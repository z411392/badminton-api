import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { SubscriptionRepository } from "@/adapters/firestore/SubscriptionRepository"
import Joi from "joi"

type SavingToken = {
    token: string
}

const validator = Joi.object<SavingToken>({
    token: Joi.string().required().messages({
        "any.required": "必須填寫 token",
        "string.empty": "必須填寫 token",
    }),
})

export const onSavingToken = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const db = getFirestore()
        const { token } = await validator.validateAsync(request.body)
        await db.runTransaction(async (transaction) => {
            const subscriptionRepository = new SubscriptionRepository({ db, transaction })
            const subscription = {
                id: credentials.uid,
                token,
            }
            await subscriptionRepository.set(credentials.uid, subscription)
            return token
        })
        const payload = { token }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
