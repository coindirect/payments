import axios from "axios";
import { API_BASE_URL } from "./Constants";

let Api={}
let uuid = sessionStorage.getItem('uuid')
// Api.confirm=``;
// Api.currencies=`${API_BASE_URL}/currency/crypto?max=1000&sort=rank&order=asc`;
// Api.status = `${API_BASE_URL}/v1/pay/${uuid}`;
// Api.profile =`${API_BASE_URL}/user/profile`;

Api.getCurrencies=()=>{
    return axios.get(`${API_BASE_URL}/currency/crypto?max=1000&sort=rank&order=asc`)
}
Api.status=(uuid)=>{
    return axios.get(`${API_BASE_URL}/v1/pay/${uuid}`)
}
Api.updateCurrency=(data, uuid)=>{
    return axios.put(`${API_BASE_URL}/v1/pay/${uuid}/update`,data)
}
Api.Accept=(uuid)=>{
    let data = {}
	data.successUrl = "no_url";
    return axios.put(`${API_BASE_URL}/v1/pay/${uuid}/accept`,data)
}
Api.merchantInfo=(id)=>{
    return axios.get(`${API_BASE_URL}/v1/merchant/${id}`)
}
Api.validate=(data)=>{
    return axios.put(`${API_BASE_URL}/v1/pay/validate`,data)
}
export default Api;
