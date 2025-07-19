/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import httpStatus from "http-status-codes"
import { sendResponse } from "../../utils/sendResponse"
import { AuthServices } from "./auth.service"
import AppError from "../../errorHelpers/AppError"
import { setAuthCookie } from "../../utils/setCookie"
import { createUserToken } from "../../utils/userToken"
import { envVars } from "../../config/env"
import passport from "passport"

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const user = await UserServices.createUser(req.body)


    passport.authenticate("local", async (err: any, user: any, info: any) => {
        if (err) {
            // return next(err)
            return next(new AppError(401, err))


        }

        if (!user) {

            return next(new AppError(401, info.message))

            // return new AppError(401, err) not useable
        }

        const userToken = await createUserToken(user)


        const { password: pass, ...rest } = user.toObject()


        setAuthCookie(res, userToken)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Login Successfully",
            data: {
                accessToken: userToken.accessToken,
                refreshToken: userToken.refreshToken,
                user: rest
            },
        })
    })(req, res, next)


    // res.status(httpStatus.CREATED).json({
    //     message: "User created successfully",
    //     user
    // })

    // const loginInfo = await AuthServices.credentialsLogin(req.body)

    // res.cookie("assessToken", logInfo.accessToken, {
    //     httpOnly: true,
    //     secure: false,
    // })

    // res.cookie("refreshToken", logInfo.refreshToken, {
    //     httpOnly: true,
    //     secure: false,
    // })




})


const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const refreshToken = req.headers.authorization;
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, " No refresh token from cookies")
    }


    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string)

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo,
    })


})
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully",
        data: null,
    })


})




const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {



    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Password Change Successfully",
        data: null,
    })


})



const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }


    const user = req.user;

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    const tokenInfo = await createUserToken(user)

    setAuthCookie(res, tokenInfo)

    // sendResponse(res, {
    //     success: true,
    //     statusCode: httpStatus.OK,
    //     message: "Password Change Successfully",
    //     data: null,
    // })

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)

})




export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController

} 