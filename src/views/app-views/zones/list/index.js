import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input, Select} from 'antd';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, WEB_CONFIG} from 'configs/AppConfig';

const { Option } = Select;

export class UserList extends Component {

	state = {
		zones: [],
		districts: [],
		reqParams: {dc_id: "", query: ""},
		loading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
		selectedUser: null
	}

	getZones = (params = {}) => {
		apiService.getZones({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"name": this.state.reqParams.query,
			"dc_id": this.state.reqParams.dc_id,
		}).then(resp => {
			this.setState({
				zones: resp.data,
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
		this.getZones({ pagination });
		this.setState({districts: WEB_CONFIG('settings').districts})
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getZones({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	}

	deleteZone = zoneID => {
		this.setState({loading: true})
		apiService.deleteZone(zoneID).then(resp => {
			this.setState({
				loading: false,
				zones: this.state.zones.filter(item => item.id !== zoneID),
			})
			message.success({ content: `Deleted zone ${zoneID}`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}
	
	render() {
		const { zones, pagination, loading, selectedRowKeys } = this.state;

		const addZone = () => {
			this.props.history.push('/app/zones/add');
		}

		const editZone = userID => {
			this.props.history.push(`/app/zones/edit/${userID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getZones({ pagination }))
		}

		const handleShowDistricts = value => {
			if(value) {
				this.setState({"reqParams": {dc_id: value}}, () => this.getZones({ pagination }))
			} else {
				this.setState({"reqParams": {dc_id: ""}}, () => this.getZones({ pagination }))
			}
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
				title: 'District',
				dataIndex: 'district',
				render: district => (
					<Tag color="green">{district.name}</Tag>
				),
				sorter: {
					compare: (a, b) => a.district.name - b.district.name,
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
						{(CAN_VIEW_MODULE(98)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => {editZone(elm.id)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(100)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteZone(elm.id)}} okText="Yes" cancelText="No">
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
							<Select placeholder="Filter By District" allowClear onChange={handleShowDistricts} style={{width: 210}}>
								{this.state.districts.map(district => (
									<Option key={district.id} value={district.id}>{district.name}</Option>
								))}
							</Select>
						</div>
					</Flex>
					<div>
						<Button onClick={addZone} type="primary" icon={<PlusCircleOutlined />} block>New Zone</Button>
					</div>
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={zones}
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
