import React from 'react'
import { Form,  message, Modal} from 'antd';
import apiService from "services/ApiService";
import CustomerForm from "../../customers/form";

const CustomerModal = props => {
	const [formCustomer] = Form.useForm();

	const saveCustomerModal = () => {
		formCustomer.submit()
	}

	const onFinishCustomer = values => {
		const params = {
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

		apiService.createCustomer(params).then(resp => {
			message.success({content: 'Done!', key: 'updatable', duration: 2})
			props.closeModal(resp)
			formCustomer.resetFields()
		})
	};

	const updateHouseNumber = newvalue => {
		formCustomer.setFieldsValue({house_num: newvalue})
	}

	return (
		<>
			<Modal
				title="New Customer"
				visible={props.visible}
				onCancel={props.closeModal}
				destroyOnClose={true}
				onOk={saveCustomerModal}
				okText="Add Customer"
				width={1000}
				style={{ top: 20 }}
			>
			<Form
				form={formCustomer}
				layout="vertical"
				onFinish={onFinishCustomer}
			>
				<CustomerForm mode="ADD" bordered={false} saveBtn={false} updateHouseNumber={updateHouseNumber} />
			</Form>
			</Modal>
		</>
			)
}

export default CustomerModal
