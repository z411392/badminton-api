import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingVenue, UpdateVenue } from "@/modules/VenueManaging/application/mutations/UpdateVenue"
import Joi from "joi"
import {
    name,
    address,
    building,
    floor,
    latitude,
    longitude,
} from "@/modules/VenueManaging/presentation/validators/Venue"

const validator = Joi.object<UpdatingVenue>({
    name,
    address,
    building,
    floor,
    latitude,
    longitude,
})

export const onUpdatingVenue = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const venueId = await db.runTransaction(async (transaction) => {
            const updateVenue = new UpdateVenue({ db, transaction })
            return await updateVenue(credentials.uid, request.params.venueId, mutation)
        })
        const payload = { venueId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
