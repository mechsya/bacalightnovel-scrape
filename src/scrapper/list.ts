import { AxiosResponse } from "axios";
import * as cheerio from "cheerio";

export const ListNovelScrapper = async (res: AxiosResponse) => {
  const $: cheerio.CheerioAPI = cheerio.load(res.data);

  const result: any = [];
  const seenSlugs = new Set();

  $(".listupd article h2 > a.tip").each((i, el) => {
    const href = $(el).attr("href");
    const title = $(el).attr("title");
    const slug = href
      ?.split("/")
      .filter((part) => part && part !== "series")
      .pop();

    if (slug && !seenSlugs.has(slug)) {
      seenSlugs.add(slug);
      result.push({ slug, title });
    }
  });

  return result;
};
