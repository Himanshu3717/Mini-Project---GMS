// import express, { Express, Request, Response } from "express";
// import cookieParser from "cookie-parser";
// // import cors from 'cors';
// import * as CUSTOMROUTER from "./routes/auth"
// import { admincheck } from "./middleware/index"

// const APP: Express = express();
// const PORT: Number = 8080;

// APP.use(express.static("public"))
// APP.use(express.urlencoded({ extended: true }))
// // APP.use(cors())
// APP.use(express.json())
// APP.use(cookieParser());
// APP.use("/auth", CUSTOMROUTER.default)

// APP.get("/", (req: Request, res: Response) => {
//     return res.sendFile("/index.html")
// })

// APP.get("/register", (req: Request, res: Response) => {
//     return res.sendFile("/register.html")
// })

// APP.get("/login", (req: Request, res: Response) => {
//     return res.sendFile("/login.html")
// })

// APP.listen(PORT, () => {
//     console.log(`server running on localhost:${PORT}`)
// })

import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import * as CUSTOMROUTER from "./routes/auth"
import { authenticCheck, admincheck } from "./middleware/index"
import { name } from "ejs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const APP: Express = express();
const PORT: Number = 8080;
const prisma = new PrismaClient()

APP.use(express.static("public"))
APP.use(express.urlencoded({ extended: true }))
APP.use(express.json())
APP.use(cookieParser());
APP.set('view engine', 'ejs');
APP.use("/auth", CUSTOMROUTER.default)

APP.get("/", (req: Request, res: Response) => {
    // return res.json({ status: "server up and running" }).status(200)
    return res.sendFile("index.html")
})

APP.get("/loggedin", async (req: Request, res: Response) => {
    let refreshTkn = req.cookies["refresh-token"]
    try {
        let decoded = jwt.verify(refreshTkn, process.env.AUTH_REFRESH_TOKEN_SECRET || "SUPER SECRET")
        if (typeof decoded === "string") return res.json({ status: "invalid request" }).status(409)
        let id = decoded.id
        let user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.send("oops something went wrong!")
        return res.render("index", { name: user.name })
    }
    catch (error) {
        return res.send("you are not logged in ")
    }
})

APP.get("/user", async (req: Request, res: Response) => {
    let refreshTkn = req.cookies["refresh-token"]
    try {
        let decoded = jwt.verify(refreshTkn, process.env.AUTH_REFRESH_TOKEN_SECRET || "SUPER SECRET")
        if (typeof decoded === "string") return res.json({ status: "invalid request" }).status(409)
        let id = decoded.id
        let user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.send("oops something went wrong!")
        if (user.admin) return res.redirect("/admin")
        return res.render("index", { ...user })
    }
    catch (error) {
        return res.redirect('/')
    }
})

APP.get("/register", (req: Request, res: Response) => {
    // return res.json({ status: "you are logged in" }).status(200)
    return res.sendFile("register.html")
})

APP.get("/login", (req: Request, res: Response) => {
    // return res.json({ status: "you are watching admin only page" }).status(200)
    return res.sendFile("login.html")
})

APP.get("/admin", admincheck, (req: Request, res: Response) => {
    // return res.json({ status: "you are watching admin only page" }).status(200)
    return res.render("admin")
})

APP.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})