import { type ArgumentsCamelCase } from "yargs"
import { createConsola } from "consola"
import { bootstrap } from "@/bootstrap"
import { getFirestore } from "firebase-admin/firestore"
import { Migration20241122 } from "@/modules/SystemMaintaining/application/mutations/Migration20241122"

const command = "load"
const describe = ""
const builder = {
    userId: {},
    from: {},
    to: {},
}

const logger = createConsola().withTag(command)
const handler = async ({ userId, from, to }: ArgumentsCamelCase<{ userId: string; from: string; to: string }>) => {
    await bootstrap()
    const db = getFirestore()
    try {
        const migrate = new Migration20241122({ db })
        await migrate(userId, from, to)
        process.exit(0)
    } catch (error) {
        if (error instanceof Error) logger.error(error.stack)
        process.exit(-1)
    }
}

export default {
    command,
    describe,
    builder,
    handler,
}
