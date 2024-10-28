import { type Request, type Response } from "express"

export const onCheckingLiveness = async (request: Request, response: Response) => {
    return response.json({})
}
