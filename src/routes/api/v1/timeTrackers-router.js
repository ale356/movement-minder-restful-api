/**
 * API version 1 routes.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { TimeTrackersController } from '../../../controllers/api/timeTrackers-controller.js'

export const router = express.Router()

const controller = new TimeTrackersController()

// ------------------------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------------------------

const PermissionLevels = Object.freeze({
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8
})

/**
 * Authenticates requests.
 *
 * If authentication is successful, `req.user`is populated and the
 * request is authorized to continue.
 * If authentication fails, an unauthorized response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme.')
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = {
      username: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      permissionLevel: payload.x_permission_level
    }

    next()
  } catch (err) {
    const error = createError(401)
    error.cause = err
    next(error)
  }
}

/**
 * Authorize requests.
 *
 * If authorization is successful, that is the user is granted access
 * to the requested resource, the request is authorized to continue.
 * If authentication fails, a forbidden response will be sent.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @param {number} permissionLevel - ...
 */
const hasPermission = (req, res, next, permissionLevel) => {
  req.user?.permissionLevel & permissionLevel
    ? next()
    : next(createError(403))
}

// ------------------------------------------------------------------------------
//  Routes
// ------------------------------------------------------------------------------

// Provide req.timeTracker to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadTimeTracker(req, res, next, id))

// GET timeTrackers
router.get('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.findAll(req, res, next)
)

// GET timeTrackers/:id
router.get('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.find(req, res, next)
)

// POST timeTrackers
router.post('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.CREATE),
  (req, res, next) => controller.create(req, res, next)
)

// PUT tasks/:id
router.put('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.update(req, res, next)
)

// DELETE tasks/:id
router.delete('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.delete(req, res, next)
)
