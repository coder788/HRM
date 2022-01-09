import { SIDE_NAV_LIGHT, NAV_TYPE_SIDE } from 'constants/ThemeConstant';
import { env } from './EnvironmentConfig'
import {AUTH_TOKEN, USER_INFO} from "redux/constants/Auth";
import io from "socket.io-client";

//console.log(JSON.parse(new Buffer(webConfig, 'base64').toString('ascii')))
export const APP_VERSION = 0.95
export const APP_NAME = "ArabianFal"
export const API_BASE_URL = env.API_ENDPOINT_URL
export const IMAGE_PLACEHOLDER_URL = `${env.SITE_URL}/storage/placeholder.png`
export const GOOGLE_MAPS_API_KEY = "AIzaSyDMsSw3WYis99-AsPGPPLraK5vZAfnbUnc"

export const WSSOCKET = io(env.WS_SOCKET_URL, {
	withCredentials: true,
	transports: ["websocket"],
	extraHeaders: {
		"authorization": "bearer "
	}
});
WSSOCKET.on('connect', function(){ console.log("connected") });
WSSOCKET.on('disconnect', function(){ console.log("disconnected") });
WSSOCKET.on('error', (error) => {
	console.log(error)
});

let webConfig = [];

export const RESET_WEB_CONFIG = () => {
	webConfig = []
}

export const WEB_CONFIG = (option) => {
	if(webConfig.length === 0){
		webConfig = localStorage.getItem(USER_INFO);
		if(webConfig){
			webConfig = JSON.parse(new Buffer(webConfig, 'base64').toString('ascii'))
		} else {
			webConfig = [];
		}
	}
	return webConfig[option]
}

export const CAN_VIEW_MODULE = (moduleid) => {
	const allowed_modules = WEB_CONFIG("allowed_modules")
	if(! allowed_modules) return false
	if(Array.isArray(moduleid)){
		const shared = allowed_modules.filter(function(n) { return moduleid.indexOf(n) !== -1;});
		return shared.length > 0
	}
	return (allowed_modules.includes(moduleid))
}

export const GET_AUTH_HEADER = () => {
	const jwtToken = localStorage.getItem(AUTH_TOKEN)
	if (jwtToken) {
		return {
			'authorization': 'Bearer ' + jwtToken,
			'app-version': APP_VERSION
		}
	}
	return false
}

export const getAllZones = (districtOnly) => {
	let options = []
	let dc = []
	WEB_CONFIG('settings').districts.map((district) => {
		dc = {value: district.id, label: district.name, children: [] };
		if(district.zones.length > 0 && ! districtOnly){
			district.zones.map((zone) => {
				dc.children.push({value: zone.id, label: zone.name, children: [] })
			})
		}
		options.push(dc)
	})

	const dc_id = WEB_CONFIG("dc_id")
	const zone_id = WEB_CONFIG("zone_id")
	const role = WEB_CONFIG("role").name

	if(["supervisor"].includes(role)){
		options = options.filter(function(dc) {
			return parseInt(dc_id) === parseInt(dc.value);
		});
		options[0].children = options[0].children.filter(function(zone) {
				return parseInt(zone_id) === parseInt(zone.value);
		});
	} else if(role === "foreman"){
		options = options.filter(function(dc) {
			return parseInt(dc_id) === parseInt(dc.value);
		});
	}

	return options
}

export const THEME_CONFIG = {
	navCollapsed: false,
	sideNavTheme: SIDE_NAV_LIGHT,
	locale: 'en',
	navType: NAV_TYPE_SIDE,
	topNavColor: '#3e82f7',
	headerNavColor: '#ffffff',
	mobileNav: false
};
