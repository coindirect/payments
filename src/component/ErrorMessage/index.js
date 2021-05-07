import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as AlertIcon } from '../../images/alert.svg'

export default function ErrorMessage({ message }) {
  const { t } = useTranslation()

  return (
    <div className='cdp--error-panel-container'>
      <AlertIcon className='cdp--error-image' />
      <div className='cdp--error-message-container'>
        <span className='cdp--error'>{t('Error')}</span>
        <span className='cdp--error-message'>{message}</span>
      </div>
    </div>
  )
}
