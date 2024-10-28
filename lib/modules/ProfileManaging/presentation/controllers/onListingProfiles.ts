import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type ListingProfiles, ListProfiles } from "@/modules/ProfileManaging/application/queries/ListProfiles"
import Joi from "joi"
import { page, search } from "@/utils/validators"
import { levelIds } from "@/modules/ProfileManaging/presentation/validators/Filter"
import { UserDao } from "@/adapters/auth/UserDao"
import { type User } from "@/modules/IdentityAndAccessManaging/dtos/User"
import { SubscriptionDao } from "@/adapters/firestore/SubscriptionDao"

const validator = Joi.object<ListingProfiles>({
    page,
    search,
    levelIds,
})

export const onListingProfiles = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listProfiles = new ListProfiles({ db })
        const userDao = new UserDao()
        const subscriptionDao = new SubscriptionDao({ db })
        const usersMap: { [userId: string]: User | undefined } = {}
        const tokensMap: { [userId: string]: string } = {}
        const profiles = []
        for await (const profile of listProfiles(credentials.uid, group.id, query)) {
            usersMap[profile.userId] = undefined
            profiles.push(profile)
        }
        const users = userDao.inIds(...Object.keys(usersMap))
        for await (const user of users) usersMap[user.id] = user
        const subscriptions = subscriptionDao.inIds(...Object.keys(usersMap))
        for await (const subscription of subscriptions) tokensMap[subscription.id] = subscription.token
        const payload = { profiles, usersMap, tokensMap }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
