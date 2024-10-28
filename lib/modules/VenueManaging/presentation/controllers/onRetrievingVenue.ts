import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"

export const onRetrievingVenue = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { venueId } = request.params as { venueId: string }
        const db = getFirestore()
        const venueDao = new VenueDao({ db })
        const venue = await venueDao.byId(venueId)
        if (!venue) throw new VenueNotFound({ venueId })
        const payload = { venue }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
