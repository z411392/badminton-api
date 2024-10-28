import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { PlaylistDao } from "@/adapters/firestore/PlaylistDao"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"

export class ResolvePlaylist extends CallableInstance<[string, string, string], Promise<Playlist | undefined>> {
    protected logger: ConsolaInstance
    protected playlistDao: PlaylistDao
    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`ResolvePlaylist`)
        this.playlistDao = new PlaylistDao({ db })
    }
    async execute(userId: string, groupId: string, playlistId: string) {
        const playlist = await this.playlistDao.byId(groupId, playlistId)
        return playlist
    }
}
