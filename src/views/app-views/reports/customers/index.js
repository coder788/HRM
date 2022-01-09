import React, {Component} from "react";
import {Badge, Card, Cascader, Col, DatePicker, Row, Spin, Tag, Tooltip, Tabs} from 'antd';
import apiService from 'services/ApiService'
import Flex from "components/shared-components/Flex";
import {getAllZones} from "configs/AppConfig";
import AppBreadcrumb from "components/layout-components/AppBreadcrumb";
import DonutChartWidget from "components/shared-components/DonutChartWidget";
import AvatarStatus from "components/shared-components/AvatarStatus";
import Chart from "react-apexcharts";
import ChartWidget from "components/shared-components/ChartWidget";
import {COLORS} from "constants/ChartConstant";
import moment from "moment";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const chartRespOptions = {
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }],
  legend: {
    position: 'bottom'
  }
}

const DistributeByDc = (props) => (
  <DonutChartWidget
    series={props.segments.counters}
    labels={props.segments.labels}
    title="Customers Summary"
    extra={
      <Row  justify="center">
        <Col xs={20} sm={20} md={20} lg={24}>
          <div className="mt-4 mx-auto" style={{maxWidth: 200}}>
            {props.segments.data.map(elm => (
              <Flex alignItems="center" justifyContent="between" className="mb-3" key={elm.label}>
                <div>
                  <Badge color={elm.color} />
                  <span className="text-gray-light">{elm.label}</span>
                </div>
                <span className="font-weight-bold text-dark">{elm.counter}</span>
              </Flex>
            ))}
          </div>
        </Col>
      </Row>
    }
  />
)

const DonutTemplate = (props) => (
  <Card title={props.title}>
    <div className="mt-3">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          {props.techs.map((staff, i) => (
            <div key={i} className={`d-flex align-items-center justify-content-between mb-3 border-bottom pb-3`}>
              <AvatarStatus id={i} src={`https://www.gravatar.com/avatar/${staff[props.staffVar].gravatar_hash}?s=150&r=g&d=mm`} name={staff[props.staffVar].full_name} subTitle={staff[props.staffVar].house_num} />
              <div>
                <Tooltip title={props.tooltip}>
                  <Tag color={props.color}>
                    {staff[props.numberVar]}
                    {props.suffix ? " "+props.suffix : ""}
                  </Tag>
                </Tooltip>
              </div>
              {props.numberVar2 ?
                <div>
                  <Tooltip title={props.tooltip2}>
                    <Tag color={props.color}>
                      {staff[props.numberVar2]}
                      {props.suffix2 ? " "+props.suffix2 : ""}
                    </Tag>
                  </Tooltip>
                </div> : ""}
            </div>
          ))}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Chart
            series={props.arrWalker(props.techs, props.numberVar, false, true)}
            type="donut"
            options={{
              labels: props.arrWalker(props.techs, props.staffVar, "full_name"),
              ...chartRespOptions
            }}
          />
        </Col>
      </Row>
    </div>
  </Card>
)

const CustomersDaily = (props) => (
  <Card title="Daily Customers">
    <Flex>
      <div className="mr-5">
        <h2 className="font-weight-bold mb-1">{props.total}</h2>
        <p><Badge color={COLORS[6]}/>Total Customers</p>
      </div>
    </Flex>
    <div>
      <ChartWidget
        card={false}
        series={props.timeline.values}
        xAxis={props.timeline.days}
        height={280}
        customOptions={
          {
            colors: [COLORS[6]],
            legend: {
              show: false
            },
            stroke: {
              width: 2.5,
              curve: 'smooth'
            },
          }
        }
      />
    </div>
  </Card>
)

export class CustomersReport extends Component {

  state = {
    reportData: [],
    segments: [],
    timeline: [],
    loading: true,
    zone_id: "",
    start: moment().subtract(7, "days"),
    end: moment()
  }

  componentDidMount() {
    this.loadReports()
  }

  arrWalker = (array, index, indexLvl2, numeric) => {
    let result = []
    array.map(child => {
      if(indexLvl2){
        numeric ? result.push(parseInt(child[index][indexLvl2])) : result.push(child[index][indexLvl2])
      } else {
        numeric ? result.push(parseInt(child[index])) : result.push(child[index])
      }
    })
    return result
  }

