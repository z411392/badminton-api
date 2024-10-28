import { type Request, type Response } from "express"
import { withCredentials, withGroup } from "@/utils/sessions"
import { getFirestore } from "firebase-admin/firestore"
import { ResolvePlaylist } from "@/modules/PlaylistManaging/application/mutations/ResolvePlaylist"
import { SessionKeys } from "@/utils/sessions"

export const withPlaylistResolving = async (request: Request, response: Response, next: () => any) => {
    const credentials = withCredentials(response)
    if (!credentials) return next()
    const group = withGroup(response)
    if (!group) return next()
    const db = getFirestore()
    const resolvePlaylist = new ResolvePlaylist({ db })
    const playlist = await resolvePlaylist(credentials.uid, group.id, request.params.playlistId)
    if (playlist) response.locals[SessionKeys.Playlist] = playlist
    return next()
}
