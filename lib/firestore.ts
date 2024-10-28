import { type WatchOption, WatchTypes } from "@/utils/firestore"
import { type Firestore } from "firebase-admin/firestore"
import { onSignUpStatusChanged } from "@/modules/SignUpManaging/presentation/controllers/onSignUpStatusChanged"
import { Topics } from "@/constants"

export const watchOptions = (db: Firestore) => {
    const now = Date.now()
    const watchOptions: WatchOption[] = [
        [
            db.collectionGroup("events").where("topic", "==", Topics.SignUp).where("timestamp", ">=", now),
            onSignUpStatusChanged,
            [WatchTypes.Added],
        ],
    ]
    return watchOptions
}
