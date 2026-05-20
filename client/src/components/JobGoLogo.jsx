import React from 'react'
import { assets } from '../assets/assets'

const JobGoLogo = ({ onClick, className = '', iconClassName = '', textClassName = '' }) => {
  const content = (
    <>
      <img
        src={assets.logoIcon}
        className={`h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain -mr-0.5 ${iconClassName}`}
        alt=""
      />
      <span
        className={`font-bold leading-none tracking-tight select-none ${textClassName || 'text-2xl sm:text-[1.75rem]'}`}
      >
        <span className="text-[#111827]">Job</span>
        <span className="text-[#5B4EDD]">Go</span>
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-0.5 cursor-pointer border-0 bg-transparent p-0 ${className}`}
        aria-label="JobGo home"
      >
        {content}
      </button>
    )
  }

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} aria-label="JobGo">
      {content}
    </div>
  )
}

export default JobGoLogo
