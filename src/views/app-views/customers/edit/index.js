import React, {Component} from 'react';
import CustomerForm from '../form';
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import {Button, Form, message, Spin} from "antd";
import apiService from "services/ApiService";

export class EditCustomer extends Component {
	formRef = React.createRef();

	state = {
		loading: true,
	}

	componentDidMount() {
		console.log(this.props)
		if (this.props.match.params.id) {
			apiService.getCustomer(this.props.match.params.id).then(resp => {
				this.setState({
					loading: false,
				})
				this.formRef.current.setFieldsValue({
					zone_id: [resp.dc_id, resp.zone_id],
					fname: resp.fname,
					lname: resp.lname,
					house_num: resp.house_num,
					email: resp.email,
					mobile: resp.mobile,
					phone: resp.phone,
					address: resp.address,
				})
				document.getElementById("gmapsLatitude").value = resp.latitude;
				document.getElementById("gmapsLongitude").value = resp.longitude;

				let event = document.createEvent("HTMLEvents");
				event.initEvent("change", true, false);
				document.getElementById("gmapsLatitude").dispatchEvent(event);

			})
		}
	}

	onFinish = values => {
		const params = {
			id: this.props.match.params.id,
			dc_id: values.zone_id[0],
			zone_id: values.zone_id[1],
			fname: values.fname,
			lname: values.lname,
			house_num: values.house_num,
			email: values.email,
			mobile: values.mobile,
			phone: values.phone,
			address: values.address,
			latitude: document.getElementById("gmapsLatitude").value,
			longitude: document.getElementById("gmapsLongitude").value,
		}

		message.loading({content: 'Sending...', key: 'updatable'});

		apiService.updateCustomer(params).then(resp => {
			message.success({content: 'Done!', key: 'updatable', duration: 2})
			this.props.history.push("/app/customers/list")
		})
	};

	updateHouseNumber = newvalue => {
		this.formRef.current.setFieldsValue({house_num: newvalue})
	}

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
								<h2 className="mb-3">Edit Customer</h2>
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
							<CustomerForm style={{marginTop: 100}} mode="EDIT" bordered={true} saveBtn={false} updateHouseNumber={this.updateHouseNumber} />
						</Spin>
					</div>
				</Form>
			</>
		)
	}
}

export default EditCustomer
