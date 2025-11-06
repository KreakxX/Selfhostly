import { Elysia } from "elysia"
import { uploadRoutes } from "./routes/upload";
import { projectRoutes } from "./routes/projects";
import cors from "@elysiajs/cors";
const app = new Elysia().use(uploadRoutes).use(cors()).use(projectRoutes).listen(3000);


