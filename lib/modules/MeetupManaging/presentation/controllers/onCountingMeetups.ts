import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CountingMeetups, CountMeetups } from "@/modules/MeetupManaging/application/queries/CountMeetups"
import Joi from "joi"
import { search } from "@/utils/validators"

const validator = Joi.object<CountingMeetups>({
    search,
})

export const onCountingMeetups = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const countMeetups = new CountMeetups({ db })
        const count = await countMeetups(credentials.uid, group.id, query)
        response.header("content-length", String(count))
        return response.end()
    } catch (thrown) {
        return next(thrown)
    }
}
