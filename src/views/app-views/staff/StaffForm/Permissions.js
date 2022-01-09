import React, { Component } from 'react';
import {Col, Divider, List, message, Row, Switch} from 'antd';
import {MenuOutlined,} from '@ant-design/icons';
import Icon from 'components/util-components/Icon';
import Flex from 'components/shared-components/Flex'
import apiService from "services/ApiService";
import customTheme from "./custom.css";

export class Permissions extends Component {

	componentDidMount() {
		if(this.props.profileid){
			apiService.getSystemModules(this.props.profileid).then(resp => {
				let checks = []
				let hide = []
				for(let i=0;i<resp.length;i++){
					checks[resp[i].parent.id] = resp[i].parent.allowed
					hide[resp[i].parent.id] = true
					if(resp[i].actions){
						resp[i].actions.map(action => (
							checks[action.id] = action.allowed
						))
					}
				}
				this.setState({
					loading: false,
					modules: resp,
					checks: checks,
					hide: hide,
				})
			})
		}
	}

	checkboxChanged(checked, actionID){
		let checks = this.state.checks
		checks[actionID] = checked
		this.setState({checks: checks}, this.updateProfile)
	}

	toggleAll(e){
		let hide = []
		this.state.hide.map((state, index) => { hide[index] = !state } )
		this.setState({
			hide: hide
		})
	}

	enableAll(e){
		let checks = []
		this.state.checks.map((state, index) => { checks[index] = true } )
		this.setState({
			checks: checks
		})
	}

	showModuleActions(e, moduleID){
		let hide = this.state.hide
		hide[moduleID] = !hide[moduleID]
		this.setState({hide: hide})
	}

	updateProfile(){
		const key = 'updatable';
		message.loading({ content: 'Updating...', key });

		const params = {
			id: this.props.profileid,
			permissions: this.state.checks,
		}

		apiService.updateUserPermissions(params).then(resp => {
			message.success({ content: 'Done!', key, duration: 2 });
		})
	}

	state = {
		loading: true,
		modules: [],
		checks: [],
		hide: [],
	}

	render() {
		const { modules, checks, hide } = this.state;
		return (
			<>
				<Flex justifyContent="between" alignItems="center" className="w-100">
					<h2 className="mb-4">Permissions</h2>
					<div>
						<Flex justifyContent="between" alignItems="center" className="w-100">
							<p className="mb-0 cursor-pointer" onClick={e => this.toggleAll(e)}>Toggle All</p>
							<Divider type="vertical" />
							<p className="mb-0 cursor-pointer" onClick={e => this.enableAll(e)}>Full Grant Access</p>
						</Flex>
					</div>
				</Flex>
				<List
					itemLayout="horizontal"
					loading={this.state.loading}
					dataSource={modules}
					renderItem={module => (
						<List.Item>
							<Flex justifyContent="between" alignItems="center" className="w-100">
								<div className="d-flex align-items-center">
									<Icon className="h1 mb-0 text-primary" type={MenuOutlined} />
									<div className="ml-3">
										<h4 className="mb-0">{module.parent.title}</h4>
										{module.actions ? <p onClick={e => this.showModuleActions(e, module.parent.id)} className="cursor-pointer">Have {module.actions?.length} actions. click here to customize.</p> : ""}
									</div>
								</div>
								<div className="ml-3">
									<Switch checked={checks[module.parent.id]} key={`module-${module.parent.id}`} onChange={state => this.checkboxChanged(state, module.parent.id)} />
								</div>
							</Flex>
							{module.actions ?
							<Row className={hide[module.parent.id] ? "ant-permissions-checks d-none" : "ant-permissions-checks" } justify="space-between" align="top" gutter={[48, 32]}>
								{module.actions.map(action => (
									<Col key={`module-col-${action.id}`} span={12}>
										<Switch size="default" checked={checks[action.id]} key={`module-action-${action.id}`} onChange={state => this.checkboxChanged(state, action.id)} /> <span className="ant-check-title">{action.title}</span>
									</Col>
								))}
							</Row> : ""}
						</List.Item>
					)}
				/>
			</>
		)
	}
}

export default Permissions
