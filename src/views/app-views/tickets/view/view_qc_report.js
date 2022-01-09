import React, {Component} from 'react'
import {Carousel, Descriptions, Divider, Empty, Image} from 'antd';

export class ViewQCReport extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions title="Details" layout="vertical" bordered>
					<Descriptions.Item label="Detailed Description" span={3}>{report.detailed_description}</Descriptions.Item>
					<Descriptions.Item label="Root Cause Analysis" span={3}>{report.root_cause}</Descriptions.Item>
					<Descriptions.Item label="Corrective action to be taken" span={3}>{report.corrective_action}</Descriptions.Item>
				</Descriptions>
				<Divider orientation="left">Collected Evidences</Divider>
				{report.images?.length > 0 ? <Carousel autoplay className="text-center">
					{report.images.map((image, i) =>
						<Image key={i} src={`${mediaPath}/${image}`} width={350} />
					)}
				</Carousel> : <Empty description={false} /> }
				</>
		)
	}
}

export default ViewQCReport
