import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import Joi from "joi"
import { getFirestore } from "firebase-admin/firestore"
import { type ListingShuttles, ListShuttles } from "@/modules/ShuttleManaging/application/queries/ListShuttles"
import { page, search } from "@/utils/validators"

const validator = Joi.object<ListingShuttles>({
    search,
    page,
})

export const onListingShuttles = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listShuttles = new ListShuttles({ db })
        const shuttles = []
        for await (const shuttle of listShuttles(credentials.uid, query)) shuttles.push(shuttle)
        const payload = { shuttles }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
