import express from 'express'
import { applyforJob, downloadUserResume, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'
import upload from '../config/multer.js'

const router = express.Router()

// Get user Data 
router.get('/user', getUserData)

// Apply for a job
router.post('/apply',applyforJob)


// Get applied jobs data 
router.get('/applications',getUserJobApplications)

// update user profile(resume)
router.post('/update-resume',upload.single('resume'),updateUserResume)

// Download user's resume
router.get('/download-resume', downloadUserResume)


export default router;