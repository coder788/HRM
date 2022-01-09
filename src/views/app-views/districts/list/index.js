import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input} from 'antd';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, WEB_CONFIG} from "configs/AppConfig";

export class UserList extends Component {

	state = {
		districts: [],
		reqParams: {query: ""},
		loading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
		selectedUser: null
	}

	getDistricts = (params = {}) => {
		apiService.getDistricts({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"name": this.state.reqParams.query,
		}).then(resp => {
			this.setState({
				districts: resp.data,
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
		this.getDistricts({ pagination });
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getDistricts({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteDistrict = (dcID) => {
		this.setState({loading: true})
		apiService.deleteDistrict(dcID).then(resp => {
			this.setState({
				loading: false,
				districts: this.state.districts.filter(item => item.id !== dcID),
			})
			message.success({ content: `Deleted district ${dcID}`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}

	render() {
		const { districts, pagination, loading, selectedRowKeys } = this.state;

		const addDistrict = () => {
			this.props.history.push('/app/districts/add');
		}

		const editDistrict = userID => {
			this.props.history.push(`/app/districts/edit/${userID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getDistricts({ pagination }))
		}

		const tableColumns = [
			{
				title: 'Name',
				dataIndex: 'name',
				render: name => (
					<span>{name}</span>
				),
				sorter: {
					compare: (a, b) => {
						a = a.name.toLowerCase();
  						b = b.name.toLowerCase();
						return a > b ? -1 : b > a ? 1 : 0;
					},
				},
			},
			{
				title: 'Zone',
				dataIndex: 'zones_count',
				render: zones_count => (
					<Tag color="orange">{zones_count}</Tag>
				),
				sorter: {
					compare: (a, b) => a.zones_count - b.zones_count,
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
				title: 'Update At',
				dataIndex: 'updated_at',
				render: updated_at => (
					<span>{moment(updated_at).format("DD/MM/YYYY")} </span>
				),
				sorter: (a, b) => moment(a.updated_at) - moment(b.updated_at)
			},
			{
				title: '',
				dataIndex: 'actions',
				render: (_, elm) => (
					<div className="text-right">
						{(CAN_VIEW_MODULE(83)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => editDistrict(elm.id)} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(85)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => this.deleteDistrict(elm.id)} okText="Yes" cancelText="No">
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
							<Input placeholder="Search" prefix={<SearchOutlined />} onChange={e => onSearch(e)} style={{width: 300}} />
						</div>
					</Flex>
					{(CAN_VIEW_MODULE(84)) ?
					<div>
						<Button onClick={addDistrict} type="primary" icon={<PlusCircleOutlined />} block>New District</Button>
					</div> : ""}
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={districts}
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

export default UserList
