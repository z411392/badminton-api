import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemoveShuttle } from "@/modules/ShuttleManaging/application/mutations/RemoveShuttle"

export const onRemovingShuttle = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const db = getFirestore()
        const shuttleId = await db.runTransaction(async (transaction) => {
            const createShuttle = new RemoveShuttle({ db, transaction })
            return await createShuttle(credentials.uid, request.params.shuttleId)
        })
        const payload = { shuttleId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
