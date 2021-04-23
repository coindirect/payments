import React, { Component } from 'react'

import { withTranslation } from 'react-i18next'
import QRCode from 'qrcode.react'

import Timer from '../Timer'
import Api from '../../api'
import Loader from '../Loader'
import ErrorMessage from '../ErrorMessage'
import { getAndSaveUuid } from '../../utils/uuid'

class WalletAddress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      flag: false,
      walletData: {},
      isLoading: true,
      currencies: [],
      isError: false
    }
    this.setInterval = {}
    this.uuid = getAndSaveUuid(props.uuid)
  }

  copyAddress = () => {
    this.setState({ flag: true })

    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        this.state.walletData.quote &&
          this.state.walletData.quote.payInInstruction.displayParameters.address
      )
    }
  }

  getStatus = (uuid) => {
    if (!this.state.isLoading || this.state.walletData) {
      Api.status(uuid)
        .then((response) => {
          this.setState({
            walletData: response.data,
            isLoading: false
          })
          switch (response.data.status) {
            case 'PROCESSING':
              this.props.paymentStatus('PROCESSING')
              break
            case 'COMPLETE':
              this.props.paymentStatus('COMPLETE')
              break
            default:
              this.props.paymentStatus('PENDING')
              break
          }
        })
        .catch((error) => {
          console.log('error', error)
          this.setState({
            isLoading: false
          })
        })
    }
  }

  componentDidMount() {
    if (!this.uuid) return

    Api.getCurrencies()
      .then((response) => {
        if (!this.state.currencies.length) {
          this.setState({
            currencies: response.data
          })
        }
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isError: true
        })
      })
    this.getStatus(this.uuid)
    this.setInterval = setInterval(() => {
      this.getStatus(this.uuid)
    }, 15000)
  }

  checkCurrency = (currency) => {
    if (!this.state.walletData) {
      return false
    }
    return currency.code === this?.state?.walletData?.quote?.from
  }

  componentWillUnmount() {
    clearInterval(this.setInterval)
  }

  getErc20Uri(contract, to, amount, decimals) {
    const value = amount * 10 ** decimals
    return (
      'ethereum:' +
      contract +
      '/transfer?address=' +
      encodeURIComponent(to) +
      '&uint256=' +
      encodeURIComponent(value)
    )
  }

  getFullUri = (currency, address, amount, tag) => {
    if (currency) {
      const code = currency.code.toUpperCase()
      switch (code) {
        case 'USDT':
          return this.getErc20Uri(
            '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            address,
            amount,
            6
          )
        case 'USDC':
          return this.getErc20Uri(
            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            address,
            amount,
            6
          )
        case 'DAI':
          return this.getErc20Uri(
            '0x6b175474e89094c44da98b954eedeac495271d0f',
            address,
            amount,
            18
          )
        case 'XRP':
          return (
            'ripple:' +
            encodeURIComponent(address) +
            '?dt=' +
            encodeURIComponent(tag) +
            '&amount=' +
            encodeURIComponent(amount)
          )
        case 'BCH':
          return address + '?amount=' + encodeURIComponent(amount)
      }

      return (
        currency.name.toLowerCase().replace(' ', '') +
        ':' +
        encodeURIComponent(address) +
        '?amount=' +
        encodeURIComponent(amount)
      )
    }
    return address
  }

  getUri = () => {
    const { walletData } = this.state
    const currency = this.state.currencies.find(this.checkCurrency)

    return this.getFullUri(
      currency,
      walletData?.quote?.payInInstruction?.displayParameters.address,
      walletData.quote.amountDue,
      walletData?.quote?.payInInstruction?.displayParameters.tag
    )
  }

  render() {
    const { flag, walletData, isLoading, isError } = this.state
    const { t, copy, confirm } = this.props

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
        {isLoading ? (
          <Loader />
        ) : (
          <div className='cdp--scanner-container'>
            <div>
              <h1 className='cdp--page-heading'>
                {t('Pay with')}{' '}
                {(walletData.quote && walletData.quote.from) || ''}
              </h1>
              <p>
                {t(
                  'To complete this payment send exactly this amount to the address provided'
                )}
              </p>
              <div className='cdp--etc-wrapper'>
                <span>{(walletData.quote && walletData.quote.from) || ''}</span>
                <span>
                  {(walletData.quote && walletData.quote.amountDue) || 0}
                </span>
              </div>
              <div>
                <span>{t('Amount')}</span>
                <span>
                  {walletData?.quote?.amountDue || 0}
                  {walletData?.quote?.from}
                </span>
              </div>
            </div>
            <div className='cdp--scanner-view'>
              <QRCode value={this.getUri()} />
            </div>
            <p>
              {t('Only send ') +
                walletData?.quote?.from +
                t(' to this address')}
            </p>
            <div className='cdp--copy-button'>
              <span>
                {walletData?.quote?.payInInstruction?.displayParameters
                  ?.address || ''}
              </span>
              <button onClick={this.copyAddress}>
                <img src={flag ? confirm : copy} alt='' />
              </button>
            </div>
            <div className='cdp--pay-time-wrapper'>
              <span>{t('Time left to pay')}</span>
              <span>
                <Timer miliseconds={walletData?.quote?.paymentExpiryDate} />
              </span>
            </div>
            <span>
              {t(
                'This feature requires blockchain confirmations before crediting your payment. Your merchant will update you on transaction progress.'
              )}
            </span>
          </div>
        )}
      </React.Fragment>
    )
  }
}
export default withTranslation()(WalletAddress)
