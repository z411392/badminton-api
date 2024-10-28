import { getAuth, type Auth } from "firebase-admin/auth"
import { type User, fromUserRecord } from "@/modules/IdentityAndAccessManaging/dtos/User"

export class UserDao {
    protected auth: Auth
    constructor() {
        this.auth = getAuth()
    }
    async *inIds(...userIds: string[]) {
        const batchSize = 100
        for (let index = 0; index < userIds.length; index += batchSize) {
            const identifiers = userIds.slice(index, index + batchSize).map((uid) => ({ uid }))
            const result = await this.auth.getUsers(identifiers)
            for (const userRecord of result.users) yield fromUserRecord(userRecord)
        }
    }

    async byId(userId: string) {
        let user: User | undefined = undefined
        for await (const found of this.inIds(userId)) {
            user = found
            break
        }
        return user
    }
}
