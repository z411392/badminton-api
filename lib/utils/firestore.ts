import { getFirestore, type Firestore } from "firebase-admin/firestore"
import { type Query } from "firebase-admin/firestore"
import { onDevelopment } from "@/utils/development"

export enum WatchTypes {
    Added = "added",
    Removed = "removed",
    Modified = "modified",
}

type OnChanged<T> = (type: WatchTypes, parameters: string[], data: T) => any | Promise<any>
export type WatchOption<T = any> = [string | Query, OnChanged<T>, WatchTypes[] | undefined]

export const watchCollection = <T = any>(
    q: string | Query,
    onChanged: OnChanged<T>,
    documentChangeTypes: WatchTypes[] = [WatchTypes.Added, WatchTypes.Modified, WatchTypes.Removed],
    db?: Firestore,
) => {
    if (!db) db = getFirestore()
    if (typeof q === "string") q = db.collection(q)
    const unsubscribe = q.onSnapshot(async (querySnapshot) => {
        for (const { type, doc } of querySnapshot.docChanges()) {
            if (
                (onDevelopment() && !doc.ref.path.startsWith("development")) ||
                (!onDevelopment() && doc.ref.path.startsWith("development"))
            )
                continue
            if (!documentChangeTypes.includes(type as WatchTypes)) continue
            const parameters = doc.ref.path.split("/").filter((_, index) => index % 2)
            try {
                await onChanged(type as WatchTypes, parameters, doc.data() as T)
            } catch {}
        }
    })
    process.on("exit", () => {
        try {
            unsubscribe()
        } catch {}
    })
    return unsubscribe
}
