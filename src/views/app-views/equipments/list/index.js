import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input, Select, Spin} from 'antd';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE} from 'configs/AppConfig';

const {Option} = Select;

export class EquipmentList extends Component {
	state = {
		equipment: [],
		customers: [],
		reqParams: {query: "", customer_id: ""},
		loading: true,
		fetchingCustomers: false,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
	}

	getEquipments = (params = {}) => {
		apiService.getEquipments({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"query": this.state.reqParams.query,
			"customer_id": this.state.reqParams.customer_id,
		}).then(resp => {
			this.setState({
				equipment: resp.data,
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
		this.getEquipments({ pagination });
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getEquipments({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteEquipment = equipmentId => {
		this.setState({loading: true})
		apiService.deleteEquipment(equipmentId).then(resp => {
			this.setState({
				loading: false,
				equipment: this.state.equipment.filter(item => item.id !== equipmentId),
			})
			message.success({ content: `Deleted item #${equipmentId} from equipment`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}

	render() {
		const { equipment, pagination, loading, selectedRowKeys } = this.state;

		const fetchUser = value => {
			this.setState({customers: [], fetchingCustomers: true})
			apiService.searchCustomers(value).then(resp => {
				this.setState({customers: resp.data, fetchingCustomers: false})
			})
		};

		const newEquipmentItem = () => {
			this.props.history.push('/app/equipments/add');
		}

		const editEquipment = equipmentID => {
			this.props.history.push(`/app/equipments/edit/${equipmentID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getEquipments({ pagination }))
		}

		const changeCustomer = customer_id => {
			this.setState({"reqParams": {customer_id: customer_id}}, () => this.getEquipments({ pagination }))
		}

		const tableColumns = [
			{
				title: 'Information',
				dataIndex: 'number',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus src={record.photo_link} name={record.title} subTitle={record.number} />
					</div>
				),
				sorter: {
					compare: (a, b) => {
						a = a.number.toLowerCase();
						b = b.number.toLowerCase();
						return a > b ? -1 : b > a ? 1 : 0;
					},
				},
			},
			{
				title: 'Customer',
				dataIndex: 'customer',
				render: customer => (
					<div className="d-flex">
						<AvatarStatus text={customer.fname.substring(0, 1)+customer.lname.substring(0, 1)} name={customer.full_name} subTitle={customer.house_num}/>
					</div>
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
						{(CAN_VIEW_MODULE(76)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => {editEquipment(elm.id)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(80)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteEquipment(elm.id)}} okText="Yes" cancelText="No">
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
							<Select
								allowClear
								labelInValue={false}
								placeholder="Filter By Customer"
								notFoundContent={this.state.fetchingCustomers ? <Spin size="small"/> : null}
								showSearch={true}
								filterOption={false}
								onSearch={fetchUser}
								onChange={changeCustomer}
								style={{width: 300}}
							>
								{this.state.customers.map(customer => (
									<Option key={customer.id} value={customer.id}>
										<Flex alignItems="center" justifyContent="start" flexDirection="row">
											<span className="font-weight-bold text-dark d-block">{customer.full_name}</span>
											<Tag color="blue" className="ml-2">{customer.house_num}</Tag>
										</Flex>
									</Option>
								))}
							</Select>
						</div>
					</Flex>
					{(CAN_VIEW_MODULE(79)) ?
					<div>
						<Button onClick={newEquipmentItem} type="primary" icon={<PlusCircleOutlined />} block>New Equipment</Button>
					</div> : ""}
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={equipment}
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

export default EquipmentList
