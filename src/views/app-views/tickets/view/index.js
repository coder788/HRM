import React, { Component } from 'react'
import {Row, Col, Card, Avatar, Button, Timeline, Typography, Tag, Progress, Rate, Skeleton, Tooltip, Alert, Empty, Modal, Table, Result, Spin} from 'antd';
import { Icon } from 'components/util-components/Icon'
import {
	MobileOutlined,
	MailOutlined,
	PhoneOutlined,
	ClockCircleOutlined,
	FieldTimeOutlined,
	DownloadOutlined,
	CalendarOutlined,
	SmileOutlined,
	FileDoneOutlined,
	SendOutlined,
	HourglassOutlined,
	CarOutlined,
	ToolOutlined,
	FolderOutlined, PrinterOutlined, UserOutlined, GoldOutlined
} from '@ant-design/icons';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import Flex from 'components/shared-components/Flex'
import apiService from "services/ApiService";
import {CAN_VIEW_MODULE, GOOGLE_MAPS_API_KEY, WEB_CONFIG} from "configs/AppConfig";
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import OrderView from "./order";
import AfterEndReport from "./end_report";
import StartReport from "./start_report";
import TechEvalReport from "./tech_eval_report";
import EnterQCReport from "./enter_qc_report";
import ViewQCReport from "./view_qc_report";
import FollowupReport from "./followup_report";
import RaiseReport from "./raise_report";
import TerminateReport from "./terminate_report";
import CustomerMessage from "./customer_message";
import ClientReview from "./client_review";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faCalendarCheck,
	faCarSide,
	faCheckCircle,
	faClipboardCheck,
	faClipboardList,
	faExclamationTriangle,
	faHourglassHalf,
	faHandshake,
	faMedal,
	faCartPlus,
	faTools,
	faTruck,
	faCalendarDay,
	faCalendarTimes,
	faUserCog,
	faUserTie
} from '@fortawesome/free-solid-svg-icons'
import RescheduledRequest from "./rescheduled_request";

const { Text } = Typography;

const ProfileInfo = props => (
	<Card>
		<Row justify="center">
			<Col sm={24} md={23}>
				<div className="d-md-flex">
					<div className="rounded p-2 bg-white shadow-sm mx-auto" style={{'marginTop': '-3.5rem', 'maxWidth': `${props.avatarSize + 16}px`}}>
						<Avatar shape="square" size={props.avatarSize} src={`https://www.gravatar.com/avatar/${props.customer.gravatar_hash}?s=150&r=g&d=mm`} />
					</div>
					<div className="ml-md-4 w-100">
						<Flex alignItems="center" mobileFlex={false} className="mb-3 text-md-left text-center">
							<h2 className="mb-0">
								{props.customer.full_name}
							</h2>
							<Tooltip placement="bottom" title="Equipment Number">{props.ofs === 1 ? <Tag className="ml-1" color="red">Out Of Scope</Tag> : props.equipment_id > 0 ? <Tag className="ml-1" color="blue">{props.equipment_num}</Tag> : <Tag className="ml-1" color="gray">Not Specified</Tag> }</Tooltip>
							{(CAN_VIEW_MODULE(59)) ?
							<div className="ml-md-3 mt-3 mt-md-0">
								<Button size="small" type="primary" onClick={() => props.sendCustomer(props.customer)}>Message</Button>
							</div> : ""}
						</Flex>
						<Row gutter="16">
							<Col sm={24} md={8}>
								<p className="mt-0 mr-3 text-muted text-md-left text-center">
									{props.customer.address}
								</p>
							</Col>
							<Col xs={24} sm={24} md={8}>
								{props.customer.email !== "" ?
								<Row className="mb-2">
									<Col xs={12} sm={12} md={9}>
										<Icon type={MailOutlined} className="text-primary font-size-md"/>
										<span className="text-muted ml-2">Email:</span>
									</Col>
									<Col xs={12} sm={12} md={15}>
										<span className="font-weight-semibold">{props.customer.email}</span>
									</Col>
								</Row> : ""}
								{props.customer.phone !== "" ?
								<Row>
									<Col xs={12} sm={12} md={9}>
										<Icon type={PhoneOutlined} className="text-primary font-size-md"/>
										<span className="text-muted ml-2">Phone:</span>
									</Col>
									<Col xs={12} sm={12} md={15}>
										<span className="font-weight-semibold">{props.customer.phone}</span>
									</Col>
								</Row> : ""}
							</Col>
							<Col xs={24} sm={24} md={8}>
								<Row className="mb-2">
									<Col xs={12} sm={12} md={9}>
										<Icon type={MobileOutlined} className="text-primary font-size-md"/>
										<span className="text-muted ml-2">Mobile:</span>
									</Col>
									<Col xs={12} sm={12} md={15}>
										<span className="font-weight-semibold">{props.customer.mobile}</span>
									</Col>
								</Row>
								<Row className="mb-2">
									<Col xs={12} sm={12} md={9}>
										<Icon type={SmileOutlined} className="text-primary font-size-md"/>
										<span className="text-muted ml-2">Review:</span>
									</Col>
									<Col xs={12} sm={12} md={15} style={{marginTop: "-7px"}}>
										{(props.review)? <Rate disabled defaultValue={props.review} allowHalf /> : <Rate disabled defaultValue={0} />}
									</Col>
								</Row>
							</Col>
						</Row>
					</div>
				</div>
			</Col>
		</Row>
	</Card>
)

