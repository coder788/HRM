import React, {Component} from 'react'
import {Descriptions, Rate} from 'antd';

export class ClientReview extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions title="Details" layout="vertical" bordered column={2}>
					<Descriptions.Item label="Timeless Response"><Rate disabled defaultValue={report.response} /></Descriptions.Item>
					<Descriptions.Item label="Employee Knowledge"><Rate disabled defaultValue={report.employee_knowledge} /></Descriptions.Item>
					<Descriptions.Item label="Employee Friendly"><Rate disabled defaultValue={report.employee_friendly} /></Descriptions.Item>
					<Descriptions.Item label="Overall Experience"><Rate disabled defaultValue={report.overall} /></Descriptions.Item>
					{report.message ?
					<Descriptions.Item label="Message" span={2}>{report.message}</Descriptions.Item> : ""}
				</Descriptions>
				</>
		)
	}
}

export default ClientReview
