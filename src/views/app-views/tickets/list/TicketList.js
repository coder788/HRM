import React, {useEffect, useState} from 'react'
import PageHeaderAlt from 'components/layout-components/PageHeaderAlt'
import {Radio, Button, Row, Col, Tooltip, Tag, Progress, Avatar, Menu, Card, Popover, Select, Modal, Cascader, DatePicker, Spin, Empty, Checkbox, Input, Pagination} from 'antd';
import Icon, {AppstoreOutlined, UnorderedListOutlined, PlusOutlined, AlertOutlined, CalendarOutlined, ArrowUpOutlined, ArrowDownOutlined} from '@ant-design/icons';
import { useHistory } from "react-router-dom";
import {
	InteractionOutlined,
	UserOutlined,
	ClockCircleOutlined,
	EyeOutlined, 
	EditOutlined,
	DeleteOutlined
} from '@ant-design/icons';
import utils from 'utils';
import { COLORS } from 'constants/ChartConstant';
import Flex from 'components/shared-components/Flex';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown'
import apiService from 'services/ApiService'
import { Skeleton } from 'antd';
import {CAN_VIEW_MODULE, getAllZones, WEB_CONFIG} from "configs/AppConfig";
import moment from 'moment';

const VIEW_LIST = 'LIST';
const VIEW_GRID = 'GRID';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = "YYYY-MM-DD";
let searchForm = {}

const ItemAction = ({id, removeId, editProfile, viewProfile}) => (
	<EllipsisDropdown
		menu={
			<Menu>
				{(CAN_VIEW_MODULE(22)) ?
				<Menu.Item key="0" onClick={() => viewProfile(id)}>
					<EyeOutlined />
					<span>View</span>
				</Menu.Item> : "" }
				{(CAN_VIEW_MODULE(29)) ?
				<Menu.Item key="1" onClick={() => editProfile(id)}>
					<EditOutlined />
					<span>Edit</span>
				</Menu.Item> : "" }
				{(CAN_VIEW_MODULE(21)) ? <Menu.Divider /> : ""}
				{(CAN_VIEW_MODULE(21)) ?
					<Menu.Item key="2" onClick={() => removeId(id)}>
						<DeleteOutlined />
						<span>Delete Ticket</span>
					</Menu.Item> : "" }
			</Menu>
		}
	/>
)

const ItemHeader = ({title, type, typecolor, status, followup, repeated}) => (
	<div>
		<h4 className="mb-0">
			{title} <Tag color={typecolor}>{type}</Tag>{followup? <Tag color="blue">FOLLOW UP</Tag> : ""}
			{repeated ? <Tag style={{backgroundColor: "#ff4646", color: "#fff", border: "none"}}>Repeated Call</Tag> : ""}
		</h4>
		<span className="text-muted mb-2">{status}</span>
	</div>
)

const ItemInfo = ({proceduresCount, statusColor, dayleft, customer, finishedTime, extra}) => (
	<Flex alignItems="center">
		<div className="mr-2">
			<Tooltip title="Procedures">
				<InteractionOutlined className="text-muted font-size-md"/>
				<span className="ml-1 text-muted">{proceduresCount}</span>
			</Tooltip>
		</div>
		<div className="mr-4">
			<Popover title={customer.full_name} content="Customer">
				<UserOutlined className="text-muted font-size-md"/>
				<span className="ml-1 text-muted">{customer.fname}</span>
			</Popover>
		</div>
		<div>
			{statusColor? <Tag className={statusColor === "none"? 'bg-gray-lightest' : ''} color={statusColor !== "none"? statusColor : ''}>
				<ClockCircleOutlined />
				<span className="ml-2 font-weight-semibold">{dayleft}</span>
			</Tag> : <Tooltip title="Finished Time"><Tag color="green"><ClockCircleOutlined /><span className="ml-2 font-weight-semibold">{moment(finishedTime).format("DD/MM/YY hh:mm A")}</span></Tag></Tooltip>}
		</div>
		{(extra !== '')? <div className="mr-2">{extra}</div> : ''}
	</Flex>
)

const ItemProgress = ({progression}) => (
	<Progress percent={progression} strokeColor={getProgressStatusColor(progression)} size="small"/>
)

