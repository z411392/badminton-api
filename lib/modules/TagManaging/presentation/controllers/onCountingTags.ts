import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CountingTags, CountTags } from "@/modules/TagManaging/application/queries/CountTags"
import Joi from "joi"
import { search } from "@/utils/validators"

const validator = Joi.object<CountingTags>({
    search,
})

export const onCountingTags = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const countTags = new CountTags({ db })
        const count = await countTags(credentials.uid, group.id, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
