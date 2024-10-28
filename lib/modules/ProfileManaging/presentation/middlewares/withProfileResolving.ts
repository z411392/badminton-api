import { type Request, type Response } from "express"
import { withCredentials, withGroup } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolveProfile } from "@/modules/ProfileManaging/application/mutations/ResolveProfile"
import { SessionKeys } from "@/utils/sessions"

export const withProfileResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const group = withGroup(response)
    if (!group) return next()
    const db = getFirestore()
    const resolveProfile = new ResolveProfile({ db })
    const profile = await resolveProfile(credentials.uid, group.id)
    if (profile) response.locals[SessionKeys.Profile] = profile
    return next()
}
