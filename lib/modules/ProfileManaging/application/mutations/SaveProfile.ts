import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { ProfileRepository } from "@/adapters/firestore/ProfileRepository"
import { type Profile } from "@/modules/ProfileManaging/dtos/Profile"
import { LevelRepository } from "@/adapters/firestore/LevelRepository"
import { LevelNotFound } from "@/modules/LevelManaging/errors/LevelNotFound"

export type SavingProfile = {
    levelId: string
    name: string
    line: string
}

export class SaveProfile extends CallableInstance<[string, string, SavingProfile], Promise<{ profileId: string }>> {
    protected logger: ConsolaInstance
    protected profileRepository: ProfileRepository
    protected levelRepository: LevelRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreateProfile`)
        this.profileRepository = new ProfileRepository({ db, transaction })
        this.levelRepository = new LevelRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, { levelId, name, line }: SavingProfile) {
        const profileId = ProfileRepository.nextId({ groupId, userId })
        const levelExists = await this.levelRepository.get(groupId, levelId)
        if (!levelExists) throw new LevelNotFound({ levelId })
        const profile: Profile = {
            id: profileId,
            userId,
            groupId,
            levelId,
            line,
            name,
            tagIds: [],
        }
        await this.profileRepository.set(groupId, profileId, profile)
        return profileId
    }
}
