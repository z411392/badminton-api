import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type CreatingGroup, CreateGroup } from "@/modules/GroupManaging/application/mutations/CreateGroup"
import { name, photo, contactUs } from "@/modules/GroupManaging/presentation/validators/Group"
import Joi from "joi"

const validator = Joi.object<CreatingGroup>({
    name,
    photo,
    contactUs,
})

export const onCreatingGroup = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const mutation = await validator.validateAsync(request.body)
        const db = getFirestore()
        const groupId = await db.runTransaction(async (transaction) => {
            const createGroup = new CreateGroup({ db, transaction })
            return await createGroup(credentials.uid, mutation)
        })
        const payload = {
            groupId,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
