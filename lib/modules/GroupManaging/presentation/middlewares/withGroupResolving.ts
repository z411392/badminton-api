import { type Request, type Response } from "express"
import { withCredentials } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolveGroup } from "@/modules/GroupManaging/application/mutations/ResolveGroup"
import { SessionKeys } from "@/utils/sessions"

export const withGroupResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const db = getFirestore()
    const resolveGroup = new ResolveGroup({ db })
    const group = await resolveGroup(credentials.uid, request.params.groupId)
    if (group) response.locals[SessionKeys.Group] = group
    return next()
}
