import { WatchTypes } from "@/utils/firestore"
import { getFirestore } from "firebase-admin/firestore"
import { PushMessage, type PushingMessage } from "@/modules/Notifying/application/mutations/PushMessage"
import { type SignUpEvent } from "@/modules/SignUpManaging/dtos/SignUpEvent"
import { getMessaging } from "firebase-admin/messaging"

export const onSignUpStatusChanged = async (type: WatchTypes, parameters: string[], event: SignUpEvent) => {
    const db = getFirestore()
    const [groupId, meetupId] = parameters
    const messaging = getMessaging()
    const pushMessage = new PushMessage({ db, messaging })
    const {
        payload: { userId, timeslotId, status },
    } = event
    const mutation: PushingMessage = {
        timeslotId,
        status,
    }
    await pushMessage(userId, groupId, meetupId, mutation)
}
