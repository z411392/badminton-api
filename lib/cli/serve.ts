import { type ArgumentsCamelCase } from "yargs"
import { createConsola } from "consola"
import { createScheduler } from "@/utils/cron"
import { bootstrap } from "@/bootstrap"
import { schedulers } from "@/cron"
import createServer from "@/http"
import { watchOptions } from "@/firestore"
import { watchCollection } from "@/utils/firestore"
import { getFirestore } from "firebase-admin/firestore"

const command = "serve"
const describe = ""
const builder = {}

const logger = createConsola().withTag(command)
const handler = async (args: ArgumentsCamelCase<{}>) => {
    await bootstrap()
    for (const { cronExpression, task, runOnInit } of schedulers) createScheduler(cronExpression, task, runOnInit)
    const db = getFirestore()
    for (const [collectionName, onChange, documentChangeTypes] of watchOptions(db))
        watchCollection(collectionName, onChange, documentChangeTypes, db)
    const server = createServer()
    server.listen(8080, "0.0.0.0", () => logger.info("express 已啟動"))
    await new Promise<void>((resolve) => process.on("SIGINT", (_) => resolve))
}

export default {
    command,
    describe,
    builder,
    handler,
}
