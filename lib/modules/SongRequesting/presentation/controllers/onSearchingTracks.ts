import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { SpotifyService } from "@/adapters/http/SpotifyService"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import Joi from "joi"
import { page, search } from "@/utils/validators"
import { artist } from "@/modules/SongRequesting/presentation/validators/Track"

type SearchingTracks = {
    search: string
    page: number
    artist: string
}

const validator = Joi.object<SearchingTracks>({
    search,
    page,
    artist,
})

export const onSearchingTracks = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { search, page, artist } = await validator.validateAsync(request.query)
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        const spotifyService = new SpotifyService({ accessToken })
        const { items, count } = await spotifyService.listTracks(search, page, artist)
        const tracks = items.map(({ id, album, name, artists, duration_ms, preview_url }) => {
            return {
                id,
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
            }
        })
        const payload = {
            tracks,
        }
        response.header("content-length", String(count))
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
