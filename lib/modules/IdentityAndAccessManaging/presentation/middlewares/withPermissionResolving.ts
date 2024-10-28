import { type Request, type Response } from "express"
import { withCredentials, withGroup } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolvePermission } from "@/modules/IdentityAndAccessManaging/application/mutations/ResolvePermission"
import { SessionKeys } from "@/utils/sessions"

export const withPermissionResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const group = withGroup(response)
    if (!group) return next()
    const db = getFirestore()
    const resolvePermission = new ResolvePermission({ db })
    const permission = await resolvePermission(credentials.uid, group.id)
    if (permission) response.locals[SessionKeys.Permission] = permission
    return next()
}
