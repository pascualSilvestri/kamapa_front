import { useState, useCallback } from 'react'

const useFormStatus = () => {
  const [status, setStatus] = useState('')

  const resetStatus = useCallback(() => {
    setStatus('')
  }, [])

  return { status, setStatus, resetStatus }
}

export default useFormStatus
