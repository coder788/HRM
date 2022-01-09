import React from 'react'
import LoginForm from '../../components/LoginForm'
import { Row, Col } from "antd";
import {APP_NAME} from "configs/AppConfig";

const backgroundURL = '/img/others/img-17.jpg'
const backgroundStyle = {
	backgroundImage: `url(${backgroundURL})`,
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover'
}

const LoginTwo = props => {
	return (
		<div className="h-100 bg-white">
			<Row justify="center" className="align-items-stretch h-100">
				<Col xs={20} sm={20} md={24} lg={16}>
					<div className="container d-flex flex-column justify-content-center h-100">
						<Row justify="center">
							<Col xs={24} sm={24} md={20} lg={12} xl={8}>
								<h1>Sign In</h1>
								<div className="mt-4">
									<LoginForm {...props}/>
								</div>
							</Col>
						</Row>
					</div>
				</Col>
				<Col xs={0} sm={0} md={0} lg={8}>
					<div className="d-flex flex-column justify-content-between h-100 px-4" style={backgroundStyle}>
						<div className="text-right">
							<img src="/img/logo-white.png" alt="logo"/>
						</div>
						<Row justify="center">
							<Col xs={0} sm={0} md={0} lg={20}>
								<img className="img-fluid mb-5" src="/img/logo_big_alt.png" alt=""/>
							</Col>
						</Row>
						<div className="d-flex justify-content-end pb-4">
							<div>
								<span className="mx-2 text-white">Copyright  &copy;  {`${new Date().getFullYear()}`} <span className="font-weight-semibold">{`${APP_NAME}`}</span> All rights reserved</span>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	)
}

export default LoginTwo
