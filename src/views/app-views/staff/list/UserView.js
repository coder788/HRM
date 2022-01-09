import React, { Component } from 'react';
import {Avatar, Drawer, Divider, Col, Row, Card, Skeleton, Button, Tag} from 'antd';
import {MobileOutlined, MailOutlined, UserOutlined, CompassOutlined, CalendarOutlined, CrownOutlined, ScheduleOutlined, ShoppingCartOutlined, CarOutlined, FieldTimeOutlined, WarningOutlined, AlertOutlined} from '@ant-design/icons';
import apiService from "services/ApiService";
import moment from "moment";
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
			console.log(prevProps.data?.id)
			if(["techboy","delivery"].includes(this.props.data.role.name)){
				this.loadReports()
				console.log("loading " + this.props.data.id)
			} else {
				this.setState({reportData: false})
			}
		}
	}

	loadReports = () => {
		this.setState({loading: true})
		apiService.getReports(`staff/${this.props.data.id}`, {
			start: moment(this.state.start).format('YYYY-MM-DD'),
			end: moment(this.state.end).format('YYYY-MM-DD')
		}).then(resp => {
			this.setState({reportData: resp}, () => this.setState({loading: false}))
		})
	}

	gotoTickets = () => {
		this.props.history.push(`/app/tickets/list#staff=${this.props.data?.id}`)
	}

	render() {
		const { data, visible, close} = this.props;

		const parseAsInt = (number, asString) => (
			isNaN(parseInt(number)) ? asString ? "0" : 0 : asString ? number.toString() : parseInt(number)
		)

		return (
			<Drawer
				width={["techboy","delivery"].includes(data?.role.name) ? 400 : 300}
				placement="right"
				onClose={close}
				closable={false}
				visible={visible}
			>
				<div className="text-center mt-3">
					<Avatar size={80} src={data?.photo_link} />
					<h3 className="mt-2 mb-0">
						{data?.full_name}
						{data?.role.name === "techboy" ? <Tag icon={<CrownOutlined />} className="ml-2 position-absolute">{parseAsInt(this.state.reportData.ratingAvg?.avgValue)}</Tag> : ""}
					</h3>
					<span className="text-muted">{data?.role.title}</span>
				</div>
				{this.state.loading ? <DrawSkeleton /> : ""}
				{this.state.reportData ?
					<div className="mt-4">
						{data?.role.name === "techboy" ?
							<Row gutter={16}>
								<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
									<StatisticWidget
										title="Issued Tickets"
										value={parseAsInt(this.state.reportData.issuedTickets)}
										status={<ScheduleOutlined />}
										statusColor="gray"
									/>
									<StatisticWidget
										title="Bad Response"
										value={parseAsInt(this.state.reportData.badResponseTime?.badCounter)}
										status={<FieldTimeOutlined />}
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
							</Row> :
							<Row gutter={16}>
								<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
									<StatisticWidget
										title="Issued Orders"
										value={parseAsInt(this.state.reportData.issuedTickets)}
										status={<ShoppingCartOutlined />}
										statusColor="gray"
									/>
								</Col>
								<Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
									<StatisticWidget
										title="Late Orders"
										value={parseAsInt(this.state.reportData.badDeliveryTime?.badCounter)}
										status={<CarOutlined />}
										statusColor="danger"
									/>
								</Col>
							</Row>}
					</div> : 	<Divider dashed /> }
				<div className={this.state.reportData ? "mt-3" : ""}>
					<h6 className="text-muted text-uppercase mb-3">Account details</h6>
					<p>
						<UserOutlined />
						<span className="ml-3 text-dark">ID: {data?.id}</span>
					</p>
					<p>
						<UserOutlined />
						<span className="ml-3 text-dark">Zone: {data?.district ? data.district.name : "Administrator"} {data?.zone ? `> ${data.zone.name}` : ""}</span>
					</p>
					<p>
						<CalendarOutlined />
						<span className="ml-3 text-dark">Born in {data?.userinfo.birthdate}</span>
					</p>
				</div>
				<div className="mt-5">
					<h6 className="text-muted text-uppercase mb-3">CONTACT</h6>
					<p>
						<MobileOutlined />
						<span className="ml-3 text-dark">{data?.mobile}</span>
					</p>
					<p>
						<MailOutlined />
						<span className="ml-3 text-dark">{data?.email? data?.email: '-'}</span>
					</p>
					<p>
						<CompassOutlined />
						<span className="ml-3 text-dark">{data?.userinfo.address ? data.userinfo.address : "NOT PROVIDED"}</span>
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
