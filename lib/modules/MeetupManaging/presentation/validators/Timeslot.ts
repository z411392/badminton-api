import Joi from "joi"
import { type TimeslotInput } from "@/modules/MeetupManaging/dtos/Timeslot"
import { time } from "@/utils/validators"

export const capacity = Joi.number().required().integer().min(1).messages({
    "any.required": "必須填寫總人數",
    "number.min": "至少得收個一位吧？",
})
export const courts = Joi.number().required().integer().min(1).messages({
    "any.required": "必須填寫球敘面數",
    "number.min": "至少得有一面場吧？",
})
export const fee = Joi.number().required().integer().min(0).messages({
    "any.required": "必須填寫費用",
    "number.min": "沒有開團的人在倒貼的吧？",
})
export const reserved = Joi.number().required().integer().min(0).messages({
    "any.required": "必須填寫預留名額",
    "number.min": "預留名額不能是負數",
})
export const timestamp = Joi.number().required().integer().min(0)

export const timeslot = Joi.object<TimeslotInput>({
    capacity,
    courts,
    fee,
    reserved,
    startTime: time,
    endTime: time,
    timestamp,
})
