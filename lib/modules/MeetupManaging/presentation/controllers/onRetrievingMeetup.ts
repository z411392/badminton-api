import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureMeetupIsSpecified } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { type Shuttle } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { PlaylistDao } from "@/adapters/firestore/PlaylistDao"

export const onRetrievingMeetup = async (request: Request, response: Response, next: Function) => {
    try {
        ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        const meetup = ensureMeetupIsSpecified(response)
        const db = getFirestore()
        const venueDao = new VenueDao({ db })
        const shuttleDao = new ShuttleDao({ db })
        const playlistDao = new PlaylistDao({ db })
        const venuesMap: { [venueId: string]: Venue | undefined } = {}
        const venue = await venueDao.byId(meetup.venueId)
        if (venue) venuesMap[venue.id] = venue
        const shuttles = shuttleDao.inIds(...meetup.shuttleIds)
        const shuttlesMap: { [shuttleId: string]: Shuttle | undefined } = {}
        for await (const shuttle of shuttles) shuttlesMap[shuttle.id] = shuttle
        let playlist: Playlist | undefined = undefined
        if (meetup.playlistId) playlist = await playlistDao.byId(group.id, meetup.playlistId)
        const payload = {
            meetup,
            venuesMap,
            shuttlesMap,
            playlist,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
