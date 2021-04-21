import React from 'react'

function Loader() {
  return (
    <div className='loader-content'>
      <div className='loader-circle' />
      <div className='loader-line-mask one'>
        <div className='loader-line' />
      </div>
    </div>
  )
}

export default Loader
