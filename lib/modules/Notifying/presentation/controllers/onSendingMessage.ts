import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureUserHasPermission } from "@/utils/sessions"
import Joi from "joi"
import { getMessaging } from "firebase-admin/messaging"
import { UnableToSendMessage } from "@/modules/Notifying/errors/UnableToSendMessage"

type SendingMessage = {
    token: string
    title?: string
    body: string
}

const validator = Joi.object<SendingMessage>({
    token: Joi.string().required().messages({
        "any.required": "必須填寫 token",
        "string.empty": "必須填寫 token",
    }),
    title: Joi.string(),
    body: Joi.string().required().messages({
        "any.required": "必須填寫 body",
        "string.empty": "必須填寫 body",
    }),
})

export const onSendingMessage = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        ensureUserHasPermission(response)
        const { token, title, body } = await validator.validateAsync(request.body)
        const messaging = getMessaging()
        try {
            const messageId = await messaging.send({
                token,
                notification: {
                    title,
                    body,
                },
            })
            const payload = { messageId }
            return response.json({ payload })
        } catch (error) {
            const reason = (error as Error).message
            throw new UnableToSendMessage({ reason })
        }
    } catch (thrown) {
        return next(thrown)
    }
}
