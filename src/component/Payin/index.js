import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import Timer from '../Timer'
import Api from '../../api'
import Loader from '../Loader'
import { ReactComponent as CancelIcon } from '../../images/cancel.svg'
import { ReactComponent as AlertIcon } from '../../images/alert.svg'

import '../../App.css'
import ErrorMessage from '../ErrorMessage'
import { getAndSaveUuid } from '../../utils/uuid'
class Payin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openDropdown: false,
      flag: false,
      name: '',
      data: {},
      selectedCurrency: 'Bitcoin',
      selectedCurrencyCode: 'BTC',
      response: false,
      isLoader: true,
      isUpdating: false,
      merchantId: '',
      displayName: '',
      errorMsg: '',
      isNextDisabled: false,
      payoutCurrency: [],
      isError: false
    }
    this.uuid = getAndSaveUuid(props.uuid)
  }

  componentDidMount() {
    if (!this.uuid) return

    Api.getCurrencies()
      .then((response) => {
        const currencies = []
        Object.keys(response.data).forEach((v, i) => {
          if (response.data[v].supportsDeposits) {
            currencies.push(response.data[v])
          }
        })
        this.setState({
          payoutCurrency: currencies
        })
        this.getStatus(this.uuid)
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isError: true
        })
      })
  }

  getStatus = (uuid) => {
    Api.status(uuid)
      .then((status) => {
        console.log(this.state.payoutCurrency, status?.data?.quote)
        this.setState(
          {
            data: status.data,
            response: true,
            selectedCurrency:
              this.state.payoutCurrency?.filter(
                (item) => item?.code === status?.data?.quote?.to
              )[0]?.name || 'Bitcoin',
            selectedCurrencyCode: status?.data?.quote?.to || 'BTC',
            miliseconds: status?.data?.quote?.acceptanceExpiryDate,
            isLoader: false,
            merchantId: status?.data?.merchantId,
            errorMsg: ''
          },
          () => {
            this.merchant(this.state.merchantId)
            this.updateCurrency(
              this.state.selectedCurrencyCode,
              this.state.selectedCurrency
            )
          }
        )
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  setDropdown = () => {
    this.setState((prevState) => ({
      openDropdown: !prevState.openDropdown
    }))
  }

  merchant = (id) => {
    Api.merchantInfo(id)
      .then((response) => {
        this.setState({
          displayName: response.data.displayName,
          isLoader: false
        })
      })
      .catch(() => {
        this.setState({
          errorMsg: this.props.t('Error fetching merchant information')
        })
      })
  }

  updateCurrency = (code = 'BTC', name) => {
    const data = {}
    data.currency = code
    data.payInMethod = 'crypto'
    const uuid =
      new URLSearchParams(window.location.search).get('uuid') ||
      window.sessionStorage.getItem('uuid') ||
      ''
    this.setState({ isUpdating: true }, () => {
      Api.updateCurrency(data, uuid)
        .then((response) => {
          this.setState({
            data: response.data,
            response: true,
            selectedCurrency: name,
            selectedCurrencyCode: code,
            miliseconds: response.data.quote.acceptanceExpiryDate,
            isLoader: false,
            merchantId: response.data.merchantId,
            errorMsg: ''
          })
        })
        .catch((error) => {
          this.setState({
            flag: !!(error.response && error.response.status === 500),
            isLoader: false,
            errorMsg:
              (error.response &&
                error.response.data &&
                error.response.data.errorList.length &&
                error.response.data.errorList[0].message) ||
              ''
          })
        })
        .finally(() => {
          this.setState({ isUpdating: false })
        })
    })
  }

  payInWallet = () => {
    this.setState({
      isNextDisabled: true
    })
    const uuid =
      new URLSearchParams(window.location.search).get('uuid') ||
      window.sessionStorage.getItem('uuid')
    Api.Accept(uuid)
      .then((response) => {
        this.props.successPayin(response.data.status)
      })
      .catch((error) => {
        this.props.failurePayin()
        this.setState({
          errorMsg: this.props.t('Something went wrong'),
          isLoading: false,
          flag: !!(error && error.response.status === 500),
          isNextDisabled: false
        })
      })
  }

  closeErrorContainer = () => {
    this.setState({
      flag: false
    })
  }

  render() {
    const {
      errorMsg,
      openDropdown,
      data,
      selectedCurrency,
      selectedCurrencyCode,
      miliseconds,
      isLoader,
      displayName,
      flag,
      isUpdating,
      isNextDisabled,
      payoutCurrency,
      isError
    } = this.state

    const { t } = this.props

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
        {isLoader ? (
          <Loader />
        ) : (
          <div className='payin-container'>
            {flag && (
              <div className='error-panel-container'>
                <AlertIcon className='error-image' />
                <div className='error-message-container'>
                  <span className='error'>{t('Error')}</span>
                  <span className='error-message'>
                    {t('No additional info available')}
                  </span>
                </div>
                <span
                  className='error-message-close'
                  onClick={() => this.closeErrorContainer()}
                >
                  <CancelIcon />
                </span>
              </div>
            )}
            <div className='pay-in-heading-wrapper'>
              <h1 className='page-heading'>
                {t('Pay with ') + selectedCurrency}
              </h1>
              <p>
                {displayName}{' '}
                {t('offers fast and secure cryptocurrency payments.')}
              </p>
            </div>
            <div>
              <p className='change-payout-currency'>{t('Pay with')}</p>
              <div
                className='dropdown-container'
                onClick={() => this.setDropdown()}
              >
                <div className='dropdown-container-state'>
                  <span className='dropdown-box'>{selectedCurrency}</span>
                </div>
                <div
                  className='dropdown-content'
                  style={{ display: openDropdown ? 'block' : 'none' }}
                >
                  {payoutCurrency && payoutCurrency.length
                    ? payoutCurrency.map((value, index) => {
                        return (
                          <div
                            onClick={() => {
                              this.updateCurrency(value.code, value.name)
                            }}
                            key={value.id}
                          >
                            {' '}
                            {value.name}
                          </div>
                        )
                      })
                    : null}
                </div>
              </div>
            </div>
            <div className='payment-of-wrapper'>
              <p>{t('Payment of')}</p>
              <p>
                {data && data.amount} {data.currency}
              </p>
            </div>
            {isUpdating ? <div className='overlay' /> : null}
            <React.Fragment>
              <div className='currency-wrapper'>
                <span>
                  {data.quote && data.quote.from} {t('Equivalent')}{' '}
                </span>
                <span>{(data.quote && data.quote.amountDue) || 0}</span>
              </div>
              <div className='pay-time-wrapper'>
                <span>{t('Quote expires in')}</span>
                <span>
                  <Timer
                    timerExpiry={this.updateCurrency}
                    name={selectedCurrency}
                    code={selectedCurrencyCode}
                    miliseconds={miliseconds}
                  />
                </span>
              </div>
              <div className='next-btn'>
                <button
                  onClick={this.payInWallet}
                  disabled={isNextDisabled}
                  className='nextbutton'
                >
                  {t('Pay with external wallet')}
                </button>
              </div>
            </React.Fragment>
            <div
              style={{ display: errorMsg ? 'block' : 'none' }}
              className='retrieve-rates'
            >
              <div className='retrieve-rates-text'>{errorMsg}</div>
            </div>
            <br />
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default withTranslation()(Payin)
