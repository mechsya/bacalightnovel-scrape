import * as cheerio from "cheerio";
import axios, { AxiosResponse } from "axios";
import { Novel, Chapter } from "../types";

export const scrapeNovelDetail = async (res: AxiosResponse) => {
  const $: cheerio.CheerioAPI = cheerio.load(res.data);

  let novel = {} as Novel;

  novel.title = $(".entry-title").text();
  novel.image = $(".ts-post-image").attr("src");
  novel.sinopsis = $(`[itemprop="description"] p`).text();
  novel.status = $(".sertostat span").text().trim().toLowerCase();
  novel.rating = "N/A";
  novel.R18 = false;
  novel.author = $(".serl")
    .filter((_, el) => $(el).find(".sername").text().trim() === "Author")
    .find(".serval a")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > 0)
    .join(", ");

  novel.genre = $(".sertogenre a")
    .map((_, el) => $(el).text().trim())
    .get()
    .join(",");

  novel.chapter = $(".eplister ul li")
    .map((_, el) => {
      const $el = $(el);
      const link = $el.find("a").first();
      const numberText = $el.find(".epl-num").text().trim();

      const volume = 0;
      const chapter = numberText;

      return {
        volume,
        chapter,
        title: $el.find(".epl-title").text().trim(),
        slug:
          link
            .attr("href")
            ?.split("/")
            .filter((segment) => segment)
            .pop() || "",
      };
    })
    .get();

  return novel;
};
