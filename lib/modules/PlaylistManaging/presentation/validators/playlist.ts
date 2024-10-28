import Joi from "joi"

export const name = Joi.string().required().max(30).messages({
    "any.required": `必須填寫播放清單名稱`,
    "string.empty": `必須填寫播放清單名稱`,
    "string.max": `播放清單名稱最多 {#limit} 個字`,
})
