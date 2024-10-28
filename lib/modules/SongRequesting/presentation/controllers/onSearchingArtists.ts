import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { SpotifyService } from "@/adapters/http/SpotifyService"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import Joi from "joi"
import { page, search } from "@/utils/validators"

type SearchingArtists = {
    search: string
    page: number
}

const validator = Joi.object<SearchingArtists>({
    search,
    page,
})

export const onSearchingArtists = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { search, page } = await validator.validateAsync(request.query)
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        const spotifyService = new SpotifyService({ accessToken })
        const { items, count } = await spotifyService.listArtists(search, page)
        const artists = items.map(({ id, name, images }) => {
            return {
                id,
                name,
                image: images && images.length ? images[0].url : undefined,
            }
        })
        const payload = {
            artists,
        }
        response.header("content-length", String(count))
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
