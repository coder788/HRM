import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Form, Button, message, Spin} from 'antd';
import Flex from 'components/shared-components/Flex'
import StockForm from './StockForm'
import {useHistory} from "react-router-dom";
import apiService from "services/ApiService";

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const NewStockForm = props => {

	const { param } = props

	const [formStock] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadedImgPath, setImagePath] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [loading, setLoadingData] = useState(false)
	const [mode, setMode] = useState(ADD)
	const [stockid, setStockID] = useState(0)
	let history = useHistory();

	useEffect(() => {
		if(props.match.params.id){
			setMode(EDIT)
		}
		if(mode === EDIT) {
			setLoadingData(true)
			setStockID(props.match.params.id)
			apiService.getStockData(props.match.params.id).then(resp => {
				setLoadingData(false)
				formStock.setFieldsValue({
					title: resp.title,
					model: resp.model,
					notes: resp.notes,
					quantity: resp.quantity,
					cat_id: resp.catid,
					tags: resp.tags?.split(","),
					zone: [resp.dc_id, resp.zone_id],
				})
				if(resp.photo){
					setImage(resp.photo_link)
				}
			})
		}
	}, [formStock, mode, param, props]);

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
		formStock.validateFields().then(values => {
			const params = {
				id: (mode === EDIT)? stockid : 0,
				catid: values.cat_id,
				title: values.title,
				model: values.model,
				notes: values.notes,
				quantity: values.quantity,
				dc_id: values.zone[0],
				zone_id: values.zone[1],
				tags: values.tags ? values.tags.join(",") : "",
				photo: uploadedImgPath
			}

			if(mode === ADD) {
				apiService.createStock(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Created ${values.model} to stocks list`)
					setTimeout(() => { history.push("/app/stock/list") }, 500)
				}, error => setSubmitLoading(false) )
			}
			if(mode === EDIT) {
				apiService.updateStock(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Item saved`)
					setTimeout(() => { history.push("/app/stock/list") }, 500)
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
							<h2 className="mb-3">{mode === 'ADD'? 'Add New Stock' : `Edit Stock`} </h2>
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
						<StockForm
							uploadedImg={uploadedImg}
							uploadLoading={uploadLoading}
							handleUploadChange={handleUploadChange}
							form={formStock}
						/>
					</Spin>
				</div>
		</>
	)

}

export default NewStockForm
