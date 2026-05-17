import React, { useContext, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { assets, jobsApplied } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import AppContext from '../context/AppContext'
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { downloadResumeBlob, downloadResumePdfWithFallback } from '../utils/downloadResume'

const Applications = () => {

  const { user, isLoaded } = useUser()
  const { getToken, isSignedIn } = useAuth()

  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingResume, setDownloadingResume] = useState(false)

  const {backendUrl, userData, userApplications, fetchUserData, fetchUserApplications } = useContext(AppContext)

  const updateResume = async () => {
    try {
      if (!resume) {
        return toast.error('Please select a resume file')
      }

      const formData = new FormData()
      formData.append('resume', resume)

      const token = await getToken()

      const {data} = await axios.post(backendUrl + '/api/users/update-resume', formData, {headers:{Authorization:`Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        await fetchUserData()
        setIsEdit(false)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }

    setResume(null)
  }

  const downloadResume = async () => {
    const resumeUrl = userData?.resume
    if (!resumeUrl || downloadingResume) return

    setDownloadingResume(true)
    try {
      const token = await getToken()
      if (token) {
        const { data } = await axios.get(backendUrl + '/api/users/download-resume', {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        })
        downloadResumeBlob(data, 'resume.pdf')
        return
      }

      await downloadResumePdfWithFallback(resumeUrl, 'resume.pdf')
    } catch {
      try {
        await downloadResumePdfWithFallback(resumeUrl, 'resume.pdf')
      } catch {
        toast.error('Could not download resume. Try again.')
      }
    } finally {
      setDownloadingResume(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded) return

      if (!user || !isSignedIn) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      await Promise.all([fetchUserData(), fetchUserApplications()])
      setIsLoading(false)
    }

    loadData()
  }, [user, isLoaded, isSignedIn])

  const showResumeUpload = isEdit || !userData?.resume

  if (!isLoaded || isLoading) {
    return (
      <>
        <Navbar />
        <Loading />
        <Footer />
      </>
    )
  }

  if (!isSignedIn || !user) {
    return (
      <>
        <Navbar />
        <div className='container px-4 min-h-[64vh] 2xl:px-20 mx-auto my-10'>
          <p className='text-gray-600'>Please login to view your applications.</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
    <Navbar/>
    <div className='container px-4 min-h-[64vh] 2xl:px-20 mx-auto my-10'>
      <h2 className='text-xl font-semibold'>Your Resume</h2>
         <div className='flex gap-2 mb-6 mt-3'>
            {
              showResumeUpload
              ? 
              <>
                <label className='flex items-center' htmlFor='resumeUpload'>
                  <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>{resume ? resume.name : 'Select Resume'}</p>
                  <input id='resumeUpload' onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" hidden/>
                  <img src={assets.profile_upload_icon} alt='' />
                </label>
                <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded-lg px-4 py-2'>Save</button>
              </>
              :
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={downloadResume}
                  disabled={downloadingResume}
                  className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg disabled:opacity-70'
                >
                  {downloadingResume ? 'Downloading...' : 'Resume'}
                </button>
                <button onClick={()=> setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'>
                  Edit
                </button>
              </div>
            }
         </div>
         <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
         <table className='min-w-full bg-white border rounded-lg'>
           <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Company</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 border-b text-left'>Status</th>
            </tr>
           </thead>
           <tbody>
            {userApplications.map((job,index)=> true ? (
              <tr key={index}>
                <td className='py-3 py-4 flex iotems-center gap-2 border-b'>
                  <img className='w-8 h-8' src={job.companyId?.image} alt=""/>{job.companyId?.name}
                  </td>
                <td className='py-2 px-4 border-b'>{job.jobId?.title}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId?.location}</td>
                <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                <td className='py-2 px-4 border-b'>
                  <span className={`${job.status === 'Accepted' ? 'bg-green-100': job.status === 'Rejected' ? 'bg-red-100': 'bg-blue-100'} px-4 py-1.5 rounded`}>
                  {job.status}
                    </span></td>
              </tr>
            ) : (null))}
           </tbody>
         </table>
    </div>
    <Footer/>
    </>
  )
}

export default Applications