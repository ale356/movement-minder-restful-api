/**
 * API version 1 routes.
 *
 * @author Mats Loock
 * @version 2.0.0
 */

import express from 'express'
import { UsersController } from '../../../controllers/api/users-controller.js'

export const router = express.Router()

const controller = new UsersController()

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadUser(req, res, next, id))

// GET users/:id
// TODO: Add authorization!!!
router.get('/:id', (req, res, next) => controller.find(req, res, next))
