import { bootstrap } from "@/bootstrap"
import dotenv from "dotenv"
beforeAll(async () => {
    await bootstrap()
    dotenv.config({ path: ".env.test" })
})

afterAll(async () => {})
