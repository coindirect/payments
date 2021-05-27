import React, { Component } from 'react'
import Api from '../../api'
import { withTranslation } from 'react-i18next'
import Loader from '../Loader'
import ErrorMessage from '../ErrorMessage'
import { getUuid } from '../../utils/uuid'
import { WALLET_URL } from '../../Constants'

class PayOutComplete extends Component {
  constructor(props) {
    super()
    this.state = {
      confirmPayoutData: {},
      payoutCurrencyData: [],
      isError: false,
      isLoading: true
    }
    this.uuid = getUuid(props.uuid)
  }

  componentDidMount() {
    if (!this.uuid) return

    const data = {}
    data.successUrl = 'no_url'

    Api.getCurrencies(this.props.apiUrl)
      .then((response) => {
        this.setState({
          payoutCurrencyData: response.data,
          isLoading: false
        })
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isLoading: false,
          isError: true
        })
      })
    this.getStatus(this.uuid)
  }

  getStatus = (uuid) => {
    Api.status(uuid, this.props.apiUrl)
      .then((response) => {
        this.setState({
          confirmPayoutData: response.data,
          isLoading: false
        })
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isError: true
        })
      })
  }

  render() {
    const {
      isError,
      payoutCurrencyData,
      confirmPayoutData,
      isLoading
    } = this.state
    const { t } = this.props

    if (!this.uuid) {
      return <ErrorMessage message={t('Something went wrong')} />
    }

    let result

    if (confirmPayoutData?.quote) {
      result = payoutCurrencyData?.filter(
        (val) => val.code === confirmPayoutData?.quote?.to
      )
    }

    return (
      <div className='cdp--payment-container'>
        {isLoading ? (
          <Loader />
        ) : (
          <React.Fragment>
            <h1 className='cdp--page-heading'>{t('Payout Complete')}</h1>
            <p className='cdp--success-quote'>
              <b>{t('Success!')} </b>
              {result?.length > 0 &&
                result.map((val) =>
                  t('You have been paid out in {{currencyCode}}', {
                    currencyCode: val.name
                  })
                )}
            </p>
            <div>
              <div className='cdp--payout-of-wrapper'>
                <p className='cdp--payout'>
                  <strong>{t('Payout')}</strong>
                </p>
                <p className='cdp--amount'>
                  <strong>
                    {(confirmPayoutData.quote &&
                      confirmPayoutData.quote.amountOut) ||
                      0}
                    {confirmPayoutData.quote && confirmPayoutData.quote.to}
                  </strong>
                </p>
              </div>
              <div className='cdp--payout-fee-wrapper'>
                <span>{t('Fee')}</span>
                <span>
                  {`${(confirmPayoutData && confirmPayoutData.fee) || 0} ${(confirmPayoutData.quote && confirmPayoutData.quote.from) ||
                    ''
                    }`}
                </span>
              </div>
              <div className='cdp--payout-equivalent-wrapper'>
                <p>
                  <b>
                    {confirmPayoutData.quote && confirmPayoutData.quote.from}{' '}
                    {t('Equivalent')}
                  </b>
                </p>
                <p>
                  <strong>
                    {`${(confirmPayoutData &&
                      confirmPayoutData.quote &&
                      confirmPayoutData.quote.amountInGross) ||
                      0
                      } ${(confirmPayoutData.quote &&
                        confirmPayoutData.quote.from) ||
                      ''
                      }`}
                  </strong>
                </p>
              </div>
              <div className='cdp--go-to-wallet-wrapper'>
                <a href={props.walletUrl || WALLET_URL}>
                  <span>
                    <strong>{t('Go To Wallet')}</strong>
                  </span>
                </a>
              </div>
            </div>
            <div
              style={{ display: isError ? 'block' : 'none' }}
              className='cdp--retrieve-rates'
            >
              <div className='cdp--retrieve-rates-text'>
                {t('Something went wrong')}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    )
  }
}
export default withTranslation()(PayOutComplete)
