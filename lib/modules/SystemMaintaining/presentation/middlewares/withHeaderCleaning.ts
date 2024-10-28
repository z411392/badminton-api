import { type Request, type Response } from "express"

export const withHeaderCleaning = (request: Request, response: Response, next: Function) => {
    response.removeHeader("X-Powered-By")
    next()
}
