import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type SignUp } from "@/modules/SignUpManaging/dtos/SignUp"
import { SignUpDao } from "@/adapters/firestore/SignUpDao"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"

export class ResolveSignUps extends CallableInstance<
    [string, string, string, ...string[]],
    Promise<SignUp | undefined>
> {
    protected logger: ConsolaInstance
    protected signUpDao: SignUpDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolveSignUp`)
        this.signUpDao = new SignUpDao({ db })
    }
    async execute(userId: string, groupId: string, meetupId: string, ...timeslotIds: string[]) {
        const signUps = await Promise.all(
            timeslotIds.map(async (timeslotId) => {
                const signUpId = SignUpRepository.nextId({ timeslotId, userId })
                const signUp = await this.signUpDao.byId(groupId, meetupId, timeslotId, signUpId)
                return signUp
            }),
        )
        return signUps.filter((signUp) => Boolean(signUp))
    }
}
