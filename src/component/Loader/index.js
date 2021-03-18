import React from 'react';
import './loader.css'

function Loader() {
  return <div className='loader-content'>
    <div className="loader-circle"></div>
    <div className="loader-line-mask one">
      <div className="loader-line"></div>
    </div>
  </div>
}

export default Loader