import React, { Component } from 'react'
import { Form, Button, Input, Row, Col, message } from 'antd';
import apiService from "services/ApiService";

export class ChangePassword extends Component {

	changePasswordFormRef = React.createRef();

	onFinish = (values) => {
		const key = 'updatable';
		message.loading({ content: 'Updating...', key });

		const params = {
			id: this.props.profileid && this.props.profileid !== "me" ? this.props.profileid : "",
			password: values.newPassword,
		}

		if(this.props.profileid === "me"){
			apiService.updateMyPass(params).then(resp => {
				message.success({ content: 'Password Changed!', key, duration: 2 });
				this.onReset()
			})
		} else {
			apiService.updateUserPass(params).then(resp => {
				message.success({ content: 'Password Changed!', key, duration: 2 });
				this.onReset()
			})
		}

	};

	onReset = () => {
    this.changePasswordFormRef.current.resetFields();
  };

	render() {

		return (
			<>
				<h2 className="mb-4">Change Password</h2>
				<Row >
					<Col xs={24} sm={24} md={24} lg={12}>
						<Form
							name="changePasswordForm"
							layout="vertical"
							ref={this.changePasswordFormRef}
							onFinish={this.onFinish}
						>
							<Form.Item
								label="New Password"
								name="newPassword"
								rules={[{
									max: 16,
									min: 8,
									message: 'Password must be between 8 to 16 characters'
								},{
									required: true,
									message: 'Please enter your new password!'
								}]}
							>
								<Input.Password />
							</Form.Item>
							<Form.Item
								label="Confirm Password"
								name="confirmPassword"
								rules={
									[
										{ 
											required: true,
											message: 'Please confirm your password!' 
										},
										({ getFieldValue }) => ({
											validator(rule, value) {
												if (!value || getFieldValue('newPassword') === value) {
													return Promise.resolve();
												}
												return Promise.reject('Password not matched!');
											},
										}),
									]
								}
							>
								<Input.Password />
							</Form.Item>
							<Button type="primary" htmlType="submit">
									Change password
								</Button>
						</Form>
					</Col>
				</Row>
			</>
		)
	}
}

export default ChangePassword
