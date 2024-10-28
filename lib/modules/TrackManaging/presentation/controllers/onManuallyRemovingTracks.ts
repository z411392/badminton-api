import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureUserHasPermission,
    ensurePlaylistIsSpecified,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type RemovingTracks, RemoveTracks } from "@/modules/TrackManaging/application/mutations/RemoveTracks"
import Joi from "joi"
import { trackIds } from "@/modules/TrackManaging/presentation/validators/Track"

const validator = Joi.object<RemovingTracks>({
    trackIds,
})

export const onManuallyRemovingTracks = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const permission = ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const playlist = ensurePlaylistIsSpecified(response)
        const db = getFirestore()
        const trackIds = await db.runTransaction(async (transaction) => {
            const removeTracks = new RemoveTracks({ db, transaction })
            return await removeTracks(credentials.uid, group.id, playlist.id, mutation, permission.id)
        })
        const payload = { trackIds }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
