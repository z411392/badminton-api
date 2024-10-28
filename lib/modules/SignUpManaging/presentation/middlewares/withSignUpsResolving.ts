import { type Request, type Response } from "express"
import { withCredentials, withGroup, withMeetup } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolveSignUps } from "@/modules/SignUpManaging/application/mutations/ResolveSignUps"
import { SessionKeys } from "@/utils/sessions"

export const withSignUpsResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const group = withGroup(response)
    if (!group) return next()
    const meetup = withMeetup(response)
    if (!meetup) return next()
    const db = getFirestore()
    const resolveSignUp = new ResolveSignUps({ db })
    const signUps = await resolveSignUp(credentials.uid, group.id, meetup.id, ...meetup.timeslots.map(({ id }) => id!))
    response.locals[SessionKeys.SignUps] = signUps
    return next()
}
