import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemoveLevel } from "@/modules/LevelManaging/application/mutations/RemoveLevel"

export const onRemovingLevel = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const db = getFirestore()
        const levelId = await db.runTransaction(async (transaction) => {
            const removeLevel = new RemoveLevel({ db, transaction })
            return await removeLevel(credentials.uid, group.id, request.params.levelId)
        })
        const payload = { levelId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