const ItemMember = ({staff}) => (
	<>
		{staff.map((elm, i) => (
				i <= 2 ?
					<Popover title={elm.profile.full_name} content={<Tag color={elm.profile.role.color}>{elm.profile.role.title}</Tag>} key={`avatar-${i}`}>
						<Avatar size="small" className={`ml-1 cursor-pointer ant-avatar-cyan`} src={elm.profile.photo_link} >
							{elm.profile.photo_link? '' : <span className="font-weight-semibold font-size-sm">{utils.getNameInitial(elm.profile.full_name)}</span>}
						</Avatar>
					</Popover>
			:
			null
		))}
		{staff.length > 3 ?
			<Tooltip title={`${staff.length - 3} More`}>
				<Avatar size={25} className="ml-1 cursor-pointer bg-white border font-size-sm">
					<span className="text-gray-light font-weight-semibold">+{staff.length - 3}</span>
				</Avatar>
			</Tooltip>
			:
			null
		}
	</>
)

const ListItem = ({ data, removeId, editProfile, viewProfile }) => (
	<div className="bg-white rounded p-3 mb-3 border">
		<Row align="middle">
    	<Col xs={24} sm={24} md={6}>
				<ItemHeader title={data.code} type={data.type_name} typecolor={data.type_color.class} repeated={data.repeated} status={data.status_name} followup={data.followup_at} />
			</Col>
			<Col xs={24} sm={24} md={8}>
				<ItemInfo
					proceduresCount={data.actions_count}
					customer={data.customer}
					statusColor={data.timeout_color}
					dayleft={data.timeout}
					finishedTime={data.finished_time}
					extra={<Tag color="orange">{data.district.name} > {data.zone.name}</Tag>}
				/>
			</Col>
			<Col xs={24} sm={24} md={5}>
				<ItemProgress progression={data.progress} />
			</Col>
			<Col xs={24} sm={24} md={3}>
				<div className="ml-0 ml-md-3">
					<ItemMember staff={data.staffin}/>
				</div>
			</Col>
			<Col xs={24} sm={24} md={2}>
				<div className="text-right">
					<ItemAction id={data.id} removeId={removeId} editProfile={editProfile} viewProfile={viewProfile} />
				</div>
			</Col>
		</Row>
	</div>
)

const GridItem = ({ data, removeId, editProfile, viewProfile }) => (
	<Card>
		<Flex alignItems="center" justifyContent="between">
			<ItemHeader title={data.code} type={data.type_name} typecolor={data.type_color.class} repeated={data.repeated} status={data.status_name} followup={data.followup_at}/>
			<ItemAction id={data.id} removeId={removeId} editProfile={editProfile} viewProfile={viewProfile} />
		</Flex>
		<div className="mt-2">
			<ItemInfo
				proceduresCount={data.actions_count}
				customer={data.customer}
				statusColor={data.timeout_color}
				dayleft={data.timeout}
				finishedTime={data.finished_time}
				extra=""
			/>
		</div>
		<div className="mt-3">
			<ItemProgress progression={data.progress} />
		</div>
		<div className="mt-3 mr-5">
			<Row>
				<Col xs={24} sm={24} md={18}>
					<ItemMember staff={data.staffin}/>
				</Col>
				<Col xs={24} sm={24} md={6}>
					<Tag color="orange">{data.district.name} > {data.zone.name}</Tag>
				</Col>
			</Row>
		</div>
	</Card>
)

const getProgressStatusColor = progress => {
	if(progress >= 80) {
		return COLORS[1]
	}
	if(progress < 60 && progress > 30) {
		return COLORS[3]
	}
	if(progress < 30) {
		return COLORS[2]
	}
	return COLORS[0]
}

