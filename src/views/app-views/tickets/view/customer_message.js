import React, {Component} from 'react'
import {Button, Form, Input, message} from 'antd';
import apiService from "services/ApiService";
import {SendOutlined} from "@ant-design/icons";

export class CustomerMessage extends Component {

	constructor(props) {
		super(props);
		this.formRef = React.createRef()
		this.state = {
			loading: false
		}
	}

	submitForm = (values) => {
		const params = {
			user_id: values.user_id,
			message: values.message,
		}
		this.setState({loading: true})
		apiService.sendCustomerSMS(params).then(resp => {
			this.setState({loading: false})
			this.props.closeModal()
			message.success('Message sent')
		}, error => this.setState({loading: false}) )
	}

	render() {
		const { customer } = this.props;

		return (
			<>
				<Form
					ref={this.formRef}
					layout="vertical"
					initialValues={{ user_id: customer.id }}
					onFinish={this.submitForm}
				>
					<Form.Item name="user_id" hidden={true}>
						<Input/>
					</Form.Item>
					<Form.Item name="message" label="" rules={[{required: true, max: 120, message: 'Please enter your message'}]}>
						<Input
							placeholder="Type your message..."
							onPressEnter={(e) => e.preventDefault()}
							style={{height: 100}}
							suffix={
								<div className="d-flex align-items-center">
									<Button type="primary" size="default" onClick={this.onSend} htmlType="submit" loading={this.state.loading}>
										<SendOutlined/> Send
									</Button>
								</div>
							}
						/>
					</Form.Item>
				</Form>
			</>
		)
	}
}

export default CustomerMessage
