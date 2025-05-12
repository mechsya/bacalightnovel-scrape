import axios from "axios";
import { Context } from "hono";
import { ListNovelScrapper } from "../scrapper/list";

export const listController = async (c: Context) => {
  const page = c.req.param("page") || 1;

  const axiosRequest = await axios.get(
    process.env.SCRAPE_URL + "/series/?page=" + page
  );

  const result = await ListNovelScrapper(axiosRequest);

  return c.json({
    code: 200,
    message: "scrape successfully",
    data: result,
  });
};
