import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { getObjectURL } from "@/utils/storage"
import { type ListingGroups, ListGroups } from "@/modules/GroupManaging/application/queries/ListGroups"
import { page } from "@/utils/validators"
import Joi from "joi"

const validator = Joi.object<ListingGroups>({
    page,
})

export const onListingGroups = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const listGroups = new ListGroups({ db })
        const groups = []
        for await (const { photoPath, ...group } of listGroups(credentials.uid, query)) {
            const photoURL = await getObjectURL(photoPath)
            groups.push({ ...group, photoURL })
        }
        const payload = { groups }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
