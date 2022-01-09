import React from 'react'
import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const StatisticWidget = ({ title, value, status, subtitle, prefix, statusColor }) => {
	return (
		<Card>
			{title && <h4 className="mb-0">{title}</h4>}
			<div className={`${prefix? 'd-flex': ''} ${title ? 'mt-3':''}`}>
				{prefix ? <div className="mr-2">{prefix}</div> : null}
				<div>
					<div className="d-flex align-items-center">
						<h1 className="mb-0 font-weight-bold">{value}</h1>
						{
							!isNaN(parseInt(status)) ?
							<span className={`font-size-md font-weight-bold ml-3 ${status !== 0 && status > 0 ? 'text-success' : 'text-danger'}`} >
								{status}
								{status !== 0 && status > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
							</span>
							:
							<span className={`font-size-xl font-weight-bold ml-3 text-${statusColor}`} >
								{status}
							</span>
						}
					</div>
					{subtitle && <div className="text-gray-light mt-1">{subtitle}</div>}
				</div>
			</div>
		</Card>
	)
}

export default StatisticWidget
