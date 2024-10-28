import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureUserHasPermission,
    ensurePlaylistIsSpecified,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingPlaylist, UpdatePlaylist } from "@/modules/PlaylistManaging/application/mutations/UpdatePlaylist"
import Joi from "joi"
import { name } from "@/modules/PlaylistManaging/presentation/validators/Playlist"

const validator = Joi.object<UpdatingPlaylist>({
    name,
})

export const onUpdatingPlaylist = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const playlist = ensurePlaylistIsSpecified(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const playlistId = await db.runTransaction(async (transaction) => {
            const updatePlaylist = new UpdatePlaylist({ db, transaction })
            return await updatePlaylist(credentials.uid, group.id, playlist.id, mutation)
        })
        const payload = { playlistId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
