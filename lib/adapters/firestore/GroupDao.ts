import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type Group, fromDocumentSnapshot } from "@/modules/GroupManaging/dtos/Group"

export class GroupDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection() {
        return this.db.collection(Collections.Groups)
    }

    protected async *_inIds(...ids: string[]) {
        const documentsReference = this.getCollection()
            .where(FieldPath.documentId(), "in", ids)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(...allGroupIds: string[]) {
        const batchSize = 30
        const mapping: { [groupId: string]: Group } = {}
        for (let index = 0; index < allGroupIds.length; index += 30) {
            const groupIds = allGroupIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(...groupIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const groupId of allGroupIds) {
            const group = mapping[groupId]
            if (!group) continue
            yield group
        }
    }

    async byId(groupId: string) {
        let group: Group | undefined = undefined
        for await (const found of this.inIds(groupId)) {
            group = found
            break
        }
        return group
    }

    async findOne({ name }: { name: string }) {
        const documentsReference = this.getCollection()
            .where("name", "==", name)
            .limit(1)
            .select()
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) return documentSnapshot.id
        return undefined
    }
}
