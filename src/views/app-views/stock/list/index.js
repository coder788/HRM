import React, {Component} from 'react'
import {Card, Table, Tag, Tooltip, message, Button, Popconfirm, Input, Cascader, Select} from 'antd';
import {DeleteOutlined, EditOutlined, PlusCircleOutlined, SearchOutlined} from '@ant-design/icons';
import moment from 'moment';
import AvatarStatus from 'components/shared-components/AvatarStatus';
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, getAllZones, WEB_CONFIG} from 'configs/AppConfig';

const {Option} = Select;

export class StockList extends Component {
	state = {
		stock: [],
		zones: [],
		reqParams: {dc_id: "", zone_id: "", query: ""},
		loading: true,
		categories: [],
		categoriesLoading: true,
		pagination: {
			current: 1,
			pageSize: 10,
			showQuickJumper: true,
		},
	}

	getZones() {
		this.setState({zones: getAllZones()})
	}

	getCategories() {
		this.setState({categoriesLoading: true})
		apiService.stockCategories().then(resp => {
			this.setState({categoriesLoading: false, categories: resp})
		})
	}

	getStock = (params = {}) => {
		apiService.getStock({
			"page": params.pagination.current,
			"pages": params.pagination.pageSize,
			"query": this.state.reqParams.query,
			"dc_id": this.state.reqParams.dc_id,
			"cat_id": this.state.reqParams.cat_id,
			"zone_id": this.state.reqParams.zone_id
		}).then(resp => {
			this.setState({
				stock: resp.data,
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
		this.getStock({ pagination });
		this.getZones()
		this.getCategories()
	}

	handleTableChange = (pagination, filters, sorter) => {
		this.getStock({
			sortField: sorter.field,
			sortOrder: sorter.order,
			pagination,
			...filters,
		});
	};

	deleteStock = stockId => {
		this.setState({loading: true})
		apiService.deleteStock(stockId).then(resp => {
			this.setState({
				loading: false,
				stock: this.state.stock.filter(item => item.id !== stockId),
			})
			message.success({ content: `Deleted item #${stockId} from stock`, duration: 2 });
		}).catch(error => {
			this.setState({loading: false})
		})
	}

	render() {
		const { stock, pagination, loading, selectedRowKeys } = this.state;

		const newStockItem = () => {
			this.props.history.push('/app/stock/add');
		}

		const editStock = stockID => {
			this.props.history.push(`/app/stock/edit/${stockID}`);
		};

		const rowSelection = {
			onChange: (key, rows) => {
				this.setState({selectedRows: rows})
				this.setState({selectedRowKeys: key})
			}
		};

		const onSearch = e => {
			this.setState({"reqParams": {query: e.currentTarget.value}}, () => this.getStock({ pagination }))
		}

		const changeCategory = catid => {
			this.setState({"reqParams": {cat_id: catid}}, () => this.getStock({ pagination }))
		}

		const handleShowZones = values => {
			if(values) {
				this.setState({"reqParams": {dc_id: values[0], zone_id: values[1]}}, () => this.getStock({ pagination }))
			} else {
				this.setState({"reqParams": {dc_id: "", zone_id: values[1]}}, () => this.getStock({ pagination }))
			}
		}

		const tableColumns = [
			{
				title: 'Item',
				dataIndex: 'title',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus src={record.photo_link} name={record.title} subTitle={record.model}/>
					</div>
				),
				sorter: {
					compare: (a, b) => {
						a = a.title.toLowerCase();
						b = b.title.toLowerCase();
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
				title: 'In Stock',
				dataIndex: 'quantity',
				render: quantity => (
					<Tag color={(quantity === 0) ? "red" : "green"}>{quantity}</Tag>
				),
			},
			{
				title: '',
				dataIndex: 'actions',
				render: (_, elm) => (
					<div className="text-right">
						{(CAN_VIEW_MODULE(63)) ?
						<Tooltip title="Edit">
							<Button type="primary" className="mr-2" icon={<EditOutlined />} onClick={() => {editStock(elm.id)}} size="small"/>
						</Tooltip> : ""}
						{(CAN_VIEW_MODULE(67)) ?
						<Popconfirm placement="top" title="Are you sure ?" onConfirm={() => {this.deleteStock(elm.id)}} okText="Yes" cancelText="No">
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
						<div className="mr-md-3 mb-3">
							<Cascader options={this.state.zones} onChange={handleShowZones} allowClear placeholder="Filter By Zone"/>
						</div>
						<div className="mb-3">
							<Select className="w-100" onChange={changeCategory} placeholder="Filter By Category" loading={this.state.categoriesLoading}>
								{
									this.state.categories.map(elm => (
										<Option key={elm.id} value={elm.id}>{elm.title}</Option>
									))
								}
							</Select>
						</div>
					</Flex>
					{(CAN_VIEW_MODULE(66)) ?
					<div>
						<Button onClick={newStockItem} type="primary" icon={<PlusCircleOutlined />} block>New Item</Button>
					</div> : ""}
				</Flex>
				<div className="table-responsive">
					<Table
						columns={tableColumns}
						dataSource={stock}
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

export default StockList
