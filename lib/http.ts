import { default as express, Router } from "express"
import cors from "cors"
import { createServer } from "node:http"
// 00
import { withHeaderCleaning } from "@/modules/SystemMaintaining/presentation/middlewares/withHeaderCleaning"
import { onCheckingLiveness } from "@/modules/SystemMaintaining/presentation/controllers/onCheckingLiveness"
import { onCheckingReadiness } from "@/modules/SystemMaintaining/presentation/controllers/onCheckingReadiness"
import { onRetrievingSystemInfo } from "@/modules/SystemMaintaining/presentation/controllers/onRetrievingSystemInfo"
import { withExceptionHandling } from "@/modules/SystemMaintaining/presentation/middlewares/withExceptionHandling"
// 01
import { withIdentityResolving } from "@/modules/IdentityAndAccessManaging/presentation/middlewares/withIdentityResolving"
import { withPermissionResolving } from "@/modules/IdentityAndAccessManaging/presentation/middlewares/withPermissionResolving"
import { onRetrievingPermission } from "@/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingPermission"
import { onJoiningGroup } from "@/modules/IdentityAndAccessManaging/presentation/controllers/onJoiningGroup"
import { onReviewingGroupJoining } from "@/modules/IdentityAndAccessManaging/presentation/controllers/onReviewingGroupJoining"
import { onRetrievingUser } from "@/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingUser"
// 02
import { onCreatingGroup } from "@/modules/GroupManaging/presentation/controllers/onCreatingGroup"
import { onCountingGroups } from "@/modules/GroupManaging/presentation/controllers/onCountingGroups"
import { onListingGroups } from "@/modules/GroupManaging/presentation/controllers/onListingGroups"
import { withGroupResolving } from "@/modules/GroupManaging/presentation/middlewares/withGroupResolving"
import { onRetrievingGroup } from "@/modules/GroupManaging/presentation/controllers/onRetrievingGroup"
import { onUpdatingGroup } from "@/modules/GroupManaging/presentation/controllers/onUpdatingGroup"
// 03
import { onCreatingVenue } from "@/modules/VenueManaging/presentation/controllers/onCreatingVenue"
import { onCountingVenues } from "@/modules/VenueManaging/presentation/controllers/onCountingVenues"
import { onListingVenues } from "@/modules/VenueManaging/presentation/controllers/onListingVenues"
import { onRemovingVenue } from "@/modules/VenueManaging/presentation/controllers/onRemovingVenue"
import { onUpdatingVenue } from "@/modules/VenueManaging/presentation/controllers/onUpdatingVenue"
import { onRetrievingVenue } from "@/modules/VenueManaging/presentation/controllers/onRetrievingVenue"
// 04
import { onCreatingShuttle } from "@/modules/ShuttleManaging/presentation/controllers/onCreatingShuttle"
import { onCountingShuttles } from "@/modules/ShuttleManaging/presentation/controllers/onCountingShuttles"
import { onListingShuttles } from "@/modules/ShuttleManaging/presentation/controllers/onListingShuttles"
import { onRemovingShuttle } from "@/modules/ShuttleManaging/presentation/controllers/onRemovingShuttle"
import { onUpdatingShuttle } from "@/modules/ShuttleManaging/presentation/controllers/onUpdatingShuttle"
import { onRetrievingShuttle } from "@/modules/ShuttleManaging/presentation/controllers/onRetrievingShuttle"
// 05
import { onCreatingMeetup } from "@/modules/MeetupManaging/presentation/controllers/onCreatingMeetup"
import { onCountingMeetups } from "@/modules/MeetupManaging/presentation/controllers/onCountingMeetups"
import { onListingMeetups } from "@/modules/MeetupManaging/presentation/controllers/onListingMeetups"
import { withMeetupResolving } from "@/modules/MeetupManaging/presentation/middlewares/withMeetupResolving"
import { onRetrievingMeetup } from "@/modules/MeetupManaging/presentation/controllers/onRetrievingMeetup"
import { onRemovingMeetup } from "@/modules/MeetupManaging/presentation/controllers/onRemovingMeetup"
import { onUpdatingMeetup } from "@/modules/MeetupManaging/presentation/controllers/onUpdatingMeetup"
// 06
import { onCreatingLevel } from "@/modules/LevelManaging/presentation/controllers/onCreatingLevel"
import { onListingLevels } from "@/modules/LevelManaging/presentation/controllers/onListingLevels"
import { onRemovingLevel } from "@/modules/LevelManaging/presentation/controllers/onRemovingLevel"
import { onUpdatingLevel } from "@/modules/LevelManaging/presentation/controllers/onUpdatingLevel"
// 07
import { onCreatingTag } from "@/modules/TagManaging/presentation/controllers/onCreatingTag"
import { onCountingTags } from "@/modules/TagManaging/presentation/controllers/onCountingTags"
import { onListingTags } from "@/modules/TagManaging/presentation/controllers/onListingTags"
import { onRemovingTag } from "@/modules/TagManaging/presentation/controllers/onRemovingTag"
// 08
import { onCountingProfiles } from "@/modules/ProfileManaging/presentation/controllers/onCountingProfiles"
import { onListingProfiles } from "@/modules/ProfileManaging/presentation/controllers/onListingProfiles"
import { onUpdatingProfile } from "@/modules/ProfileManaging/presentation/controllers/onUpdatingProfile"
import { onRetrievingProfile } from "@/modules/ProfileManaging/presentation/controllers/onRetrievingProfile"
import { withProfileResolving } from "@/modules/ProfileManaging/presentation/middlewares/withProfileResolving"
import { onSavingProfile } from "@/modules/ProfileManaging/presentation/controllers/onSavingProfile"
// 09
import { onCreatingPlaylist } from "@/modules/PlaylistManaging/presentation/controllers/onCreatingPlaylist"
import { onCountingPlaylists } from "@/modules/PlaylistManaging/presentation/controllers/onCountingPlaylists"
import { onListingPlaylists } from "@/modules/PlaylistManaging/presentation/controllers/onListingPlaylists"
import { withPlaylistResolving } from "@/modules/PlaylistManaging/presentation/middlewares/withPlaylistResolving"
import { onRetrievingPlaylist } from "@/modules/PlaylistManaging/presentation/controllers/onRetrievingPlaylist"
import { onRemovingPlaylist } from "@/modules/PlaylistManaging/presentation/controllers/onRemovingPlaylist"
import { onUpdatingPlaylist } from "@/modules/PlaylistManaging/presentation/controllers/onUpdatingPlaylist"
// 10
import { onSigningUpOrCancelling } from "@/modules/SignUpManaging/presentation/controllers/onSigningUpOrCancelling"
import { withSignUpsResolving } from "@/modules/SignUpManaging/presentation/middlewares/withSignUpsResolving"
import { onReviewingSignUp } from "@/modules/SignUpManaging/presentation/controllers/onReviewingSignUp"
import { onRetrievingSignUp } from "@/modules/SignUpManaging/presentation/controllers/onRetrievingSignUp"
// 11
import { onManaullyAddingTracks } from "@/modules/TrackManaging/presentation/controllers/onManaullyAddingTracks"
import { onManuallyRemovingTracks } from "@/modules/TrackManaging/presentation/controllers/onManuallyRemovingTracks"
import { onRetrievingTrack } from "@/modules/TrackManaging/presentation/controllers/onRetrievingTrack"
// 12
import { onSearchingArtists } from "@/modules/SongRequesting/presentation/controllers/onSearchingArtists"
import { onSearchingTracks } from "@/modules/SongRequesting/presentation/controllers/onSearchingTracks"
import { onAddingTracks } from "@/modules/SongRequesting/presentation/controllers/onAddingTracks"
import { onRemovingTracks } from "@/modules/SongRequesting/presentation/controllers/onRemovingTracks"
import { onRetrievingFriendshipStatus } from "@/modules/IdentityAndAccessManaging/presentation/controllers/onRetrievingFriendshipStatus"
// 13
import { onRetrievingToken } from "@/modules/Notifying/presentation/controllers/onRetrievingToken"
import { onSavingToken } from "@/modules/Notifying/presentation/controllers/onSavingToken"
import { onSendingMessage } from "@/modules/Notifying/presentation/controllers/onSendingMessage"
import { onTestingToken } from "@/modules/Notifying/presentation/controllers/onTestingToken"

