import { type Event } from "@/adapters/firestore/EventPublisher"
import { type SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { Topics } from "@/constants"

export type SignUpEvent = Event<
    Topics.SignUp,
    {
        userId: string
        signUpId: string
        timeslotId: string
        status: SignUpStatuses
        administratorId?: string
    }
>
