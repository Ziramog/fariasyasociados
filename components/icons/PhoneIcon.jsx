'use client'

export default function PhoneIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='25'
      fill='none'
      viewBox='0 0 24 25'
      className={className}
    >
      <path
        stroke='#E94560'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        d='m15.04 22.39.012.007a5.533 5.533 0 0 0 6.884-.755l.774-.774c.72-.721.72-1.889 0-2.61L19.449 15a1.846 1.846 0 0 0-2.61 0v0a1.843 1.843 0 0 1-2.607 0L9.014 9.78a1.846 1.846 0 0 1 0-2.608v0a1.843 1.843 0 0 0 0-2.608L5.754 1.3a1.846 1.846 0 0 0-2.61 0l-.773.774a5.535 5.535 0 0 0-.756 6.884l.008.012A49.935 49.935 0 0 0 15.04 22.39v0Z'
        clipRule='evenodd'
      />
    </svg>
  )
}
