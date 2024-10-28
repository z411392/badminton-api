import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Level, fromDocumentSnapshot } from "@/modules/LevelManaging/dtos/Level"
import { PageSizes } from "@/constants"

export class LevelDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection(groupId: string) {
        return this.db.collection(Collections.Levels.replace(":groupId", groupId))
    }

    protected async *_inIds(groupId: string, ...levelIds: string[]) {
        const documentsReference = this.getCollection(groupId)
            .where(FieldPath.documentId(), "in", levelIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, ...allLevelIds: string[]) {
        const batchSize = 30
        const mapping: { [levelId: string]: Level } = {}
        for (let index = 0; index < allLevelIds.length; index += 30) {
            const levelIds = allLevelIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, ...levelIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const levelId of allLevelIds) {
            const level = mapping[levelId]
            if (!level) continue
            yield level
        }
    }

    async byId(groupId: string, levelId: string) {
        let level: Level | undefined = undefined
        for await (const found of this.inIds(groupId, levelId)) {
            level = found
            break
        }
        return level
    }
    async search({ groupId }: { groupId: string }) {
        const page = 1
        const limit: number = PageSizes.Unlimited
        const offset = (page - 1) * limit
        const venueIds: string[] = []
        const collection = this.getCollection(groupId)
        const stream = collection
            .select()
            .orderBy("order", "desc")
            .offset(offset)
            .limit(limit)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of stream) venueIds.push(documentSnapshot.id)
        return venueIds
    }
}
