import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingLevel, CreateLevel } from "@/modules/LevelManaging/application/mutations/CreateLevel"
import Joi from "joi"
import { color } from "@/utils/validators"
import { name, order, description } from "@/modules/LevelManaging/presentation/validators/Level"

const validator = Joi.object<CreatingLevel>({
    name,
    order,
    color,
    description,
})

export const onCreatingLevel = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const levelId = await db.runTransaction(async (transaction) => {
            const createLevel = new CreateLevel({ db, transaction })
            return await createLevel(credentials.uid, group.id, mutation)
        })
        const payload = { levelId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
