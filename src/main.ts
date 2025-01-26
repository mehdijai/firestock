import { config } from "dotenv";
import rootRouter from "@/router";
import { ExpServer } from "@/server";

config();

const _server = new ExpServer();

_server.registerRootRoute(rootRouter);

_server.listen();
