import axios from 'axios'
import { API_BASE_URL } from './Constants'

const Api = {}

Api.getCurrencies = (apiBaseUrl = API_BASE_URL) => {
  return axios.get(`${apiBaseUrl}/currency/crypto?max=1000&sort=rank&order=asc`)
}
Api.status = (uuid, apiBaseUrl = API_BASE_URL) => {
  return axios.get(`${apiBaseUrl}/v1/pay/${uuid}`)
}
Api.updateCurrency = (data, uuid, apiBaseUrl = API_BASE_URL) => {
  return axios.put(`${apiBaseUrl}/v1/pay/${uuid}/update`, data)
}
Api.accept = (uuid, apiBaseUrl = API_BASE_URL) => {
  const data = {}
  data.successUrl = 'no_url'
  return axios.put(`${apiBaseUrl}/v1/pay/${uuid}/accept`, data)
}
Api.merchantInfo = (id, apiBaseUrl = API_BASE_URL) => {
  return axios.get(`${apiBaseUrl}/v1/merchant/${id}`)
}
Api.validate = (data, apiBaseUrl = API_BASE_URL) => {
  return axios.put(`${apiBaseUrl}/v1/pay/validate`, data)
}
export default Api
