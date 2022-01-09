import React, {Component} from 'react'
import {Carousel, Descriptions, Divider, Empty, Image} from 'antd';
import AvatarStatus from "components/shared-components/AvatarStatus";

export class TechEvalReport extends Component {

	render() {
		const { report, mediaPath, vehicle } = this.props;

		return (
			<>
				<Divider orientation="left">Vehicle</Divider>
				<Descriptions layout="vertical" bordered column={4}>
					{report.vehicle_type ?
						<Descriptions.Item label="Type" span={2}>{report.vehicle_type === "mobile" ? "Mobile Workshop" : "Pick Up"}</Descriptions.Item>
						:
						<>
							<Descriptions.Item label="Information" span={2}>
								<AvatarStatus src={vehicle.photo_link} name={vehicle.title} subTitle={vehicle.plate_num} />
							</Descriptions.Item>
							<Descriptions.Item label="Type" span={2}>{vehicle.type_name}</Descriptions.Item>
						</>
					}
					<Descriptions.Item label="Condition" span={4}>{report.condition? "Damages Found" : "No Damages"}</Descriptions.Item>
				</Descriptions>
				{report.condition ?
					<>
						<Divider orientation="left">Photos Of Damages</Divider>
						{report.images?.length > 0 ? <Carousel autoplay className="text-center">
							{report.images.map((image, i) =>
								<Image key={i} src={`${mediaPath}/${image}`} width={350} />
							)}
						</Carousel> : <Empty description={false} /> }
					</>
					: "" }
			</>
		)
	}
}

export default TechEvalReport
