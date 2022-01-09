import React, { useState } from 'react'
import {Card, Row, Col, Form, Input, Button, message, Rate, Result} from "antd";
import { ContainerOutlined } from '@ant-design/icons';
import {API_BASE_URL} from "configs/AppConfig";

const backgroundStyle = {
	backgroundImage: 'url(/img/others/img-17.jpg)',
	backgroundRepeat: 'repeat-y',
	backgroundSize: 'cover'
}

const desc = ['Very Dissatisfied', 'Dissatisfied', 'Natural', 'Satisfied', 'Very Satisfied'];

const SendReview = props => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [successRating, setSuccessRating] = useState(false);
	let httpStatus = 0

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
		postData(`${API_BASE_URL}/tickets/review/${props.match.params.id}`, values).then(response => {
			setLoading(false)
			if(httpStatus === 200){
				setSuccessRating(true)
				message.success('Thank you!')
			} else if(httpStatus === 400) {
				message.error(response[0])
			}
		})
	};

	return (
		<div className="pt-5" style={backgroundStyle}>
			<div className="container d-flex flex-column justify-content-center">
				<Row justify="center">
					<Col xs={20} sm={20} md={20} lg={9}>
						<Card>
							<div className="my-2">
								{! successRating ?
								<div className="text-center">
									<img className="img-fluid" src="/img/logo_big_alt.png" alt="" />
									<h3 className="mt-5 font-weight-bold">Service Evaluation</h3>
									<p className="mb-4">your feedback is valuable for us. please take a few moments and share your experience.</p>
								</div> : ""}
								<Row justify="center">
									<Col xs={24} sm={24} md={20} lg={20}>
										{! successRating ?
										<Form form={form} layout="vertical" name="forget-password" onFinish={onSend}>
											<Form.Item name="response" label="How satisfied were you with our timeless response ?" rules={[{required: true, message: 'Required field'}]}>
												<Rate tooltips={desc} />
											</Form.Item>
											<Form.Item name="employee_knowledge" label="How knowledgeable were the employee ?" rules={[{required: true, message: 'Required field'}]}>
												<Rate tooltips={desc} />
											</Form.Item>
											<Form.Item name="employee_friendly" label="How friendly were the employee ?" rules={[{required: true, message: 'Required field'}]}>
												<Rate tooltips={desc} />
											</Form.Item>
											<Form.Item name="overall" label="How satisfied were you with overall experience ?" rules={[{required: true, message: 'Required field'}]}>
												<Rate tooltips={desc} />
											</Form.Item>
											<Form.Item
												label="What can we do to improve your experience with us ?"
												name="message"
												rules={
													[
														{
															required: false,
															max: 255,
														}
													]
												}>
												<Input.TextArea placeholder="Leave a message..." rows={6} prefix={<ContainerOutlined className="text-primary" />}/>
											</Form.Item>
											<Form.Item>
												<Button loading={loading} type="primary" htmlType="submit" block>{loading? 'Sending...' : 'Send Now'}</Button>
											</Form.Item>
										</Form> : <Result status="success" title="Thanks for your time" /> }
									</Col>
								</Row>
							</div>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	)
}

export default SendReview

