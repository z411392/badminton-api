import { default as axiosFactory, type AxiosInstance } from "axios"

export type SpotifyArtist = {
    id: string
    name: string
    images: Array<{
        url: string
        width: number
        height: number
    }>
}

export type SpotifyAlbum = {
    id: string
    name: string
    images: Array<{
        url: string
        width: number
        height: number
    }>
}

export type SpotifyTrack = {
    id: string
    album: SpotifyAlbum
    name: string
    artists: Array<SpotifyArtist>
    duration_ms: number
    preview_url?: string
}

export class SpotifyService {
    protected axios: AxiosInstance
    constructor({ accessToken }: { accessToken: string }) {
        this.axios = axiosFactory.create({
            baseURL: "https://api.spotify.com/v1",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        })
    }
    async me() {
        const uri = `/me`
        const {
            data: { id: userId },
        } = await this.axios.get<{ id: string }>(uri)
        return userId
    }
    async createPlaylist(name: string, description: string = "") {
        const userId = await this.me()
        const uri = `/users/:userId/playlists`.replace(":userId", userId)
        const data = {
            name,
            description,
            public: false,
        }
        const {
            data: { id: playlistId },
        } = await this.axios.post<{ id: string }>(uri, data)
        return playlistId
    }
    async changePlaylistDetails(playlistId: string, name: string, description: string = "") {
        const uri = `/playlists/:playlistId`.replace(":playlistId", playlistId)
        const data = {
            name,
            description,
            public: false,
        }
        await this.axios.put<{}>(uri, data)
        return playlistId
    }
    async addItemsToPlaylist(playlistId: string, ...uris: string[]) {
        const uri = `/playlists/:playlistId/tracks`.replace(":playlistId", playlistId)
        const data = { uris }
        const {
            data: { snapshot_id: snapshotId },
        } = await this.axios.post<{ snapshot_id: string }>(uri, data)
        return snapshotId
    }
    async getTrackById(trackId: string) {
        const uri = `/tracks/${trackId}`.replace(":trackId", trackId)
        try {
            const { data: spotifyTrack } = await this.axios.get<SpotifyTrack>(uri)
            return spotifyTrack
        } catch {
            return undefined
        }
    }
    async listArtists(search: string, page: number) {
        if (!search)
            return {
                count: 0,
                items: [],
            }
        const uri = `/search`
        const limit = 20
        const offset = (page - 1) * limit
        const params = {
            type: "artist",
            q: encodeURIComponent(search),
            limit: String(limit),
            offset: String(offset),
        }
        const { data: payload } = await this.axios.get<{ artists: { items: SpotifyArtist[]; total: number } }>(uri, {
            params,
        })
        const {
            artists: { items, total: count },
        } = payload
        return {
            count,
            items,
        }
    }
    async listTracks(search: string, page: number, artist: string) {
        const uri = `/search`
        const limit = 20
        const offset = (page - 1) * limit
        const where: string[] = []
        if (artist) where.push(`artist:${artist}`)
        const append = where.length ? " " + where.join(" ") : ""
        const q = encodeURIComponent(search + encodeURI(append))
        const paramsSerializer = () => `type=track&limit=${limit}&offset=${offset}&q=${q}`
        const {
            data: {
                tracks: { items, total: count },
            },
        } = await this.axios.get<{ tracks: { items: SpotifyTrack[]; total: number } }>(uri, {
            params: {},
            paramsSerializer,
        })
        return {
            count,
            items,
        }
    }
    async removePlaylistTracks(playlistId: string, ...uris: string[]) {
        const uri = `/playlists/:playlistId/tracks`.replace(":playlistId", playlistId)
        const data = { tracks: uris.map((uri) => ({ uri })) }
        const {
            data: { snapshot_id: snapshotId },
        } = await this.axios.delete<{ snapshot_id: string }>(uri, { data })
        return snapshotId
    }
}
