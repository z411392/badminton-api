import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import { SpotifyService } from "@/adapters/http/SpotifyService"

export type CreatingPlaylist = {
    name: string
}

export class CreatePlaylist extends CallableInstance<
    [string, string, CreatingPlaylist],
    Promise<{ playlistId: string }>
> {
    protected logger: ConsolaInstance
    protected playlistRepository: PlaylistRepository
    protected spotifyService: SpotifyService

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`CreatePlaylist`)
        this.playlistRepository = new PlaylistRepository({ db, transaction })
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        this.spotifyService = new SpotifyService({ accessToken })
    }
    async execute(userId: string, groupId: string, { name }: CreatingPlaylist) {
        const playlistId = PlaylistRepository.nextId({ groupId })
        const spotifyId = await this.spotifyService.createPlaylist(name)
        const playlist: Playlist = {
            id: playlistId,
            name,
            spotifyId,
            tracksDuration: 0,
            tracksCount: 0,
        }
        await this.playlistRepository.set(groupId, playlistId, playlist)
        return playlistId
    }
}