const RescheduleAction = (props) => (
	(props.ticket.reschedule_at && CAN_VIEW_MODULE(24) && props.displayState) ?
		<Spin spinning={props.loadingState}>
			<Result
				status="info"
				title="Technician requested to rescheduling the appointment!"
				subTitle={`In case you will accept the appointment will be rescuduled to be at ${moment(props.ticket.reschedule_at).format("DD-MM-YYYY hh:mm A")}`}
				extra={[
					<Button type="primary" danger key="reject" onClick={() => props.rescheduleFeedback("reject")}>Reject</Button>,
					<Button type="primary" key="accept" onClick={() => props.rescheduleFeedback("accept")}>Accept</Button>,
				]}
			/></Spin> : ""
)

const WaitingAction = (props) => (
	(props.ticket.status === "waiting_assign_qc" && CAN_VIEW_MODULE(110)) ?
		<Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting to be assigned to QC</Col>
					<Col span={4}>
						<Button size="small" type="default" onClick={() => props.gotoAssign("qc")} icon={<FileDoneOutlined/>}>Assign Now</Button>
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> :
	(props.ticket.status === "waiting_assign" && props.ticket.type === "inspection" && CAN_VIEW_MODULE([110,108])) ?
		<Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting to be assigned to technician or QC</Col>
					<Col span={4}>
						{(CAN_VIEW_MODULE(108)) ?
						<Button size="small" block type="default" onClick={() => props.gotoAssign("technician")} icon={<FontAwesomeIcon icon={faUserCog}/>}><span className="ml-1">Technician</span></Button> : ""}
						{(CAN_VIEW_MODULE(110)) ?
						<Button size="small" block type="default" onClick={() => props.gotoAssign("qc")} className="mt-1" icon={<FontAwesomeIcon icon={faUserTie}/>}><span className="ml-1">QC</span></Button> : ""}
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> :
	(props.ticket.status === "waiting_assign" && CAN_VIEW_MODULE(108)) ?
		<Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting to be assigned to technician</Col>
					<Col span={4}>
						<Button size="small" type="default" onClick={() => props.gotoAssign("technician")} icon={<FileDoneOutlined/>}>Assign Now</Button>
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> :
	((props.ticket.status === "raised_problem_sv" || props.ticket.status === "raised_problem_foreman") && ["foreman", "pm", "admin"].includes(WEB_CONFIG("role").name) && CAN_VIEW_MODULE(108)) ?
		<Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting to be assigned to technician</Col>
					<Col span={4}>
						<Button size="small" type="default" onClick={() => props.gotoAssign("technician")} icon={<FileDoneOutlined/>}>Assign Now</Button>
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> :
		(props.ticket.status === "stock_requested" && CAN_VIEW_MODULE(109)) ? <Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting to be assigned to delivery boy</Col>
					<Col span={4}>
						<Button size="small" type="default" onClick={() => props.gotoAssign("delivery")} icon={<FileDoneOutlined/>}>Assign Now</Button>
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> : (props.ticket.status === "waiting_qc_report" && CAN_VIEW_MODULE(123)) ? <Alert
			description={
				<Row align="middle" gutter={4}>
					<Col span={18}>Ticket waiting posting QC report by you</Col>
					<Col span={4}>
						<Button size="small" type="default" onClick={() => props.openModal("report", " ", "enter_qc_report")} icon={<FileDoneOutlined/>}>Post Now</Button>
					</Col>
				</Row>
			}
			type="info"
			showIcon
			className="mb-3"
		/> : ""
)

