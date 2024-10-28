import { type Response } from "express"
import { type DecodedIdToken } from "firebase-admin/auth"
import { UserUnauthenticated } from "@/modules/IdentityAndAccessManaging/errors/UserUnauthenticated"
import { type Group } from "@/modules/GroupManaging/dtos/Group"
import { type Permission } from "@/modules/IdentityAndAccessManaging/dtos/Permission"
import { PermissionDenied } from "@/modules/IdentityAndAccessManaging/errors/PermissionDenied"
import { PermissionStatuses } from "@/modules/IdentityAndAccessManaging/dtos/PermissionStatuses"
import { Roles } from "@/modules/IdentityAndAccessManaging/dtos/Roles"
import { type Playlist } from "@/modules/PlaylistManaging/dtos/Playlist"
import { type MeetupWithTimeslots } from "@/modules/MeetupManaging/dtos/Meetup"
import { type SignUp } from "@/modules/SignUpManaging/dtos/SignUp"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"
import { type Profile } from "@/modules/ProfileManaging/dtos/Profile"
import { Root } from "@/constants"

export enum SessionKeys {
    Credentials = "credentials",
    Group = "group",
    Permission = "permission",
    Playlist = "playlist",
    Meetup = "meetup",
    SignUps = "signUps",
    Profile = "profile",
}

export const withCredentials = (response: Response) => {
    const credentials: DecodedIdToken | undefined = response.locals[SessionKeys.Credentials]
    return credentials
}

export const ensureUserIsAuthenticated = (response: Response) => {
    const credentials = withCredentials(response)
    if (!credentials) throw new UserUnauthenticated()
    return credentials
}

export const ensureUserIsRoot = (response: Response) => {
    const credentials = ensureUserIsAuthenticated(response)
    if (credentials.uid !== Root) throw new PermissionDenied()
    return credentials
}

export const withGroup = (response: Response) => {
    const group: Group | undefined = response.locals[SessionKeys.Group]
    return group
}

export const ensureGroupIsSpecified = (response: Response) => {
    const group = withGroup(response)
    if (!group) throw new PermissionDenied()
    return group
}

export const withPermission = (response: Response) => {
    const permission: Permission | undefined = response.locals[SessionKeys.Permission]
    return permission
}

export const ensureUserHasPermission = (
    response: Response,
    { mustBeApproved = true, mustBeOwner = false }: { mustBeApproved: boolean; mustBeOwner: boolean } = {
        mustBeApproved: true,
        mustBeOwner: false,
    },
) => {
    const permission = withPermission(response)
    if (!permission) throw new PermissionDenied()
    if (mustBeApproved && permission.status !== PermissionStatuses.Approved) throw new PermissionDenied()
    if (mustBeOwner && permission.role !== Roles.Owner) throw new PermissionDenied()
    return permission
}

export const withPlaylist = (response: Response) => {
    const playlist: Playlist | undefined = response.locals[SessionKeys.Playlist]
    return playlist
}

export const ensurePlaylistIsSpecified = (response: Response) => {
    const playlist = withPlaylist(response)
    if (!playlist) throw new PermissionDenied()
    return playlist
}

export const withMeetup = (response: Response) => {
    const meeup: MeetupWithTimeslots | undefined = response.locals[SessionKeys.Meetup]
    return meeup
}

export const ensureMeetupIsSpecified = (response: Response) => {
    const meetup = withMeetup(response)
    if (!meetup) throw new PermissionDenied()
    return meetup
}

export const withSignUps = (response: Response) => {
    const signUps: SignUp[] = response.locals[SessionKeys.SignUps]
    return signUps
}

export const ensureUserHasSignedUp = (response: Response) => {
    const signUps = withSignUps(response)
    const accepted = signUps.filter(({ status }) => {
        if (status === SignUpStatuses.Accepted) return true
        if (status === SignUpStatuses.Paid) return true
        return false
    })
    if (accepted.length === 0) throw new PermissionDenied()
    return accepted
}

export const withProfile = (response: Response) => {
    const profile: Profile | undefined = response.locals[SessionKeys.Profile]
    return profile
}

export const ensureUserHasProfile = (response: Response) => {
    const profile = withProfile(response)
    if (!profile) throw new PermissionDenied()
    return profile
}
