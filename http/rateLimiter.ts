import rateLimit from "express-rate-limit"

export const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: "Too many requests, please try again after 1 minute"
})
