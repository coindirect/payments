import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as AlertIcon } from '../../images/alert.svg'

export default function ErrorMessage({ message }) {
  const { t } = useTranslation()

  return (
    <div className='App'>
      <div className='error-panel-container'>
        <AlertIcon className='error-image' />
        <div className='error-message-container'>
          <span className='error'>{t('Error')}</span>
          <span className='error-message'>{message}</span>
        </div>
      </div>
    </div>
  )
}
