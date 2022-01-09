import React from 'react'
import { APP_NAME, APP_VERSION } from 'configs/AppConfig';
import {Tag} from "antd";

export default function Footer() {
	return (
		<footer className="footer">
			<span>Copyright  &copy;  {`${new Date().getFullYear()}`} <span className="font-weight-semibold">{`${APP_NAME}`}</span> All rights reserved. Powered by <a className="text-gray" href="https://details.net.sa">Details Digital</a></span>
			<div>
				<a className="text-gray" href="/#" onClick={e => e.preventDefault()}>Application Version {APP_VERSION} <Tag color="red">Beta</Tag></a>
			</div>
		</footer>
	)
}
