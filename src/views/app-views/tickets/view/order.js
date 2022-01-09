import React, {Component} from 'react'
import {Table, Tag} from 'antd';
import AvatarStatus from 'components/shared-components/AvatarStatus';

export class OrderView extends Component {

	render() {
		const { order } = this.props;

		const tableColumns = [
			{
				title: 'Item',
				dataIndex: 'title',
				render: (_, record) => (
					<div className="d-flex">
						<AvatarStatus src={record.stock.photo_link} name={record.stock.title} subTitle={record.stock.model}/>
					</div>
				)
			},
			{
				title: 'Quantity',
				dataIndex: 'quantity',
				render: quantity => (
					<Tag color="blue">{quantity}</Tag>
				),
			}
		];

		return (
			<div className="table-responsive">
				<Table
					columns={tableColumns}
					dataSource={order.items}
					rowKey='id'
					bordered={false}
					pagination={false}
				/>
			</div>
		)
	}
}

export default OrderView