const router = Router()
    .get("/liveness_check", onCheckingLiveness)
    .get("/readiness_check", onCheckingReadiness)
    .get("/system/info", onRetrievingSystemInfo)
    .get("/users/:userId", onRetrievingUser)
    .post("/groups", onCreatingGroup)
    .head("/groups", onCountingGroups)
    .get("/groups", onListingGroups)
    .put("/groups/:groupId", onUpdatingGroup)
    .use(
        "/groups/:groupId",
        Router({ mergeParams: true })
            .use(withGroupResolving)
            .use(withPermissionResolving)
            .get("/", onRetrievingGroup)
            .post("/permissions", onJoiningGroup)
            .get("/permissions/:permissionId", onRetrievingPermission)
            .put("/permissions/:permissionId", onReviewingGroupJoining)
            .post("/levels", onCreatingLevel)
            .get("/levels", onListingLevels)
            .delete("/levels/:levelId", onRemovingLevel)
            .put("/levels/:levelId", onUpdatingLevel)
            .post("/tags", onCreatingTag)
            .head("/tags", onCountingTags)
            .delete("/tags/:tagId", onRemovingTag)
            .get("/tags", onListingTags)
            .put("/profile", onSavingProfile)
            .get("/profile", onRetrievingProfile)
            .head("/profiles", onCountingProfiles)
            .get("/profiles", onListingProfiles)
            .put("/profiles/:profileId", onUpdatingProfile)
            .get("/profiles/:profileId", onRetrievingProfile)
            .post("/playlists", onCreatingPlaylist)
            .head("/playlists", onCountingPlaylists)
            .get("/playlists", onListingPlaylists)
            .use(
                "/playlists/:playlistId",
                Router({ mergeParams: true })
                    .use(withPlaylistResolving)
                    .get("/", onRetrievingPlaylist)
                    .delete("/", onRemovingPlaylist)
                    .put("/", onUpdatingPlaylist)
                    .post("/tracks", onManaullyAddingTracks)
                    .delete("/tracks", onManuallyRemovingTracks)
                    .get("/tracks/:trackId", onRetrievingTrack),
            )
            .post("/meetups", onCreatingMeetup)
            .head("/meetups", onCountingMeetups)
            .get("/meetups", onListingMeetups)
            .use(
                "/meetups/:meetupId",
                Router({ mergeParams: true })
                    .use(withMeetupResolving)
                    .get("/", onRetrievingMeetup)
                    .delete("/", onRemovingMeetup)
                    .put("/", onUpdatingMeetup)
                    .use(
                        "/timeslots/:timeslotId",
                        Router({ mergeParams: true })
                            .use(
                                "/signUp",
                                Router({ mergeParams: true })
                                    .use(withProfileResolving)
                                    .put("/", onSigningUpOrCancelling)
                                    // .get("/", onRetrievingSignUp)
                                    .delete("/", onSigningUpOrCancelling),
                            )
                            .get("/signUps/:signUpId", onRetrievingSignUp)
                            .put("/signUps/:signUpId", onReviewingSignUp),
                    )
                    .use(
                        "/tracks",
                        Router({ mergeParams: true })
                            .use(withSignUpsResolving)
                            .post("/", onAddingTracks)
                            .delete("/", onRemovingTracks),
                    ),
            )
            .post("/messages", onSendingMessage),
    )
    .post("/venues", onCreatingVenue)
    .head("/venues", onCountingVenues)
    .get("/venues", onListingVenues)
    .delete("/venues/:venueId", onRemovingVenue)
    .put("/venues/:venueId", onUpdatingVenue)
    .get("/venues/:venueId", onRetrievingVenue)
    .post("/shuttles", onCreatingShuttle)
    .head("/shuttles", onCountingShuttles)
    .get("/shuttles", onListingShuttles)
    .delete("/shuttles/:shuttleId", onRemovingShuttle)
    .put("/shuttles/:shuttleId", onUpdatingShuttle)
    .get("/shuttles/:shuttleId", onRetrievingShuttle)
    .get("/spotify/artists", onSearchingArtists)
    .get("/spotify/tracks", onSearchingTracks)
    .get("/line/friendshipStatus", onRetrievingFriendshipStatus)
    .get("/subscription", onRetrievingToken)
    .put("/subscription", onSavingToken)
    .post("/subscription", onTestingToken)

export default () => {
    const app = express()
        .use(withHeaderCleaning)
        .use(express.json({ limit: "50mb" }))
        .use(cors())
        .use(withIdentityResolving)
        .use(router)
        .use(withExceptionHandling)
    const server = createServer(app)
    process.on("exit", () => server.close())
    return server
}
