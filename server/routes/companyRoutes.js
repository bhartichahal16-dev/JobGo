import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company 
router.post('/register',upload.single('image'), registerCompany)

// Company Login
router.post('/login',loginCompany)

// Get Company data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany,postJob)

// Get Applicants Data of Company
router.get('/applicants', protectCompany, getCompanyJobApplicants)

// Get Company Job list
router.get('/list-jobs', protectCompany,getCompanyPostedJobs)

// Change Applications Status
router.post('/change-status', protectCompany, ChangeJobApplicationsStatus)

// Change job visibility
router.post('/change-visibility', protectCompany, changeVisiblity)

export default router