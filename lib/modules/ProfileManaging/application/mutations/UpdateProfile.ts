import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { ProfileRepository } from "@/adapters/firestore/ProfileRepository"
import { type Profile } from "@/modules/ProfileManaging/dtos/Profile"
import { LevelRepository } from "@/adapters/firestore/LevelRepository"
import { LevelNotFound } from "@/modules/LevelManaging/errors/LevelNotFound"
import { ProfileNotFound } from "@/modules/ProfileManaging/errors/ProfileNotFound"

export type UpdatingProfile = {
    levelId: string
    name: string
    line: string
}

export class UpdateProfile extends CallableInstance<
    [string, string, string, UpdatingProfile],
    Promise<{ profileId: string }>
> {
    protected logger: ConsolaInstance
    protected profileRepository: ProfileRepository
    protected levelRepository: LevelRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdateProfile`)
        this.profileRepository = new ProfileRepository({ db, transaction })
        this.levelRepository = new LevelRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, profileId: string, { levelId, name, line }: UpdatingProfile) {
        const profileExists = await this.profileRepository.get(groupId, profileId)
        if (!profileExists) throw new ProfileNotFound({ profileId })
        const levelExists = await this.levelRepository.get(groupId, levelId)
        if (!levelExists) throw new LevelNotFound({ levelId })
        const profile: Profile = { ...profileExists, levelId, name, line }
        await this.profileRepository.set(groupId, profileId, profile)
        return profileId
    }
}
