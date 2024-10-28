import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { PlaylistNotFound } from "@/modules/PlaylistManaging/errors/PlaylistNotFound"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import { SpotifyService } from "@/adapters/http/SpotifyService"

export type UpdatingPlaylist = {
    name: string
}

export class UpdatePlaylist extends CallableInstance<
    [string, string, string, UpdatingPlaylist],
    Promise<{ playlistId: string }>
> {
    protected logger: ConsolaInstance
    protected playlistRepository: PlaylistRepository
    protected spotifyService: SpotifyService

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`UpdatePlaylist`)
        this.playlistRepository = new PlaylistRepository({ db, transaction })
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        this.spotifyService = new SpotifyService({ accessToken })
    }
    async execute(userId: string, groupId: string, playlistId: string, { name }: UpdatingPlaylist) {
        const playlistExists = await this.playlistRepository.get(groupId, playlistId)
        if (!playlistExists) throw new PlaylistNotFound({ playlistId })
        const playlist: Playlist = {
            ...playlistExists,
            name,
        }
        await this.playlistRepository.set(groupId, playlistId, playlist)
        await this.spotifyService.changePlaylistDetails(playlistExists.spotifyId, name)
        return playlistId
    }
}
