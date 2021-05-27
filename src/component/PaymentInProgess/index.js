import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import Api from '../../api'
import { getUuid } from '../../utils/uuid'
import ErrorMessage from '../ErrorMessage'
import Loader from '../Loader'

class PaymentInProgess extends Component {
  constructor(props) {
    super(props)
    this.state = {
      walletData: {},
      isError: false
    }
    this.uuid = getUuid(props.uuid)
  }

  componentDidMount() {
    if (!this.uuid) return

    this.getStatus(this.uuid)
    setInterval(() => {
      this.getStatus(this.uuid)
    }, 15000)
  }

  getStatus = (uuid) => {
    Api.status(uuid, this.props.apiUrl)
      .then((response) => {
        this.setState({
          walletData: response.data
        })
        switch (response.data.status) {
          case 'COMPLETE':
            this.props.paymentStatus('COMPLETE')
            break
          default:
            this.props.paymentStatus('PROCESSING')
            break
        }
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isError: true
        })
      })
  }

  render() {
    const { t } = this.props
    const { walletData, isError } = this.state

    if (!this.uuid || isError) {
      return (
        <ErrorMessage
          message={
            !this.uuid
              ? t('Something went wrong')
              : t('Error fetching merchant information')
          }
        />
      )
    }

    return (
      <React.Fragment>
        {Object.keys(walletData)?.length ? (
          <div className='cdp--payment-progress-container'>
            <span className='cdp--great-qoute'>
              <strong>{t('Great')}! </strong>
              {t(
                'We have detected your transaction on the blockchain and will now wait until the payment has been fully processed'
              )}
              .
            </span>
            <p>&nbsp;</p>
            <div className='cdp--total-paid'>
              <p>{t('Seen')}</p>
              <p style={{ color: '#0C0F3D' }}>
                {walletData?.quote?.amountIn} {walletData?.quote?.from}
              </p>
            </div>
            <div className='cdp--total-amount'>
              <p>{t('Total amount')} </p>
              <p style={{ color: '#0C0F3D' }}>
                {walletData.walletAmount} {walletData.walletCurrency}
              </p>
            </div>
            <span className='cdp--confirmation'>
              {t(
                'This feature requires blockchain confirmations before crediting your payment. Your merchant will update you on transaction progress.'
              )}
            </span>
            <div className='cdp--ref'>
              <p>
                {t('Reference')}
                <b> {walletData.reference}</b>
              </p>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </React.Fragment>
    )
  }
}
export default withTranslation()(PaymentInProgess)
