import { type Request, type Response } from "express"
import {
    ensureUserIsAuthenticated,
    ensureGroupIsSpecified,
    ensureUserHasPermission,
    ensurePlaylistIsSpecified,
} from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemovePlaylist } from "@/modules/PlaylistManaging/application/mutations/RemovePlaylist"

export const onRemovingPlaylist = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const playlist = ensurePlaylistIsSpecified(response)
        const db = getFirestore()
        const playlistId = await db.runTransaction(async (transaction) => {
            const removePlaylist = new RemovePlaylist({ db, transaction })
            return await removePlaylist(credentials.uid, group.id, playlist.id)
        })
        const payload = { playlistId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
