import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureMeetupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { SignUpDao } from "@/adapters/firestore/SignUpDao"
import { SignUpRepository } from "@/adapters/firestore/SignUpRepository"
import { SignUpNotFound } from "@/modules/SignUpManaging/errors/SignUpNotFound"

export const onRetrievingSignUp = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const meetup = ensureMeetupIsSpecified(response)
        const { timeslotId } = request.params as { timeslotId: string }
        const signUpId = request.params.signUpId
            ? request.params.signUpId
            : SignUpRepository.nextId({ timeslotId, userId: credentials.uid })
        const db = getFirestore()
        const signUpDao = new SignUpDao({ db })
        const signUp = await signUpDao.byId(group.id, meetup.id, timeslotId, signUpId)
        if (!signUp) throw new SignUpNotFound({ signUpId })
        const payload = { signUp: signUp }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
