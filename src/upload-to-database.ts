import dotenv from "dotenv";
import axios from "axios";
import { ListNovelScrapper } from "./scrapper/list";
import { scrapeNovelDetail } from "./scrapper/novel";
import { PrismaClient } from "../generated/prisma";
import { v4 as uuidv4 } from "uuid";
import { ChapterScrapper } from "./scrapper/chapter";

dotenv.config();

const prisma = new PrismaClient();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry Axios Request
const axiosResponse = async (url: string, delayMs = 2000): Promise<any> => {
  let attempts = 0;

  while (true) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response;
    } catch (error: any) {
      console.warn(
        `❌ Gagal mengambil data dari: ${url}, percobaan ke-${
          attempts + 1
        }, error: ${error.message}`
      );
      attempts++;
      await delay(delayMs);
    }
  }

  return null;
};

// Upload novel dengan pengecekan duplikasi
const uploadNovel = async (novel: any) => {
  try {
    const existing = await prisma.novels.findFirst({
      where: { title: novel.title },
    });

    if (existing) {
      console.log("ℹ️ Novel sudah ada:", novel.title);
      return existing;
    }

    return await prisma.novels.create({
      data: {
        slug: uuidv4(),
        title: novel.title,
        author: novel.author,
        status: novel.status || "ongoing",
        cover: novel.image,
        ranting: novel.rating,
        genre: novel.genre,
        sinopsis: novel.sinopsis,
        view: 0,
        adult: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal upload novel:", novel.title);
    console.log(error);
    return null;
  }
};

// Upload chapter dengan pengecekan duplikasi
const uploadChapter = async (chapter: any) => {
  try {
    const existing = await prisma.chapters.findFirst({
      where: {
        title: chapter.title,
        novels: {
          id: chapter.novelId,
        },
      },
    });

    if (existing) {
      console.log("ℹ️ Chapter sudah ada:", chapter.title);
      return existing;
    }

    return await prisma.chapters.create({
      data: {
        slug: uuidv4(),
        title: chapter.title,
        content_length: chapter.content.length,
        volume: chapter.volume || "0",
        chapter: chapter.chapter,
        content: chapter.content,
        view: 0,
        novels: {
          connect: {
            id: chapter.novelId,
          },
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("❌ Gagal upload chapter:", chapter.title);
    console.log(error);
    return null;
  }
};

const main = async () => {
  let page = 1;

  while (true) {
    console.log(`🌐 Scraping halaman ${page}...`);

    const listHtml = await axiosResponse(
      page === 1
        ? `${process.env.SCRAPE_URL}/tag/japanese`
        : `${process.env.SCRAPE_URL}/tag/japanese/page/${page}`
    );
    if (!listHtml) {
      console.warn(`⚠️ Tidak bisa mengambil halaman ${page}, skip.`);
      page++;
      continue;
    }

    const listResult = await ListNovelScrapper(listHtml);
    if (!listResult || listResult.length === 0) {
      console.log("✅ Semua halaman selesai di-scrape.");
      break;
    }

    for (const list of listResult) {
      try {
        const novelHtml = await axiosResponse(
          `${process.env.SCRAPE_URL}/series/${list.slug}`
        );
        if (!novelHtml) continue;

        const novelResult = await scrapeNovelDetail(novelHtml);
        const uploadedNovel = await uploadNovel(novelResult);
        if (!uploadedNovel) continue;

        console.log("✅ Novel uploaded:", uploadedNovel.title);

        for (const chapter of novelResult.chapter) {
          try {
            const chapterHtml = await axiosResponse(
              `${process.env.SCRAPE_URL}/${chapter.slug}`
            );
            if (!chapterHtml) continue;

            const contentChapter = await ChapterScrapper(chapterHtml);
            const uploadedChapter = await uploadChapter({
              novelId: uploadedNovel.id,
              title: chapter.title,
              content: contentChapter.content,
              chapter: chapter.chapter,
              volume: chapter.volume?.toString(),
            });

            if (uploadedChapter) {
              console.log("📘 Chapter uploaded:", chapter.title);
            }
          } catch (err) {
            console.warn("⚠️ Gagal proses chapter:", chapter.title, err);
          }

          await delay(500); // Delay antar chapter
        }
      } catch (err) {
        console.warn("⚠️ Gagal proses novel:", list.slug, err);
      }

      await delay(1000); // Delay antar novel
    }

    page++;
  }

  await prisma.$disconnect();
};

main().catch((e) => {
  console.error("❌ Error utama:", e);
  prisma.$disconnect();
});
