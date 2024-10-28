import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getObjectURL } from "@/utils/storage"

export const onRetrievingGroup = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { photoPath, ...rest } = ensureGroupIsSpecified(response)
        const permission = ensureUserHasPermission(response)
        const photoURL = await getObjectURL(photoPath)
        const payload = {
            group: { ...rest, photoURL },
            permission,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
