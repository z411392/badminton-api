import { type Request, type Response } from "express"
import { ensureUserIsAuthenticated, ensureGroupIsSpecified, ensureUserHasPermission } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { type Venue } from "@/modules/VenueManaging/dtos/Venue"
import { type Shuttle } from "@/modules/ShuttleManaging/dtos/Shuttle"
import { VenueDao } from "@/adapters/firestore/VenueDao"
import { ShuttleDao } from "@/adapters/firestore/ShuttleDao"
import { page, search } from "@/utils/validators"
import { type ListingMeetups, ListMeetups } from "@/modules/MeetupManaging/application/queries/ListMeetups"
import Joi from "joi"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { PlaylistDao } from "@/adapters/firestore/PlaylistDao"

const validator = Joi.object<ListingMeetups>({
    search,
    page,
})

export const onListingMeetups = async (request: Request, response: Response, next: Function) => {
    try {
        const credentials = ensureUserIsAuthenticated(response)
        const group = ensureGroupIsSpecified(response)
        ensureUserHasPermission(response)
        const query = await validator.validateAsync(request.query)
        const db = getFirestore()
        const venueDao = new VenueDao({ db })
        const shuttleDao = new ShuttleDao({ db })
        const playlistDao = new PlaylistDao({ db })
        const listMeetups = new ListMeetups({ db })
        const meetups = []
        const venuesMap: { [venueId: string]: Venue | undefined } = {}
        const shuttlesMap: { [shuttleId: string]: Shuttle | undefined } = {}
        const playlistsMap: { [playlistId: string]: Playlist | undefined } = {}
        for await (const meetup of listMeetups(credentials.uid, group.id, query)) {
            meetups.push(meetup)
            venuesMap[meetup.venueId] = undefined
            for (const shuttleId of meetup.shuttleIds) shuttlesMap[shuttleId] = undefined
            if (meetup.playlistId) playlistsMap[meetup.playlistId] = undefined
        }
        const venues = venueDao.inIds(...Object.keys(venuesMap))
        for await (const venue of venues) venuesMap[venue.id] = venue
        const shuttles = shuttleDao.inIds(...Object.keys(shuttlesMap))
        for await (const shuttle of shuttles) shuttlesMap[shuttle.id] = shuttle
        const playlists = playlistDao.inIds(group.id, ...Object.keys(playlistsMap))
        for await (const playlist of playlists) playlistsMap[playlist.id] = playlist
        const payload = {
            meetups,
            venuesMap,
            shuttlesMap,
            playlistsMap,
        }
        return response.json({ payload })
    } catch (thrown) {
        return next(thrown)
    }
}
