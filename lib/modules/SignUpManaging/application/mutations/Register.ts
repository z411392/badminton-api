import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { type SignUp } from "@/modules/SignUpManaging/dtos/SignUp"
import { SignedUpAlready } from "@/modules/SignUpManaging/errors/SignedUpAlready"
import { isAvailableForRegistering } from "@/modules/SignUpManaging/domain/services/isAvailableForRegistering"
import { EventPublisher } from "@/adapters/firestore/EventPublisher"
import { type SignUpEvent } from "@/modules/SignUpManaging/dtos/SignUpEvent"
import { Topics } from "@/constants"
export class Register extends CallableInstance<[string, string, string, string, number?], Promise<string>> {
    protected logger: ConsolaInstance
    protected signUpRepository: SignUpRepository
    protected eventPublisher: EventPublisher

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`Register`)
        this.signUpRepository = new SignUpRepository({ db, transaction })
        this.eventPublisher = new EventPublisher({ db })
    }
    async execute(userId: string, groupId: string, meetupId: string, timeslotId: string, timestamp?: number) {
        const signUpId = SignUpRepository.nextId({ timeslotId, userId })
        const signUpExists = await this.signUpRepository.get(groupId, meetupId, timeslotId, signUpId)
        if (signUpExists) {
            if (!isAvailableForRegistering(signUpExists.status))
                throw new SignedUpAlready({ userId, meetupId, timeslotId })
        }
        const status = SignUpStatuses.Pending
        const signUp: SignUp = {
            id: signUpId,
            userId,
            status,
        }
        await this.signUpRepository.set(groupId, meetupId, timeslotId, signUpId, signUp, timestamp)
        const event: SignUpEvent = {
            topic: Topics.SignUp,
            payload: {
                userId,
                signUpId,
                timeslotId,
                status,
            },
            timestamp: timestamp ? timestamp : Date.now(),
        }
        await this.eventPublisher.publish({ groupId, meetupId }, event)
        return signUpId
    }
}
