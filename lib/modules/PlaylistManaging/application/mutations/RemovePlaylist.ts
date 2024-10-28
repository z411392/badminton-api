import CallableInstance from "callable-instance"
import { type ConsolaInstance, createConsola } from "consola"
import { type Firestore, type Transaction } from "firebase-admin/firestore"
import { PlaylistRepository } from "@/adapters/firestore/PlaylistRepository"
import { PlaylistNotFound } from "@/modules/PlaylistManaging/errors/PlaylistNotFound"

export class RemovePlaylist extends CallableInstance<[string, string, string], Promise<{ playlistId: string }>> {
    protected logger: ConsolaInstance
    protected playlistRepository: PlaylistRepository

    constructor({ db, transaction }: { db: Firestore; transaction: Transaction }) {
        super("execute")
        this.logger = createConsola().withTag(`RemovePlaylist`)
        this.playlistRepository = new PlaylistRepository({ db, transaction })
    }
    async execute(userId: string, groupId: string, playlistId: string) {
        const playlistExists = await this.playlistRepository.get(groupId, playlistId)
        if (!playlistExists) throw new PlaylistNotFound({ playlistId })
        await this.playlistRepository.remove(groupId, playlistId)
        return playlistId
    }
}
