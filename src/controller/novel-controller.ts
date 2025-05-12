import axios from "axios";
import { Context } from "hono";
import { scrapeNovelDetail } from "../scrapper/novel";

const novelController = async (c: Context) => {
  const slug = c.req.param("slug");

  const axiosRequest = await axios.get(
    process.env.SCRAPE_URL + "/series/" + slug
  );

  const result = await scrapeNovelDetail(axiosRequest);
  return c.json({
    code: 200,
    message: "scrape successfully",
    data: result,
  });
};

export default novelController;
