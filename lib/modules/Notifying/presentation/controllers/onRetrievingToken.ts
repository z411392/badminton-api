import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { type Request, type Response } from "express"
import { getFirestore } from "firebase-admin/firestore"
import { SubscriptionDao } from "@/adapters/firestore/SubscriptionDao"

export const onRetrievingToken = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const db = getFirestore()
        const subscriptionDao = new SubscriptionDao({ db })
        const subscription = await subscriptionDao.byId(credentials.uid)
        const payload = { token: subscription ? subscription.token : undefined }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
