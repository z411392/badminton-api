import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingTag, CreateTag } from "@/modules/TagManaging/application/mutations/CreateTag"
import Joi from "joi"
import { name } from "@/modules/TagManaging/presentation/validators/Tag"

const validator = Joi.object<CreatingTag>({
    name,
})

export const onCreatingTag = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const tagId = await db.runTransaction(async (transaction) => {
            const createTag = new CreateTag({ db, transaction })
            return await createTag(credentials.uid, group.id, mutation)
        })
        const payload = { tagId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