const TicketList = () => {
	const [view, setView] = useState(VIEW_GRID);
	const [list, setList] = useState(false);
	const [customers, setCustomers] = useState([]);
	const [fetching, setFetchingState] = useState(false);
	const [archiveIsOn, setArchiveIsOn] = useState(false);
	const [dateRange, setDateRange] = useState(["",""]);
	const [pagingData, setPaging] = useState({current: 1, total: 0});
	let history = useHistory();

	useEffect(() => {
		searchForm = {in_action: 1}
		startSearch()
	}, [])

	const newTicket = () => {
		history.push('/app/tickets/new');
	}

	const onChangeProjectView = e => {
		setView(e.target.value)
	}

	const onChangeProjectOrder = e => {
		searchForm.sort = e.target.value
		startSearch()
	}

	const	deleteItem = id => {
		confirm({
			title: 'Are you sure delete this ticket ?',
			content: 'There is no undo for this process',
			okText: 'Yes',
			okType: 'danger',
			cancelText: 'No',
			onOk() {
				apiService.delTicket(id).then(resp => {
					const data = list.filter(elm => elm.id !== id)
					setList(data)
				})
			},
			onCancel() {},
		});
	}

	const	editProfile = id => {
		history.push(`/app/tickets/edit/${id}`)
	}

	const	viewProfile = id => {
		history.push(`/app/tickets/view/${id}`)
	}

	const startSearch = (currPage) => {
		const params = hashResolver()
		setList(false);
		if(! currPage) currPage = pagingData.current
		searchForm.page = currPage
		if(params.staff){
			searchForm.staff_id = params.staff
		}
		if(params.customer){
			searchForm.customer_id = params.customer
		}
		console.log('search form', searchForm)
		apiService.getTickets(searchForm).then(resp => {
			setList(resp.data);
			setPaging({current: currPage, total: resp.total})
		})
	}

	const hashResolver = () => {
		let hash = window.location.hash.substr(1);

		return hash.split('&').reduce(function (res, item) {
			let parts = item.split('=');
			res[parts[0]] = parts[1];
			return res;
		}, {});
	}

	const onChangeType = e => {
		searchForm.type = e.target.value
		startSearch()
	}

	const onEnterQuery = e => {
		searchForm.query = e.target.value
		startSearch()
	}

	const onChangeDateType = e => {
		let date = []
		switch (e.target.value){
			case "today":
				date = [moment(), moment()]
				break
			case "week":
				date = [moment().subtract(7, 'days'), moment()]
				break
			case "month":
				date = [moment().subtract(30, 'days'), moment()]
				break
			default:
				date = ["", ""]
				break
		}
		if(e.target.value === "alltime"){
			searchForm.from_date = ""
			searchForm.to_date = ""
		} else {
			searchForm.from_date = date[0].format(dateFormat)
			searchForm.to_date = date[1].format(dateFormat)
		}
		setDateRange(date)
		startSearch()
	}

	const zoneCascChanged = value => {
		searchForm.zone_id = value[1]
		searchForm.dc_id = value[0]
		startSearch()
	}

	const onChangeDate = value => {
		setDateRange(value)
		searchForm.from_date = value[0].format('YYYY-MM-DD')
		searchForm.to_date = value[1].format('YYYY-MM-DD')
		startSearch()
	}

	const onChangeNeed = e => {
		searchForm.need_action = (e.target.checked)? 1 : ""
		startSearch()
	}

	const onChangeOpened = e => {
		searchForm.in_action = (e.target.checked)? "" : 1
		setArchiveIsOn(e.target.checked)
		startSearch()
	}

	const onChangeRCalls = e => {
		searchForm.r_calls = (e.target.checked)? 1 : ""
		startSearch()
	}

	const onChangeCustomer = select => {
		searchForm.customer_id = select ? select.value : ''
		startSearch()
	}

	const fetchUser = value => {
		setCustomers([])
		setFetchingState(true)
		apiService.searchCustomers(value).then(resp => {
			const data = resp.data.map(user => ({
				text: `${user.full_name}`,
				value: user.id,
			}));
			setCustomers(data)
			setFetchingState(false)
		})
	};

	const ticketTypes = WEB_CONFIG("settings").ticket_types

	const IconComponents = {
		AlertOutlined: AlertOutlined,
		CalendarOutlined: CalendarOutlined,
		EyeOutlined: EyeOutlined,
	}

	return (
		<>
			<PageHeaderAlt className="bg-white border-bottom">
				<div className="container-fluid">
					<Flex justifyContent="between" alignItems="center" className="py-4">
						<h2>Tickets</h2>
						<div>
							<Radio.Group className="ml-2" defaultValue="asc" onChange={e => onChangeProjectOrder(e)}>
								<Radio.Button value="asc"><ArrowUpOutlined /> Oldest</Radio.Button>
								<Radio.Button value="desc"><ArrowDownOutlined /> Recent</Radio.Button>
							</Radio.Group>
							<Radio.Group className="ml-2" defaultValue={VIEW_GRID} onChange={e => onChangeProjectView(e)}>
								<Radio.Button value={VIEW_GRID}><AppstoreOutlined /></Radio.Button>
								<Radio.Button value={VIEW_LIST}><UnorderedListOutlined /></Radio.Button>
							</Radio.Group>
							{(CAN_VIEW_MODULE(28)) ?
							<Button type="primary" className="ml-2" onClick={newTicket}>
								<PlusOutlined />
								<span>New</span>
							</Button> : ""}
						</div>
					</Flex>
					<Row>
						<Col xs={24} sm={24} md={24} lg={14} className="text-center mt-4">
							<Cascader options={getAllZones()} placeholder="All Districts" onChange={zoneCascChanged} />
							<Select
								allowClear
								labelInValue={true}
								placeholder="Select Customer"
								notFoundContent={fetching ? <Spin size="small" /> : null}
								showSearch={true}
								filterOption={false}
								onSearch={fetchUser}
								onChange={onChangeCustomer}
								className="ml-3"
								style={{width: 210}}
							>
								{customers.map(d => (
									<Option key={d.value} value={d.value}>{d.text}</Option>
								))}
							</Select>
							<Input placeholder="ID or Code" className="ml-3" style={{width: 130}} onPressEnter={e => onEnterQuery(e)} />
						</Col>
						<Col xs={24} sm={24} md={24} lg={10} className="text-center mt-4">
							<Radio.Group defaultValue="" name="type" onChange={e => onChangeType(e)} buttonStyle="solid">
								<Radio.Button value="">All</Radio.Button>
								{
									ticketTypes.map(ticketType => <Radio.Button key={ticketType.name} style={{color: ticketType.color}} value={ticketType.name}>
										<Icon style={{ fontSize: '14px', color: ticketType.color, padding: 5, backgroundColor: ticketType.bgcolor }} className="rounded-circle" component={IconComponents[ticketType.icon]} /> {ticketType.title}
									</Radio.Button>)
								}
							</Radio.Group>
						</Col>
					</Row>
					<Row className="mt-3">
						<Col xs={24} sm={24} md={24} lg={14} className="text-center mt-4">
							<RangePicker className={archiveIsOn ? "" : "d-none"} onChange={onChangeDate} value={dateRange} />
							<Checkbox onChange={onChangeNeed} className="ml-3">Need action</Checkbox>
							<Checkbox onChange={onChangeRCalls} className="ml-3">Repeated Calls</Checkbox>
							<Checkbox onChange={onChangeOpened} defaultChecked={archiveIsOn} className="ml-3">Show History</Checkbox>
						</Col>
						<Col xs={24} sm={24} md={24} lg={10} className={`text-center mt-4 ${archiveIsOn ? '' : 'd-none'}`}>
							<Radio.Group defaultValue="alltime" onChange={e => onChangeDateType(e)} buttonStyle="solid">
								<Radio.Button value="alltime">All Time</Radio.Button>
								<Radio.Button value="today">Today</Radio.Button>
								<Radio.Button value="week">Last Week</Radio.Button>
								<Radio.Button value="month">Last Month</Radio.Button>
							</Radio.Group>
						</Col>
					</Row>
				</div>
			</PageHeaderAlt>
			<div className={`my-4 ${view === VIEW_LIST? 'container' : 'container-fluid'}`}>
				{
					!list ? <SekeltonView/> :
					list && list.length === 0 ? <Empty /> :
					view === VIEW_LIST ?
					list.map(elm => <ListItem data={elm} removeId={id => deleteItem(id)} editProfile={id => editProfile(id)} viewProfile={id => viewProfile(id)} key={elm.id} />)
					:
					<Row gutter={16}>
						{list.map(elm => (
							<Col xs={24} sm={24} lg={8} xl={8} xxl={6} key={elm.id}>
								<GridItem data={elm} removeId={id => deleteItem(id)} editProfile={id => editProfile(id)} viewProfile={id => viewProfile(id)} />
							</Col>
						))}
					</Row>
				}
				<div className="text-center mt-3">
					<Pagination current={pagingData.current} onChange={startSearch} total={pagingData.total} pageSize={20} hideOnSinglePage={true} />
				</div>
			</div>
		</>
	)
}

const SekeltonView = () => {
	return <>
		<Row gutter={16}>
			{[1,2,3,4,5,6,7,8].map(elm => (
				<Col xs={24} sm={24} lg={8} xl={8} xxl={6} key={elm}>
					<Card>
						<Flex alignItems="center" justifyContent="between">
							<Skeleton paragraph={false} className="w-50" />
						</Flex>
						<div className="mt-2">
							<Skeleton paragraph={false} />
							<Skeleton paragraph={false} />
							<Skeleton paragraph={false} />
						</div>
						<div className="mt-3">
							<Skeleton paragraph={false} />
						</div>
						<div className="mt-3 mr-5">
							<Row>
								<Col xs={24} sm={24} md={18}>
									<Skeleton.Avatar size={32} />
									<Skeleton.Avatar size={32} />
									<Skeleton.Avatar size={32} />
								</Col>
								<Col xs={24} sm={24} md={6}>
									<Skeleton paragraph={false} />
								</Col>
							</Row>
						</div>
					</Card>
				</Col>
			))}
		</Row>
	</>
}

export default TicketList
