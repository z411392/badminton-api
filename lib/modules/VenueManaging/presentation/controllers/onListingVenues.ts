import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import Joi from "joi"
import { getFirestore } from "firebase-admin/firestore"
import { type ListingVenues, ListVenues } from "@/modules/VenueManaging/application/queries/ListVenues"
import { page } from "@/utils/validators"
import { search } from "@/utils/validators"

const validator = Joi.object<ListingVenues>({
    search,
    page,
})

export const onListingVenues = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listVenues = new ListVenues({ db })
        const venues = []
        for await (const venue of listVenues(credentials.uid, query)) venues.push(venue)
        const payload = { venues }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
