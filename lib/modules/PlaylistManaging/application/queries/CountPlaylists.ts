import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore } from "firebase-admin/firestore"
import { PlaylistDao } from "@/adapters/firestore/PlaylistDao"

export type CountingPlaylists = {
    search: string
}

export class CountPlaylists extends CallableInstance<[string, string, CountingPlaylists], Promise<number>> {
    protected logger: ConsolaInstance
    protected playlistDao: PlaylistDao

    constructor({ db }: { db: Firestore }) {
        super("execute")
        this.logger = createConsola().withTag(`CountPlaylists`)
        this.playlistDao = new PlaylistDao({ db })
    }
    async execute(userId: string, groupId: string, { search }: CountingPlaylists) {
        const count = await this.playlistDao.count({ groupId, search })
        return count
    }
}
