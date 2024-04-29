import { Request, Response } from "express"
import jwt from "jsonwebtoken"

export default async function authenticCheck(req: Request, res: Response, next: Function) {
    const auth = req.headers.authorization;
    if (!auth) return res.json({ status: "invalid request" }).status(400);
    if (!auth.startsWith("Bearer ")) return res.json({ status: "invalid request" }).status(400);

    const accessTokenParts = auth.split(' ');
    const aTkn = accessTokenParts[1].replace(/^"|"$/g, '');;

    try {
        let decoded = jwt.verify(aTkn, process.env.AUTH_ACCESS_TOKEN_SECRET || "SUPER SECRET")
        if (typeof decoded === "string") return

        let id = decoded.id
        req.body.id = id

        next()
    }
    catch (error: any) {
        console.log(error)
        if (error.name === "TokenExpiredError") {
            res.json({ status: "token expired" }).status(401)
        } else {
            console.log(error)
            res.json({ status: "you are not logged in" }).status(401)
        }
    }
}