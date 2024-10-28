import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingMeetup, UpdateMeetup } from "@/modules/MeetupManaging/application/mutations/UpdateMeetup"
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
import { type Replace } from "@/utils/types"
import { type TimeslotInput } from "@/modules/MeetupManaging/dtos/Timeslot"

const validator = Joi.object<Replace<UpdatingMeetup, "timeslots", TimeslotInput[]>>({
    name,
    date,
    venueId,
    shuttleIds,
    timeslots,
    description,
    playlistId,
})

export const onUpdatingMeetup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const meetupId = await db.runTransaction(async (transaction) => {
            const updateMeetup = new UpdateMeetup({ db, transaction })
            return await updateMeetup(credentials.uid, group.id, request.params.meetupId, mutation)
        })
        const payload = { meetupId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
