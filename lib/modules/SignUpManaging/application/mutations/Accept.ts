import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { type SignUp } from "@/modules/SignUpManaging/dtos/SignUp"
import { isAvailableForAccepting } from "@/modules/SignUpManaging/domain/services/isAvailableForAccepting"
import { SignUpNotFound } from "@/modules/SignUpManaging/errors/SignUpNotFound"
import { UnableToAccept } from "@/modules/SignUpManaging/errors/UnableToAccept"
import { EventPublisher } from "@/adapters/firestore/EventPublisher"
import { type SignUpEvent } from "@/modules/SignUpManaging/dtos/SignUpEvent"
import { Topics } from "@/constants"

export class Accept extends CallableInstance<[string, string, string, string, string, number?], Promise<string>> {
    protected logger: ConsolaInstance
    protected signUpRepository: SignUpRepository
    protected eventPublisher: EventPublisher

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`Accept`)
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
        if (!isAvailableForAccepting(signUpExists.status)) throw new UnableToAccept({ userId, meetupId, timeslotId })
        const status = SignUpStatuses.Accepted
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
