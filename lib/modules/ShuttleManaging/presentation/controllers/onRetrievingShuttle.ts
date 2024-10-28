import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { ShuttleNotFound } from "@/modules/ShuttleManaging/errors/ShuttleNotFound"

export const onRetrievingShuttle = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const { shuttleId } = request.params as { shuttleId: string }
        const db = getFirestore()
        const shuttleDao = new ShuttleDao({ db })
        const shuttle = await shuttleDao.byId(shuttleId)
        if (!shuttle) throw new ShuttleNotFound({ shuttleId })
        const payload = { shuttle }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
