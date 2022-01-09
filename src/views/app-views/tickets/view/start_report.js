import React, {Component} from 'react'
import {Carousel, Descriptions, Divider, Empty, Image} from 'antd';

export class StartReport extends Component {

	render() {
		const { report, mediaPath } = this.props;

		return (
			<>
				<Descriptions title="Details" layout="vertical" bordered>
					<Descriptions.Item label="Voltage">{report.voltage}</Descriptions.Item>
					<Descriptions.Item label="Heater AMPS">{report.heater_amps}</Descriptions.Item>
					<Descriptions.Item label="Suction PSI">{report.suction_psi}</Descriptions.Item>
					<Descriptions.Item label="Comp Oil Level">{report.comp_oil_level}</Descriptions.Item>
					<Descriptions.Item label="Comp AMPS">{report.comp_amps}</Descriptions.Item>
					<Descriptions.Item label="Discharge PSI">{report.discharge_psi}</Descriptions.Item>
					<Descriptions.Item label="Comp Volt">{report.comp_volt}</Descriptions.Item>
					<Descriptions.Item label="Blower Motor AMPS">{report.blower_motor_amps}</Descriptions.Item>
				</Descriptions>
				<Divider orientation="left">Photos</Divider>
				{report.images?.length > 0 ? <Carousel autoplay className="text-center">
					{report.images.map((image, i) =>
						<Image key={i} src={`${mediaPath}/${image}`} width={350} />
					)}
				</Carousel> : <Empty description={false} /> }
				</>
		)
	}
}

export default StartReport
