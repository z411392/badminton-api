import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ListLevels } from "@/modules/LevelManaging/application/queries/ListLevels"

export const onListingLevels = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const db = getFirestore()
        const listLevels = new ListLevels({ db })
        const levels = []
        for await (const level of listLevels(credentials.uid, group.id)) levels.push(level)
        const payload = { levels }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
