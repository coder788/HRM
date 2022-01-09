import axios from 'axios'
import {API_BASE_URL, GET_AUTH_HEADER, RESET_WEB_CONFIG, WSSOCKET, WEB_CONFIG} from 'configs/AppConfig'
import history from '../history'
import {AUTH_TOKEN, USER_INFO} from 'redux/constants/Auth'
import { notification } from 'antd';
import apiService from "services/ApiService";

const service = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000
})

// Config
const ENTRY_ROUTE = '/auth/login'
const PUBLIC_REQUEST_KEY = 'public-request'

WSSOCKET.on(`arabianfal_database_chat:notification-${WEB_CONFIG("id")}`, function(data){
	console.log("chat:new message")
	notification.info({message: "New Message", description: data.message})
})

WSSOCKET.on('arabianfal_database_settings:reload', function(data){
	console.log("settings:reloaded")
	apiService.reloadSettings().then(resp => {
		localStorage.setItem(USER_INFO, new Buffer(JSON.stringify(resp)).toString('base64'))
		RESET_WEB_CONFIG()
	}, error => {
		localStorage.removeItem(AUTH_TOKEN)
		localStorage.removeItem(USER_INFO)
		window.location.reload()
	})
})

// API Request interceptor
service.interceptors.request.use(config => {

  if (GET_AUTH_HEADER()) {
    config.headers = GET_AUTH_HEADER()
  }

  if (!GET_AUTH_HEADER() && !config.headers[PUBLIC_REQUEST_KEY]) {
		history.push(ENTRY_ROUTE)
		window.location.reload();
  }

  return config
}, error => {
	// Do something with request error here
	notification.error({
		message: 'Error'
	})
  Promise.reject(error)
})

// API respone interceptor
service.interceptors.response.use( (response) => {
	return response.data
}, (error) => {

	let notificationParam = {
		message: ''
	}
	
	if (! error.response) {
		notificationParam.message = 'Failed Connection'
		notificationParam.description = 'Server is down or internet connection problem'
		notification.error(notificationParam)
		return Promise.reject(error)
	}

	// Remove token and redirect
	if (error.response.status === 401 || error.response.status === 403 || error.response.status === 410) {
		notificationParam.message = 'Authentication Fail'
		notificationParam.description = 'Please login again'
		notification.error(notificationParam)
		localStorage.removeItem(AUTH_TOKEN)
		localStorage.removeItem(USER_INFO)
		history.push(ENTRY_ROUTE)
		window.location.reload();
	}

	if (error.response.status === 101) {
		notificationParam.message = 'Outdated Version'
		notificationParam.description = 'Please refresh the page to update the app'
		notification.error(notificationParam)
		//window.location.reload();
		return Promise.reject(error)
	}

	if (error.response.status === 400) {
		for(let i in error.response.data){
			if(typeof error.response.data[i] !== 'string'){
				error.response.data[i].map((errormsg, i) => {
					notificationParam.message = errormsg
					notification.error(notificationParam)
				});
			} else {
				notificationParam.message = error.response.data[i]
				notification.error(notificationParam)
			}
		}
		return Promise.reject(error)
	}

	if (error.response.status === 404) {
		notificationParam.message = 'Not Found'
	}

	if (error.response.status === 500) {
		notificationParam.message = 'Internal Server Error'
	}
	
	if (error.response.status === 508) {
		notificationParam.message = 'Time Out'
	}

	notification.error(notificationParam)

	return Promise.reject(error);
});

export default service
