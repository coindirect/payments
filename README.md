# Coindirect Payments

> Coindirect Merchant React Payments SDK

[![NPM](https://img.shields.io/npm/v/@coindirect/payments.svg)](https://www.npmjs.com/package/@coindirect/payments) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
yarn add @coindirect/payments
```

or

```bash
npm install --save @coindirect/payments
```

## Overview

This library is used to create payment forms in React for Coindirect.

Go the [Coindirect's Merchant Portal](https://merchants.coindirect.com/payments) for the admin functionality.

## Properties

Each in addition to the properties below, each Component has an optional `uuid` property.

If none is supplied, it will attempt to fetch it from (in order of precedence):

- the url (like `?uuid={uuid}`)
- the session storage.

### Payout

Used to initiate pay-out.

| Prop                 | Type       |
| :------------------- | :--------- |
| confirmPayoutSuccess | () => null |
| confirmPayoutFailure | () => null |

### PayoutComplete

On pay-out sucessfully completed.

| Prop         | Type                    |
| :----------- | :---------------------- |
| successPayin | (paymentStatus) => null |
| failurePayin | () => null              |

### Payin

Used to initiate pay-in.

| Prop         | Type                    |
| :----------- | :---------------------- |
| successPayin | (paymentStatus) => null |
| failurePayin | () => null              |

### Address

Used to display wallet details in the pay-in flow.

| Prop          | Type                    |
| :------------ | :---------------------- |
| confirm       | imageUrl: string        |
| copy          | imageUrl: string        |
| paymentStatus | (paymentStatus) => null |

### PaymentInProgess

Used to display "in-progress" in the pay-in flow.

| Prop          | Type                    |
| :------------ | :---------------------- |
| paymentStatus | (paymentStatus) => null |

### PayinComplete

On pay-in sucessfully completed.

| Prop          | Type                    |
| :------------ | :---------------------- |
| paymentStatus | (paymentStatus) => null |

## Note on styling

Every class name is prefixed with `.cdp--`

You can simply overwrite the styling by importing the same classnames in a css file after this line:

```
import '@coindirect/payments/src/index.css'
```

Or you could create your own theme.

## Sample usage

````jsx
import React, { Component } from 'react'
import {
  Payout,
  Payin,
  Address,
  PaymentInProgess,
  PayinComplete,
  PayoutComplete
} from '@coindirect/payments'
import '@coindirect/payments/src/index.css'
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
````
