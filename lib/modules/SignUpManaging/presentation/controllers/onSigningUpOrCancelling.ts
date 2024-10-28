import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureMeetupIsSpecified,
    ensureUserHasProfile,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { TimeslotNotFound } from "@/modules/SignUpManaging/errors/TimeslotNotFound"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { Register } from "@/modules/SignUpManaging/application/mutations/Register"
import { Cancel } from "@/modules/SignUpManaging/application/mutations/Cancel"
import { DateTime } from "luxon"
import { UnableToRegister } from "@/modules/SignUpManaging/errors/UnableToRegister"

export const onSigningUpOrCancelling = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const meetup = ensureMeetupIsSpecified(response)
        ensureUserHasProfile(response)
        const { timeslotId } = request.params as { timeslotId: string }
        const status = request.method === "PUT" ? SignUpStatuses.Pending : SignUpStatuses.Cancelled
        const timeslot = meetup.timeslots.find(({ id }) => id === timeslotId)
        if (!timeslot) throw new TimeslotNotFound({ timeslotId })
        const { date } = meetup
        const { startTime } = timeslot
        const startedAt = DateTime.fromFormat(`${date} ${startTime}`, `yyyy-LL-dd HH:mm`).toMillis()
        if (startedAt <= Date.now())
            throw new UnableToRegister({ userId: credentials.uid, meetupId: meetup.id, timeslotId })
        const db = getFirestore()
        const signUpId = await db.runTransaction(async (transaction) => {
            switch (status) {
                case SignUpStatuses.Pending:
                    const register = new Register({ db, transaction })
                    return await register(credentials.uid, group.id, meetup.id, timeslotId)
                case SignUpStatuses.Cancelled:
                    const cancel = new Cancel({ db, transaction })
                    return await cancel(credentials.uid, group.id, meetup.id, timeslotId)
                default:
                    return undefined
            }
        })
        const payload = { signUpId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
