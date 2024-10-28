import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensurePlaylistIsSpecified } from "@/utils/sessions"

export const onRetrievingPlaylist = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        ensureGroupIsSpecified(response)
        const playlist = ensurePlaylistIsSpecified(response)
        const payload = {
            playlist,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
