import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import Api from '../../api'
class PayinComplete extends Component {
  constructor() {
    super()
    this.state = {
      paymentInfo: ''
    }
  }

  componentDidMount() {
    const uuid =
      new URLSearchParams(window.location.search).get('uuid') ||
      window.sessionStorage.getItem('uuid')
    if (!this.state.paymentInfo) {
      Api.status(uuid)
        .then((response) => {
          this.setState({
            paymentInfo: response.data
          })
        })
        .catch((error) => {
          console.log('error', error)
        })
    }
  }

  render() {
    const { t } = this.props
    const { paymentInfo } = this.state
    return (
      <div className='payment-done-container'>
        <h1 className=''>{t('Payment completed')}</h1>
        <div className='total-paid'>
          <p>{t('Paid')}</p>
          <p>
            {paymentInfo?.quote?.amountIn || 0}{' '}
            {paymentInfo?.quote && paymentInfo?.quote?.from}
          </p>
        </div>
        <div className='total-payment'>
          <p>Payment</p>
          <p>
            {paymentInfo?.walletAmount || 0} {paymentInfo?.quote?.to}
          </p>
        </div>
        <div className='fee'>
          <p>Fee</p>
          <p>
            {(paymentInfo.quote && paymentInfo.quote.fee) || 0}{' '}
            {paymentInfo.quote && paymentInfo.quote.to}
          </p>
        </div>
        <div className='total-cost'>
          <p>{t('Total cost')}</p>
          <p>
            {(paymentInfo.quote && paymentInfo.quote.amountOut) || 0}{' '}
            {paymentInfo.walletCurrency}
          </p>
        </div>
        {paymentInfo.returnUrl && paymentInfo.returnUrl.length > 0 ? (
          <center>
            <br />
            <a href={paymentInfo.returnUrl} className='backbutton'>
              {t('Back to Merchant')}
            </a>
          </center>
        ) : null}
        <p>&nbsp;</p>
        <div className='ref'>
          <p>
            {t('Reference')} {paymentInfo.reference}
          </p>
        </div>
      </div>
    )
  }
}
export default withTranslation()(PayinComplete)
