import { AxiosResponse } from "axios";
import * as cheerio from "cheerio";
import { Chapter } from "../types";

export const ChapterScrapper = async (res: AxiosResponse) => {
  const $: cheerio.CheerioAPI = cheerio.load(res.data);

  const chapter = {} as Chapter;

  const titleHeader = $(".entry-title").text().trim() || "";

  chapter.title = titleHeader;
  chapter.content = $(".epcontent").html() || $(".epcontent").html() || "";

  const match = titleHeader.match(/Volume\s*(\d+)\s*Chapter\s*(\d+)/i);
  const chapOnlyMatch = titleHeader.match(/Chapter\s*(\d+)/i);

  let ch = null;
  let vol = null;

  if (match) {
    vol = match[1];
    ch = match[2];
  } else if (chapOnlyMatch) {
    ch = chapOnlyMatch[1];
  }

  chapter.volume = vol;
  chapter.chapter = ch;

  return chapter;
};