const DateLabel = props => (
	// style={{backgroundColor: "transparent", color: props.color, border: `1px solid ${props.color}`}}
	<><Tag color={props.color}><ClockCircleOutlined /> {moment(props.time).format("DD MMM YY hh:mm A")}</Tag></>
)

const ActionData = props => (
	<>
		{(() => {
			if (props.data.action === "raised_problem_sv" || props.data.action === "raised_problem_foreman" || props.data.action === "raised_problem") {
				return (
					<Avatar
						style={props.data.report ? {cursor: "pointer", backgroundColor: '#f96b72'} : {backgroundColor: '#f96b72'}}
						onClick={() => props.openModal("report", props.data.report, props.data.action)}
						size={16}
					/>
				)
			}
			if (props.data.agent && props.data.staff) {
				return (
					<Tooltip title={props.data.agent.full_name}>
						<Avatar
							style={props.data.report ? {cursor: "pointer"} : null}
							onClick={() => props.openModal("report", props.data.report, props.data.action, props.data.vehicle)}
							size={32}
							src={props.data.agent.photo_link}
						/>
					</Tooltip>
				)
			}
			if (props.data.stock_order && props.data.action === "stock_requested") {
				return (
					<Tooltip title={`Requested no #${props.data.stock_order.items.length} items`}>
						<Avatar
							shape="square"
							onClick={() => props.openModal("order", props.data.stock_order, props.data.action)}
							style={{cursor: "pointer"}}
							size={32}
							icon={<IconStyle action={props.data.action} />}
						/>
					</Tooltip>
				)
			}
			if (props.data.client) {
				return (
					<Tooltip title={`Response time ${humanizeDuration(props.data.response*1000)} since ${props.data.main_job.details}`}>
						<Avatar
							style={props.data.report ? {cursor: "pointer"} : null}
							onClick={() => props.openModal("report", props.data.report, props.data.action)}
							size={32}
							src={`https://www.gravatar.com/avatar/${props.data.client.gravatar_hash}?s=150&r=g&d=mm`}
						/>
					</Tooltip>
				)
			}
			if (props.data.response) {
				return (
					<Tooltip title={`Response time ${humanizeDuration(props.data.response*1000)} since ${props.data.main_job.details}`}>
						<Avatar
							shape="square"
							className={props.data.report ? "cursor-pointer" : ""}
							onClick={() => props.openModal("report", props.data.report, props.data.action, props.data.vehicle)}
							size={32}
							icon={<IconStyle action={props.data.action} />}
						/>
					</Tooltip>
				)
			}
			else {
				return (
					<Avatar
						shape="square"
						className={props.data.report ? "cursor-pointer" : ""}
						onClick={() => props.openModal("report", props.data.report, props.data.action, props.data.vehicle)}
						size={32}
						icon={<IconStyle action={props.data.action} />}
					/>
				)
			}
		})()}
	</>
)

const IconStyle = props => {
	let icon
	switch (props.action){
		case 'tech_job_started':
			icon = faTools
			break
		case 'tech_start_report':
			icon = faClipboardCheck
			break
		case 'followup_job':
			icon = faCalendarCheck
			break
		case 'stock_requested':
			icon = faCartPlus
			break
		case 'client_review':
			icon = faMedal
			break
		case 'tech_job_ended':
			icon = faCheckCircle
			break
		case 'tech_end_report':
			icon = faClipboardList
			break
		case 'tech_boy_terminated':
			icon = faExclamationTriangle
			break
		case 'delv_job_started':
			icon = faTruck
			break
		case 'delv_job_ended':
			icon = faHandshake
			break
		case 'tech_boy_responded':
			icon = faCarSide
			break
		case 'tech_job_rescheduled':
			icon = faCalendarDay
			break
		case 'rescheduled_accepted':
			icon = faCalendarCheck
			break
		case 'rescheduled_rejected':
			icon = faCalendarTimes
			break
		default:
			icon = faHourglassHalf
			break
	}
	return (<FontAwesomeIcon icon={icon} style={{color:"#2c90ff"}} />)
}

