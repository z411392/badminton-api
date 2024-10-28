import { type Firestore, type DocumentSnapshot, FieldPath } from "firebase-admin/firestore"
import { Collections } from "@/constants"
import { type SignUp, fromDocumentSnapshot } from "@/modules/SignUpManaging/dtos/SignUp"

export class SignUpDao {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }

    protected getCollection(groupId: string, meetupId: string, timeslotId: string) {
        return this.db.collection(
            Collections.SignUps.replace(":groupId", groupId)
                .replace(":meetupId", meetupId)
                .replace(":timeslotId", timeslotId),
        )
    }

    protected async *_inIds(groupId: string, meetupId: string, timeslotId: string, ...signUpIds: string[]) {
        const documentsReference = this.getCollection(groupId, meetupId, timeslotId)
            .where(FieldPath.documentId(), "in", signUpIds)
            .stream() as unknown as ReadableStream<DocumentSnapshot>
        for await (const documentSnapshot of documentsReference) yield documentSnapshot
    }

    async *inIds(groupId: string, meetupId: string, timeslotId: string, ...allSignUpIds: string[]) {
        const batchSize = 30
        const mapping: { [signUpId: string]: SignUp } = {}
        for (let index = 0; index < allSignUpIds.length; index += 30) {
            const signUpIds = allSignUpIds.slice(index, index + batchSize)
            for await (const documentSnapshot of this._inIds(groupId, meetupId, timeslotId, ...signUpIds))
                mapping[documentSnapshot.id] = fromDocumentSnapshot(documentSnapshot)
        }
        for (const signUpId of allSignUpIds) {
            const signUp = mapping[signUpId]
            if (!signUp) continue
            yield signUp
        }
    }

    async byId(groupId: string, meetupId: string, timeslotId: string, signUpId: string) {
        let signUp: SignUp | undefined = undefined
        for await (const found of this.inIds(groupId, meetupId, timeslotId, signUpId)) {
            signUp = found
            break
        }
        return signUp
    }
}
