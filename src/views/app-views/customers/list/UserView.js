import React, { Component } from 'react';
import {Avatar, Drawer, Divider, Row, Col, Card, Skeleton, Button, Tag} from 'antd';
import {
	MobileOutlined,
	MailOutlined,
	UserOutlined,
	CompassOutlined,
	PushpinOutlined,
	PhoneOutlined,
	HomeOutlined, ScheduleOutlined, CrownOutlined, WarningOutlined, ShoppingCartOutlined, AlertOutlined
} from '@ant-design/icons';
import moment from "moment";
import apiService from "services/ApiService";
import StatisticWidget from "components/shared-components/StatisticWidget";

export class UserView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			reportData: false,
			start: moment().subtract(1, "year"),
			end: moment()
		}
	}

	componentDidUpdate(prevProps) {
		if(! prevProps.data?.id && this.props.data?.id){
			this.loadReports()
		}
	}

	loadReports = () => {
		this.setState({loading: true})
		apiService.getReports(`customers/${this.props.data.id}`, {
			start: moment(this.state.start).format('YYYY-MM-DD'),
			end: moment(this.state.end).format('YYYY-MM-DD')
		}).then(resp => {
			this.setState({reportData: resp}, () => this.setState({loading: false}))
		})
	}

	gotoTickets = () => {
		this.props.history.push(`/app/tickets/list#customer=${this.props.data?.id}`)
	}

	render() {
		const { data, visible, close} = this.props;

		const parseAsInt = (number, asString) => (
			isNaN(parseInt(number)) ? asString ? "0" : 0 : asString ? number.toString() : parseInt(number)
		)

		return (
			<Drawer
				width={400}
				placement="right"
				onClose={close}
				closable={false}
				visible={visible}
			>
				<div className="text-center mt-3">
					<Avatar size={120} src={`https://www.gravatar.com/avatar/${data?.gravatar_hash}?s=150&r=g&d=mm`} />
					<h3 className="mt-2 mb-0">
						{data?.full_name}
						<Tag icon={<CrownOutlined />} className="ml-2 position-absolute">{parseAsInt(this.state.reportData.ratingAvg?.avgValue)}</Tag>
					</h3>
					<span className="text-muted">{data?.email}</span>
				</div>
				{this.state.loading ? <DrawSkeleton /> : ""}
				{this.state.reportData ?
				<div className="mt-4">
					<Row gutter={16}>
						<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
							<StatisticWidget
								title="Issued Tickets"
								value={parseAsInt(this.state.reportData.issuedTickets)}
								status={<ScheduleOutlined />}
								statusColor="gray"
							/>
							<StatisticWidget
								title="Spare Parts"
								value={parseAsInt(this.state.reportData.consumedStockItems)}
								status={<ShoppingCartOutlined />}
								statusColor="danger"
							/>
						</Col>
						<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
							<StatisticWidget
								title="Repeated Calls"
								value={parseAsInt(this.state.reportData.repeatedTickets)}
								status={<AlertOutlined />}
								statusColor="danger"
							/>
							<StatisticWidget
								title="Cancelled Time"
								value={parseAsInt(this.state.reportData.terminatedTickets)}
								status={<WarningOutlined />}
								statusColor="danger"
							/>
						</Col>
					</Row>
				</div> : ""}
				<Divider dashed />
				<div className="">
					<h6 className="text-muted text-uppercase mb-3">Account details</h6>
					<p>
						<UserOutlined />
						<span className="ml-3 text-dark">ID: {data?.id}</span>
					</p>
					<p>
						<PushpinOutlined />
						<span className="ml-3 text-dark">{data?.district.name} > {data?.zone.name}</span>
					</p>
					<p>
						<HomeOutlined />
						<span className="ml-3 text-dark">{data?.house_num}</span>
					</p>
				</div>
				<div className="mt-5">
					<h6 className="text-muted text-uppercase mb-3">CONTACT</h6>
					<p>
						<MobileOutlined />
						<span className="ml-3 text-dark">{data?.mobile}</span>
					</p>
					<p>
						<PhoneOutlined />
						<span className="ml-3 text-dark">{data?.phone}</span>
					</p>
					<p>
						<MailOutlined />
						<span className="ml-3 text-dark">{data?.email? data?.email: '-'}</span>
					</p>
					<p>
						<CompassOutlined />
						<span className="ml-3 text-dark">{data?.address}</span>
					</p>
				</div>
				<div className="mt-3 mb-3">
					<Button type="primary" block onClick={this.gotoTickets}>
						View All Tickets
					</Button>
				</div>
			</Drawer>
		)
	}
}

const DrawSkeleton = () => (
	<div className="mt-4">
		<h6 className="text-muted text-uppercase mb-3">REPORTS</h6>
		<Row gutter={16}>
			<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
				<Card><Skeleton active={true} /></Card>
				<Card><Skeleton active={true} /></Card>
			</Col>
			<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
				<Card><Skeleton active={true} /></Card>
				<Card><Skeleton active={true} /></Card>
			</Col>
		</Row>
	</div>
)

export default UserView
