import { Container } from "inversify"
export const container = new Container()

export const symbols = {}

import { Settings } from "luxon"
import axios from "axios"
import https from "https"
import { Headers, fetch } from "cross-fetch"
import FormData from "form-data"
import { onTest } from "@/utils/development"
import { initializeApp, cert } from "firebase-admin/app"
import { existsSync } from "fs"
import dotenv from "dotenv"

export const bootstrap = async () => {
    const NODE_ENV = process.env.NODE_ENV
    if (existsSync(".env")) dotenv.config({ path: ".env" })
    if (NODE_ENV === "test") process.env.NODE_ENV = NODE_ENV
    process.setMaxListeners(0)
    Settings.defaultZone = process.env.TZ ?? "Asia/Taipei"
    axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false })
    if (!global.Headers) global.Headers = Headers
    if (!global.fetch) global.fetch = fetch
    if (!global.FormData) global.FormData = FormData as any
    const privateKey = process.env.PRIVATE_KEY!.replace(/\\n/gm, "\n")
    initializeApp({
        credential: cert({
            projectId: process.env.APP!,
            clientEmail: process.env.CLIENT_EMAIL!,
            privateKey,
        }),
        databaseURL: process.env.DATABASE_URL!,
        storageBucket: process.env.STORAGE_BUCKET!,
    })
    if (onTest()) return
}
