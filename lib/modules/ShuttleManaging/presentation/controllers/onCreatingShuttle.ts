import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingShuttle, CreateShuttle } from "@/modules/ShuttleManaging/application/mutations/CreateShuttle"
import Joi from "joi"
import { brand, name } from "@/modules/ShuttleManaging/presentation/validators/Shuttle"

const validator = Joi.object<CreatingShuttle>({
    brand,
    name,
})

export const onCreatingShuttle = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const shuttleId = await db.runTransaction(async (transaction) => {
            const createShuttle = new CreateShuttle({ db, transaction })
            return await createShuttle(credentials.uid, mutation)
        })
        const payload = { shuttleId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
