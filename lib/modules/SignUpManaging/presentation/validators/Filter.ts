import Joi from "joi"
import { SignUpStatuses } from "@/modules/SignUpManaging/dtos/SignUpStatuses"

export const statuses = Joi.array()
    .items(Joi.string())
    .required()
    .allow(...Object.values(SignUpStatuses))
    .required()
