import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingLevel, UpdateLevel } from "@/modules/LevelManaging/application/mutations/UpdateLevel"
import Joi from "joi"
import { color } from "@/utils/validators"
import { name, order, description } from "@/modules/LevelManaging/presentation/validators/Level"

const validator = Joi.object<UpdatingLevel>({
    name,
    order,
    color,
    description,
})

export const onUpdatingLevel = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const levelId = await db.runTransaction(async (transaction) => {
            const updateLevel = new UpdateLevel({ db, transaction })
            return await updateLevel(credentials.uid, group.id, request.params.levelId, mutation)
        })
        const payload = { levelId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
