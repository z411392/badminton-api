import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type ListingPlaylists, ListPlaylists } from "@/modules/PlaylistManaging/application/queries/ListPlaylists"
import Joi from "joi"
import { page, search } from "@/utils/validators"

const validator = Joi.object<ListingPlaylists>({
    search,
    page,
})

export const onListingPlaylists = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listPlaylists = new ListPlaylists({ db })
        const playlists = []
        for await (const playlist of listPlaylists(credentials.uid, group.id, query)) playlists.push(playlist)
        const payload = { playlists }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
