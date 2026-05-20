import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
  return (
    <section className='container px-4 2xl:px-20 mx-auto my-20' aria-label='JobGo platform overview'>
      <img
        className='w-full h-auto rounded-lg object-contain'
        src={assets.poster}
        alt='JobGo: Make your career stand out — register, upload resume, ATS score, apply to jobs, and get hired faster'
        loading='lazy'
      />
    </section>
  )
}

export default AppDownload
