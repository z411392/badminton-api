import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { UserDao } from "@/adapters/auth/UserDao"
import { UserNotFound } from "@/modules/IdentityAndAccessManaging/errors/UserNotFound"

export const onRetrievingUser = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { userId } = request.params as { userId: string }
        const userDao = new UserDao()
        const user = await userDao.byId(userId)
        if (!user) throw new UserNotFound({ userId })
        const payload = {
            user,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
