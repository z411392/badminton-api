import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingPlaylist, CreatePlaylist } from "@/modules/PlaylistManaging/application/mutations/CreatePlaylist"
import Joi from "joi"
import { name } from "@/modules/PlaylistManaging/presentation/validators/Playlist"

const validator = Joi.object<CreatingPlaylist>({
    name,
})

export const onCreatingPlaylist = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const playlistId = await db.runTransaction(async (transaction) => {
            const createPlaylist = new CreatePlaylist({ db, transaction })
            return await createPlaylist(credentials.uid, group.id, mutation)
        })
        const payload = { playlistId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
