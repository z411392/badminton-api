import Joi from "joi"

export const spotifyId = Joi.string().required().messages({
    "any.required": `必須填寫 spotifyId`,
    "string.empty": `必須填寫 spotifyId`,
})

export const spotifyIds = Joi.array().required().items(spotifyId).min(1).messages({
    "any.required": `必須填寫 spotifyId`,
    "array.min": `必須填寫 spotifyId`,
})
export const trackId = Joi.string().required().messages({
    "any.required": `必須填寫 trackId`,
    "string.empty": `必須填寫 trackId`,
})
export const trackIds = Joi.array().required().items(trackId).min(1).messages({
    "any.required": `必須填寫 trackId`,
    "array.min": `必須填寫 spotifyId`,
})
