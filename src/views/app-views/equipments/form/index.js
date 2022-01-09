import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Form, Button, message, Spin} from 'antd';
import Flex from 'components/shared-components/Flex'
import EquipmentForm from './EquipmentForm'
import {useHistory} from "react-router-dom";
import apiService from "services/ApiService";

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const NewEquipmentForm = props => {

	const { param } = props

	const [formEquipment] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadedImgPath, setImagePath] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [loading, setLoadingData] = useState(false)
	const [mode, setMode] = useState(ADD)
	const [equipmentid, setEquipmentID] = useState(0)
	const [customers, setCustomers] = useState([])
	let history = useHistory();

	useEffect(() => {
		if(props.match?.params.id){
			setMode(EDIT)
		}
		if(mode === EDIT) {
			setLoadingData(true)
			setEquipmentID(props.match.params.id)
			apiService.getEquipmentData(props.match.params.id).then(resp => {
				setLoadingData(false)
				setCustomers([resp.customer])
				formEquipment.setFieldsValue({
					customer_id: resp.customer_id,
					number: resp.number,
					company: resp.company,
					model: resp.model,
					year: resp.year,
					notes: resp.notes,
				})
				if(resp.photo){
					setImage(resp.photo_link)
				}
			})
		}
	}, [formEquipment, mode, param, props]);

	const handleUploadChange = info => {
		if (info.file.status === 'uploading') {
			setUploadLoading(true)
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, imageUrl => {
				setImage(imageUrl)
				setImagePath(info.file.response.path)
				setUploadLoading(true)
			});
		}
	};

	const goBack = () => {
		history.goBack()
	}

	const onFinish = () => {
		setSubmitLoading(true)
		formEquipment.validateFields().then(values => {
			const params = {
				id: (mode === EDIT)? equipmentid : 0,
				customer_id: values.customer_id,
				number: values.number,
				company: values.company,
				model: values.model,
				year: values.year,
				notes: values.notes,
				photo: uploadedImgPath
			}

			if(mode === ADD) {
				apiService.createEquipment(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Created ${values.model} to equipments list`)
					setTimeout(() => { history.push("/app/equipments/list") }, 500)
				}, error => setSubmitLoading(false) )
			}
			if(mode === EDIT) {
				apiService.updateEquipment(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Item saved`)
					setTimeout(() => { history.push("/app/equipments/list") }, 500)
				}, error => setSubmitLoading(false) )
			}
		}).catch(info => {
			setSubmitLoading(false)
			console.log('info', info)
			message.error('Please enter all required field ');
		});
	};

	return (
		<>
				<PageHeaderAlt className="bg-white border-bottom" overlap>
					<div className="container">
						<Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
							<h2 className="mb-3">{mode === 'ADD'? 'Add New Equipment' : `Edit Equipment`} </h2>
							<div className="mb-3">
								<Button className="mr-2" onClick={() => goBack()}>Discard</Button>
								<Button type="primary" onClick={() => onFinish()} htmlType="submit" loading={submitLoading} >
									{mode === 'ADD'? 'Add' : `Save`}
								</Button>
							</div>
						</Flex>
					</div>
				</PageHeaderAlt>
				<div className="container">
					<Spin spinning={loading}>
						<EquipmentForm
							uploadedImg={uploadedImg}
							uploadLoading={uploadLoading}
							handleUploadChange={handleUploadChange}
							form={formEquipment}
							customers={customers}
						/>
					</Spin>
				</div>
		</>
	)

}

export default NewEquipmentForm
