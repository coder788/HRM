import React, {useEffect, useState} from 'react'
import {Card, Row, Col, Form, Input, Button, message, Steps, Result, notification} from "antd";
import { MobileOutlined, NumberOutlined, UnlockOutlined, LockOutlined } from '@ant-design/icons';
import {API_BASE_URL} from "configs/AppConfig";
import { useHistory } from "react-router-dom";
import custom from "./custom.css";

const backgroundStyle = {
	backgroundImage: 'url(/img/others/img-17.jpg)',
	backgroundRepeat: 'no-repeat',
	backgroundSize: 'cover'
}

const { Step } = Steps;

const ForgotPassword = () => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [disableVerify, setDisableVerify] = useState(true);
	const [step, setStep] = useState(1);
	const [code, setCode] = useState(1);
	const [mobile, setMobile] = useState(1);
	const codeRef = [React.createRef(),React.createRef(),React.createRef(),React.createRef(),React.createRef(),React.createRef()]
	let httpStatus = 0
	let history = useHistory()

	const gotoLoginPage = () => {
		history.push("/auth/login")
	}

	async function postData(url = '', data = {}) {
		const response = await fetch(url, {
			method: 'POST',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		httpStatus = response.status
		return response.json()
	}

	const onSend = values => {
		setLoading(true)
		postData(`${API_BASE_URL}/user/forgetpwd`, {mobile: values.mobile}).then(response => {
			setLoading(false)
			setMobile(values.mobile)
			if(httpStatus === 200){
				praseRespMsgs(response, true)
				setStep(step+1)
			} else if(httpStatus === 400) {
				praseRespMsgs(response, false)
			}
		})
  };

	const onSendCode = values => {
		setLoading(true)
		let allCode = ""
		Array.from({ length: 6 }, (element, index) => (
			allCode += values[`code_${index}`]
		))
		postData(`${API_BASE_URL}/user/forgetpwd`, {mobile: mobile, code: allCode}).then(response => {
			setLoading(false)
			setCode(allCode)
			if(httpStatus === 200){
				praseRespMsgs(response, true)
				setStep(step+1)
			} else if(httpStatus === 400) {
				praseRespMsgs(response, false)
			}
		})
  };

	const onSendPass = values => {
		setLoading(true)
		postData(`${API_BASE_URL}/user/forgetpwd`, {mobile: mobile, code: code, password: values.password}).then(response => {
			setLoading(false)
			if(httpStatus === 200){
				praseRespMsgs(response, true)
				setStep(step+1)
			} else if(httpStatus === 400) {
				praseRespMsgs(response, false)
			}
		})
	};

	const checkCompleteCode = e => {
		let clearAllInputs = 0;
		for(let i=0; i<6; i++){
			clearAllInputs += codeRef[i].current.input.value !== "" ? 1 : 0
		}
		(clearAllInputs === 6) ? setDisableVerify(false) : setDisableVerify(true)
	}

	const praseRespMsgs = (messages, success) => {
		let notificationParam = {message: ''}
		for(let i in messages){
			if(typeof messages[i] !== 'string'){
				messages[i].map((errormsg, i) => {
					notificationParam.message = errormsg
					if(success){
						notification.success(notificationParam)
					} else {
						notification.error(notificationParam)
					}
				});
			} else {
				notificationParam.message = messages[i]
				if(success){
					notification.success(notificationParam)
				} else {
					notification.error(notificationParam)
				}
			}
		}
	}

	const autoTab = e => {
		const BACKSPACE_KEY = 8;
		const DELETE_KEY = 46;
		let tabindex = e.target.getAttribute('data-index') || 0;
		tabindex = Number(tabindex);
		let elem = null;
		if (e.keyCode === BACKSPACE_KEY) {
			elem = tabindex > 0 && codeRef[tabindex - 1];
		} else if (e.keyCode !== DELETE_KEY) {
			elem = tabindex < codeRef.length - 1 && codeRef[tabindex + 1];
		}
		if (elem) {
			elem.current.focus();
		}
	};

	const blocks = Array.from({ length: 6 }, (element, index) => (
		<Col span={4} key={index}>
			<Form.Item name={`code_${index}`}>
				<Input
					data-index={index}
					ref={codeRef[index]}
					maxLength={1}
					onKeyUp={autoTab}
					onChange={checkCompleteCode}
				/>
			</Form.Item>
		</Col>
	));

	return (
		<div className="h-100" style={backgroundStyle}>
			<div className="container d-flex flex-column justify-content-center h-100">
				<Row justify="center">
					<Col xs={20} sm={20} md={20} lg={9}>
						<Card>
							<div className="my-2">
								{step < 4 ?
								<Steps className="code-box-demo mb-5">
									<Step status={step > 1 ? "finish" : "wait"} title="Mobile" icon={<MobileOutlined />} />
									<Step status={step > 2 ? "finish" : "wait"} title="Verification" icon={<NumberOutlined />} />
									<Step status={step > 3 ? "finish" : "wait"} title="Password" icon={<UnlockOutlined />} />
								</Steps> : ""}
								{step === 1 ?
									<>
										<div className="text-center">
											<h3 className="mt-3 font-weight-bold">Forgot Password?</h3>
											<p className="mb-4">Enter your mobile number to reset password</p>
										</div>
										<Row justify="center">
											<Col xs={24} sm={24} md={20} lg={20}>
												<Form form={form} layout="vertical" onFinish={onSend}>
													<Form.Item
														name="mobile"
														rules={
															[
																{
																	required: true,
																	message: 'Please input your mobile number'
																}
															]
														}>
														<Input placeholder="9665xxxxxxxx" prefix={<MobileOutlined className="text-primary"/>}/>
													</Form.Item>
													<Form.Item>
														<Button loading={loading} type="primary" htmlType="submit" block>{loading ? 'Sending' : 'Send'}</Button>
													</Form.Item>
												</Form>
											</Col>
										</Row>
									</> : step === 2 ?
										<>
											<div className="text-center">
												<h3 className="mt-3 font-weight-bold">Enter Received Code</h3>
												<p className="mb-4">Enter code that you received on your mobile number now</p>
											</div>
											<Row justify="center">
												<Col xs={24} sm={24} md={20} lg={20}>
													<Form form={form} layout="horizontal" onFinish={onSendCode} theme={custom} className="verifyForm">
														<Row justify="space-around" align="middle">
															{blocks}
														</Row>
														<Form.Item>
															<Button loading={loading} type="primary" disabled={disableVerify} htmlType="submit" block>{loading ? 'Verifying...' : 'Verify Code'}</Button>
														</Form.Item>
													</Form>
												</Col>
											</Row>
										</> : step === 3 ? <>
											<div className="text-center" style={{height: 100}}>
												<h3 className="mt-3 font-weight-bold">Choose New Password</h3>
												<p className="mb-4">set password from 8 chars and numbers at least</p>
											</div>
											<Row justify="center">
												<Col xs={24} sm={24} md={15} lg={15}>
													<Form form={form} layout="vertical" onFinish={onSendPass}>
														<Form.Item
															name="password"
															rules={[{required: true, min: 8, max: 16, message: 'Please enter valid password'}]}>
															<Input.Password placeholder="New Password" prefix={<LockOutlined className="text-primary"/>}/>
														</Form.Item>
														<Form.Item
															name="password2"
															rules={
																[
																	{
																		required: true,
																		message: 'Please confirm your password!'
																	},
																	({ getFieldValue }) => ({
																		validator(rule, value) {
																			if (!value || getFieldValue('password') === value) {
																				return Promise.resolve();
																			}
																			return Promise.reject('Password not matched!');
																		},
																	}),
																]
															}
														>
															<Input.Password placeholder="Verify Password" prefix={<LockOutlined className="text-primary"/>}/>
														</Form.Item>
														<Form.Item>
															<Button loading={loading} type="primary" htmlType="submit" block>{loading ? 'Setting...' : 'Set Password'}</Button>
														</Form.Item>
													</Form>
												</Col>
											</Row>
										</> : <Result
											status="success"
											title="Password updated successfully"
											extra={[
												<Button type="primary" key="login" onClick={() => gotoLoginPage()}>
													Back To Login
												</Button>,
											]}
										/>}
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default ForgotPassword

