import React, { Component } from 'react'

import { Payout, Payin, Address, PaymentInProgess, PayinComplete, PayoutComplete } from 'coindirect-package'
import 'coindirect-package/src/App.css';
import {
  Switch,
  Route,
} from "react-router-dom";
import { withRouter } from 'react-router';

class App extends Component {


  handleConfirmPayout = () => {
    this.props.history.push('confirm')
  }

  paymentStatus = (status) => {
    if(status === 'PROCESSING' && !window.location.pathname.includes('seen')){
      this.props.history.push('seen');
    }
    else if( status === 'COMPLETE' && !window.location.pathname.includes('done')){
      this.props.history.push('done');
    }
  }
  
  handleFailedPayout = () => {
    console.log('Payment Failed')
  }
  
  handleConfirmPayin = (status) => {
    if(status === 'PENDING'){
      this.props.history.push('address')
    }
  }

  handleFailurePayin = () => {
    console.log('hadle failure payin')
  }

  render() {
    return (
      <React.Fragment>
        <Switch>
          {/* Payout Routes */}
          <Route exact path="/payout">
            <Payout
              confirmPayoutSuccess={this.handleConfirmPayout}
              confirmPayoutFailure={this.handleFailedPayout} />
          </Route>
          <Route exact path='/confirm' component={() => <PayoutComplete />} />

          {/* Payin Routes */}
          <Route exact path="/payin">
            <Payin
              successPayin={this.handleConfirmPayin}
              failurePayin={this.handleFailurePayin}
            />
          </Route>
          <Route exact path="/address" component={() => <Address paymentStatus={this.paymentStatus} />} />
          <Route exact path="/seen" component={() => <PaymentInProgess paymentStatus={this.paymentStatus} />} />
          <Route exact path="/done" component={() => <PayinComplete paymentStatus={this.paymentStatus} />} />
        </Switch>
      </React.Fragment>
    )
  }
}

export default withRouter(App)