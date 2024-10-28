import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import { SpotifyService } from "@/adapters/http/SpotifyService"
import { TrackRepository } from "@/adapters/firestore/TrackRepository"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { PlaylistNotFound } from "@/modules/PlaylistManaging/errors/PlaylistNotFound"
import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 8, interval: 1000, intervalCap: 1000 })

export type RemovingTracks = {
    trackIds: string[]
}

export class RemoveTracks extends CallableInstance<
    [string, string, string, RemovingTracks, string?],
    Promise<{ trackId: string }>
> {
    protected logger: ConsolaInstance
    protected spotifyService: SpotifyService
    protected trackRepository: TrackRepository
    protected playlistRepository: PlaylistRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemoveTracks`)
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        this.spotifyService = new SpotifyService({ accessToken })
        this.trackRepository = new TrackRepository({ db, transaction })
        this.playlistRepository = new PlaylistRepository({ db, transaction })
    }
    async execute(
        userId: string,
        groupId: string,
        playlistId: string,
        mutation: RemovingTracks,
        permissionId?: string,
    ) {
        const playlistExists = await this.playlistRepository.get(groupId, playlistId)
        if (!playlistExists) throw new PlaylistNotFound({ playlistId })
        const uris: string[] = []
        let tracksCountIncrement = 0
        let tracksDurationIncrement = 0
        const trackIds: string[] = []
        for (const trackId of mutation.trackIds) {
            const trackExists = await this.trackRepository.get(groupId, playlistId, trackId)
            if (!trackExists) continue
            if (!permissionId && trackExists.userId !== userId) continue
            const spotifyTrackExists = await this.spotifyService.getTrackById(trackExists.spotifyId)
            if (!spotifyTrackExists) continue
            tracksCountIncrement -= 1
            tracksDurationIncrement -= spotifyTrackExists.duration_ms
            const uri = `spotify:track:${trackExists.spotifyId}`
            uris.push(uri)
            trackIds.push(trackId)
        }
        queue.add(() => this.spotifyService.removePlaylistTracks(playlistExists.spotifyId, ...uris))
        for (const trackId of trackIds) await this.trackRepository.remove(groupId, playlistId, trackId)
        playlistExists.tracksCount += tracksCountIncrement
        playlistExists.tracksDuration += tracksDurationIncrement
        await this.playlistRepository.set(groupId, playlistId, playlistExists)
        return trackIds
    }
}
