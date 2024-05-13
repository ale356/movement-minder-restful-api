/**
 * API version 1 routes.
 *
 * @author Mats Loock
 * @author Alejandro Lindström Mamani
 * @version 2.0.0
 */

import express from 'express'
import { router as accountRouter } from './account-router.js'
import { router as timeTrackersRouter } from './timeTrackers-router.js'
import { router as usersRouter } from './users-router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Hooray! Welcome to version 1 of this very simple RESTful API!' }))
router.use('/', accountRouter)
router.use('/timeTrackers', timeTrackersRouter)
router.use('/users', usersRouter)
