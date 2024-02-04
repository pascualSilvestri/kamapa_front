'use client'
import React from 'react'

const SuccessMessage = ({ message }) => {
  return (
    <div className='alert alert-success'>
      <i className='fas fa-check' />
      {message}
    </div>
  )
}

export default SuccessMessage
