import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type SavingProfile, SaveProfile } from "@/modules/ProfileManaging/application/mutations/SaveProfile"
import Joi from "joi"
import { levelId, name, line } from "@/modules/ProfileManaging/presentation/validators/Profile"

const validator = Joi.object<SavingProfile>({
    levelId,
    name,
    line,
})

export const onSavingProfile = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const profileId = await db.runTransaction(async (transaction) => {
            const createProfile = new SaveProfile({ db, transaction })
            return await createProfile(credentials.uid, group.id, mutation)
        })
        const payload = { profileId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
