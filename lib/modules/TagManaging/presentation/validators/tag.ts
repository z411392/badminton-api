import Joi from "joi"

export const name = Joi.string().required().min(1).max(30).messages({
    "any.required": `必須填寫標籤`,
    "string.empty": `必須填寫標籤`,
    "string.min": `標籤至少 {#limit} 個字`,
    "string.max": `標籤最多 {#limit} 個字`,
})
