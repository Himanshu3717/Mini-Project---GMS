import express, { Request, Response, Router } from 'express';
import { PrismaClient, User } from '@prisma/client';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
// import { validateRegister } from '../validators/schemaValidators'

const SALT_ROUNDS = process.env.BCRYPTJS_SALT || 5
const SALT = bcrypt.genSaltSync(parseInt(SALT_ROUNDS.toString()))
const ASECRET = process.env.AUTH_ACCESS_TOKEN_SECRET || "SUPER SECRET"
const AEXPIRY = process.env.AUTH_ACCESS_TOKEN_EXPIRY || "60s"
const RSECRET = process.env.AUTH_REFRESH_TOKEN_SECRET || "SUPER SECRET"
const REXPIRTY = process.env.AUTH_REFRESH_TOKEN_EXPIRY || "2d"

const prisma = new PrismaClient()
const router: Router = express.Router()

router.post("/register", async (req: Request, res: Response) => {
    // collect body and validate 
    // let valid = await validateRegister(req)
    // if (!valid.success) return res.json({ status: valid.error }).status(409)

    let { email, name, number, gender, password, weight, height, age } = req.body

    let user = await prisma.user.findUnique({ where: { email } })
    if (user) return res.json({ status: "Email already exists" }).status(409);
    let user_number = await prisma.user.findUnique({ where: { number } })
    if (user_number) return res.json({ status: "Mobile already exists" }).status(409);

    let hash = await bcrypt.hash(password, SALT)

    user = await prisma.user.create({
        data: {
            email,
            name,
            password: hash,
            number,
            age: parseInt(age),
            gender: gender === "male" ? "MALE" : "FEMALE",
            weight: parseInt(weight),
            height: parseInt(height),
        }
    })

    let accesstoken = await generateAccessAndRefreshToken(user, res)
    // user = clean(user)

    return res.json({
        status: "user signed up sucessfully",
        user: { ...user, ["password"]: undefined, ["refreshTokenHash"]: undefined, ["admin"]: undefined },
        token: accesstoken
    })
        .status(200)
})


router.post("/login", async (req: Request, res: Response) => {
    let { email, password } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ status: "user not available try signinup" }).status(404)

    let validUser = await bcrypt.compare(password, user.password)

    if (!validUser) return res.json({ status: "Invalid password" }).status(401);

    let accesstoken = await generateAccessAndRefreshToken(user, res);
    return res.json({
        status: `${user.name} logged in sucessfully ${user.admin ? "as admin" : ""}`,
        user: { ...user, ["password"]: undefined, ["refreshTokenHash"]: undefined, ["admin"]: undefined },
        token: accesstoken
    })
        .status(200)
})

router.post("/logout", async (req: Request, res: Response) => {
    try {
        let refreshTkn = req.cookies["refresh-token"]

        let data = jwt.verify(refreshTkn, RSECRET)
        if (typeof data === "string") return res.json({ status: "invalid request" }).status(409)
        let id = data.id

        let user = await prisma.user.update({ where: { id }, data: { refreshTokenHash: "undefined" } });

        res.cookie("refresh-token", "")

        return res.json({ status: `user: ${user.name} logged out sucessfully` }).status(200)
    }
    catch (error: any) {
        console.log(error)
        return res.json({ status: "you are not logged in" }).status(409)
    }
})

router.post("/regenrate", async (req: Request, res: Response) => {
    console.log("regenrate mentioned")
    const auth = req.headers.authorization;
    if (!auth) return res.json({ status: "invalid request" }).status(400);
    if (!auth.startsWith("Bearer ")) return res.json({ status: "invalid request" }).status(400);

    const accessTokenParts = auth.split(" ");
    const staleATkn = accessTokenParts[1];// to remove any access token if stored

    let refreshTkn = req.cookies["refresh-token"]

    let decoded = jwt.verify(refreshTkn, RSECRET)
    if (typeof decoded === "string") return res.json({ status: "invalid request" }).status(409)
    let id = decoded.id

    let user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.json({ status: "invalid request" }).status(409);

    let aTkn = jwt.sign({ id: user.id, name: user.name, auth: user.admin }, ASECRET, { expiresIn: AEXPIRY })

    return res.json({ status: "Access Tkn Regenrated", token: aTkn }).status(200)
})

async function generateAccessAndRefreshToken(user: User, res: Response) {
    let accesstoken = jwt.sign({ id: user.id, name: user.name, auth: user.admin }, ASECRET, { expiresIn: AEXPIRY })
    let refreshtoken = jwt.sign({ id: user.id }, RSECRET, { expiresIn: REXPIRTY })

    let refreshTokenHash = await bcrypt.hash(refreshtoken, SALT)

    user = await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshTokenHash
        }
    })

    res.cookie("refresh-token", refreshtoken)

    return accesstoken
}

export default router