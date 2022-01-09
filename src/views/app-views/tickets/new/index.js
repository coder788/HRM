import React, { useState, useEffect } from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Form, Button, message, Spin} from 'antd';
import Flex from 'components/shared-components/Flex'
import TicketForm from './TicketForm'
import {useHistory} from "react-router-dom";
import moment from "moment";
import apiService from "services/ApiService";

const getBase64 = (img, callback) => {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

const ADD = 'ADD'
const EDIT = 'EDIT'

const NewTicketForm = props => {

	const { param } = props

	const [formTicket] = Form.useForm();
	const [uploadedImg, setImage] = useState('')
	const [uploadedImgPath, setImagePath] = useState('')
	const [uploadLoading, setUploadLoading] = useState(false)
	const [submitLoading, setSubmitLoading] = useState(false)
	const [loading, setLoadingData] = useState(false)
	const [mode, setMode] = useState(ADD)
	const [ticketid, setTicketID] = useState(0)
	const [ticketCustomer, setCustomer] = useState([])
	const [equipments, setEquipments] = useState([])
	let history = useHistory();

	useEffect(() => {
		if(props.match.params.id){
			setMode(EDIT)
		}
		if(mode === EDIT) {
			setLoadingData(true)
			setTicketID(props.match.params.id)
			apiService.getTicket(props.match.params.id).then(resp => {
				setLoadingData(false)
				setCustomer([resp.customer])
				selectedCustomer(resp.customer.id)
				formTicket.setFieldsValue({
					type: resp.type,
					cat_id: resp.catid,
					customer_id: resp.customer.id,
					equipment_id: resp.ofs === 1 ? -1 : resp.equipment_id,
					code: resp.code,
					description: resp.details,
					time: moment(resp.start_time),
					date: moment(resp.start_time),
				})
				if(resp.attachment){
					setImage(resp.attachment_link)
				}
			})
		} else {
			formTicket.setFieldsValue({
				time: moment(),
				date: moment(),
			})
		}
	}, [formTicket, mode, param, props]);

	const updateCustomersList = data => {
		setCustomer(data)
	}

	const updateEquipmentsList = data => {
		setEquipments(data)
	}

	const selectedCustomer = customer_id => {
		apiService.getEquipments({customer_id: customer_id}).then(resp => {
			setEquipments(resp.data)
		})
	}

	const resetUpload = () => {
		setImage("")
		setImagePath("")
		setUploadLoading(false)
	}

	const handleUploadChange = info => {
		if (info.file.status === 'uploading') {
			setUploadLoading(true)
			return;
		}
		if (info.file.status === 'done') {
			getBase64(info.file.originFileObj, imageUrl =>{
				setImage(info.file.response.url)
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
		formTicket.validateFields().then(values => {
			let startTime
			if(values.type === "mmt"){
				startTime = moment().format("YYYY-MM-DD") + " " + values.time.format("HH:mm")
			} else {
				startTime = moment(values.date.format("YYYY-MM-DD") + " " + values.time.format("HH:mm")).format("YYYY-MM-DD HH:mm")
			}

			const params = {
				id: (mode === EDIT)? ticketid : 0,
				catid: values.cat_id,
				type: values.type,
				customer_id: values.customer_id,
				equipment_id: values.equipment_id,
				code: values.code,
				details: values.description,
				start_time: startTime,
				attachment: uploadedImgPath
			}

			if(mode === ADD) {
				apiService.addTicket(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Created ${values.code} to tickets list`)
					setTimeout(() => { history.push("/app/tickets/list") }, 500)
				}, error => setSubmitLoading(false) )
			}
			if(mode === EDIT) {
				apiService.updateTicket(params).then(resp => {
					setSubmitLoading(false)
					message.success(`Ticket saved`)
					setTimeout(() => { history.push("/app/tickets/list") }, 500)
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
							<h2 className="mb-3">{mode === 'ADD'? 'Add New Ticket' : `Edit Ticket`} </h2>
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
						<TicketForm
							uploadedImg={uploadedImg}
							uploadLoading={uploadLoading}
							handleUploadChange={handleUploadChange}
							resetUpload={resetUpload}
							form={formTicket}
							customer={ticketCustomer}
							equipments={equipments}
							selectedCustomer={selectedCustomer}
							updateCustomersList={updateCustomersList}
							updateEquipmentsList={updateEquipmentsList}
						/>
					</Spin>
				</div>
		</>
	)

}

export default NewTicketForm
