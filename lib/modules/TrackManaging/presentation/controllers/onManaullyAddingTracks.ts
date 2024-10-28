import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureUserHasPermission,
    ensurePlaylistIsSpecified,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type AddingTracks, AddTracks } from "@/modules/TrackManaging/application/mutations/AddTracks"
import Joi from "joi"
import { spotifyIds } from "@/modules/TrackManaging/presentation/validators/Track"

const validator = Joi.object<AddingTracks>({
    spotifyIds,
})

export const onManaullyAddingTracks = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const permission = ensureUserHasPermission(response)
        const playlist = ensurePlaylistIsSpecified(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const trackIds = await db.runTransaction(async (transaction) => {
            const addTracks = new AddTracks({ db, transaction })
            return await addTracks(credentials.uid, group.id, playlist.id, mutation, permission.id)
        })
        const payload = { trackIds }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
