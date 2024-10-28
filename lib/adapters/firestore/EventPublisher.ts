import { type Firestore } from "firebase-admin/firestore"
import { v5 as uuid5, v1 as uuid1 } from "uuid"
import { Topics, EventsSavedTo } from "@/constants"

export type Event<S = Topics, T = any> = {
    topic: S
    payload: T
    timestamp: number
}

export class EventPublisher {
    protected db: Firestore
    constructor({ db }: { db: Firestore }) {
        this.db = db
    }
    async publish(parameters: { [key: string]: string }, event: Event) {
        let collection = EventsSavedTo[event.topic as keyof typeof EventsSavedTo]
        for (const key in parameters) collection = collection.replace(`:${key}`, parameters[key])
        const eventId = uuid5(uuid1(), uuid5(collection, process.env.PROJECT_UUID!))
        const documentReference = this.db.collection(collection).doc(eventId)
        await documentReference.set(event)
        return eventId
    }
}
