import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CountingVenues, CountVenues } from "@/modules/VenueManaging/application/queries/CountVenues"
import Joi from "joi"
import { search } from "@/utils/validators"

const validator = Joi.object<CountingVenues>({
    search,
})

export const onCountingVenues = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const db = getFirestore()
        const query = await validator.validateAsync(request.query)
        const countVenues = new CountVenues({ db })
        const count = await countVenues(credentials.uid, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
