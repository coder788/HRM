import React, {Component} from 'react'
import {Button, Input, Col, Form, Row, Upload, Divider, message} from 'antd';
import {InboxOutlined} from "@ant-design/icons";
import apiService from "services/ApiService";
import {API_BASE_URL, GET_AUTH_HEADER} from "configs/AppConfig";

const {Dragger} = Upload;
const { TextArea } = Input;

export class EnterQCReport extends Component {
	state = {
		loading: false,
		uploadImgs: [],
	}

	sendReport = values => {
		this.setState({loading: true})

		const params = {
			detailed_description: values.detailed_description,
			root_cause: values.root_cause,
			corrective_action: values.corrective_action,
			images: this.state.uploadImgs,
		}

		apiService.sendQCReport(this.props.ticketID, params).then(resp => {
			this.setState({loading: false})
			this.props.closeModal()
		})
	}

	uploadImage = info => {
		const {status} = info.file;
		if (status !== 'uploading') {
			console.log(info.file, info.fileList);
			this.setState({uploadImgs: [...this.state.uploadImgs, info.file.response.path]})
		}
		if (status === 'done') {
			message.success(`${info.file.name} file uploaded successfully.`);
		} else if (status === 'error') {
			message.error(`${info.file.name} file upload failed.`);
		}
	}
	dragerProps = () => {
		return {
			name: 'file',
			multiple: true,
			action: `${API_BASE_URL}/tickets/actions/upload_photo`,
			headers: GET_AUTH_HEADER(),
			onChange: this.uploadImage,
		}
	}

	render() {

		return (
			<Form
				ref={this.formRef}
				layout="vertical"
				onFinish={this.sendReport}
			>
				<Row gutter="4">
					<Col span={24}>
						<Form.Item name="detailed_description" label="Detailed Description" rules={[{required: true}]}>
							<TextArea autoSize={{ minRows: 6, maxRows: 15 }} />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="root_cause" label="Root Cause Analysis" rules={[{required: true}]}>
							<TextArea autoSize={{ minRows: 6, maxRows: 15 }} />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="corrective_action" label="Corrective action to be taken" rules={[{required: true}]}>
							<TextArea autoSize={{ minRows: 6, maxRows: 15 }} />
						</Form.Item>
					</Col>
				</Row>
				<Divider orientation="left">Collected Evidences</Divider>
				<Dragger className="mb-3" {...this.dragerProps()}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined/>
					</p>
					<p className="ant-upload-text">Click or drag file to this area to upload the collected evidences photos</p>
					<p className="ant-upload-hint">Support for a single or bulk upload.</p>
				</Dragger>
				<Form.Item className="text-right mb-0">
					<Button type="primary" htmlType="submit" loading={this.state.loading}>
						Send Report
					</Button>
				</Form.Item>
			</Form>
		)
	}
}

export default EnterQCReport
