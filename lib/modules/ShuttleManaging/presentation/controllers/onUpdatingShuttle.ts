import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingShuttle, UpdateShuttle } from "@/modules/ShuttleManaging/application/mutations/UpdateShuttle"
import Joi from "joi"
import { brand, name } from "@/modules/ShuttleManaging/presentation/validators/Shuttle"

const validator = Joi.object<UpdatingShuttle>({
    brand,
    name,
})

export const onUpdatingShuttle = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const shuttleId = await db.runTransaction(async (transaction) => {
            const updateShuttle = new UpdateShuttle({ db, transaction })
            return await updateShuttle(credentials.uid, request.params.shuttleId, mutation)
        })
        const payload = { shuttleId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
