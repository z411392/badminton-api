import Joi from "joi"

export const artist = Joi.string().required().allow("").messages({
    "any.required": `必須填寫歌手名稱`,
    "string.empty": `必須填寫歌手名稱`,
})
