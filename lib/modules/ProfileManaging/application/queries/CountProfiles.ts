import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { ProfileDao } from "@/adapters/firestore/ProfileDao"

export type CountingProfiles = {
    search: string
    levelIds: string[]
}

export class CountProfiles extends CallableInstance<[string, string, CountingProfiles], Promise<number>> {
    protected logger: ConsolaInstance
    protected profileDao: ProfileDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountProfiles`)
        this.profileDao = new ProfileDao({ db })
    }
    async execute(userId: string, groupId: string, { search, levelIds }: CountingProfiles) {
        const count = await this.profileDao.count({ groupId, search, levelIds })
        return count
    }
}
