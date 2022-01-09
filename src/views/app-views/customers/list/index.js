import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input, Cascader} from 'antd';
import {EyeOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import UserView from './UserView';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, getAllZones, WEB_CONFIG} from 'configs/AppConfig';

export class UserList extends Component {

	state = {
		users: [],
		zones: [],
		reqParams: {role_id: "", query: ""},
		userProfileVisible: false,
		loading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
		selectedUser: null
	}

	getZones() {
		this.setState({zones: getAllZones()})
	}
	
	getCustomers = (params = {}) => {
		apiService.getCustomers({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"name": this.state.reqParams.query,
			"dc_id": this.state.reqParams.dc_id,
			"zone_id": this.state.reqParams.zone_id
		}).then(resp => {
			this.setState({
				users: resp.data,
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
		this.getCustomers({ pagination });
		this.getZones()
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getCustomers({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteUser = userId => {
		this.setState({loading: true})
		apiService.deleteCustomer(userId).then(resp => {
			this.setState({
				loading: false,
				users: this.state.users.filter(item => item.id !== userId),
			})
			message.success({ content: `Deleted customer ${userId}`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}

	showUserProfile = userInfo => {
		this.setState({
			userProfileVisible: true,
			selectedUser: userInfo
		});
	};

	closeUserProfile = () => {
		this.setState({
			userProfileVisible: false,
			selectedUser: null
    });
	}

	render() {
		const { users, pagination, loading, userProfileVisible, selectedUser, selectedRowKeys } = this.state;

		const addCustomer = () => {
			this.props.history.push('/app/customers/add');
		}

		const editCustomerProfile = userID => {
			this.props.history.push(`/app/customers/edit/${userID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getCustomers({ pagination }))
		}

		const handleShowZones = values => {
			if(values) {
				this.setState({"reqParams": {dc_id: values[0], zone_id: values[1]}}, () => this.getCustomers({ pagination }))
			} else {
				this.setState({"reqParams": {dc_id: "", zone_id: values[1]}}, () => this.getCustomers({ pagination }))
			}
		}

		const tableColumns = [
			{
				title: 'Name',
				dataIndex: 'full_name',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus text={record.fname.substring(0, 1)+record.lname.substring(0, 1)} name={record.full_name} subTitle={record.house_num}/>
					</div>
				),
				sorter: {
					compare: (a, b) => {
						a = a.full_name.toLowerCase();
  						b = b.full_name.toLowerCase();
						return a > b ? -1 : b > a ? 1 : 0;
					},
				},
			},
			{
				title: 'District',
				dataIndex: 'district',
				render: district => (
					<Tag color="blue">{district.name}</Tag>
				),
				sorter: {
					compare: (a, b) => a.district.name.length - b.district.name.length,
				},
			},
			{
				title: 'Zone',
				dataIndex: 'zone',
				render: zone => (
					<Tag color="orange">{zone.name}</Tag>
				),
				sorter: {
					compare: (a, b) => a.zone.name.length - b.zone.name.length,
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
				title: 'Mobile',
				dataIndex: 'mobile',
				render: mobile => (
					<Tag color="blue">{mobile}</Tag>
				),
			},
			{
				title: '',
				dataIndex: 'actions',
				render: (_, elm) => (
					<div className="text-right">
						{(CAN_VIEW_MODULE(56)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => {editCustomerProfile(elm.id)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(55)) ?
						<Tooltip title="View">
							<Button type="default" className="mr-2" icon={<EyeOutlined />} onClick={() => {this.showUserProfile(elm)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(60)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteUser(elm.id)}} okText="Yes" cancelText="No">
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
							<Cascader options={this.state.zones} onChange={handleShowZones} allowClear placeholder="Filter By Zone"/>
						</div>
					</Flex>
					{(CAN_VIEW_MODULE(58)) ?
					<div>
						<Button onClick={addCustomer} type="primary" icon={<PlusCircleOutlined />} block>New Customer</Button>
					</div> : ""}
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={users}
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
					<UserView data={selectedUser} visible={userProfileVisible} history={this.props.history} close={()=> {this.closeUserProfile()}}/>
				</div>
			</Card>
		)
	}
}

export default UserList
