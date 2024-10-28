import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemoveTag } from "@/modules/TagManaging/application/mutations/RemoveTag"

export const onRemovingTag = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const db = getFirestore()
        const tagId = await db.runTransaction(async (transaction) => {
            const removeTag = new RemoveTag({ db, transaction })
            return await removeTag(credentials.uid, group.id, request.params.tagId)
        })
        const payload = { tagId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
