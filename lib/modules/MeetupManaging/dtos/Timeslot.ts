import { type DocumentSnapshot } from "firebase-admin/firestore"
import { DateTime } from "luxon"

export type Timeslot = {
    id: string
    capacity: number
    courts: number
    fee: number
    reserved: number
    startTime: number
    endTime: number
    timestamp: number
    createdAt?: number
    updatedAt?: number
}

export type TimeslotInput = Omit<Timeslot, "id" | "startTime" | "endTime"> & {
    startTime: string
    endTime: string
    id?: string
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const { capacity, courts, fee, reserved, startTime, endTime, timestamp } = documentSnapshot.data() as {
        capacity: number
        courts: number
        fee: number
        reserved: number
        startTime: number
        endTime: number
        timestamp: number
    }
    const timeslot: Timeslot = {
        id: documentSnapshot.id,
        capacity,
        courts,
        fee,
        reserved,
        startTime,
        endTime,
        timestamp,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return timeslot
}

export const fromInput = (timeslotInput: TimeslotInput, date: string) => {
    const { timestamp, capacity, courts, fee, reserved, ...rest } = timeslotInput
    const startTime = DateTime.fromFormat(`${date} ${rest.startTime}`, `yyyy-LL-dd HH:mm`).toMillis()
    let endTime = DateTime.fromFormat(`${date} ${rest.endTime}`, `yyyy-LL-dd HH:mm`).toMillis()
    if (endTime <= startTime) endTime += 86400_000
    const timeslot: Omit<Timeslot, "id"> = {
        capacity,
        courts,
        fee,
        reserved,
        startTime,
        endTime,
        timestamp,
    }
    return timeslot
}

export const toInput = (timeslot: Timeslot) => {
    const { id, capacity, courts, fee, reserved, timestamp } = timeslot
    const startTime = DateTime.fromMillis(timeslot.startTime).toFormat(`HH:mm`)
    const endTime = DateTime.fromMillis(timeslot.endTime).toFormat(`HH:mm`)
    const timeslotInput: TimeslotInput = {
        id,
        capacity,
        courts,
        fee,
        reserved,
        timestamp,
        startTime,
        endTime,
    }
    return timeslotInput
}
