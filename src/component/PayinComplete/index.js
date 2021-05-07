import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import Api from '../../api'
import { getUuid } from '../../utils/uuid'
import ErrorMessage from '../ErrorMessage'

class PayinComplete extends Component {
  constructor(props) {
    super(props)
    this.state = {
      paymentInfo: '',
      isError: false
    }
    this.uuid = getUuid(props.uuid)
  }

  componentDidMount() {
    if (!this.uuid) return

    if (!this.state.paymentInfo) {
      Api.status(this.uuid)
        .then((response) => {
          this.setState({
            paymentInfo: response.data
          })
        })
        .catch((error) => {
          this.setState({
            isError: true
          })
          console.log('error', error)
        })
    }
  }

  render() {
    const { t } = this.props
    const { paymentInfo, isError } = this.state

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
      <div className='cdp--payment-done-container'>
        <h1 className=''>{t('Payment completed')}</h1>
        <div className='cdp--total-paid'>
          <p>{t('Paid')}</p>
          <p>
            {paymentInfo?.quote?.amountIn || 0}{' '}
            {paymentInfo?.quote && paymentInfo?.quote?.from}
          </p>
        </div>
        <div className='cdp--total-payment'>
          <p>Payment</p>
          <p>
            {paymentInfo?.walletAmount || 0} {paymentInfo?.quote?.to}
          </p>
        </div>
        <div className='cdp--fee'>
          <p>Fee</p>
          <p>
            {(paymentInfo.quote && paymentInfo.quote.fee) || 0}{' '}
            {paymentInfo.quote && paymentInfo.quote.to}
          </p>
        </div>
        <div className='cdp--total-cost'>
          <p>{t('Total cost')}</p>
          <p>
            {(paymentInfo.quote && paymentInfo.quote.amountOut) || 0}{' '}
            {paymentInfo.walletCurrency}
          </p>
        </div>
        {paymentInfo.returnUrl && paymentInfo.returnUrl.length > 0 ? (
          <center>
            <br />
            <a href={paymentInfo.returnUrl} className='cdp--backbutton'>
              {t('Back to Merchant')}
            </a>
          </center>
        ) : null}
        <p>&nbsp;</p>
        <div className='cdp--ref'>
          <p>
            {t('Reference')} {paymentInfo.reference}
          </p>
        </div>
      </div>
    )
  }
}
export default withTranslation()(PayinComplete)
