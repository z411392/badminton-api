import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { type UpdatingGroup, UpdateGroup } from "@/modules/GroupManaging/application/mutations/UpdateGroup"
import { getFirestore } from "firebase-admin/firestore"
import { name, photo, contactUs } from "@/modules/GroupManaging/presentation/validators/Group"
import Joi from "joi"

const validator = Joi.object<UpdatingGroup>({
    name,
    photo,
    contactUs,
})

export const onUpdatingGroup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const groupId = await db.runTransaction(async (transaction) => {
            const updateGroup = new UpdateGroup({ db, transaction })
            return await updateGroup(credentials.uid, request.params.groupId, mutation)
        })
        const payload = {
            groupId,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
