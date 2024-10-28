import Joi from "joi"

export const brand = Joi.string().required().min(2).max(15).messages({
    "any.required": `必須填寫廠牌`,
    "string.empty": `必須填寫廠牌`,
    "string.min": `廠牌至少 {#limit} 個字`,
    "string.max": `廠牌最多 {#limit} 個字`,
})

export const name = Joi.string().required().min(2).max(15).messages({
    "any.required": `必須填寫型號`,
    "string.empty": `必須填寫型號`,
    "string.min": `型號至少 {#limit} 個字`,
    "string.max": `型號最多 {#limit} 個字`,
})
