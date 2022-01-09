import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Form, Button, message, Spin} from 'antd';
import Flex from 'components/shared-components/Flex'
import VehicleForm from './VehicleForm'
import {useHistory} from "react-router-dom";
import apiService from "services/ApiService";
import {CAN_VIEW_MODULE} from "configs/AppConfig";

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const NewVehicleForm = props => {

	const { param } = props

	const [formVehicle] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadedImgPath, setImagePath] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [loading, setLoadingData] = useState(false)
	const [mode, setMode] = useState(ADD)
	const [vehicleid, setVehicleID] = useState(0)
	let history = useHistory();

	useEffect(() => {
		if(props.match.params.id){
			setMode(EDIT)
		}
		if(mode === EDIT) {
			setLoadingData(true)
			setVehicleID(props.match.params.id)
			apiService.getVehicleData(props.match.params.id).then(resp => {
				setLoadingData(false)
				formVehicle.setFieldsValue({
					type: resp.type,
					plate_num: resp.plate_num,
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
	}, [formVehicle, mode, param, props]);

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
		formVehicle.validateFields().then(values => {
			const params = {
				id: (mode === EDIT)? vehicleid : 0,
				type: values.type,
				plate_num: values.plate_num,
				company: values.company,
				model: values.model,
				year: values.year,
				notes: values.notes,
				photo: uploadedImgPath
			}

			if(mode === ADD) {
				apiService.createVehicle(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Created ${values.model} to vehicles list`)
					setTimeout(() => { history.push("/app/vehicles/list") }, 500)
				}, error => setSubmitLoading(false) )
			}
			if(mode === EDIT) {
				apiService.updateVehicle(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Item saved`)
					setTimeout(() => { history.push("/app/vehicles/list") }, 500)
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
							<h2 className="mb-3">{mode === 'ADD'? 'Add New Vehicle' : `Edit Vehicle`} </h2>
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
						<VehicleForm
							uploadedImg={uploadedImg}
							uploadLoading={uploadLoading}
							handleUploadChange={handleUploadChange}
							form={formVehicle}
						/>
					</Spin>
				</div>
		</>
	)

}

export default NewVehicleForm
