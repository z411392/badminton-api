import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type UpdatingProfile, UpdateProfile } from "@/modules/ProfileManaging/application/mutations/UpdateProfile"
import Joi from "joi"
import { levelId, name, line } from "@/modules/ProfileManaging/presentation/validators/Profile"

const validator = Joi.object<UpdatingProfile>({
    levelId,
    name,
    line,
})

export const onUpdatingProfile = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const profileId = await db.runTransaction(async (transaction) => {
            const updateProfile = new UpdateProfile({ db, transaction })
            return await updateProfile(credentials.uid, group.id, request.params.profileId, mutation)
        })
        const payload = { profileId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
