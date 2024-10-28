import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureUserHasPermission,
    ensureMeetupIsSpecified,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { TimeslotNotFound } from "@/modules/SignUpManaging/errors/TimeslotNotFound"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { Accept } from "@/modules/SignUpManaging/application/mutations/Accept"
import { Revoke } from "@/modules/SignUpManaging/application/mutations/Revoke"
import { MarkAsPaid } from "@/modules/SignUpManaging/application/mutations/MarkAsPaid"
import { MarkAsRefunded } from "@/modules/SignUpManaging/application/mutations/MarkAsRefunded"
import Joi from "joi"
import { status } from "@/modules/SignUpManaging/presentation/validators/SignUp"

const validator = Joi.object({
    status,
})

export const onReviewingSignUp = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const meetup = ensureMeetupIsSpecified(response)
        const { timeslotId, signUpId } = request.params as { timeslotId: string; signUpId: string }
        const { status } = await validator.validateAsync(request.body)
        const timeslot = meetup.timeslots.find(({ id }) => id === timeslotId)
        if (!timeslot) throw new TimeslotNotFound({ timeslotId })
        const db = getFirestore()
        await db.runTransaction(async (transaction) => {
            switch (status) {
                case SignUpStatuses.Accepted:
                    const accept = new Accept({ db, transaction })
                    return await accept(credentials.uid, group.id, meetup.id, timeslot.id, signUpId)
                case SignUpStatuses.Revoked:
                    const revoke = new Revoke({ db, transaction })
                    return await revoke(credentials.uid, group.id, meetup.id, timeslot.id, signUpId)
                case SignUpStatuses.Paid:
                    const markAsPaid = new MarkAsPaid({ db, transaction })
                    return await markAsPaid(credentials.uid, group.id, meetup.id, timeslot.id, signUpId)
                case SignUpStatuses.Refunded:
                    const markAsRefunded = new MarkAsRefunded({ db, transaction })
                    return await markAsRefunded(credentials.uid, group.id, meetup.id, timeslotId, signUpId)
            }
            return undefined
        })
        const payload = { signUpId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
