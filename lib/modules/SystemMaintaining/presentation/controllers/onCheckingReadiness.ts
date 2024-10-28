import { type Request, type Response } from "express"

export const onCheckingReadiness = async (request: Request, response: Response) => {
    return response.json({})
}
