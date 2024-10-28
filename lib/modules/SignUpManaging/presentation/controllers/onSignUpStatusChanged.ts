import { WatchTypes } from "@/utils/firestore"
import { getFirestore } from "firebase-admin/firestore"
import {
    SendLINEPushMessage,
    type SendingLINEPushMessage,
} from "@/modules/Notifying/application/mutations/SendLINEPushMessage"
import { type SignUpEvent } from "@/modules/SignUpManaging/dtos/SignUpEvent"

export const onSignUpStatusChanged = async (type: WatchTypes, parameters: string[], event: SignUpEvent) => {
    const db = getFirestore()
    const [groupId, meetupId] = parameters
    const sendLINEPushMessage = new SendLINEPushMessage({ db })
    const {
        payload: { userId, timeslotId, status },
    } = event
    const mutation: SendingLINEPushMessage = {
        timeslotId,
        status,
    }
    await sendLINEPushMessage(userId, groupId, meetupId, mutation)
}
