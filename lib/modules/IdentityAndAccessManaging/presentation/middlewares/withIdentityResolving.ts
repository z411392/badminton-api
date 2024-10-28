import { type Request, type Response } from "express"
import { ResolveCredentials } from "@/modules/IdentityAndAccessManaging/application/mutations/ResolveCredentials"
import { SessionKeys } from "@/utils/sessions"

const retrieveTokenFromAuthorizationHeader = (request: Request) => {
    const authorization = request.headers.authorization
    if (!authorization) return undefined
    const split = authorization.split(/bearer\s+/)
    if (split.length === 0) return undefined
    const [_, token] = split
    if (!token) return undefined
    return token.trim()
}

export const withIdentityResolving = async (request: Request, response: Response, next: () => any) => {
    const token = retrieveTokenFromAuthorizationHeader(request)
    if (token) {
        const resolveCredentials = new ResolveCredentials()
        const credentials = await resolveCredentials(token)
        if (credentials) response.locals[SessionKeys.Credentials] = credentials
    }
    return next()
}
