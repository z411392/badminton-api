export const Version = "0.0.1.20241028"

export const Collections = new Proxy(
    {
        Groups: "groups",
        Permissions: "permissions",
        Venues: "venues",
        Shuttles: "shuttles",
        Meetups: "groups/:groupId/meetups",
        Timeslots: "groups/:groupId/meetups/:meetupId/timeslots",
        Levels: "groups/:groupId/levels",
        Tags: "groups/:groupId/tags",
        Profiles: "groups/:groupId/profiles",
        Playlists: "groups/:groupId/playlists",
        Tracks: "groups/:groupId/playlists/:playlistId/tracks",
        SignUps: "groups/:groupId/meetups/:meetupId/timeslots/:timeslotId/signUps",
        MeetupEvents: "groups/:groupId/meetups/:meetupId/events",
        Subscriptions: "subscriptions",
    },
    {
        get: (props, prop) => {
            const collection = props[prop as keyof typeof props]
            if (!collection) return undefined
            const skipped = ["subscriptions"]
            if (skipped.includes(collection)) return collection
            return process.env.NODE_ENV ? [process.env.NODE_ENV, collection].join("_") : collection
        },
    },
)

export enum DatetimeFormats {
    ISO8601DATE = "yyyy-LL-dd",
    ISO8601TIME = "HH:mm:ss",
    ISO8601 = `${DatetimeFormats.ISO8601DATE} ${DatetimeFormats.ISO8601TIME}`,
}

export enum PageSizes {
    Unlimited = 2000,
    Venues = 20,
    Shuttles = 20,
    Meetups = 20,
    Tags = 20,
    Profiles = 20,
    Playlists = 20,
}

export const Root = "wT9yf3fvduNaALoB5PKPDMQVrNZ2"

export const CacheKeys = new Proxy(
    {
        SpotifyAccessToken: "spotifyAccessToken",
    },
    {
        get: (props, prop) => {
            const cacheKey = props[prop as keyof typeof props]
            if (!cacheKey) return undefined
            return process.env.NODE_ENV ? [process.env.NODE_ENV, cacheKey].join("_") : cacheKey
        },
    },
)

export const Indexes = new Proxy(
    {
        Groups: "groups",
        Venues: "venues",
        Shuttles: "shuttles",
        Meetups: "meetups",
        Timeslots: "timeslots",
        Tags: "tags",
        SignUps: "signUps",
        Playlists: "playlists",
        Profiles: "profiles",
        Tracks: "tracks",
    },
    {
        get: (props, prop) => {
            const collection = props[prop as keyof typeof props]
            if (!collection) return undefined
            return process.env.NODE_ENV ? [process.env.NODE_ENV, collection].join("_") : collection
        },
    },
)

export enum Topics {
    SignUp = "SignUp",
}

export const EventsSavedTo = {
    [Topics.SignUp]: Collections.MeetupEvents,
}