const ConsumedMaterials = props => (
	<Card title="Consumed Materials">
		<div className="mb-3">
			<Row>
				<Col sm={24} md={24}>
					<div className="table-responsive">
						<Table
							columns={[
								{
									title: 'Item',
									dataIndex: 'title',
									render: (_, record) => (
										<div className="d-flex">
											<AvatarStatus src={record.stock.photo_link} name={record.stock.title} subTitle={record.stock.model}/>
										</div>
									),
								},
								{
									title: 'Used Date',
									dataIndex: 'created_at',
									render: created_at => (
										<span>{moment(created_at).format("DD/MM/YYYY")} </span>
									),
								},
								{
									title: 'Quantity',
									dataIndex: 'quantity',
									render: quantity => (
										<Tag color="blue">{quantity}</Tag>
									),
								},
							]}
							dataSource={props.items}
							pagination={false}
							rowKey='id'
						/>
					</div>
				</Col>
			</Row>
		</div>
	</Card>
)

const TicketActions = props => (
	<Card title="Procedures">
		<div className="mb-3">
			<Row>
				<Col sm={24} md={22}>
					<Timeline mode="left">
						<Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />} label={<DateLabel color="purple" time={props.created} />}>Start Time</Timeline.Item>
						{props.actions.map((elm, i) => {
							return (
								<Timeline.Item key={i} dot={<ActionData data={elm} openModal={props.openModal} />} label={<DateLabel color="blue" time={elm.created_at}/>}>
									{(elm.agent && elm.staff) ? <AvatarStatus
										src={elm.staff.photo_link}
										name={elm.staff.full_name}
										subTitle={`${elm.details} by ${elm.agent.full_name}`}
									/> : (elm.agent) ? <AvatarStatus
										src={elm.agent.photo_link}
										name={elm.agent.full_name}
										subTitle={elm.details}
									/> : (elm.staff) ?
										<AvatarStatus
											src={elm.staff.photo_link}
											name={elm.staff.full_name}
											subTitle={elm.details}
										/> : (elm.client) ? <><Text strong>{elm.client.full_name}</Text> <Text>{elm.details}</Text></>
											: <Text strong>{elm.details}</Text> }
								</Timeline.Item>
							)
						})}
						{(props.finished)? <Timeline.Item dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />} label={<DateLabel color="green" time={props.finished}/>}>Issued Time</Timeline.Item> :""}
					</Timeline>
				</Col>
			</Row>
		</div>
	</Card>
)

const Staff = props => (
	<Card title="Staff In">
		{
			props.staff.length === 0 ? <Empty/> :
			props.staff.map((elm, i) => {
				return (
					<div className={`${i === (props.staff.length - 1)? '' : 'mb-4'}`} key={`connection-${i}`}>
						<Row justify="space-around" align="middle">
							<Col span={18}>
								<AvatarStatus src={elm.profile.photo_link} name={elm.profile.full_name} subTitle={elm.profile.role.title} />
							</Col>
							<Col span={6}>
								{(elm.profile.id !== WEB_CONFIG("id")) && CAN_VIEW_MODULE(132) ?
								<Button icon={<SendOutlined/>} type="primary" size="small" shape="round" loading={(props.chatLoading && props.chatLoading === elm.profile.id)} onClick={(e) => props.startChat(e, elm.profile.id)}>Chat</Button> : ""}
							</Col>
						</Row>
					</div>
				)
			})
		}
	</Card>
)

export class ViewTicket extends Component {
	state = {
		loading: true,
		ticket: false,
		chatLoading: false,
		printLoading: false,
		modalVisible: false,
		rescheduleFeedbackLoading: false,
		rescheduleFeedbackBlock: true,
		modalTitle: "",
		modalContent: "",
	}

