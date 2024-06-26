/**
 * Module for the AccountController.
 *
 * @author Mats Loock
 * @author Alejandro Lindström Mamani
 * @version 2.0.0
 */

// import createError from 'http-errors'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { User } from '../../models/user.js'
import { TimeTracker } from '../../models/timeTracker.js'

/**
 * Encapsulates a controller.
 */
export class AccountController {
  /**
   * Authenticates a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async login (req, res, next) {
    try {
      const user = await User.authenticate(req.body.username, req.body.password)

      // Get the timeTracker id for the payload.
      const timeTracker = await TimeTracker.findOne({ userId: user.id })

      const payload = {
        user_id: user.id,
        timeTrackerId: timeTracker ? timeTracker.id : null, // If timeTracker found, include its ID, otherwise null.
        username: user.username,
        email: user.email,
        x_permission_level: user.permissionLevel
      }

      // Create the access token with the shorter lifespan.
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      })

      // // Create the refresh token with the longer lifespan.
      // -----------------------------------------------------------------
      // 👉👉👉 This is the place to create and handle the refresh token!
      //         Quite a lot of additional implementation is required!!!
      // -----------------------------------------------------------------
      // const refreshToken = ...

      res
        .status(201)
        .json({
          access_token: accessToken
          // refresh_token: refreshToken
        })
    } catch (error) {
      // Authentication failed.
      const err = createError(401)
      err.cause = error

      next(err)
    }
  }

  /**
   * Registers a user.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async register (req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        permissionLevel: 7
      })

      const savedUser = await user.save()
      const userIdString = savedUser._id.toString()

      // Create a timeTracker object for the user.
      const timeTracker = new TimeTracker({
        userId: userIdString
      })

      await timeTracker.save()

      res
        .status(201)
        .json({ id: user.id })
    } catch (error) {
      let err = error

      if (err.code === 11000) {
        // Duplicated keys.
        err = createError(409)
        err.cause = error
      } else if (error.name === 'ValidationError') {
        // Validation error(s).
        err = createError(400)
        err.cause = error
      }

      next(err)
    }
  }
}
