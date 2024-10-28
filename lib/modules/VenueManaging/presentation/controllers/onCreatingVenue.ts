import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import Joi from "joi"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingVenue, CreateVenue } from "@/modules/VenueManaging/application/mutations/CreateVenue"
import {
    name,
    address,
    building,
    floor,
    latitude,
    longitude,
} from "@/modules/VenueManaging/presentation/validators/Venue"

const validator = Joi.object<CreatingVenue>({
    name,
    address,
    building,
    floor,
    latitude,
    longitude,
})

export const onCreatingVenue = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const venueId = await db.runTransaction(async (transaction) => {
            const createVenue = new CreateVenue({ db, transaction })
            return await createVenue(credentials.uid, mutation)
        })
        const payload = { venueId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
