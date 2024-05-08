/**
 * Module for the TimeTrackerController.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import createError from 'http-errors'
import { TimeTracker } from '../../models/timeTracker.js'

/**
 * Encapsulates a controller.
 */
export class TimeTrackersController {
  /**
   * Provide req.timeTracker to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the timeTracker to load.
   */
  async loadTimeTracker (req, res, next, id) {
    try {
      // Get the timeTracker.
      const timeTracker = await TimeTracker.findById(id)

      // If no timeTracker found send a 404 (Not Found).
      if (!timeTracker) {
        next(createError(404))
        return
      }

      // Provide the timeTracker to req.
      req.task = timeTracker

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a timeTracker.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    res.json(req.timeTracker)
  }

  /**
   * Sends a JSON response containing all timeTrackers.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const timeTrackers = await TimeTracker.find()

      res.json(timeTrackers)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new timeTracker.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const timeTracker = new TimeTracker({
        userId: req.body.userId,
      })

      await timeTracker.save()

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${timeTracker._id}`
      )

      res
        .location(location.href)
        .status(201)
        .json(timeTracker)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific timeTracker.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      // Only save the valid properties on the request body.
      for (const field in req.body) {
        // Check if the field exists in the timeTracker schema.
        if (Object.prototype.hasOwnProperty.call(req.timeTracker.schema.obj, field)) {
          // Update the corresponding property of the timeTracker object with the value from the request body.
          req.timeTracker[field] = req.body[field]
        }
      }

      await req.timeTracker.save()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the specified timeTracker.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await req.timeTracker.deleteOne()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
