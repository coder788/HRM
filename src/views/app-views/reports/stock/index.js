import React, {Component} from "react";
import {Badge, Card, Cascader, Col, DatePicker, Row, Spin, Tag, Tooltip} from 'antd';
import apiService from 'services/ApiService'
import Flex from "components/shared-components/Flex";
import {getAllZones} from "configs/AppConfig";
import AppBreadcrumb from "components/layout-components/AppBreadcrumb";
import AvatarStatus from "components/shared-components/AvatarStatus";
import Chart from "react-apexcharts";
import ChartWidget from "components/shared-components/ChartWidget";
import {COLORS} from "constants/ChartConstant";
import moment from "moment";

const { RangePicker } = DatePicker;

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

const DonutTemplate = (props) => (
  <Card title={props.title}>
    <div className="mt-3">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          {props.items.map((item, i) => (
            <div key={i} className={`d-flex align-items-center justify-content-between mb-3 border-bottom pb-3`}>
              {(props.staffVar) ?
                <AvatarStatus id={i} src={item[props.staffVar].photo_link} name={item[props.staffVar].title} subTitle={item[props.staffVar].model} />
                :
                <AvatarStatus id={i} src={item.photo_link} name={item.title} subTitle={item.model} />
              }
              <div>
                <Tooltip title={props.tooltip}>
                  <Tag color={props.color}>
                    {item[props.numberVar]}
                    {props.suffix ? " "+props.suffix : ""}
                  </Tag>
                </Tooltip>
              </div>
              {props.numberVar2 ?
                <div>
                  <Tooltip title={props.tooltip2}>
                    <Tag color={props.color}>
                      {item[props.numberVar2]}
                      {props.suffix2 ? " "+props.suffix2 : ""}
                    </Tag>
                  </Tooltip>
                </div> : ""}
            </div>
          ))}
        </Col>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Chart
            series={props.arrWalker(props.items, props.numberVar, false, true)}
            type="donut"
            options={{
              labels: props.staffVar ? props.arrWalker(props.items, props.staffVar, "model") : props.arrWalker(props.items, "model"),
              ...chartRespOptions
            }}
          />
        </Col>
      </Row>
    </div>
  </Card>
)

const CustomersDaily = (props) => (
  <Card title="Daily Orders">
    <Flex>
      <div className="mr-5">
        <h2 className="font-weight-bold mb-1">{props.total}</h2>
        <p><Badge color={COLORS[6]}/>Total Orders</p>
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

export class StockReport extends Component {

  state = {
    reportData: [],
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
    apiService.getReports("stock", {
      zone_id: this.state.zone_id,
      start: moment(this.state.start).format('YYYY-MM-DD'),
      end: moment(this.state.end).format('YYYY-MM-DD')
    }).then(resp => {

      let timeline = {days: [], values: [{name: "Orders", data: []}], total : 0}
      resp.dailyStock.map(element => {
        timeline.days.push(element.date)
        timeline.values[0].data.push(element.ordersCount)
        timeline.total += element.ordersCount
      })

      this.setState({reportData: resp, timeline: timeline}, () => this.setState({loading: false}))
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
            <Col xs={24} sm={24} md={24} lg={24}>
              <Row gutter={16}>
                <Col span={24}>
                  <CustomersDaily timeline={this.state.timeline} total={this.state.timeline.total} />
                  <DonutTemplate
                    arrWalker={this.arrWalker}
                    items={this.state.reportData.mostReqStock}
                    title="Most Picked Parts From Stock"
                    staffVar="stock"
                    numberVar="quantity"
                    tooltip="Number Of Shipped Times"
                    color="purple"
                  />
                  <DonutTemplate
                    arrWalker={this.arrWalker}
                    items={this.state.reportData.mostOutStock}
                    title="Most Parts Gone Out Of Stock"
                    staffVar={false}
                    numberVar="ofs_times"
                    tooltip="Number Of Times"
                    color="red"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        }
      </>
    )
  }
}

export default StockReport;
