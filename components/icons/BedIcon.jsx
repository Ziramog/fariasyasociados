'use client'

export default function BedIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='17'
      height='16'
      fill='none'
      viewBox='0 0 17 16'
      className={className}
    >
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M2.19 7.5V6c0-.552.43-1 .96-1h3.84c.53 0 .96.448.96 1v1.5M7.95 7.5V6c0-.552.43-1 .96-1h3.84c.53 0 .96.448.96 1v1.5'
      />
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M2.03 7.5h11.84c.707 0 1.28.597 1.28 1.333V12H.75V8.833c0-.736.573-1.333 1.28-1.333'
        clipRule='evenodd'
      />
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='M.75 12v2M15.15 12v2M13.71 7.5V3c0-.552-.43-1-.96-1h-9.6c-.53 0-.96.448-.96 1v4.5'
      />
    </svg>
  )
}
