import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import AppContext from '../context/AppContext'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import kconvert from 'k-convert';
import moment from 'moment';
import JobCard from '../components/JobCard'
import Footer from '../components/Footer'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import { calculateAtsScore, extractJobKeywords, getScoreColor } from '../utils/atsScore'
import { extractTextFromResumeUrl } from '../utils/resumeText'

const ApplyJob = () => {
  
  const { id } = useParams()

  const { getToken, isSignedIn } = useAuth()
  const { isLoaded } = useUser()

  const navigate = useNavigate()
  const [JobData, setJobData] = useState(null)

  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false)
  const [atsScore, setAtsScore] = useState(null)
  const [atsLoading, setAtsLoading] = useState(false)
  const [atsError, setAtsError] = useState(null)

  const {jobs,backendUrl, userData, userApplications, fetchUserData, fetchUserApplications } = useContext(AppContext)
  const fetchJob = async () => {
    // const data = jobs.filter(job => job._id === id)
    // if(data.length !==0){
    //   setJobData(data[0])
    //   console.log(data[0])
    // }
     try{
      const {data} = await axios.get(backendUrl+`/api/jobs/${id}`)

      if(data.success){
        setJobData(data.job)
      }
      else{
        toast.error(data.message)
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  }

  const applyHandler = async () => {
    try{
       if (!isLoaded) return

       if (!isSignedIn) {
        return toast.error('Please login to apply for jobs')
       }

       let currentUser = userData
       if (!currentUser?.resume) {
        currentUser = await fetchUserData()
       }

       if (!currentUser?.resume) {
        toast.error('Please upload your resume to apply for jobs')
        navigate('/applications')
        return
       }

       const token = await getToken()
       if (!token) {
        return toast.error('Please login to apply for jobs')
       }

       const {data} = await axios.post(backendUrl+'/api/users/apply',
        {jobId:JobData._id},
        {headers:{Authorization:`Bearer ${token}`}}
       )

       if(data.success){
        toast.success(data.message)
        fetchUserApplications()
       }
       else{
        toast.error(data.message)
       }

    }
    catch(error){
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const checkAlreadyApplied = () => {
    const hasApplied = userApplications.some(item => item.jobId?._id === JobData._id)

    setIsAlreadyApplied(hasApplied)


  }

  useEffect(()=>{
      fetchJob()
  },[id])

  useEffect(()=>{
    if(userApplications.length > 0 && JobData){
      checkAlreadyApplied()
    }
  },[JobData,userApplications,id])

  useEffect(() => {
    let cancelled = false

    const runAtsCheck = async () => {
      setAtsScore(null)
      setAtsError(null)

      if (!JobData || !isLoaded || !isSignedIn) return

      let resumeUrl = userData?.resume
      if (!resumeUrl) {
        const user = await fetchUserData()
        resumeUrl = user?.resume
      }

      if (!resumeUrl) return

      setAtsLoading(true)
      try {
        const resumeText = await extractTextFromResumeUrl(resumeUrl)
        const jobKeywords = extractJobKeywords(JobData)
        const result = calculateAtsScore(resumeText, jobKeywords)

        if (!cancelled) {
          setAtsScore(result.score)
        }
      } catch {
        if (!cancelled) {
          setAtsError('Could not read resume for ATS check')
        }
      } finally {
        if (!cancelled) {
          setAtsLoading(false)
        }
      }
    }

    runAtsCheck()

    return () => {
      cancelled = true
    }
  }, [JobData, isLoaded, isSignedIn, userData?.resume, id])

  const renderAtsLabel = () => {
    if (!isSignedIn) return null

    if (atsLoading) {
      return <p className='text-sm text-gray-500'>Checking ATS Score...</p>
    }

    if (atsError) {
      return <p className='text-sm text-gray-500'>{atsError}</p>
    }

    if (atsScore === null) {
      if (!userData?.resume) {
        return (
          <p className='text-sm text-gray-500'>
            <Link to='/applications' className='text-blue-600 hover:underline'>
              Upload resume
            </Link>{' '}
            to see ATS Score
          </p>
        )
      }
      return null
    }

    return (
      <p className={`text-sm font-semibold ${getScoreColor(atsScore)}`}>
        ATS Score: {atsScore}%
      </p>
    )
  }

  const renderApplyBlock = (align = 'end') => {
    const rowClass =
      align === 'end'
        ? 'justify-end max-md:justify-center'
        : 'justify-start'

    return (
      <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end max-md:items-center' : 'items-start'}`}>
        <div className={`flex flex-wrap items-center gap-3 ${rowClass}`}>
          {!isAlreadyApplied && renderAtsLabel()}
          <button
            onClick={applyHandler}
            disabled={isAlreadyApplied}
            className='bg-blue-600 p-2.5 px-10 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed'
          >
            {isAlreadyApplied ? 'Already Applied' : 'Apply Now'}
          </button>
        </div>
        {!isAlreadyApplied && atsScore !== null && atsScore < 50 && (
          <Link
            to='/applications'
            className={`text-xs text-blue-600 hover:underline ${align === 'end' ? 'max-md:text-center' : ''}`}
          >
            Update resume to improve score
          </Link>
        )}
      </div>
    )
  }

  return JobData ?  (
    <>
     <Navbar/>
     <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
          <div className='bg-white text-black rounded-lg w-full'>
                <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl'>
                     <div className='flex flex-column md:flex-row items-center'>
                      <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={JobData.companyId.image} alt="" /> 
                        <div className='text-center md:text-left text-neutral-700'>
                              <h1 className='text-2xl sm:text-4xl font-medium'>{JobData.title}</h1>
                              <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                                  <span className='flex items-center gap-1'>
                                      <img src={assets.suitcase_icon} alt="" />
                                      {JobData.companyId.name}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <img src={assets.location_icon} alt="" />
                                    {JobData.location}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <img src={assets.person_icon} alt="" />
                                    {JobData.level}
                                  </span>
                                  <span className='flex items-center gap-1'>
                                    <img src={assets.money_icon} alt="" />
                                    CTC : {kconvert.convertTo(JobData.salary)}
                                  </span>
                              </div>
                        </div>
                     </div>
                     <div className='flex flex-col justify-center text-sm max-md:mx-auto'>
                          {renderApplyBlock('end')}
                          <p className='mt-1 text-gray-600 text-end max-md:text-center'>Posted {moment(JobData.date).fromNow()}</p>
                     </div>     
                </div>

                <div className='flex flex-col lg:flex-row justify-between items-start'>
                    <div className='w-full lg:w-2/3'>
                      <h2 className='font-bold text-2xl mb-4'>Job description</h2>
                         <div className='rich-text' dangerouslySetInnerHTML={{__html:JobData.description}}></div>
                         <div className='mt-10'>{renderApplyBlock('start')}</div>

                    </div>

                    {/* Right Section More Jobs */}
                    <div className='w-full lg:w-1/3 mt:8 mg:mt-0 lg:ml-8 space-y-5'>
                      <h2>More jobs from {JobData.companyId.name}</h2>
                      {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
                      .filter(job => {
                        // Set of applied jobIds
                        const appliedJobIds = new Set(userApplications.map(app => app.jobId && app.jobId._id)) 
                        // Return true if the user has not alread applied for this job
                        return !appliedJobIds.has(job._id)
                        }).slice(0,4)
                      .map((job, index)=> <JobCard key={index} job={job}/> )}

                    </div>
                </div>
          </div>
     </div>

     <Footer/>
    </>
  ) : (
     <Loading/>
  )
}

export default ApplyJob