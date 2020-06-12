import { Application, Router } from 'https://deno.land/x/oak/mod.ts';
import UserController from "./database/userController.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
const router = new Router();

// https://stackoverflow.com/questions/49633157/how-do-i-set-headers-to-all-responses-in-koa-js
app.use(async (ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', '*');
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    ctx.response.headers.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors()); // Enable CORS for All Routes

// get
router.get("/users", UserController.index);
router.get("/userLogin", UserController.userLogin);

// post
router.post("/createUser", UserController.createUser);

// listen
const env  = Deno.env.toObject();
const PORT = env.PORT || 1337;
const HOST = env.HOST || '127.0.0.1';

// await
app.listen(`${HOST}:${PORT}`);
console.log(`Listening on port ${PORT}...`);