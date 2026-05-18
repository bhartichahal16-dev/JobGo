import Job from '../models/Job.js'
import JobApplication from "../models/JobApplication.js"
import { uploadFile } from '../utilis/uploadFile.js'
import getOrCreateUser from '../utilis/getOrCreateUser.js'
import { getAuthUserId } from '../utilis/auth.js'
import { fetchResumeBuffer } from '../utilis/fetchResumeBuffer.js'
import { toPdfDownloadName } from '../utilis/resumeFileName.js'
import path from 'path'

// Get user data
export const getUserData = async(req,res) => {
    const userId = getAuthUserId(req)

    if (!userId) {
        return res.json({ success: false, message: 'Unauthorized. Please login again.' })
    }

    try {
        const user = await getOrCreateUser(userId)
        res.json({success:true,user})
    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

// Apply for a job
export const applyforJob = async(req,res) => {

    const {jobId} = req.body

    const userId = getAuthUserId(req)

    if (!userId) {
        return res.json({ success: false, message: 'Unauthorized. Please login again.' })
    }

    try{
        const user = await getOrCreateUser(userId)

        if(!user.resume){
            return res.json({success:false, message:'Please upload your resume before applying'})
        }

        const isAlreadyApplied = await JobApplication.find({jobId,userId})

        if(isAlreadyApplied.length > 0){
            return res.json({success:false, message:'Already Applied'})
        }

        const jobData = await Job.findById(jobId)

        if(!jobData){
            return res.json({success:false, message:'Job Not Found'})
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date:Date.now()
        })
        res.json({success:true, message:'Applied Successfully'})
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}

// Get user applied applications
export const getUserJobApplications = async(req,res) => {
    const userId = getAuthUserId(req)

    if (!userId) {
        return res.json({ success: false, message: 'Unauthorized. Please login again.' })
    }

    try{
        const applications = await JobApplication.find({userId}).populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()

        return res.json({success:true, applications})
    }
    catch(error){
        res.json({success:false, message:error.message})
    }
}

// update user profile (resume)
export const updateUserResume = async(req,res) => {
    const userId = getAuthUserId(req)

    if (!userId) {
        return res.json({ success: false, message: 'Unauthorized. Please login again.' })
    }

    try{
        const resumeFile = req.file

        if(!resumeFile){
            return res.json({success:false, message: 'Resume file is required'})
        }

        const userData = await getOrCreateUser(userId)

        const originalName = resumeFile.originalname || 'resume.pdf'
        const ext = path.extname(originalName).toLowerCase() || '.pdf'
        const safeBase = path
            .basename(originalName, ext)
            .replace(/[^\w.-]/g, '_')
            .slice(0, 80) || 'resume'

        userData.resumeFileName = originalName
        userData.resume = await uploadFile(resumeFile, "raw", {
            public_id: `jobgo-resumes/${userId}_${Date.now()}_${safeBase}${ext}`,
        })

        await userData.save()

        return res.json({success:true, message:'Resume Updated', user: userData})
    }
    catch(error){
        console.error("updateUserResume:", error.message)
        res.json({success:false, message: error.message})
    }
}

// Download user's resume as PDF
export const downloadUserResume = async (req, res) => {
    const userId = getAuthUserId(req)

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login again.' })
    }

    try {
        const user = await getOrCreateUser(userId)

        if (!user.resume) {
            return res.status(404).json({ success: false, message: 'No resume uploaded' })
        }

        const buffer = await fetchResumeBuffer(user.resume)
        const downloadName = toPdfDownloadName(user.resumeFileName, user.name)

        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${downloadName}"; filename*=UTF-8''${encodeURIComponent(downloadName)}`
        )
        res.setHeader('Cache-Control', 'no-store')
        return res.send(buffer)
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}
