import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Form, Button, message, Spin, Input, Col, Card, Row, InputNumber, Radio} from 'antd';
import Flex from 'components/shared-components/Flex'
import {useHistory} from "react-router-dom";
import apiService from "services/ApiService";
import {CAN_VIEW_MODULE} from "../../../configs/AppConfig";

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const SettingsForm = props => {
	const [settingsForm] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadedImgPath, setImagePath] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [loading, setLoadingData] = useState(false)
	let history = useHistory();

	useEffect(() => {
			setLoadingData(true)
			apiService.getSettings().then(resp => {
				setLoadingData(false)
				settingsForm.setFieldsValue({
					apiurl: resp.APP_PRODUCTION_URL,
					siteurl: resp.APP_PRODUCTION_SITEURL,
					timezone: resp.APP_TIME_ZONE,
					email: resp.MAIL_FROM_ADDRESS,
					sitename: resp.APP_NAME,
					email_method: resp.MAIL_MAILER,
					sms_appid: resp.SMSAPI_APPID,
					sms_senderid: resp.SMSAPI_SENDERID,
					sms_password: resp.SMSAPI_PASSWORD,
					sms_username: resp.SMSAPI_USERNAME,
					smtp_auth: resp.MAIL_ENCRYPTION,
					smtp_password: resp.MAIL_PASSWORD,
					smtp_port: resp.MAIL_PORT,
					smtp_server: resp.MAIL_HOST,
					smtp_username: resp.MAIL_USERNAME,
					ticket_eta: resp.TICKET_ETA,
					ticket_respond_eta: resp.TICKET_RESPOND_ETA,
					delivery_eta: resp.DELIVERY_ETA,
					app_version: resp.APP_VERSION,
					mob_version: resp.MOB_VERSION,
				})
				if(resp.photo){
					setImage(resp.photo_link)
				}
			})
	}, [settingsForm]);

	const handleUploadChange = info => {
		if (info.file.status === 'uploading') {
			setUploadLoading(true)
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, imageUrl => {
				setImage(imageUrl)
				setImagePath(info.file.response.path)
				setUploadLoading(true)
			});
		}
	};

	const goBack = () => {
		history.goBack()
	}

	const onFinish = () => {
		setSubmitLoading(true)
		settingsForm.validateFields().then(values => {
			const params = {
				APP_PRODUCTION_URL: values.apiurl,
				APP_PRODUCTION_SITEURL: values.siteurl,
				APP_TIME_ZONE: values.timezone,
				MAIL_FROM_ADDRESS: values.email,
				APP_NAME: values.sitename,
				MAIL_MAILER: values.email_method,
				SMSAPI_APPID: values.sms_appid,
				SMSAPI_SENDERID: values.sms_senderid,
				SMSAPI_PASSWORD: values.sms_password,
				SMSAPI_USERNAME: values.sms_username,
				MAIL_ENCRYPTION: values.smtp_auth,
				MAIL_PASSWORD: values.smtp_password,
				MAIL_PORT: values.smtp_port,
				MAIL_HOST: values.smtp_server,
				MAIL_USERNAME: values.smtp_username,
				TICKET_ETA: values.ticket_eta,
				TICKET_RESPOND_ETA: values.ticket_respond_eta,
				DELIVERY_ETA: values.delivery_eta,
				APP_VERSION: values.app_version,
				MOB_VERSION: values.mob_version,
			}
			apiService.updateSettings(params).then(resp => {
				setSubmitLoading(false)
				message.success(`Settings saved`)
			}, error => setSubmitLoading(false) )

		}).catch(info => {
			setSubmitLoading(false)
			console.log('info', info)
			message.error('Please enter all required field ');
		});
	};

	const formItemLayout = {
		labelCol: {
			xs: { span: 24 },
			sm: { span: 8 },
			md: { span: 8 },
		},
		wrapperCol: {
			xs: { span: 24 },
			sm: { span: 16 },
			md: { span: 16 },
		},
	};

	return (
		<>
				<PageHeaderAlt className="bg-white border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-3">Settings</h2>
							<div className="mb-3">
								<Button className="mr-2" onClick={() => goBack()}>Discard</Button>
								{(CAN_VIEW_MODULE(19)) ?
								<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={submitLoading} >
									Save Changes
								</Button> : ""}
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container">
					<Spin spinning={loading}>
						<Form
							{...formItemLayout}
							onFinish={onFinish}
							form={settingsForm}
						>
							<Row gutter={16} style={{marginTop: 100}}>
								<Col xs={24} sm={24} md={24}>
									<Card title="Basic Info">
										<Row>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="sitename" label="Company Name" rules={[{required: true, message: 'Please input company name'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="siteurl" label="Site Link" rules={[{required: true, type: "url", message: 'Please input site link'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="apiurl" label="API Link" rules={[{required: true, type: "url", message: 'Please input API link'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item
													name="email"
													label="E-mail"
													colon={false}
													rules={[
														{
															type: 'email',
															message: 'The input is not valid E-mail!',
														},
														{
															required: true,
															message: 'Please input your E-mail!',
														},
													]}
												>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="timezone" label="Timezone" rules={[{required: true, message: 'Required'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="ticket_respond_eta" label="Ticket Respond Timeout" extra="Minutes" colon={false} rules={[{required: true, message: 'Required'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="ticket_eta" label="Ticket Timeout" extra="Minutes" colon={false} rules={[{required: true, message: 'Required'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="delivery_eta" label="Delivery Timeout" extra="Minutes" colon={false} rules={[{required: true, message: 'Required'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="app_version" label="Web App Version" colon={false} rules={[{required: true, message: 'Required'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="mob_version" label="Mobile App Version" colon={false} rules={[{required: true, message: 'Required'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
										</Row>
									</Card>
									<Card title="Email Server">
										<Row>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="email_method" label="Method" rules={[{required: true, message: 'Please choose email sending method'}]}>
													<Radio.Group buttonStyle="solid">
														<Radio.Button value="smtp">SMTP</Radio.Button>
														<Radio.Button value="php">PHP Mail</Radio.Button>
													</Radio.Group>
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="smtp_server" label="Server" rules={[{required: true, message: 'Please enter SMTP server'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="smtp_auth" label="Authentication" rules={[{required: true, message: 'Please choose SMTP authentication type'}]}>
													<Radio.Group name="radiogroup">
														<Radio value="tls">TLS</Radio>
														<Radio value="ssl">SSL</Radio>
													</Radio.Group>
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="smtp_port" label="Port Number" rules={[{required: true, message: 'Please enter SMTP port number'}]}>
													<InputNumber />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="smtp_username" label="Username" rules={[{required: true, message: 'Please enter SMTP username'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="smtp_password" label="Password" rules={[{required: true, message: 'Please enter SMTP password!'}]}>
													<Input.Password />
												</Form.Item>
											</Col>
										</Row>
									</Card>
									<Card title="SMS Provider">
										<Row>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="sms_appid" label="App ID" rules={[{required: false, message: 'Please input SMS app ID!'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="sms_senderid" label="Sender ID" rules={[{required: true, message: 'Please input SMS sender ID!'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="sms_username" label="Username" rules={[{required: true, message: 'Please input SMS username!'}]}>
													<Input />
												</Form.Item>
											</Col>
											<Col xs={24} sm={24} md={15}>
												<Form.Item name="sms_password" label="Password" rules={[{required: true, message: 'Please input SMS password!'}]}>
													<Input.Password />
												</Form.Item>
											</Col>
										</Row>
									</Card>
								</Col>
							</Row>
						</Form>
					</Spin>
				</div>
		</>
	)

}

export default SettingsForm
