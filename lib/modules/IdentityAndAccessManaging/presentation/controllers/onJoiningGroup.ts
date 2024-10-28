import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { JoinGroup } from "@/modules/IdentityAndAccessManaging/application/mutations/JoinGroup"

export const onJoiningGroup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const db = getFirestore()
        const permissionId = await db.runTransaction(async (transaction) => {
            const joinGroup = new JoinGroup({ db, transaction })
            return await joinGroup(credentials.uid, group.id)
        })
        const payload = { permissionId }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
