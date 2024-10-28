import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { PermissionDao } from "@/adapters/firestore/PermissionDao"

export const onRetrievingPermission = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        ensureGroupIsSpecified(response)
        ensureUserHasPermission(response, { mustBeApproved: true, mustBeOwner: true })
        const permissionId = request.params.permissionId
        const db = getFirestore()
        const permissionDao = new PermissionDao({ db })
        const permission = await permissionDao.byId(permissionId)
        const payload = { permission }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
