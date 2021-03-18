import React, { Component } from 'react'
import axios from 'axios';
import Api from '../../api';
import { withTranslation } from 'react-i18next';
import Loader from '../Loader';
import { API_BASE_URL } from '../../Constants';

class PayOutComplete extends Component {
  constructor(props) {
    super();
    this.state = {
      confirmPayoutData:{},
      payoutCurrencyData:[],
      isError: false,
    }
  }
  
  componentDidMount() {
    let data = {}
    data.successUrl = "no_url";
    var uuid = sessionStorage.getItem('uuid');
    Api.getCurrencies()
    .then((response) => {
        this.setState({
            payoutCurrencyData: response.data,
        })
    })
    .catch((error) => {
      console.log('error', error)
    })
    this.getStatus(uuid)
  }

  getStatus = (uuid) => {
    Api.status(uuid)
      .then((response) => {
        this.setState({
          confirmPayoutData: response.data,
        })
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  render() {
    const { isError, payoutCurrencyData, confirmPayoutData} = this.state;
    const { t } = this.props;

    let result;

    if(confirmPayoutData?.quote){
      result = payoutCurrencyData?.filter(val => val.code === confirmPayoutData?.quote?.to );
    }

    return (
      <div className="payment-container">
          <React.Fragment>
            <h1 className="page-heading" >
              {t("Payout Complete")}
            </h1>
            <p className="success-quote" >
              <b>{t("Success!")} </b>
             {result?.length > 0 && result.map((val)=> t(`You have been paid out in `) + val.name )}
           </p>
            <div>
              <div className="payout-of-wrapper">
                <p className="payout">
                  <strong >{t("Payout")}</strong>
                </p>
                <p className="amount">
                  <strong>
                  {confirmPayoutData.quote && confirmPayoutData.quote.amountOut || 0} 
                  {confirmPayoutData.quote && confirmPayoutData.quote.to}
                  </strong>
                </p>
              </div>
              <div className="payout-fee-wrapper">
                <span >{t("Fee")}</span>
                <span>
                  {`${confirmPayoutData && confirmPayoutData.fee || 0} ${confirmPayoutData.quote && confirmPayoutData.quote.from || ''}`}
                </span>
              </div>
              <div className="payout-equivalent-wrapper">
                <p>
                  <b>{confirmPayoutData.quote && confirmPayoutData.quote.from} {t("Equivalent")}</b>
                </p>
                <p>
                  <strong>
                  {`${confirmPayoutData && confirmPayoutData.quote && confirmPayoutData.quote.amountInGross || 0} ${confirmPayoutData.quote && confirmPayoutData.quote.from || ''}`}
                  </strong>
                </p>
              </div>
              <div className="go-to-wallet-wrapper">
                <a href='https://www.sandbox.coindirect.com/wallets/btc'>
                   <span>
                     <strong>{t("Go To Wallet")}</strong>
                    </span>
                </a>
              </div>
            </div>
            <div style={{ display: isError ? 'block' : 'none' }} className="retrieve-rates">
              <div className="retrieve-rates-text">{t("Something went wrong")}</div>
            </div>
          </React.Fragment>
      </div>
    )
  }
}
export default withTranslation()(PayOutComplete);