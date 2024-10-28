import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureMeetupIsSpecified,
    ensureUserHasSignedUp,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { PlaylistNotSpecified } from "@/modules/PlaylistManaging/errors/PlaylistNotSpecified"
import Joi from "joi"
import { type AddingTracks, AddTracks } from "@/modules/TrackManaging/application/mutations/AddTracks"
import { spotifyIds } from "@/modules/TrackManaging/presentation/validators/Track"

const validator = Joi.object<AddingTracks>({
    spotifyIds,
})

export const onAddingTracks = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const meetup = ensureMeetupIsSpecified(response)
        if (!meetup.playlistId) throw new PlaylistNotSpecified({ meetupId: meetup.id })
        ensureUserHasSignedUp(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const trackIds = await db.runTransaction(async (transaction) => {
            const addTracks = new AddTracks({ db, transaction })
            return await addTracks(credentials.uid, group.id, meetup.playlistId!, mutation)
        })
        const payload = { trackIds }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
