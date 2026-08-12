'use client'

export default function EmailIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      fill='none'
      viewBox='0 0 24 24'
      className={className}
    >
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M.75 6a1.5 1.5 0 0 1 1.5-1.5h19.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H2.25A1.5 1.5 0 0 1 .75 18V6Z'
        clipRule='evenodd'
      />
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M15.687 9.975 19.5 13.5M8.313 9.975 4.5 13.5M22.88 5.014l-9.513 6.56a2.406 2.406 0 0 1-2.734 0L1.12 5.014'
      />
    </svg>
  )
}
