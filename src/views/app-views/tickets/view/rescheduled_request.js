import React, {Component} from 'react'
import {Descriptions} from 'antd';
import moment from "moment";

export class RescheduledRequest extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<Descriptions layout="vertical" bordered className="mt-1">
				<Descriptions.Item label="Time" span={3}>{moment(report.time).format("DD/MM/YYYY hh:mm A")}</Descriptions.Item>
				<Descriptions.Item label="Reason" span={3}>{report.reason}</Descriptions.Item>
			</Descriptions>
		)
	}
}

export default RescheduledRequest
