import { Context } from "hono";
import { ChapterScrapper } from "../scrapper/chapter";
import axios from "axios";

const chapterController = async (c: Context) => {
  const slug = c.req.param("slug");

  const axiosRequest = await axios.get(process.env.SCRAPE_URL + "/" + slug);

  const result = await ChapterScrapper(axiosRequest);
  return c.json({
    code: 200,
    message: "scrape successfully",
    data: result,
  });
};

export default chapterController;
