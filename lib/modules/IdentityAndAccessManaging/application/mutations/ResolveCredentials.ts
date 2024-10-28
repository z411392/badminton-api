import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

export class ResolveCredentials extends CallableInstance<[string], Promise<DecodedIdToken | undefined>> {
    protected logger: ConsolaInstance
    constructor() {
        super("execute")
        this.logger = createConsola().withTag(`ResolveCredentials`)
    }
    async execute(token: string) {
        const auth = getAuth()
        try {
            const credentials: DecodedIdToken = await auth.verifyIdToken(token)
            return credentials
        } catch {
            return undefined
        }
    }
}
