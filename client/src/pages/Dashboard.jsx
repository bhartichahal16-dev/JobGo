import React from 'react'
import { Outlet } from 'react-router-dom'
import { assets } from '../assets/assets'

const Dashboard = () => {
  return (
    <div className='min-h-screen'>

        {/* Navbar for Recuriter Panel */}
        <div className=''>
            <div>
                <img src={assets.logo} alt="" />
                <div>
                    <p>Welcome, GreatStack</p>
                    <div>
                        <img src={assets.company_icon} />
                        <div>
                            <ul>
                                <li>Logout</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Dashboard