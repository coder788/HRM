import React, { Component } from 'react';
import {List, message, Switch} from 'antd';
import { 
	MobileOutlined,
	MailOutlined,
	CommentOutlined,
} from '@ant-design/icons';
import Icon from 'components/util-components/Icon';
import Flex from 'components/shared-components/Flex'
import apiService from "services/ApiService";

export class Notification extends Component {

	componentDidMount() {
		if(this.props.profileid){
			apiService.getUser(this.props.profileid).then(resp => {
				this.setState({
					loading: false,
				})
				this.updateOptions('key-email', resp.userinfo.receive_email)
				this.updateOptions('key-sms', resp.userinfo.sms)
				this.updateOptions('key-mobile', resp.userinfo.mobile_push)
			})
		}
	}

	updateOptions(key, value){
		const checkedItem = this.state.config.map( elm => {
			if(elm.key === key) {
				elm.allow = value
			}
			return elm
		})
		this.setState({
			config:[
				...checkedItem
			]
		})
	}

	getOption(key){
		for (let i = 0; i < this.state.config.length; i++) {
			if (this.state.config[i].key === key) {
				return this.state.config[i].allow
			}
		}
	}

	updateProfile(){
		const key = 'updatable';
		message.loading({ content: 'Updating...', key });

		const params = {
			id: this.props.profileid && this.props.profileid !== "me" ? this.props.profileid : "",
			receive_email: this.getOption('key-email'),
			sms: this.getOption('key-sms'),
			mobile_push: this.getOption('key-mobile'),
		}

		if(this.props.profileid === "me"){
			apiService.updateMySettings(params).then(resp => {
				message.success({ content: 'Done!', key, duration: 2 });
			})
		} else {
			apiService.updateUserSettings(params).then(resp => {
				message.success({ content: 'Done!', key, duration: 2 });
			})
		}

	}

	state = {
		loading: true,
		config: [
			{
				key: 'key-sms',
				title: 'SMS',
				icon: CommentOutlined,
				desc: 'Receive SMS notifications to the registered mobile number.',
				allow: false
			},
			{
				key: 'key-mobile',
				title: 'Mobile',
				icon: MobileOutlined,
				desc: 'Mobile push notifications if there is access to mobile app.',
				allow: false
			},
			{
				key: 'key-email',
				title: 'Email Notifications',
				icon: MailOutlined,
				desc: 'Receive email notifications to the registered email address.',
				allow: false
			},
		]
	}

	render() {
		const { config } = this.state;
		return (
			<>
				<h2 className="mb-4">Notification</h2>
				<List
					itemLayout="horizontal"
					loading={this.state.loading}
					dataSource={config}
					renderItem={item => (
						<List.Item>
							<Flex justifyContent="between" alignItems="center" className="w-100">
								<div className="d-flex align-items-center">
									<Icon className="h1 mb-0 text-primary" type={item.icon} />
									<div className="ml-3">
										<h4 className="mb-0">{item.title}</h4>
										<p>{item.desc}</p>
									</div>
								</div>
								<div className="ml-3">
									<Switch checked={item.allow} onChange={
										checked => {
											const checkedItem = config.map( elm => {
												if(elm.key === item.key) {
													elm.allow = checked
												}
												return elm
											})
											this.setState({
												config:[
													...checkedItem
												]
											}, this.updateProfile)
										}
									} />
								</div>
							</Flex>
						</List.Item>
					)}
				/>
			</>
		)
	}
}

export default Notification
