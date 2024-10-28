import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { PlaylistDao } from "@/adapters/firestore/PlaylistDao"
import { type CountingPlaylists } from "@/modules/PlaylistManaging/application/queries/CountPlaylists"

export type ListingPlaylists = CountingPlaylists & {
    page: number
}

export class ListPlaylists extends CallableInstance<[string, string, ListingPlaylists], AsyncIterable<Playlist>> {
    protected logger: ConsolaInstance
    protected playlistDao: PlaylistDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ListPlaylists`)
        this.playlistDao = new PlaylistDao({ db })
    }
    async *execute(userId: string, groupId: string, { page, search }: ListingPlaylists) {
        const playlistIds = await this.playlistDao.search({ groupId, search }, page)
        if (playlistIds.length === 0) return
        for await (const playlist of this.playlistDao.inIds(groupId, ...playlistIds)) yield playlist
    }
}
