import React, {Component} from 'react'
import {Col, Form, Input, Row} from 'antd';
import {BarcodeOutlined} from "@ant-design/icons";

const rules = {
	number: [
		{
			required: true,
			message: 'Please enter the equipment number',
		}
	],
	company: [
		{
			required: true,
			message: 'Please enter the manufacture company name',
		}
	],
	model: [
		{
			required: true,
			message: 'Please enter the equipment model',
		}
	],
	year: [
		{
			required: true,
			message: 'Please enter the equipment manufacturing year',
		}
	],
	notes: [
		{
			required: false,
			type: "string",
			max: 255,
			message: 'Please enter some notes',
		}
	],
}

export class BasicFields extends Component {

	render() {

		return (
			<>
				<Row>
					<Col xs={24} sm={24} md={10}>
						<Form.Item name="number" label="Number" rules={rules.number}>
							<Input placeholder="eg. 4730293056129" prefix={<BarcodeOutlined className="site-form-item-icon"/>}/>
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24} sm={24} md={8}>
						<Form.Item name="company" label="Manufacturer" rules={rules.company}>
							<Input placeholder="Power" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={8}>
						<Form.Item name="model" label="Model" rules={rules.model} className="ml-3">
							<Input placeholder="R2A20114B" />
						</Form.Item>
					</Col>
					<Col xs={24} sm={24} md={5}>
						<Form.Item name="year" label="Year" rules={rules.year} className="ml-3">
							<Input placeholder="2016" />
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col xs={24} sm={24} md={24}>
						<Form.Item name="notes" label="Notes" rules={rules.notes}>
							<Input.TextArea rows={12} placeholder="Write some notes..."/>
						</Form.Item>
					</Col>
				</Row>
			</>
		)
	}
}

export default BasicFields
