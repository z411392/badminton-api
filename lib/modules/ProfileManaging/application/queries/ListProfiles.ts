import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type Profile } from "@/modules/ProfileManaging/dtos/Profile"
import { ProfileDao } from "@/adapters/firestore/ProfileDao"
import { type CountingProfiles } from "@/modules/ProfileManaging/application/queries/CountProfiles"

export type ListingProfiles = CountingProfiles & {
    search: string
    page: number
}

export class ListProfiles extends CallableInstance<[string, string, ListingProfiles], AsyncIterable<Profile>> {
    protected logger: ConsolaInstance
    protected profileDao: ProfileDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListProfiles`)
        this.profileDao = new ProfileDao({ db })
    }
    async *execute(userId: string, groupId: string, { page, search, levelIds }: ListingProfiles) {
        const profileIds = await this.profileDao.search({ groupId, search, levelIds }, page)
        if (profileIds.length === 0) return
        for await (const profile of this.profileDao.inIds(groupId, ...profileIds)) yield profile
    }
}
