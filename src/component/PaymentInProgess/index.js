import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Api from '../../api';
class PaymentInProgess extends Component {

  constructor(){
    super();
    this.state = {
      walletData: ''
    }
  }

  componentDidMount() {
    let uuid = sessionStorage.getItem('uuid');
    setInterval(() => {
      this.getStatus(uuid)
    }, 15000);
  }

  getStatus = (uuid) => {
    if (!this.state.walletData) {
      Api.status(uuid)
        .then((response) => {
          this.setState({
            walletData: response.data,
          })
          switch (response.data.status) {
            case 'COMPLETE':
              this.props.paymentStatus('COMPLETE')
              break;
            default:
              this.props.paymentStatus('PROCESSING')
              break;
          }
        })
        .catch((error) => {
          console.log('error', error)
        })
    }
  }

  render() {
    const { t } = this.props;
    const { walletData } = this.state;
    return (
      <div className="payment-progress-container">
        <span className="great-qoute">
          <strong>{t("Great")}! </strong>
          {t("We have detected your transaction on the blockchain and will now wait until the payment has been fully processed")}.
                </span>
        <p>&nbsp;</p>
        <div className="total-paid">
          <p>{t("Seen")}</p>
          <p style={{ color: '#0C0F3D' }}>{walletData?.quote?.amountIn} {walletData?.quote?.from}</p>
        </div>
        <div className="total-amount">
          <p>{t("Total amount")} </p>
          <p style={{ color: '#0C0F3D' }}>{walletData.walletAmount} {walletData.walletCurrency}</p>
        </div>
        <span className="confirmation">
          {t("This feature requires blockchain confirmations before crediting your payment. Your merchant will update you on transaction progress.")}
        </span>
        <div className="ref">
          <p>{t("Reference ")}<b>{walletData.reference}</b></p>
        </div>
      </div>
    )
  }
}
export default withTranslation()(PaymentInProgess);