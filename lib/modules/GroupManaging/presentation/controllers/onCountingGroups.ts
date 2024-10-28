import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { type CountingGroups, CountGroups } from "@/modules/GroupManaging/application/queries/CountGroups"
import { getFirestore } from "firebase-admin/firestore"
import Joi from "joi"

const validator = Joi.object<CountingGroups>()

export const onCountingGroups = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const countGroups = new CountGroups({ db })
        const count = await countGroups(credentials.uid, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
