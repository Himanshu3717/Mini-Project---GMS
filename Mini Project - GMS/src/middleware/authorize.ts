import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()


export default async function adminCheck(req: Request, res: Response, next: Function) {
    // const auth = req.headers.authorization;
    // if (!auth) return res.status(400).json({ status: "invalid request" });
    // if (!auth.startsWith("Bearer ")) return res.status(400).json({ status: "invalid request" });

    // const accessTokenParts = auth.split(" ");
    // const aTkn = accessTokenParts[1];
    let refreshTkn = req.cookies["refresh-token"]
    try {
        if (!(await checkIfAdmin(refreshTkn))) return res.status(401).json({ status: "you are unauthorized to access this page" });

        next();
    } catch (error: any) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            res.json({ status: "token expired" }).status(401)
        } else {
            console.log(error)
            res.json({ status: "you are not logged in" }).status(401)
        }
    }
}

async function checkIfAdmin(rTKN: string) {
    let decoded = jwt.verify(rTKN, process.env.AUTH_REFRESH_TOKEN_SECRET || "SUPER SECRET");
    if (typeof decoded == "string") return false;

    let id = decoded.id;
    let user = await prisma.user.findUnique({ where: { id } })
    if (!user) return false
    return user.admin
}