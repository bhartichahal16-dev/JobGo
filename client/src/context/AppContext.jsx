import { createContext, useEffect, useState } from "react"
import axios from "axios"
import { useAuth, useUser } from "@clerk/clerk-react"
import { toast } from "react-toastify"
import { getBackendUrl } from "../config/backendUrl"

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    
    const backendUrl = getBackendUrl()

    const { user, isLoaded } = useUser()

    const { getToken, isSignedIn } = useAuth()

    const [searchFilter, setSearchFilter] = useState({
        title:'',
        location:''
    })

    const [isSearched, setIsSearched] = useState(false)

    const [jobs, setJobs] = useState([])

    const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

    const [companyToken,setCompanyToken] = useState(null)
    const [companyData,setCompanyData] = useState(null)

    const [userData, setUserData] = useState(null)

    const [userApplications, setUserApplications] = useState([])



    // Function to fetch Jobs
    const fetchJobs = async() => {
        try{
          const {data} = await axios.get(backendUrl + '/api/jobs')

          if (data.success){
            setJobs(data.jobs)
            console.log(data.jobs)
          }
          else{
            toast.error(data.message)
          }
        }
        catch (error) {
            const message = error.response?.data?.message || error.message
            toast.error(message)
        }

    }

    // Clear expired recruiter session (JWT "invalid signature" from old/wrong token)
    const clearCompanySession = () => {
        localStorage.removeItem('companyToken')
        setCompanyToken(null)
        setCompanyData(null)
    }

    // function to fetch company data
    const fetchCompanyData = async() => {
        try {
            const {data} = await axios.get(backendUrl + '/api/company/company', {headers:{token:companyToken}})

            if(data.success){
                setCompanyData(data.company)
            }
            else{
                if (data.message?.toLowerCase().includes('invalid signature')) {
                    clearCompanySession()
                    return
                }
                toast.error(data.message)
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message
            if (message?.toLowerCase().includes('invalid signature')) {
                clearCompanySession()
                return
            }
            toast.error(message)
        }
    }

    // function to fetch user data
    const fetchUserData = async () => {
        try {
            if (!isSignedIn) return

            const token = await getToken()
            if (!token) return

            const {data} = await axios.get(backendUrl + '/api/users/user', {headers:{Authorization:`Bearer ${token}`}})

            if(data.success){
                setUserData(data.user)
                return data.user
            }
            else{
                toast.error(data.message)
            }

        }
        catch(error){
            if (isSignedIn) {
                toast.error(error.response?.data?.message || error.message)
            }
        }
        return null
    }

    // Function to fetch user applied applications data
    const fetchUserApplications = async () =>
    {
        try{
            if (!isSignedIn) return

            const token = await getToken()
            if (!token) return

           const {data} = await axios.get(backendUrl + '/api/users/applications', {headers:{Authorization:`Bearer ${token}`}}
         )
        if(data.success){
            setUserApplications(data.applications)
        }
        else{
            toast.error(data.message)
        }
    }
        catch(error){
            if (isSignedIn) {
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    useEffect(() => {
        fetchJobs()

        const storedcompanyToken = localStorage.getItem('companyToken')

        if(storedcompanyToken){
            setCompanyToken(storedcompanyToken)
        }
    },[])

    useEffect(() => {
        if(companyToken){
            fetchCompanyData()
        }
    },[companyToken])

    useEffect(() => {
        if(isLoaded && isSignedIn && user){
            fetchUserData()
            fetchUserApplications()
        }
    },[isLoaded, isSignedIn, user])

    const value = {
        setSearchFilter,searchFilter, 
        isSearched, setIsSearched,
        jobs, setJobs,
        showRecruiterLogin, setShowRecruiterLogin,
        companyToken, setCompanyToken,
        companyData, setCompanyData,
        backendUrl,
        userData, setUserData,
        userApplications, setUserApplications,
        fetchUserData,
        fetchUserApplications

    }
    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)
}

export default AppContext
