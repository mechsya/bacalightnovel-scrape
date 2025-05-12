import { Hono } from "hono";
import novelController from "../controller/novel-controller";
import chapterController from "../controller/chapter-controller";
import { listController } from "../controller/list-controller";

const api = new Hono();

api.get("novel/:slug", novelController);
api.get("chapter/:slug", chapterController);
api.get("novels/:page", listController);

export default api;
