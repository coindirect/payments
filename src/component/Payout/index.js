import React, { Component } from 'react';
import close from "../../images/cancel.svg";
import alert from "../../images/alert.svg";
import downarrow from "../../images/downarrow.svg";
import { withTranslation } from 'react-i18next';
import Timer from '../Timer';
import Api from '../../api';
import Loader from '../Loader';

import '../../App.css';

			
class PayOut extends Component {
	constructor(props) {
		super(props);
		this.state = {
			openDropdown: false,
			popUpError: false,
			selectedCurrencyCode: 'BTC',
			transactionStatus: "PENDING",
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
		this.uuid = new URLSearchParams(window.location.search).get("uuid");
		sessionStorage.setItem('uuid', this.uuid ? this.uuid : sessionStorage.getItem('uuid'));
	}

	componentDidMount() {
		Api.getCurrencies()
			.then((response) => {
				this.setState({
					payoutCurrency: response.data,
					isLoading: false
				})
				this.getStatus(this.uuid)
			})
			.catch((error) => {
				console.log('error', error);
				this.setState({
					isLoading: false
				})
			})
	}


	getStatus = (uuid) => {
        Api.status(uuid)
            .then((status) => {
				this.setState({
					selectedCurrency: this.state.payoutCurrency?.filter(item => item?.code === status?.data?.quote?.from)[0].name,
                    selectedCurrencyCode: status?.data?.quote?.from,
                }, () => {
                    this.updateCurrency(this.state.selectedCurrencyCode, this.state.selectedCurrency)
                })
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
		this.updateCurrency(code, name);
		this.setState({
			isOverlay: true
		})
	}

	updateCurrency = (code = "BTC", name) => {
		return new Promise((resolve, reject) => {
			let data = {};
			data.currency = code;
			data.payOutMethod = "crypto";

			if (this.state.walletAddress && this.state.walletAddress.length > 0) {
				data.payOutInstruction = {
					code: "crypto",
					address: this.state.walletAddress,
					currency: code
				};
			} else {
				data.payOutInstruction = null;
			}

			let uuid = new URLSearchParams(window.location.search).get("uuid") || sessionStorage.getItem('uuid');
			
			Api.updateCurrency(data, uuid)
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
					resolve();
				})
				.catch((error) => {
					this.setState({
						isLoading: false,
						popUpError: error.response && error.response.status === 500 ? true : false,
						errorMsg: (
							error.response && error.response.status > 400
								? error.response && error.response.data
								: error.response.data.errorList ?
									error.response.data.errorList && error.response.data.errorList.length &&
									error.response.data.errorList[0].message : this.props.t('Something went wrong'))
					})
				})
		});
	}

	confirmPayout = () => {
		this.setState({
			isNextDisabled: true,
			isOverlay: true
		})
		let uuid = new URLSearchParams(window.location.search).get("uuid") || sessionStorage.getItem('uuid');
		Api.Accept(uuid)
			.then(() => {
				this.props.confirmPayoutSuccess()
			})
			.catch((error) => {
				this.props.confirmPayoutFailure()
				this.setState({
					errorMsg: this.props.t('Something went wrong'),
					popUpError: true,
					isNextDisabled: false,
					isOverlay: false
				})
			})
	}

	handleAddress = (event) => {
		let data = {
			address: event.target.value,
			code: "crypto",
			currency: this.state.selectedCurrencyCode
		};
		this.setState({
			walletAddress: event.target.value
		});
		Api.validate(data)
			.then((response) => {
				this.setState({ validAddress: true }, () => {
					this.updateCurrency(this.state.selectedCurrencyCode, this.state.selectedCurrency).then(() => {
						this.setState({
							isNextDisabled: false
						});
					});
				});
			})
			.catch((error) => {
				this.setState({
					errorMsg: this.props.t('Could not verify address'),
					validAddress: false
				})
			});
	}


	render() {
		const { openDropdown, popUpError, selectedCurrency, data, miliseconds, selectedCurrencyCode,
			isLoading, errorMsg, isNextDisabled, walletAddress, isOverlay, payoutCurrency } = this.state;

		const { t } = this.props;
		return (
			<React.Fragment>{
				isLoading ? <Loader /> :
					<div className="App" style={{ opacity: isOverlay ? 0.5 : 1 }}>
						{popUpError &&
							<div className="error-panel-container">
								<img className="error-image" alt="" src={alert} />
								<div className="error-message-container">
									<span className="error">{t("Error")}</span>
									<span className="error-message">{t("No additional info available")}</span>
								</div>
								<span className="error-message-close" onClick={() => this.closeErrorContainer()}>
									<img src={close} alt="" /></span>
							</div>
						}
						<h1 className='page-heading'>{t("Confirm payout")}</h1>
						<p className='subheading'>{t("We don't share your financial details with the merchant.")}</p>

						<div className='payout-container'>
							<table className='payout-table'>
								<thead>
									<tr className='payout-table-heading-row'>
										<th className="payout-heading">{t("Payout of")}</th>
										<th className="payout-value">{(data && data.amount) || 0}
											{(data.quote && data.quote.from) || ""}</th>
									</tr>
								</thead>
								<tbody>
									<tr className='payout-table-data-row'>
										<td className="payout-heading">{t("Fee")}</td>
										<td className="payout-fee-value">{(data.quote && data.quote.fee) || 0}
											{(data && data.currency)}</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div>
							<table className="payout-receive-table">
								<thead>
									<tr className="payout-receive">
										<th className="payout-receive-title">{t("You receive")}</th>
										<th className="payout-receive-value">{(data.quote && data.quote.amountOut) || 0}
											{(data.quote && data.quote.to) || ""}</th>
									</tr>
								</thead>
								<tbody>
									<tr className="payout-quote">
										<td className="payout-quote-title">{t("Quote expires in")}</td>
										<td className="payout-quote-value">
											<Timer
												timerExpiry={this.updateCurrency}
												name={selectedCurrency}
												code={selectedCurrencyCode}
												miliseconds={miliseconds}/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div>
							<p className="change-payout-currency" >{t("Change payout currency")}</p>
							<div className='dropdown-container' onClick={() => this.setDropdown()}>
								<div className="dropdown-container-state">
									<span className="dropdown-box">{selectedCurrency}</span>
									<div>
										<img className="dropdown-arrow" alt="" src={downarrow} />
									</div>
								</div>
								<div className="dropdown-content" style={
									{ display: openDropdown ? 'block' : openDropdown ? 'none' : 'none' }}>
									{
										payoutCurrency && payoutCurrency.length ? payoutCurrency.filter(item => item.code !== data.currency)
											.map((value) => {
												return (
													<div onClick={() => { this.updateCurr(value.code, value.name) }}
														key={value.id}> {value.name}</div>)
											})
											: null
									}
								</div>
							</div>
							<p className="wallet-address-description" >{t("Address where you wish to be paid")}</p>
							<input
								type='text'
								className='wallet-input'
								name='walletAddress'
								onChange={this.handleAddress}
								placeholder={walletAddress ? walletAddress : "Enter wallet address"} />
						</div>
						<div className="next-btn">
							<button disabled={isNextDisabled} onClick={this.confirmPayout} className={`nextbutton`}>
								{t("Next")}</button>
						</div>
						{
							errorMsg ?
								<div className="retrieve-rates">
									<div className="retrieve-rates-text">{errorMsg}</div>
								</div>
								: null
						}
					</div>
			}
			</React.Fragment>
		);
	}
}
export default withTranslation()(PayOut);