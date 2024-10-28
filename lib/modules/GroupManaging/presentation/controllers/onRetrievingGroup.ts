import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getObjectURL } from "@/utils/storage"
import { type Permission } from "@/modules/IdentityAndAccessManaging/dtos/Permission"

export const onRetrievingGroup = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { photoPath, ...rest } = ensureGroupIsSpecified(response)
        let permission: Permission | undefined = undefined
        try {
            permission = ensureUserHasPermission(response)
        } catch {}
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
