import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureMeetupIsSpecified,
    ensureUserHasSignedUp,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type RemovingTracks, RemoveTracks } from "@/modules/TrackManaging/application/mutations/RemoveTracks"
import { PlaylistNotSpecified } from "@/modules/PlaylistManaging/errors/PlaylistNotSpecified"
import Joi from "joi"
import { trackIds } from "@/modules/TrackManaging/presentation/validators/Track"

const validator = Joi.object<RemovingTracks>({
    trackIds,
})

export const onRemovingTracks = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const meetup = ensureMeetupIsSpecified(response)
        ensureUserHasSignedUp(response)
        const mutation = await validator.validateAsync(request.body)
        if (!meetup.playlistId) throw new PlaylistNotSpecified({ meetupId: meetup.id })
        const db = getFirestore()
        const trackIds = await db.runTransaction(async (transaction) => {
            const removeTracks = new RemoveTracks({ db, transaction })
            return await removeTracks(credentials.uid, group.id, meetup.playlistId!, mutation)
        })
        const payload = { trackIds }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
