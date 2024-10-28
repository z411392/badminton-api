import { getMessaging } from "firebase-admin/messaging"

export const isTokenValid = async (token: string) => {
    const messaging = getMessaging()
    try {
        await messaging.send({ token }, true)
        return true
    } catch (error) {
        return false
    }
}
