import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { ProfileDao } from "@/adapters/firestore/ProfileDao"
import { type Profile } from "@/modules/ProfileManaging/dtos/Profile"
import { ProfileRepository } from "@/adapters/firestore/ProfileRepository"

export class ResolveProfile extends CallableInstance<[string, string], Promise<Profile | undefined>> {
    protected logger: ConsolaInstance
    protected profileDao: ProfileDao
    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolveProfile`)
        this.profileDao = new ProfileDao({ db })
    }
    async execute(userId: string, groupId: string) {
        const profileId = ProfileRepository.nextId({ groupId, userId })
        const profile = await this.profileDao.byId(groupId, profileId)
        return profile
    }
}
