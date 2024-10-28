import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import cache from "memory-cache"
import { CacheKeys } from "@/constants"
import { SpotifyService } from "@/adapters/http/SpotifyService"
import { TrackRepository } from "@/adapters/firestore/TrackRepository"
import { type Track } from "@/modules/TrackManaging/dtos/Track"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { PlaylistNotFound } from "@/modules/PlaylistManaging/errors/PlaylistNotFound"
import PQueue from "p-queue"

const queue = new PQueue({ concurrency: 8, interval: 1000, intervalCap: 1000 })

export type AddingTracks = {
    spotifyIds: string[]
}

export class AddTracks extends CallableInstance<
    [string, string, string, AddingTracks, string?],
    Promise<{ trackId: string }>
> {
    protected logger: ConsolaInstance
    protected spotifyService: SpotifyService
    protected trackRepository: TrackRepository
    protected playlistRepository: PlaylistRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`AddTracks`)
        const accessToken = cache.get(CacheKeys.SpotifyAccessToken) as string
        this.spotifyService = new SpotifyService({ accessToken })
        this.trackRepository = new TrackRepository({ db, transaction })
        this.playlistRepository = new PlaylistRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, playlistId: string, mutation: AddingTracks, permissionId?: string) {
        const playlistExists = await this.playlistRepository.get(groupId, playlistId)
        if (!playlistExists) throw new PlaylistNotFound({ playlistId })
        const uris: string[] = []
        let tracksCountIncrement = 0
        let tracksDurationIncrement = 0
        for (const spotifyId of mutation.spotifyIds) {
            const spotifyTrackExists = await this.spotifyService.getTrackById(spotifyId)
            if (!spotifyTrackExists) continue
            tracksCountIncrement += 1
            tracksDurationIncrement += spotifyTrackExists.duration_ms
            const uri = `spotify:track:${spotifyId}`
            uris.push(uri)
        }
        queue.add(() => this.spotifyService.addItemsToPlaylist(playlistExists.spotifyId, ...uris))
        const trackIds = []
        for (const spotifyId of mutation.spotifyIds) {
            const trackId = TrackRepository.nextId({ playlistId })
            const track: Track = {
                id: trackId,
                userId,
                spotifyId,
                snapshotId: "",
            }
            await this.trackRepository.set(groupId, playlistId, trackId, track)
            trackIds.push(trackId)
            await new Promise((resolve) => setTimeout(resolve, 1))
        }
        playlistExists.tracksCount += tracksCountIncrement
        playlistExists.tracksDuration += tracksDurationIncrement
        await this.playlistRepository.set(groupId, playlistId, playlistExists)
        return trackIds
    }
}
