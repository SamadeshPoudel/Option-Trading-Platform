import { authClient } from "@/lib/auth-client"; //import the auth client


const { data, error } = await authClient.signUp.email({
        email:"pankaj@gmail.com", // user email address
        password:"12345678", // user password -> min 8 characters by default
        name:"panku bhaiya", // user display name
        image:"", // User image URL (optional)
        callbackURL: "/" // A URL to redirect to after the user verifies their email (optional)
    }, {
        onRequest: (ctx) => {
            //show loading
        },
        onSuccess: (ctx) => {
            //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
            // display the error message
            alert(ctx.error.message);
        },
});