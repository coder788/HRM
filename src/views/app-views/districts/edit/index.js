import React, {Component} from 'react';
import DistrictForm from '../form';
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import {Button, Form, message, Spin} from "antd";
import apiService from "services/ApiService";

export class EditDistrict extends Component {
	formRef = React.createRef();

	state = {
		loading: true,
	}

	componentDidMount() {
		console.log(this.props)
		if (this.props.match.params.id) {
			apiService.getDistrict(this.props.match.params.id).then(resp => {
				this.setState({
					loading: false,
				})
				this.formRef.current.setFieldsValue({
					name: resp.name,
					radius: resp.radius,
					about: resp.about,
				})
				document.getElementById("gmapsLatitude").value = resp.latitude;
				document.getElementById("gmapsLongitude").value = resp.longitude;
				document.getElementById("radiusHtml").value = resp.radius;

				let event = document.createEvent("HTMLEvents");
				event.initEvent("change", true, false);
				document.getElementById("radiusHtml").dispatchEvent(event);
			})
		}
	}

	onFinish = values => {
		const params = {
			id: this.props.match.params.id,
			name: values.name,
			about: values.about,
			latitude: document.getElementById("gmapsLatitude").value,
			longitude: document.getElementById("gmapsLongitude").value,
			radius: document.getElementById("radiusHtml").value,
		}

		message.loading({content: 'Sending...', key: 'updatable'});

		apiService.updateDistrict(params).then(resp => {
			message.success({content: 'Done!', key: 'updatable', duration: 2})
			this.props.history.push("/app/districts/list")
		})
	};

	render() {
		const {loading} = this.state;

		return (
			<>
				<Form
					ref={this.formRef}
					layout="vertical"
					onFinish={this.onFinish}
				>
					<PageHeaderAlt className="bg-white border-bottom" overlap>
						<div className="container">
							<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
								<h2 className="mb-3">Edit District</h2>
								<div className="mb-3">
									<Button className="mr-2" onClick={() => this.props.history.goBack()}>Discard</Button>
									<Button type="primary" htmlType="submit">
										Save Changes
									</Button>
								</div>
							</Flex>
						</div>
					</PageHeaderAlt>
					<div className="container" style={{marginTop: 100}}>
						<Spin spinning={loading}>
							<DistrictForm style={{marginTop: 100}} mode="EDIT" bordered={true} saveBtn={false} />
						</Spin>
					</div>
				</Form>
			</>
		)
	}
}

export default EditDistrict
