import { type Request, type Response } from "express"
import { withCredentials, withGroup } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolveMeetup } from "@/modules/MeetupManaging/application/mutations/ResolveMeetup"
import { SessionKeys } from "@/utils/sessions"

export const withMeetupResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const group = withGroup(response)
    if (!group) return next()
    const db = getFirestore()
    const resolveMeetup = new ResolveMeetup({ db })
    const meetup = await resolveMeetup(credentials.uid, group.id, request.params.meetupId)
    if (meetup) response.locals[SessionKeys.Meetup] = meetup
    return next()
}
