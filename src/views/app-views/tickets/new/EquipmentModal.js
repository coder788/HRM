import React, {useEffect} from 'react'
import {Form, message, Modal} from 'antd';
import apiService from "services/ApiService";
import BasicFields from "../../equipments/form/basic_fields";

const EquipmentModal = props => {
	const [formEquipment] = Form.useForm();

	useEffect(() => {
		//console.log(props.customer_id)
	})

	const saveEquipmentModal = () => {
		formEquipment.submit()
	}

	const onFinishEquipment = values => {
		const params = {
			customer_id: props.customer_id,
			number: values.number,
			company: values.company,
			model: values.model,
			year: values.year,
			notes: values.notes,
			photo: ""
		}

		message.loading({content: 'Sending...', key: 'updatable'});

		apiService.createEquipment(params).then(resp => {
			message.success({content: 'Done!', key: 'updatable', duration: 2})
			props.closeModal(resp)
			formEquipment.resetFields()
		})
	};

	return (
		<>
			<Modal
				title="New Equipment"
				visible={props.visible}
				onCancel={props.closeModal}
				destroyOnClose={true}
				onOk={saveEquipmentModal}
				okText="Add Equipment"
				width={1000}
				style={{ top: 20 }}
			>
				<Form
					form={formEquipment}
					layout="vertical"
					onFinish={onFinishEquipment}
				>
					<BasicFields/>
				</Form>
			</Modal>
		</>
	)
}

export default EquipmentModal
