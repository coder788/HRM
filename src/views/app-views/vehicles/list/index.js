import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input, Select} from 'antd';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, WEB_CONFIG} from 'configs/AppConfig';

const {Option} = Select;

export class VehicleList extends Component {
	state = {
		vehicle: [],
		reqParams: {query: "", type: ""},
		loading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
	}

	getVehicles = (params = {}) => {
		apiService.getVehicles({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"query": this.state.reqParams.query,
			"type": this.state.reqParams.type,
		}).then(resp => {
			this.setState({
				vehicle: resp.data,
				loading: false,
				pagination: {
					current: params.pagination.current,
					pageSize: resp.per_page,
					total: resp.total,
				},
			})
		})
	}

	componentDidMount() {
		const { pagination } = this.state;
		this.getVehicles({ pagination });
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getVehicles({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteVehicle = vehicleId => {
		this.setState({loading: true})
		apiService.deleteVehicle(vehicleId).then(resp => {
			this.setState({
				loading: false,
				vehicle: this.state.vehicle.filter(item => item.id !== vehicleId),
			})
			message.success({ content: `Deleted item #${vehicleId} from vehicle`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}

	render() {
		const { vehicle, pagination, loading, selectedRowKeys } = this.state;

		const newVehicleItem = () => {
			this.props.history.push('/app/vehicles/add');
		}

		const editVehicle = vehicleID => {
			this.props.history.push(`/app/vehicles/edit/${vehicleID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getVehicles({ pagination }))
		}

		const changeType = type => {
			this.setState({"reqParams": {type: type}}, () => this.getVehicles({ pagination }))
		}

		const tableColumns = [
			{
				title: 'Information',
				dataIndex: 'plate_num',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus src={record.photo_link} name={record.title} subTitle={record.plate_num} />
					</div>
				),
				sorter: {
					compare: (a, b) => {
						a = a.plate_num.toLowerCase();
						b = b.plate_num.toLowerCase();
						return a > b ? -1 : b > a ? 1 : 0;
					},
				},
			},
			{
				title: 'Type',
				dataIndex: 'type_name',
				render: type_name => (
					<Tag color="black">{type_name}</Tag>
				),
				sorter: {
					compare: (a, b) => a.type_name.length - b.type_name.length,
				},
			},
			{
				title: 'Created Date',
				dataIndex: 'created_at',
				render: created_at => (
					<span>{moment(created_at).format("DD/MM/YYYY")} </span>
				),
				sorter: (a, b) => moment(a.created_at) - moment(b.created_at)
			},
			{
				title: '',
				dataIndex: 'actions',
				render: (_, elm) => (
					<div className="text-right">
						{(CAN_VIEW_MODULE(70)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => {editVehicle(elm.id)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(74)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteVehicle(elm.id)}} okText="Yes" cancelText="No">
							<Tooltip title="Delete">
								<Button danger icon={<DeleteOutlined />} size="small"/>
							</Tooltip>
						</Popconfirm> : ""}
					</div>
				)
			}
		];

		return (
			<Card>
				<Flex alignItems="center" justifyContent="between" mobileFlex={false}>
					<Flex className="mb-1" mobileFlex={false}>
						<div className="mr-md-3 mb-3">
							<Input placeholder="Search" prefix={<SearchOutlined />} onChange={e => onSearch(e)}/>
						</div>
						<div className="mb-3">
							<Select onChange={changeType} placeholder="Filter By Type" style={{width: 180}}>
								<Option value="mobile">Mobile Workshop</Option>
								<Option value="pickup">Pick Up</Option>
							</Select>
						</div>
					</Flex>
					{(CAN_VIEW_MODULE(73)) ?
					<div>
						<Button onClick={newVehicleItem} type="primary" icon={<PlusCircleOutlined />} block>New Vehicle</Button>
					</div> : ""}
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={vehicle}
						pagination={pagination}
						onChange={this.handleTableChange}
						loading={loading}
						rowKey='id'
						rowSelection={{
							selectedRowKeys: selectedRowKeys,
							type: 'checkbox',
							preserveSelectedRowKeys: false,
							...rowSelection,
						}}
					/>
				</div>
			</Card>
		)
	}
}

export default VehicleList
