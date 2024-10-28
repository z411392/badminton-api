import { type Request, type Response } from "express"
import { type ConsolaInstance, createConsola } from "consola"
import CallableInstance from "callable-instance"
import { UserUnauthenticated } from "@/modules/IdentityAndAccessManaging/errors/UserUnauthenticated"
import { PermissionDenied } from "@/modules/IdentityAndAccessManaging/errors/PermissionDenied"
import { GroupNotFound } from "@/modules/GroupManaging/errors/GroupNotFound"
import { VenueNotFound } from "@/modules/VenueManaging/errors/VenueNotFound"
import { MeetupNotFound } from "@/modules/MeetupManaging/errors/MeetupNotFound"
import { TimeslotNotFound } from "@/modules/SignUpManaging/errors/TimeslotNotFound"
import { UnableToRegister } from "@/modules/SignUpManaging/errors/UnableToRegister"
import { UnableToAccept } from "@/modules/SignUpManaging/errors/UnableToAccept"
import { UnableToCancel } from "@/modules/SignUpManaging/errors/UnableToCancel"
import { UnableToMarkAsPaid } from "@/modules/SignUpManaging/errors/UnableToMarkAsPaid"
import { UnableToMarkAsRefunded } from "@/modules/SignUpManaging/errors/UnableToMarkAsRefunded"
import { UnableToRevoke } from "@/modules/SignUpManaging/errors/UnableToRevoke"
import { SignedUpAlready } from "@/modules/SignUpManaging/errors/SignedUpAlready"
import { TagNotFound } from "@/modules/TagManaging/errors/TagNotFound"
import { PlaylistNotFound } from "@/modules/PlaylistManaging/errors/PlaylistNotFound"
import { ProfileNotFound } from "@/modules/ProfileManaging/errors/ProfileNotFound"
import { LevelNotFound } from "@/modules/LevelManaging/errors/LevelNotFound"
import { VenueConflict } from "@/modules/VenueManaging/errors/VenueConflict"
import { GroupConflict } from "@/modules/GroupManaging/errors/GroupConflict"
import { ShuttleNotFound } from "@/modules/ShuttleManaging/errors/ShuttleNotFound"
import { ShuttleConflict } from "@/modules/ShuttleManaging/errors/ShuttleConflict"
import { ValidationError } from "joi"
import { GroupCreatingInProgress } from "@/modules/GroupManaging/errors/GroupCreatingInProgress"
import { HasJoinedGroup } from "@/modules/GroupManaging/errors/HasJoinedGroup"
import { JoinRequestAlreadySubmitted } from "@/modules/GroupManaging/errors/JoinRequestAlreadySubmitted"
import { JoinRequestRejected } from "@/modules/GroupManaging/errors/JoinRequestRejected"
import { MustBeImage } from "@/modules/GroupManaging/errors/MustBeImage"
import { PlaylistNotSpecified } from "@/modules/PlaylistManaging/errors/PlaylistNotSpecified"
import { SignUpNotFound } from "@/modules/SignUpManaging/errors/SignUpNotFound"
import { TagConflict } from "@/modules/TagManaging/errors/TagConflict"
import { UserNotFound } from "@/modules/IdentityAndAccessManaging/errors/UserNotFound"
import { TokenInvalid } from "@/modules/Notifying/errors/TokenInvalid"
import { UnableToSendMessage } from "@/modules/Notifying/errors/UnableToSendMessage"

class ExceptionHandler extends CallableInstance<[], any | Promise<any>> {
    protected logger: ConsolaInstance
    constructor() {
        super("execute")
        this.logger = createConsola().withTag(`ExceptionHandler`)
    }
    protected statusCodeFor<T extends Error>(thrown: T) {
        switch (true) {
            case thrown instanceof ValidationError:
            case thrown instanceof TokenInvalid:
            case thrown instanceof UnableToSendMessage:
                return 400
            case thrown instanceof UserUnauthenticated:
                return 401
            case thrown instanceof PermissionDenied:
                return 403
            case thrown instanceof GroupNotFound:
            case thrown instanceof VenueNotFound:
            case thrown instanceof MeetupNotFound:
            case thrown instanceof TimeslotNotFound:
            case thrown instanceof TagNotFound:
            case thrown instanceof PlaylistNotFound:
            case thrown instanceof ProfileNotFound:
            case thrown instanceof LevelNotFound:
            case thrown instanceof ShuttleNotFound:
            case thrown instanceof UserNotFound:
                return 404
            case thrown instanceof UnableToRegister:
            case thrown instanceof UnableToAccept:
            case thrown instanceof UnableToCancel:
            case thrown instanceof UnableToMarkAsPaid:
            case thrown instanceof UnableToMarkAsRefunded:
            case thrown instanceof UnableToRevoke:
            case thrown instanceof SignedUpAlready:
            case thrown instanceof VenueConflict:
            case thrown instanceof GroupConflict:
            case thrown instanceof ShuttleConflict:
            case thrown instanceof GroupCreatingInProgress:
            case thrown instanceof HasJoinedGroup:
            case thrown instanceof JoinRequestAlreadySubmitted:
            case thrown instanceof JoinRequestRejected:
            case thrown instanceof MustBeImage:
            case thrown instanceof PlaylistNotSpecified:
            case thrown instanceof SignUpNotFound:
            case thrown instanceof TagConflict:
                return 400
        }
        return 500
    }
    protected errorFor(thrown: Error) {
        if (thrown instanceof ValidationError) {
            const { message } = thrown
            return {
                type: "ValidationError",
                payload: {
                    message,
                },
            }
        }
        try {
            return JSON.parse(thrown.message)
        } catch {
            return undefined
        }
    }
    async execute(thrown: unknown, request: Request, response: Response, _: Function) {
        if (!(thrown instanceof Error)) return
        const statusCode = this.statusCodeFor(thrown)
        const error = this.errorFor(thrown)
        if (statusCode === 500) this.logger.error(thrown.stack)
        return response.status(statusCode).json({ error })
    }
}

export const withExceptionHandling = new ExceptionHandler()
