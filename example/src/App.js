import React, { Component } from 'react'
import {
  Payout,
  Payin,
  Address,
  PaymentInProgess,
  PayinComplete,
  PayoutComplete
} from 'coindirect-payments'
import 'coindirect-payments/src/index.css'
import { Switch, Route } from 'react-router-dom'
import { Redirect, withRouter } from 'react-router'
import copy from './copy.svg'
import confirm from './confirm.svg'

class App extends Component {
  handleConfirmPayout = () => {
    this.props.history.push('confirm')
  }

  paymentStatus = (status) => {
    if (status === 'PROCESSING' && !window.location.pathname.includes('seen')) {
      this.props.history.push('seen')
    } else if (
      status === 'COMPLETE' &&
      !window.location.pathname.includes('done')
    ) {
      this.props.history.push('done')
    }
  }

  handleFailedPayout = () => {
    console.log('Payment Failed')
  }

  handleConfirmPayin = (status) => {
    if (status === 'PENDING') {
      this.props.history.push('address')
    }
  }

  handleFailurePayin = () => {
    console.log('handle failure payin')
  }

  render() {
    return (
      <div className='App'>
        <Switch>
          {/* Payout Routes */}
          <Route exact path='/payout'>
            <Payout
              confirmPayoutSuccess={this.handleConfirmPayout}
              confirmPayoutFailure={this.handleFailedPayout}
            />
          </Route>
          <Route exact path='/confirm' component={() => <PayoutComplete />} />

          {/* Payin Routes */}
          <Route exact path='/payin'>
            <Payin
              successPayin={this.handleConfirmPayin}
              failurePayin={this.handleFailurePayin}
            />
          </Route>
          <Route
            exact
            path='/address'
            component={() => (
              <Address
                paymentStatus={this.paymentStatus}
                copy={copy}
                confirm={confirm}
              />
            )}
          />
          <Route
            exact
            path='/seen'
            component={() => (
              <PaymentInProgess paymentStatus={this.paymentStatus} />
            )}
          />
          <Route
            exact
            path='/done'
            component={() => (
              <PayinComplete paymentStatus={this.paymentStatus} />
            )}
          />

          <Redirect from='/' to='/payout' />
        </Switch>
      </div>
    )
  }
}

export default withRouter(App)
