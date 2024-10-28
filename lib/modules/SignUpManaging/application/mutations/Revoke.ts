import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { type SignUp } from "@/modules/SignUpManaging/dtos/SignUp"
import { isAvailableForRevoking } from "@/modules/SignUpManaging/domain/services/isAvailableForRevoking"
import { SignUpNotFound } from "@/modules/SignUpManaging/errors/SignUpNotFound"
import { UnableToRevoke } from "@/modules/SignUpManaging/errors/UnableToRevoke"
import { EventPublisher } from "@/adapters/firestore/EventPublisher"
import { type SignUpEvent } from "@/modules/SignUpManaging/dtos/SignUpEvent"
import { Topics } from "@/constants"
export class Revoke extends CallableInstance<[string, string, string, string, string, number?], Promise<string>> {
    protected logger: ConsolaInstance
    protected signUpRepository: SignUpRepository
    protected eventPublisher: EventPublisher

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`Revoke`)
        this.signUpRepository = new SignUpRepository({ db, transaction })
        this.eventPublisher = new EventPublisher({ db })
    }
    async execute(
        administratorId: string,
        groupId: string,
        meetupId: string,
        timeslotId: string,
        signUpId: string,
        timestamp?: number,
    ) {
        const signUpExists = await this.signUpRepository.get(groupId, meetupId, timeslotId, signUpId)
        if (!signUpExists) throw new SignUpNotFound({ signUpId })
        const { userId } = signUpExists
        if (!isAvailableForRevoking(signUpExists.status)) throw new UnableToRevoke({ userId, meetupId, timeslotId })
        const status = SignUpStatuses.Revoked
        const signUp: SignUp = {
            ...signUpExists,
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
                administratorId,
            },
            timestamp: timestamp ? timestamp : Date.now(),
        }
        await this.eventPublisher.publish({ groupId, meetupId }, event)
        return signUpId
    }
}
