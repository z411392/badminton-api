import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { UserDao } from "@/adapters/auth/UserDao"
import { UserNotFound } from "@/modules/IdentityAndAccessManaging/errors/UserNotFound"
import { Providers } from "@/modules/IdentityAndAccessManaging/dtos/Providers"
import axios from "axios"

export const onRetrievingFriendshipStatus = async (request: Request, response: Response, next: Function) => {
    const credentials = ensureUserIsAuthenticated(response)
    const userDao = new UserDao()
    let isFriend = true
    try {
        const user = await userDao.byId(credentials.uid)
        if (!user) throw new UserNotFound({ userId: credentials.uid })
        const userId = user.providers[Providers.LINE]
        if (!userId) throw new UserNotFound({ userId: credentials.uid })
        const { data: _ } = await axios.get<{
            userId: string
            displayName: string
            pictureUrl: string
            statusMessage: string
            language: string
        }>(`https://api.line.me/v2/bot/profile/${userId}`, {
            headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN!}'` },
        })
    } catch {
        isFriend = false
    }
    const payload = {
        isFriend,
    }
    return response.json({ payload })
}
