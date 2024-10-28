import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { CountProfiles } from "@/modules/ProfileManaging/application/queries/CountProfiles"
import { type CountingProfiles } from "@/modules/ProfileManaging/application/queries/CountProfiles"
import Joi from "joi"
import { search } from "@/utils/validators"
import { levelIds } from "@/modules/ProfileManaging/presentation/validators/Filter"

const validator = Joi.object<CountingProfiles>({
    search,
    levelIds,
})

export const onCountingProfiles = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const countProfiles = new CountProfiles({ db })
        const count = await countProfiles(credentials.uid, group.id, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
