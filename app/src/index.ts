import { Elysia } from "elysia";
import { uploadRoutes } from "./routes/upload";
import { projectRoutes } from "./routes/projects";

const app = new Elysia().use(uploadRoutes).use(projectRoutes).listen(3000);


