import React from 'react'

import { Payout, Payin, Address, PaymentInProgess, PayinComplete, PayoutComplete } from 'coindirect-package'
import 'coindirect-package/src/App.css'

const App = () => {


  const handleConfirmPayout = () => {
    console.log('Handle')
  }

  const paymentStatus = () => {
    console.log('paymentStatus')
  }
  return <React.Fragment>
    {/* <Payout
      confirmPayoutSuccess={handleConfirmPayout}
      confirmPayoutFailure={handleConfirmPayout}
    />
    <Payin
      successPayin={handleConfirmPayout}
      failurePayin={handleConfirmPayout}
    />
    <Address paymentStatus={paymentStatus} />
    <PaymentInProgess paymentStatus={paymentStatus} />
    <PayinComplete paymentStatus={paymentStatus} />
    <PayoutComplete /> */}
  </React.Fragment>
}

export default App
