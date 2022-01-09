import React, { Component } from 'react'
import {Badge, Menu} from 'antd';
import { Link, Route, Switch } from 'react-router-dom';
import InnerAppLayout from 'layouts/inner-app-layout';
import Permissions from './Permissions';
import {WEB_CONFIG} from "configs/AppConfig";

const SettingOption = ({ match, location }) => {
	return (
		<Menu
			mode="inline"
			selectedKeys={[location.pathname]}
		>
			{WEB_CONFIG("settings").roles.map(role =>
				<Menu.Item key={`${match.url}/${role.id}`}>
					<Badge color={role.color} />
					<span>{role.title}</span>
					<Link to={`${role.id}`} />
				</Menu.Item>
			)}
		</Menu>
	);
};

const SettingContent = ({ match, history }) => {
	return (
		<Switch>
			{WEB_CONFIG("settings").roles.map(role =>
				<Route key={`role-template-${role.id}`} path={`${match.url}/${role.id}`} component={() => <Permissions roleid={role.id} />} />
			)}
		</Switch>
	)
}

export class StaffForm extends Component {
	render() {
		return (
			<InnerAppLayout
				sideContentWidth={320}
				sideContent={<SettingOption {...this.props}/>}
				mainContent={<SettingContent {...this.props}/>}
			/>
		);
	}
}

export default StaffForm
