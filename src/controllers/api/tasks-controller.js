/**
 * Module for the TasksController.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import createError from 'http-errors'
import { Task } from '../../models/task.js'

/**
 * Encapsulates a controller.
 */
export class TasksController {
  /**
   * Provide req.task to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadTask (req, res, next, id) {
    try {
      // Get the task.
      const task = await Task.findById(id)

      // If no task found send a 404 (Not Found).
      if (!task) {
        next(createError(404))
        return
      }

      // Provide the task to req.
      req.task = task

      // Next middleware.
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    res.json(req.task)
  }

  /**
   * Sends a JSON response containing all tasks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const tasks = await Task.find()

      res.json(tasks)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const task = new Task({
        description: req.body.description,
        done: req.body.done
      })

      await task.save()

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${task._id}`
      )

      res
        .location(location.href)
        .status(201)
        .json(task)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      req.task.description = req.body.description
      req.task.done = req.body.done

      await req.task.save()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the specified task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await req.task.deleteOne()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
