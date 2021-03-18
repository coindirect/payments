import React, { Component } from 'react';

import { withTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';

import copy from '../../images/copy.svg'
import confirm from '../../images/confirm.svg'
import Timer from '../Timer'
import Api from '../../api';
import Loader from '../Loader';

class WalletAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: false,
      walletData: {},
      isLoading: true,
      currencies: []
    }
  }

  copyAddress = () => {
    this.setState({ flag: true })
    navigator.clipboard.writeText(this.state.walletData.quote
      && this.state.walletData.quote.payInInstruction.displayParameters.address);
  }

  getStatus = (uuid) => {
    if (!this.state.isLoading || this.state.walletData) {
      Api.status(uuid)
        .then((response) => {
          this.setState({
            walletData: response.data,
            isLoading: false,
          })
          switch (response.data.status) {
            case 'PROCESSING':
              this.props.paymentStatus('PROCESSING')
              break;
            case 'COMPLETE':
              this.props.paymentStatus('COMPLETE')
              break;
            default:
              this.props.paymentStatus('PENDING')
              break;
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
    let uuid = new URLSearchParams(window.location.search).get("uuid") || sessionStorage.getItem('uuid');
    Api.getCurrencies()
      .then((response) => {
        if (!this.state.currencies.length) {
          this.setState({
            currencies: response.data,
          })
        }
      })
      .catch((error) => {
        console.log('error', error)
      })
    this.getStatus(uuid)
    setInterval(() => {
      this.getStatus(uuid)
    }, 15000);
  }

  checkCurrency = (currency) => {
    if (!this.state.walletData) {
      return false;
    }
    return currency.code === this?.state?.walletData?.quote?.from;
  }

  getUri = () => {
    let { walletData } = this.state;
    let currency = this.state.currencies.find(this.checkCurrency);

    if (currency) {
      return currency.name.toLowerCase().replace(" ", "") + ":"
        + encodeURIComponent(walletData?.quote?.payInInstruction?.displayParameters.address)
        + "?amount=" + encodeURIComponent(walletData.quote.amountIn);
    }
    return walletData?.quote?.payInInstruction?.displayParameters?.address || '';
  }

  render() {
    const { flag, walletData, isLoading } = this.state;
    const { t } = this.props;

    return (
      <React.Fragment>
        {
          isLoading ? <Loader /> :
            <div className="scanner-container">
              <div>
                <h1 className="page-heading">
                  {t("Pay with")} {(walletData.quote && walletData.quote.from) || ""}
                </h1>
                <p>
                  {t("To complete this payment send exactly this amount to the address provided")}
                </p>
                <div className="etc-wrapper">
                  <span >{walletData.quote && walletData.quote.from || ""}</span>
                  <span>{(walletData.quote && walletData.quote.amountDue || 0)}</span>
                </div>
                <div>
                  <span>{t("Amount")}</span>
                  <span>{walletData.quote && walletData.quote.amountDue || 0}
                    {walletData.quote && walletData.quote.from}
                  </span>
                </div>
              </div>
              <div className="scanner-view" >
                <QRCode value={this.getUri()} />
              </div>
              <p>{t("Only send ") + walletData?.quote?.from + t(" to this address")}</p>
              <div className="copy-button">
                <span>
                  {(walletData.quote && walletData.quote.payInInstruction.displayParameters.address || "")}
                </span>
                <button onClick={this.copyAddress}><img src={flag ? confirm : copy} alt="" /></button>
              </div>
              <div className="pay-time-wrapper" >
                <span>{t("Time left to pay")}</span>
                <span>
                  <Timer
                    miliseconds={walletData && walletData.quote && walletData.quote.paymentExpiryDate}
                  />
                </span>
              </div>
              <span>
                {t("This feature requires blockchain confirmations before crediting your payment. Your merchant will update you on transaction progress.")}
              </span>
            </div>
        }
      </React.Fragment>
    )
  }
}
export default withTranslation()(WalletAddress);