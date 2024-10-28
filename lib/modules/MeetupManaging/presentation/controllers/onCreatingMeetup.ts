import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingMeetup, CreateMeetup } from "@/modules/MeetupManaging/application/mutations/CreateMeetup"
import Joi from "joi"
import { date } from "@/utils/validators"
import {
    name,
    venueId,
    shuttleIds,
    timeslots,
    description,
    playlistId,
} from "@/modules/MeetupManaging/presentation/validators/Meetup"

const validator = Joi.object<CreatingMeetup>({
    name,
    date,
    venueId,
    shuttleIds,
    timeslots,
    description,
    playlistId,
})

export const onCreatingMeetup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const meetupId = await db.runTransaction(async (transaction) => {
            const createMeetup = new CreateMeetup({ db, transaction })
            return await createMeetup(credentials.uid, group.id, mutation)
        })
        const payload = { meetupId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
