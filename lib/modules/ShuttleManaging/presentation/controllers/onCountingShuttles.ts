import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CountingShuttles, CountShuttles } from "@/modules/ShuttleManaging/application/queries/CountShuttles"
import Joi from "joi"
import { search } from "@/utils/validators"

const validator = Joi.object<CountingShuttles>({
    search,
})

export const onCountingShuttles = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const countShuttles = new CountShuttles({ db })
        const count = await countShuttles(credentials.uid, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
