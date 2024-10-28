import { type DocumentSnapshot, type GeoPoint } from "firebase-admin/firestore"

export type Venue = {
    id: string
    name: string
    address: string
    building: string
    floor: number
    latitude: number
    longitude: number
    createdAt?: number
    updatedAt?: number
}

export const fromDocumentSnapshot = (documentSnapshot: DocumentSnapshot) => {
    const {
        name,
        address,
        building,
        floor,
        geopoint: { latitude, longitude },
    } = documentSnapshot.data() as {
        name: string
        address: string
        building: string
        floor: number
        geopoint: GeoPoint
    }
    const venue: Venue = {
        id: documentSnapshot.id,
        name,
        address,
        building,
        floor,
        latitude,
        longitude,
        createdAt: documentSnapshot.createTime ? documentSnapshot.createTime.toMillis() : undefined,
        updatedAt: documentSnapshot.updateTime ? documentSnapshot.updateTime.toMillis() : undefined,
    }
    return venue
}
