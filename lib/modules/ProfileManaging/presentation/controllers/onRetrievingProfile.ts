import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ProfileDao } from "@/adapters/firestore/ProfileDao"
import { ProfileNotFound } from "@/modules/ProfileManaging/errors/ProfileNotFound"
import { ProfileRepository } from "@/adapters/firestore/ProfileRepository"

export const onRetrievingProfile = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const profileId = request.params.profileId
            ? request.params.profileId
            : ProfileRepository.nextId({ groupId: group.id, userId: credentials.uid })
        const db = getFirestore()
        const profileDao = new ProfileDao({ db })
        const profile = await profileDao.byId(group.id, profileId)
        if (!profile) throw new ProfileNotFound({ profileId })
        const payload = { profile }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
