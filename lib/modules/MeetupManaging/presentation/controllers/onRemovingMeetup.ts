import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemoveMeetup } from "@/modules/MeetupManaging/application/mutations/RemoveMeetup"

export const onRemovingMeetup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const db = getFirestore()
        const meetupId = await db.runTransaction(async (transaction) => {
            const removeMeetup = new RemoveMeetup({ db, transaction })
            return await removeMeetup(credentials.uid, group.id, request.params.meetupId)
        })
        const payload = { meetupId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
