# coindirect-package

> Made with create-react-library

[![NPM](https://img.shields.io/npm/v/coindirect-package.svg)](https://www.npmjs.com/package/coindirect-package) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save coindirect-package
```

## Usage

```jsx
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
    console.log(this.props)
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
```

## License

MIT © [aniagarwal97](https://github.com/aniagarwal97)
