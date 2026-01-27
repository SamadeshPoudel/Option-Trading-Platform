import express from "express";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
// Auth middleware for protected routes
export const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
        return res.status(401).json({ msg: "Unauthorized!!!!" });
    }

    // Attach session/user to request for use in routes
    (req as any).session = session.session;
    (req as any).user = session.user;

    next();
};