	componentDidMount() {
		apiService.getTicket(this.props.match.params.id).then(resp => {
			this.setState({
				loading: false,
				ticket: resp,
			})
		})
	}

	startChat = (e, to_uid) => {
		console.log(e)
		this.setState({chatLoading: to_uid})
		apiService.sendMessage({
			message: '',
			ticket_id: this.state.ticket.id,
			to_userid: to_uid,
			hello: 1,
		}).then(resp => {
			this.setState({chatLoading: false})
			this.props.history.push(`/app/chat/${resp}`)
		})
	}

	openExternalLink = link => {
		window.open(link, '_blank')
	}

	gotoAssign = (type) => {
		this.props.history.push(`/app/tickets/assign/${type}/${this.state.ticket.id}`)
	}

	rescheduleFeedback = (action) => {
		this.setState({rescheduleFeedbackLoading: true})
		apiService.rescheduleFeedback(this.state.ticket.id, {action: action}).then(resp => {
			this.setState({rescheduleFeedbackLoading: false, rescheduleFeedbackBlock: false})
		})
	}

	closeModal = () => {
		this.setState({modalVisible: false})
	}

	sendCustomer = (customerData) => {
		this.setState({modalContent: <CustomerMessage customer={customerData} closeModal={this.closeModal} />, modalTitle: `Send a message to ${customerData.fname}`, modalVisible: true})
	}

	openModal = (action, data, actionName, additionalData) => {
		if(! data){
			console.log("no data")
			return
		}
		switch (action){
			case "order":
				this.setState({modalContent: <OrderView order={data} />, modalTitle: `Order No #${data.id}`, modalVisible: true})
				break
			case "report":
				console.log(actionName)
				switch (actionName){
					case "tech_end_report":
						this.setState({modalContent: <AfterEndReport report={data.content} mediaPath={data.media_path} />, modalTitle: "After Repair Report", modalVisible: true})
						break
					case "tech_start_report":
						this.setState({modalContent: <StartReport report={data.content} mediaPath={data.media_path} />, modalTitle: "Before Start Repair Report", modalVisible: true})
						break
					case "tech_job":
						this.setState({modalContent: <TechEvalReport report={data.content} vehicle={additionalData} mediaPath={data.media_path} />, modalTitle: "Technician Evaluation", modalVisible: true})
						break
					case "enter_qc_report":
						this.setState({modalContent: <EnterQCReport ticketID={this.state.ticket.id} closeModal={this.closeModal} />, modalTitle: "QC Report", modalVisible: true})
						break
					case "qc_report_sent":
						this.setState({modalContent: <ViewQCReport report={data.content} mediaPath={data.media_path} />, modalTitle: "QC Report", modalVisible: true})
						break
					case "tech_followup_result":
						this.setState({modalContent: <FollowupReport report={data.content} mediaPath={data.media_path} />, modalTitle: "Followup Report", modalVisible: true})
						break
					case "raised_problem_sv":
						this.setState({modalContent: <RaiseReport report={data.content} mediaPath={data.media_path} />, modalTitle: "Raise Problem Report", modalVisible: true})
						break
					case "raised_problem_foreman":
						this.setState({modalContent: <RaiseReport report={data.content} mediaPath={data.media_path} />, modalTitle: "Raise Problem Report", modalVisible: true})
						break
					case "tech_boy_terminated":
						this.setState({modalContent: <TerminateReport report={data.content} mediaPath={data.media_path} />, modalTitle: "Cancellation Report", modalVisible: true})
						break
					case "client_review":
						this.setState({modalContent: <ClientReview report={data.content} mediaPath={data.media_path} />, modalTitle: "Client Evaluation", modalVisible: true})
						break
					case "tech_job_rescheduled":
						this.setState({modalContent: <RescheduledRequest report={data.content} mediaPath={data.media_path} />, modalTitle: "Rescheduled Request", modalVisible: true})
						break
					default:
						break
				}
				break
			default:
				break
		}
	}

