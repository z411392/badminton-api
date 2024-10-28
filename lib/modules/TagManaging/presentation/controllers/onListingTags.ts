import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type ListingTags, ListTags } from "@/modules/TagManaging/application/queries/ListTags"
import Joi from "joi"
import { page, search } from "@/utils/validators"

const validator = Joi.object<ListingTags>({
    search,
    page,
})

export const onListingTags = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listTags = new ListTags({ db })
        const tags = []
        for await (const tag of listTags(credentials.uid, group.id, query)) tags.push(tag)
        const payload = { tags }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
