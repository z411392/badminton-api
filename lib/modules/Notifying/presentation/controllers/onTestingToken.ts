import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getMessaging } from "firebase-admin/messaging"
import { UnableToSendMessage } from "@/modules/Notifying/errors/UnableToSendMessage"
import Joi from "joi"

type TestingToken = {
    token: string
}

const validator = Joi.object<TestingToken>({
    token: Joi.string().required().messages({
        "any.required": "必須填寫 token",
        "string.empty": "必須填寫 token",
    }),
})


export const onTestingToken = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const messaging = getMessaging()
        const { token } = await validator.validateAsync(request.body)
        try {
            const messageId = await messaging.send({
                token,
                notification: {
                    body: "這組訂閱碼可以用喔！",
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