  loadReports = () => {
    this.setState({loading: true})
    apiService.getReports("customers", {
      zone_id: this.state.zone_id,
      start: moment(this.state.start).format('YYYY-MM-DD'),
      end: moment(this.state.end).format('YYYY-MM-DD')
    }).then(resp => {

      let segments = {labels: [], colors: [], counters: [], data: []}
      resp.dcCustomers.map(segment => {
        segments.labels.push(segment.district.name)
        segments.counters.push(segment.countInDc)
        segments.colors.push("red")
        segments.data.push({label: segment.district.name, color: "red", counter: segment.countInDc})
      })

      let timeline = {days: [], values: [{name: "Daily Customers", data: []}]}
      resp.dailyCustomers.map(element => {
        timeline.days.push(element.date)
        timeline.values[0].data.push(element.custCounter)
      })

      this.setState({reportData: resp, segments: segments, timeline: timeline}, () => this.setState({loading: false}))
    })
  }

  render() {
    const zoneCascChanged = value => {
      this.setState({zone_id: value[1]}, () => this.loadReports())
    }

    const dateChanged = date => {
      this.setState({start: date[0].format('YYYY-MM-DD'), end: date[1].format('YYYY-MM-DD')}, () => this.loadReports())
    }

    const disabledDate = current => {
      return current && current > moment().endOf('day');
    }

    return (
      <>
        <div className="app-page-header">
          <h3 className="mb-0 mr-3 font-weight-semibold">Reports</h3>
          <AppBreadcrumb/>
          <Flex className="py-2 ml-5" mobileFlex={false} justifyContent="start" alignItems="center">
            <Cascader options={getAllZones()} placeholder="All Districts" onChange={zoneCascChanged}/>
            <RangePicker
              disabledDate={disabledDate}
              className="ml-3"
              defaultValue={[this.state.start, this.state.end]}
              onChange={dateChanged}
              ranges={{
                Today: [moment(), moment()],
                'This Week': [moment().startOf('week'), moment().endOf('week')],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Week': [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
                'Last 30 days': [moment().subtract(30, 'days'), moment()],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
              }}
            />
          </Flex>
        </div>
        {this.state.loading ? <Spin/> :
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Tabs defaultActiveKey="1" type="line" tabPosition="top">
                    <TabPane tab="General" key="1">
                      <CustomersDaily timeline={this.state.timeline} total={this.state.reportData.totalCustomers} />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.issuedTickets}
                        title="Most Issued Tickets"
                        staffVar="customer"
                        numberVar="ticketsCount"
                        tooltip="Number Of Tickets"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.repeatedTickets}
                        title="Most Repeated Calls"
                        staffVar="customer"
                        numberVar="ticketsCount"
                        tooltip="Number Of Tickets"
                        color="red"
                      />
                    </TabPane>
                    <TabPane tab="Reviews" key="2">
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.bestReviews}
                        title="Best Reviews"
                        staffVar="customer"
                        numberVar="reviewCount"
                        numberVar2="reviewValue"
                        tooltip="Review Times"
                        tooltip2="Total Review Values"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.badReviews}
                        title="Bad Reviews"
                        staffVar="customer"
                        numberVar="reviewCount"
                        numberVar2="reviewValue"
                        tooltip="Review Times"
                        tooltip2="Total Review Values"
                        color="red"
                      />
                    </TabPane>
                    <TabPane tab="Stock" key="3">
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.consumedStock}
                        title="Most Requested Orders"
                        staffVar="customer"
                        numberVar="ordersCount"
                        tooltip="Number Of Orders"
                        color="blue"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.consumedStockItems}
                        title="Most Consumed Parts From Stock"
                        staffVar="customer"
                        numberVar="itemsCount"
                        tooltip="Number Of Items"
                        color="blue"
                      />
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8}>
              <DistributeByDc segments={this.state.segments}/>
            </Col>
          </Row>
        }
      </>
    )
  }
}

export default CustomersReport;
