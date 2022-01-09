import React, {Component} from 'react'
import {Card, Table, Tooltip, message, Button, Popconfirm, Input} from 'antd';
import {DeleteOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";

export class LogList extends Component {

	state = {
		logs: [],
		reqParams: {query: ""},
		userProfileVisible: false,
		loading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
		selectedLog: null
	}

	getLogs = (params = {}) => {
		apiService.getLogs({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"query": this.state.reqParams.query,
		}).then(resp => {
			this.setState({
				logs: resp.data,
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
		this.getLogs({ pagination });
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getLogs({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteLog = logId => {
		this.setState({loading: true})
		apiService.getCustomers({"id": logId}).then(resp => {
			this.setState({
				loading: false,
				users: this.state.users.filter(item => item.id !== logId),
			})
			message.success({ content: `Deleted log ${logId}`, duration: 2 });
		})
	}

	render() {
		const { logs, pagination, loading, selectedRowKeys } = this.state;

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getLogs({ pagination }))
		}

		const tableColumns = [
			{
				title: 'Staff',
				dataIndex: 'full_name',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus src={record.user.photo_link} name={record.user.full_name} subTitle={record.user.role.title}/>
					</div>
				),
				sorter: {
					compare: (a, b) => {
						a = a.user.full_name.toLowerCase();
  						b = b.user.full_name.toLowerCase();
						return a > b ? -1 : b > a ? 1 : 0;
					},
				},
			},
			{
				title: 'Action',
				dataIndex: 'log',
				render: log => (
					<span>{log}</span>
				),
				sorter: {
					compare: (a, b) => a.log.length - b.log.length,
				},
			},
			{
				title: 'Created Date',
				dataIndex: 'created_at',
				render: created_at => (
					<span>{moment(created_at).format("DD/MM/YYYY hh:mm A")} </span>
				),
				sorter: (a, b) => moment(a.created_at) - moment(b.created_at)
			},
			{
				title: '',
				dataIndex: 'actions',
				render: (_, elm) => (
					<div className="text-right">
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteLog(elm.id)}} okText="Yes" cancelText="No">
							<Tooltip title="Delete">
								<Button danger icon={<DeleteOutlined />} size="small"/>
							</Tooltip>
						</Popconfirm>
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
					</Flex>
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={logs}
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

export default LogList
