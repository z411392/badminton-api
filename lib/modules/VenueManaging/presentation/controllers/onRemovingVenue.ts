import { type Request, type Response } from "express"
import { ensureUserIsRoot } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { RemoveVenue } from "@/modules/VenueManaging/application/mutations/RemoveVenue"

export const onRemovingVenue = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsRoot(response)
        const db = getFirestore()
        const venueId = await db.runTransaction(async (transaction) => {
            const removeVenue = new RemoveVenue({ db, transaction })
            return await removeVenue(credentials.uid, request.params.venueId)
        })
        const payload = { venueId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
