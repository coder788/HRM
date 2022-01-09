import React, {Component} from 'react'
import {Descriptions} from 'antd';

export class RaiseReport extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions layout="vertical" bordered>
					<Descriptions.Item label="Reason" span={3}>{report.reason}</Descriptions.Item>
				</Descriptions>
				</>
		)
	}
}

export default RaiseReport
