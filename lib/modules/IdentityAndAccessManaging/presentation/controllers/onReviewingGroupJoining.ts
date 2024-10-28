import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import Joi from "joi"
import {
    type ReviewingGroupJoining,
    ReviewGroupJoining,
} from "@/modules/IdentityAndAccessManaging/application/mutations/ReviewGroupJoining"
import { permissionId, status } from "@/modules/IdentityAndAccessManaging/presentation/validators/Permission"

const validator = Joi.object<ReviewingGroupJoining>({
    permissionId,
    status,
})

export const onReviewingGroupJoining = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const permission = ensureUserHasPermission(response, { mustBeApproved: true, mustBeOwner: true })
        const permissionId = request.params.permissionId
        const mutation = await validator.validateAsync({ ...request.body, permissionId })
        const payload = {
            permissionId,
        }
        if (permission.id === mutation.permissionId) return response.json({ payload })
        const db = getFirestore()
        await db.runTransaction(async (transaction) => {
            const reviewGroupJoining = new ReviewGroupJoining({ db, transaction })
            await reviewGroupJoining(credentials.uid, group.id, mutation)
        })
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
