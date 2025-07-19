/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { User } from "../modules/user/user.model";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs"


passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email: string, password: string, done) => {
        try {

            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, { message: "User does not exist" })
            }

            // if (!isUserExist) {
            //     return done ("User does not exist")
            // }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects =>providerObjects.provider == "google" )

            if (isGoogleAuthenticated&&!isUserExist.password) {
                return done(null, false, {message: "You have authenticated through google. if you want to login with credentials, then at first login with google and set password for your gmail"})
            }


            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatched) {
              return done(null, false, { message: "Passport does not matched" })
}


return done(null, isUserExist)


} catch (error) {
            console.log(error);
            done(error)
        }
    })
)









passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user)
    } catch (error) {
        console.log(error);
        done(error)
    }
})