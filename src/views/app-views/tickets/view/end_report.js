import React, {Component} from 'react'
import {Carousel, Descriptions, Divider, Empty, Image} from 'antd';
import moment from "moment";

export class AfterEndReport extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions title="Details" layout="vertical" bordered column={2}>
					<Descriptions.Item label="Cause" span={2}>{report.cause}</Descriptions.Item>
					<Descriptions.Item label="Problem Description" span={2}>{report.problem_description}</Descriptions.Item>
					<Descriptions.Item label="Item Code">{report.item_code}</Descriptions.Item>
					<Descriptions.Item label="Cause Code">{report.cause_code}</Descriptions.Item>
					<Descriptions.Item label="Activity Code">{report.activity_code}</Descriptions.Item>
					<Descriptions.Item label="Damage Code">{report.damage_code}</Descriptions.Item>
				</Descriptions>
				<Divider orientation="left">Photos</Divider>
				{report.images?.length > 0 ? <Carousel autoplay className="text-center">
					{report.images.map((image, i) =>
						<Image key={i} src={`${mediaPath}/${image}`} width={350} />
					)}
				</Carousel> : <Empty description={false} /> }
				{report.followup_time ?
					<Descriptions title="New Follow-up Visit" layout="vertical" bordered className="mt-4">
						<Descriptions.Item label="Time" span={3}>{moment(report.followup_time).format("DD/MM/YYYY hh:mm A")}</Descriptions.Item>
						<Descriptions.Item label="Reason" span={3}>{report.followup_reason}</Descriptions.Item>
					</Descriptions> : ""}
				</>
		)
	}
}

export default AfterEndReport
