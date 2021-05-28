import React, { Component } from 'react'
import { ReactComponent as CancelIcon } from '../../images/cancel.svg'
import { ReactComponent as AlertIcon } from '../../images/alert.svg'
import { ReactComponent as DownArrowIcon } from '../../images/downarrow.svg'
import { withTranslation } from 'react-i18next'
import Timer from '../Timer'
import Api from '../../api'
import Loader from '../Loader'

import ErrorMessage from '../ErrorMessage'
import { getAndSaveUuid } from '../../utils/uuid'

class PayOut extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openDropdown: false,
      popUpError: false,
      selectedCurrencyCode: 'BTC',
      transactionStatus: 'PENDING',
      selectedCurrency: 'Bitcoin',
      data: {},
      validAddress: false,
      isError: false,
      errorMsg: '',
      confirmPayoutData: {},
      isLoading: true,
      walletAddress: '',
      isNextDisabled: true,
      isOverlay: false
    }
    this.uuid = getAndSaveUuid(props.uuid)
  }

  componentDidMount() {
    if (!this.uuid) return

    Api.getCurrencies(this.props.apiUrl)
      .then((response) => {
        this.setState({
          payoutCurrency: response.data,
          isLoading: false
        })
        this.getStatus(this.uuid)
      })
      .catch((error) => {
        console.log('error', error)
        this.setState({
          isLoading: false,
          isError: true
        })
      })
  }

  getStatus = (uuid) => {
    Api.status(uuid, this.props.apiUrl)
      .then((status) => {
        const selectedCurrency = this.state.payoutCurrency?.filter(
          (item) => item?.code === status?.data?.quote?.from
        )[0]?.name

        if (selectedCurrency) {
          this.setState(
            {
              selectedCurrency,
              selectedCurrencyCode: selectedCurrency
                ? status?.data?.quote?.from
                : this.state.selectedCurrencyCode
            },
            () => {
              this.updateCurrency(
                this.state.selectedCurrencyCode,
                this.state.selectedCurrency
              )
            }
          )
        } else {
          // if the current currency cannot be paid out, stay with the current payout currency > but triggers "updateCurrency" which
          // will get the latest supported currency payout values
          this.updateCurrency(
            this.state.selectedCurrencyCode,
            this.state.selectedCurrency
          )
        }
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  setDropdown = () => {
    this.setState({
      openDropdown: !this.state.openDropdown
    })
  }

  closeErrorContainer = () => {
    this.setState({
      popUpError: false
    })
  }

  updateCurr = (code, name) => {
    this.updateCurrency(code, name)
    this.setState({
      isOverlay: true
    })
  }

  updateCurrency = (code = 'BTC', name) => {
    return new Promise((resolve, reject) => {
      const data = {}
      data.currency = code
      data.payOutMethod = 'crypto'
      if (this.state.walletAddress && this.state.walletAddress.length > 0) {
        data.payOutInstruction = {
          code: 'crypto',
          address: this.state.walletAddress,
          currency: code
        }
      } else {
        data.payOutInstruction = null
      }

      Api.updateCurrency(data, this.uuid, this.props.apiUrl)
        .then((response) => {
          this.setState({
            data: response.data,
            response: true,
            selectedCurrency: name,
            selectedCurrencyCode: code,
            miliseconds: response.data.quote.acceptanceExpiryDate,
            isLoading: false.response,
            errorMsg: '',
            isNextDisabled: !this.state.validAddress,
            isOverlay: false
          })
          resolve()
        })
        .catch((error) => {
          this.setState({
            isLoading: false,
            popUpError: !!(error.response && error.response.status === 500),
            errorMsg:
              error.response && error.response.status > 400
                ? error.response && error.response.data
                : error.response.data.errorList
                ? error.response.data.errorList &&
                  error.response.data.errorList.length &&
                  error.response.data.errorList[0].message
                : this.props.t('Something went wrong')
          })
        })
    })
  }

  confirmPayout = () => {
    this.setState(
      {
        isNextDisabled: true,
        isOverlay: true
      },
      () => {
        const uuid =
          new URLSearchParams(window.location.search).get('uuid') ||
          window.sessionStorage.getItem('uuid')
        Api.accept(uuid, this.props.apiUrl)
          .then(() => {
            this.props.confirmPayoutSuccess()
          })
          .catch(() => {
            this.props.confirmPayoutFailure()
            this.setState({
              errorMsg: this.props.t('Something went wrong'),
              popUpError: true,
              isNextDisabled: false,
              isOverlay: false
            })
          })
      }
    )
  }

  handleAddress = (event) => {
    const data = {
      address: event.target.value,
      code: 'crypto',
      currency: this.state.selectedCurrencyCode
    }
    this.setState({
      walletAddress: event.target.value
    })
    Api.validate(data, this.props.apiUrl)
      .then((response) => {
        this.setState({ validAddress: true }, () => {
          this.updateCurrency(
            this.state.selectedCurrencyCode,
            this.state.selectedCurrency
          ).then(() => {
            this.setState({
              isNextDisabled: false
            })
          })
        })
      })
      .catch(() => {
        this.setState({
          errorMsg: this.props.t('Could not verify address'),
          validAddress: false
        })
      })
  }

  render() {
    const {
      openDropdown,
      popUpError,
      selectedCurrency,
      data,
      miliseconds,
      selectedCurrencyCode,
      isLoading,
      errorMsg,
      isNextDisabled,
      walletAddress,
      isOverlay,
      isError,
      payoutCurrency
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
        {isLoading ? (
          <Loader />
        ) : (
          <div style={{ opacity: isOverlay ? 0.5 : 1 }}>
            {popUpError && (
              <div className='cdp--error-panel-container'>
                <AlertIcon className='cdp--error-image' />
                <div className='cdp--error-message-container'>
                  <span className='cdp--error'>{t('Error')}</span>
                  <span className='cdp--error-message'>
                    {t('No additional info available')}
                  </span>
                </div>
                <span
                  className='cdp--error-message-close'
                  onClick={() => this.closeErrorContainer()}
                >
                  <CancelIcon />
                </span>
              </div>
            )}
            <h1 className='cdp--page-heading'>{t('Confirm payout')}</h1>
            <p className='cdp--subheading'>
              {t("We don't share your financial details with the merchant.")}
            </p>

            <div className='cdp--payout-container'>
              <table className='cdp--payout-table'>
                <thead>
                  <tr className='cdp--payout-table-heading-row'>
                    <th className='cdp--payout-heading'>{t('Payout of')}</th>
                    <th className='cdp--payout-value'>
                      {(data && data.amount) || 0}
                      {(data.quote && data.quote.from) || ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='cdp--payout-table-data-row'>
                    <td className='cdp--payout-heading'>{t('Fee')}</td>
                    <td className='cdp--payout-fee-value'>
                      {(data.quote && data.quote.fee) || 0}
                      {data && data.currency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <table className='cdp--payout-receive-table'>
                <thead>
                  <tr className='cdp--payout-receive'>
                    <th className='cdp--payout-receive-title'>
                      {t('You receive')}
                    </th>
                    <th className='cdp--payout-receive-value'>
                      {(data.quote && data.quote.amountOut) || 0}
                      {(data.quote && data.quote.to) || ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className='cdp--payout-quote'>
                    <td className='cdp--payout-quote-title'>
                      {t('Quote expires in')}
                    </td>
                    <td className='cdp--payout-quote-value'>
                      <Timer
                        timerExpiry={this.updateCurrency}
                        name={selectedCurrency}
                        code={selectedCurrencyCode}
                        miliseconds={miliseconds}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className='cdp--change-payout-currency'>
                {t('Change payout currency')}
              </p>
              <div
                className='cdp--dropdown-container'
                onClick={() => this.setDropdown()}
              >
                <div className='cdp--dropdown-container-state'>
                  <span className='cdp--dropdown-box'>{selectedCurrency}</span>
                  <div>
                    <DownArrowIcon className='cdp--dropdown-arrow' />
                  </div>
                </div>
                <div
                  className='cdp--dropdown-content'
                  style={{
                    display: openDropdown
                      ? 'block'
                      : openDropdown
                      ? 'none'
                      : 'none'
                  }}
                >
                  {payoutCurrency && payoutCurrency.length
                    ? payoutCurrency
                        .filter((item) => item.code !== data.currency)
                        .map((value) => {
                          return (
                            <div
                              onClick={() => {
                                this.updateCurr(value.code, value.name)
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
              <p className='cdp--wallet-address-description'>
                {t('Address where you wish to be paid')}
              </p>
              <input
                type='text'
                className='cdp--wallet-input'
                name='walletAddress'
                onChange={this.handleAddress}
                placeholder={walletAddress || 'Enter wallet address'}
              />
            </div>
            <div className='cdp--next-btn'>
              <button
                disabled={isNextDisabled}
                onClick={this.confirmPayout}
                className='cdp--nextbutton'
              >
                {t('Next')}
              </button>
            </div>
            {errorMsg ? (
              <div className='cdp--retrieve-rates'>
                <div className='cdp--retrieve-rates-text'>{errorMsg}</div>
              </div>
            ) : null}
          </div>
        )}
      </React.Fragment>
    )
  }
}
export default withTranslation()(PayOut)
