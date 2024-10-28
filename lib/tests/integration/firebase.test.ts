import { database, firestore } from "firebase-admin"
import { withResolvers } from "@/utils/promises"

describe.skip(`跟 firebase 相關的整合測試`, () => {
    test(`要能夠讀取／寫入 Realtime Database`, async () => {
        const db = database()
        expect(db).toBeTruthy()
        const key = "test"
        const testRef = db.ref(key)
        const value = "hello, world!"
        await expect(testRef.set(value)).resolves.not.toThrow()
        const snapshot = await testRef.get()
        expect(snapshot.val()).toBe(value)
    })
    test(`要能夠讀取／寫入／監控 Firestore`, async () => {
        const db = firestore()
        expect(db).toBeTruthy()
        const collectionName = "test"
        const collection = db.collection(collectionName)
        const adding = withResolvers<void>()
        const doc = collection.doc("1")
        const content = "hello, world!"
        await expect(doc.set({ content }, { merge: true })).resolves.not.toThrow()
        const snapshot = await doc.get()
        expect(snapshot).toBeTruthy()
        const removing = withResolvers<void>()
        await doc.delete()
        Promise.all([adding.promise, removing.promise])
    }, 60_000)
})
