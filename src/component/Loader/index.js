import React from 'react'

function Loader() {
  return (
    <div className='cdp--loader-content'>
      <div className='cdp--loader-circle' />
      <div className='cdp--loader-line-mask cdp--one'>
        <div className='cdp--loader-line' />
      </div>
    </div>
  )
}

export default Loader
