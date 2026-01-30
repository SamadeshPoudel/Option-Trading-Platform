import { authClient } from "./auth-client";

const { data, error } = await authClient.signIn.email({
    /**
     * The user email
     */
    email,
    /**
     * The user password
     */
    password,
    /**
     * A URL to redirect to after the user verifies their email (optional)
     */
    callbackURL: import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173",
    /**
     * remember the user session after the browser is closed. 
     * @default true
     */
    rememberMe: false
}, {
    //callbacks
})