import dotenv from "dotenv";

dotenv.config();
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import api from "./router";

const app = new Hono();

app.route("/api", api);

serve(app);
