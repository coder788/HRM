import React, {Component} from 'react'
import {Descriptions, Tag} from 'antd';
import {LikeOutlined, DislikeOutlined} from "@ant-design/icons";
import moment from "moment";

export class FollowupReport extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions title="Details" layout="vertical" bordered>
					<Descriptions.Item label="State" span={3}>{report.solved ? <Tag color="green"><LikeOutlined /> SOLVED</Tag> : <Tag color="red"><DislikeOutlined /> NOT SOLVED</Tag> }</Descriptions.Item>
					<Descriptions.Item label="Notes" span={3}>{report.note}</Descriptions.Item>
				</Descriptions>
				{report.followup_time ?
					<Descriptions title="New Follow-up Visit" layout="vertical" bordered className="mt-4">
						<Descriptions.Item label="Time" span={3}>{moment(report.followup_time).format("DD/MM/YYYY hh:mm A")}</Descriptions.Item>
						<Descriptions.Item label="Reason" span={3}>{report.followup_reason}</Descriptions.Item>
					</Descriptions> : ""}
			</>
		)
	}
}

export default FollowupReport
