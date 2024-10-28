import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensurePlaylistIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { TrackDao } from "@/adapters/firestore/TrackDao"
import { SpotifyService } from "@/adapters/http/SpotifyService"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import { UserDao } from "@/adapters/auth/UserDao"

export const onRetrievingTrack = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const playlist = ensurePlaylistIsSpecified(response)
        const { trackId } = request.params as { trackId: string }
        const db = getFirestore()
        const trackDao = new TrackDao({ db })
        const track = await trackDao.byId(group.id, playlist.id, trackId)
        if (!track) {
            const payload = { track: undefined }
            return response.json({ payload })
        }
        const userDao = new UserDao()
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        const spotifyService = new SpotifyService({ accessToken })
        const spotifyTrack = await spotifyService.getTrackById(track.spotifyId)
        const { album, name, artists, duration_ms, preview_url } = spotifyTrack!
        const user = await userDao.byId(track.userId)
        const payload = {
            track: {
                id: track.id,
                album: {
                    name: album.name,
                    image: album.images && album.images.length ? album.images[0].url : undefined,
                },
                artists: artists.map((artist) => {
                    return {
                        name: artist.name,
                        image: artist.images && artist.images.length ? artist.images[0].url : undefined,
                    }
                }),
                name,
                duration: duration_ms,
                preview: preview_url ?? "",
                userId: track.userId,
                user,
                spotifyId: track.spotifyId,
                createdAt: track.createdAt,
                updatedAt: track.updatedAt,
            },
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