	getPrintVersion = () => {
		this.setState({printLoading: true})
		apiService.printTicket(this.state.ticket.id).then(resp => {
			this.setState({printLoading: false})
			window.open(resp.link, "_blank")
		})
	}

	render() {
		const {ticket, loading} = this.state
		const avatarSize = 150

		return (
			<>
				{(loading) ? <SkeletonView/> :
					<>
						<PageHeaderAlt background={`https://maps.googleapis.com/maps/api/staticmap?center=${ticket.customer.latitude},${ticket.customer.longitude}&zoom=12&size=640x640&scale=2&maptype=roadmap&markers=color:red%7Clabel:${ticket.customer.fname.substring(0, 1)+ticket.customer.lname.substring(0, 1)}%7C${ticket.customer.latitude},${ticket.customer.longitude}&key=${GOOGLE_MAPS_API_KEY}`} className="bg-center" cssClass="bg-primary" overlap>
							<div className="container text-center">
								<div className="py-5 my-md-5">
								</div>
							</div>
						</PageHeaderAlt>
						<div className="container my-4">
							<ProfileInfo avatarSize={avatarSize} customer={ticket.customer} review={ticket.review} equipment_id={ticket.equipment_id} equipment_num={ticket.equipment?.number} ofs={ticket.ofs} sendCustomer={this.sendCustomer} />
							<Row gutter="16">
								<Col xs={24} sm={24} md={8}>
									<Card
										title="Ticket Information"
										extra={(CAN_VIEW_MODULE(25)) ? <Button icon={<PrinterOutlined/>} loading={this.state.printLoading} onClick={this.getPrintVersion}>Print Copy</Button> : ""}
									>
										<Row gutter="16">
											<Col xs={24} sm={24} md={24} lg={14}>
												<h2>{ticket.code} <Tag color={ticket.type_color.class}>{ticket.type_name}</Tag></h2>
												<span className="text-muted mb-2">{ticket.status_name}</span>
												<Row>
													<Col xs={24} sm={24} md={24} className="mt-3">
														<Icon type={FieldTimeOutlined} className="text-primary font-size-md"/>
														<span className="font-weight-semibold ml-2">{ticket.timeout? ticket.timeout : moment(ticket.finished_time).format("DD/MM/YYYY hh:mm A")}</span>
													</Col>
													<Col xs={24} sm={24} md={24} className="mt-2">
														<Icon type={UserOutlined} className="text-primary font-size-md"/>
														<span className="font-weight-semibold ml-2">{ticket.agent.full_name}</span>
													</Col>
													{ticket.operation_time ?
														<Col xs={24} sm={24} md={24} className="mt-2">
															<Icon type={HourglassOutlined} className="text-primary font-size-md"/>
															<span className="font-weight-semibold ml-2">Finished in {humanizeDuration(ticket.operation_time*60000)}</span>
														</Col>
														: ""}
													{ticket.response_time ?
														<Col xs={24} sm={24} md={24} className="mt-2">
															<Icon type={CarOutlined} className="text-primary font-size-md"/>
															<span className="font-weight-semibold ml-2">Respond in {humanizeDuration(ticket.response_time*60000)}</span>
														</Col>
														: ""}
													{ticket.repair_time ?
														<Col xs={24} sm={24} md={24} className="mt-2">
															<Icon type={ToolOutlined} className="text-primary font-size-md"/>
															<span className="font-weight-semibold ml-2">Reparing in {humanizeDuration(ticket.repair_time*60000)}</span>
														</Col>
														: ""}
													<Col xs={24} sm={24} md={24} className="mt-2">
														<Icon type={CalendarOutlined} className="text-primary font-size-md"/>
														<span className="font-weight-semibold ml-2">{moment(ticket.start_time).format("DD MMM YY hh:mm A")}</span>
													</Col>
													<Col xs={24} sm={24} md={24} className="mt-2">
														<Icon type={FolderOutlined} className="text-primary font-size-md"/>
														<span className="font-weight-semibold ml-2">{(ticket.category) ? ticket.category.title : "Not Specified"}</span>
													</Col>
													<Col xs={24} sm={24} md={24} className="mt-2">
														<Icon type={DownloadOutlined} className="text-primary font-size-md"/>
														<span className="font-weight-semibold ml-2">{(ticket.attachment) ? ticket.attachment.split(".")[1].toUpperCase() + " File" : "No Attachment"}</span>
													</Col>
												</Row>
											</Col>
											<Col xs={24} sm={24} md={24} lg={10}>
												<Row gutter={[8, 8]}>
													<Col span={24} className="text-center">
														<Progress type="circle" percent={ticket.progress} />
													</Col>
													<Col span={24} className="text-center">
														<Tag color="geekblue" className="mr-0">{ticket.district.name} > {ticket.zone.name}</Tag>
													</Col>
													{ticket.repeated ?
														<Col span={24} className="text-center">
															<Tag className="mr-0" style={{backgroundColor: "#ff4646", color: "#fff", border: "none"}}>
																<FontAwesomeIcon icon={faExclamationTriangle} style={{color:"#fff"}} /> Repeated Call
															</Tag>
														</Col> : ""}
												</Row>
											</Col>
										</Row>
										<div className="mt-4 bg-gray-lightest p-3 rounded" style={{minHeight: 150}}>
											<Row>
												<Col sm={24} md={24}>
													<span className="text-dark font-size-base">{ticket.details}</span>
												</Col>
											</Row>
										</div>
										{(ticket.attachment) ?
											<div className="mt-4">
												<Button type="primary" onClick={() => this.openExternalLink(ticket.attachment_link)} block icon={<DownloadOutlined />}>Download</Button>
											</div> : ""
										}
									</Card>
									<Staff staff={ticket.staffin} startChat={this.startChat} chatLoading={this.state.chatLoading} />
								</Col>
								<Col xs={24} sm={24} md={16}>
									<RescheduleAction ticket={ticket} rescheduleFeedback={this.rescheduleFeedback} displayState={this.state.rescheduleFeedbackBlock} loadingState={this.state.rescheduleFeedbackLoading} />
									<WaitingAction ticket={ticket} gotoAssign={this.gotoAssign} openModal={this.openModal} />
									<TicketActions actions={ticket.actions} created={ticket.start_time} finished={ticket.finished_time} openModal={this.openModal} />
									{ticket.consumed_materials.length > 0 ? <ConsumedMaterials items={ticket.consumed_materials} /> : ""}
								</Col>
							</Row>
						</div>
					</>
				}
				<Modal
					title={this.state.modalTitle}
					visible={this.state.modalVisible}
					footer={null}
					destroyOnClose={true}
					onCancel={this.closeModal}
				>{this.state.modalContent}</Modal>
			</>
		)
	}
}

const SkeletonView = () => {
	return <>
		<PageHeaderAlt bgcolor={true} className="bg-center" cssClass="bg-primary" overlap>
			<div className="container text-center">
				<div className="py-5 my-md-5">
				</div>
			</div>
		</PageHeaderAlt>
		<div className="container my-4">
			<Card>
				<Row justify="center">
					<Col sm={24} md={23}>
						<div className="d-md-flex">
							<div className="rounded p-2 bg-white shadow-sm mx-auto" style={{'marginTop': '-3.5rem', 'maxWidth': 166}}>
								<Skeleton.Avatar size={150} shape="square" />
							</div>
							<div className="ml-md-4 w-100">
								<Flex alignItems="center" mobileFlex={false} className="mb-3 text-md-left text-center">
									<Skeleton className="mb-0 w-25" active={true} paragraph={false} title={{width: 120}} />
									<div className="ml-md-3 mt-3 mt-md-0">
										<Skeleton.Button size="small" shape="round" />
									</div>
								</Flex>
								<Row gutter="16">
									<Col sm={24} md={8}>
										<div className="mt-0 mr-3 text-muted text-md-left text-center">
											<Skeleton active={true} paragraph={false} />
											<Skeleton active={true} paragraph={false} />
										</div>
									</Col>
									<Col xs={24} sm={24} md={8}>
										<Row className="mb-2">
											<Col xs={12} sm={12} md={9}>
												<Icon type={MailOutlined} className="text-primary font-size-md" />
												<span className="text-muted ml-2">Email:</span>
											</Col>
											<Col xs={12} sm={12} md={15}>
												<Skeleton active={true} paragraph={false} title={{width: 80}} />
											</Col>
										</Row>
										<Row>
											<Col xs={12} sm={12} md={9}>
												<Icon type={PhoneOutlined} className="text-primary font-size-md"/>
												<span className="text-muted ml-2">Phone:</span>
											</Col>
											<Col xs={12} sm={12} md={15}>
												<Skeleton active={true} paragraph={false} title={{width: 80}} />
											</Col>
										</Row>
									</Col>
									<Col xs={24} sm={24} md={8}>
										<Row className="mb-2">
											<Col xs={12} sm={12} md={9}>
												<Icon type={MobileOutlined} className="text-primary font-size-md"/>
												<span className="text-muted ml-2">Mobile:</span>
											</Col>
											<Col xs={12} sm={12} md={15}>
												<Skeleton active={true} paragraph={false} title={{width: 80}} />
											</Col>
										</Row>
										<Row className="mb-2">
											<Col xs={12} sm={12} md={9}>
												<Icon type={SmileOutlined} className="text-primary font-size-md"/>
												<span className="text-muted ml-2">Review:</span>
											</Col>
											<Col xs={12} sm={12} md={15}>
												<Skeleton active={true} paragraph={false} />
											</Col>
										</Row>
									</Col>
								</Row>
							</div>
						</div>
					</Col>
				</Row>
			</Card>
			<Row gutter="16">
				<Col xs={24} sm={24} md={8}>
					<Card title="Ticket Information">
						<Row gutter="16">
							<Col xs={24} sm={24} md={14}>
								<Skeleton active={true} paragraph={false} />
								<Skeleton className="mb-2" active={true} paragraph={false} />
								<Row justify="center" align="top">
									<Col xs={24} sm={24} md={24} className="mt-3">
										<Skeleton.Avatar active={true} size={16} shape="circle" />
										<Skeleton className="w-50 ml-1 d-inline-block" active={true} paragraph={false} title={{width: 80}} />
									</Col>
									<Col xs={24} sm={24} md={24} className="mt-2">
										<Skeleton.Avatar active={true} size={16} shape="circle" />
										<Skeleton className="w-50 ml-1 d-inline-block" active={true} paragraph={false} title={{width: 80}} />
									</Col>
									<Col xs={24} sm={24} md={24} className="mt-2">
										<Skeleton.Avatar active={true} size={16} shape="circle" />
										<Skeleton className="w-50 ml-1 d-inline-block" active={true} paragraph={false} title={{width: 80}} />
									</Col>
								</Row>
							</Col>
							<Col xs={24} sm={24} md={10}>
								<Row gutter={[8, 8]}>
									<Col span={24}>
										<Skeleton.Avatar size={120} shape="circle" />
									</Col>
									<Col span={24} className="text-center">
										<Skeleton active={true} paragraph={false} />
									</Col>
								</Row>
							</Col>
						</Row>
						<div className="mt-4 bg-gray-lightest p-3 rounded" style={{minHeight: 150}}>
							<Row>
								<Col sm={24} md={24}>
									<Skeleton active={true} paragraph={{ rows: 3 }} />
								</Col>
							</Row>
						</div>
						<div className="mt-4">
							<Skeleton.Button shape="round" className="d-block w-100" />
						</div>
					</Card>
					<Card title="Staff In">
						<Skeleton active={true} avatar />
						<Skeleton active={true} avatar />
						<Skeleton active={true} avatar />
					</Card>
				</Col>
				<Col xs={24} sm={24} md={16}>
					<Card title="Procedures">
						<div className="mb-3">
							<Row>
								<Col sm={24} md={22}>
									<Timeline mode="left">
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
										<Timeline.Item color="gray" label={<Skeleton active={true} paragraph={false} />}>
											<Skeleton active={true} paragraph={false} />
										</Timeline.Item>
									</Timeline>
								</Col>
							</Row>
						</div>
					</Card>
					<Card title="Consumed Materials">
						<Skeleton active={true} avatar />
						<Skeleton active={true} avatar />
						<Skeleton active={true} avatar />
						<Skeleton active={true} avatar />
					</Card>
				</Col>
			</Row>
		</div>
	</>
}

export default ViewTicket
