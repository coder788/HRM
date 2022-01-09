import React, {Component} from "react";
import {Badge, Button, Card, Cascader, Col, DatePicker, Row, Spin, Tabs} from 'antd';
import apiService from 'services/ApiService'
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, getAllZones} from "configs/AppConfig";
import AppBreadcrumb from "components/layout-components/AppBreadcrumb";
import DonutChartWidget from "components/shared-components/DonutChartWidget";
import {AlertOutlined, CalendarOutlined, FileDoneOutlined, UserSwitchOutlined, ShoppingCartOutlined, IssuesCloseOutlined, WarningOutlined} from "@ant-design/icons";
import DataDisplayWidget from "components/shared-components/DataDisplayWidget";
import ChartWidget from "components/shared-components/ChartWidget";
import {COLORS} from "constants/ChartConstant";
import StatisticWidget from "components/shared-components/StatisticWidget";
import moment from "moment";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const parseAsInt = (number, asString) => (
  isNaN(parseInt(number)) ? asString ? "0" : 0 : asString ? number.toString() : parseInt(number)
)

const DistributeByCategory = (props) => (
  <DonutChartWidget
    series={props.segments.counters}
    labels={props.segments.labels}
    title={props.title}
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

const DailyGraph = (props) => (
  <Card title="Daily Tickets">
    <Flex>
      {props.segments.data.map((segment, i) => (
        <div key={i} className="mr-5">
          <h2 className="font-weight-bold mb-1">{segment.counter}</h2>
          <p><Badge color={segment.color}/>{segment.label}</p>
        </div>
      ))}
    </Flex>
    <div>
      <ChartWidget
        card={false}
        series={props.timeline.values}
        xAxis={props.timeline.days}
        height={280}
        customOptions={
          {
            colors: [COLORS[7], COLORS[6], COLORS[8]],
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

export class TicketsReport extends Component {

  state = {
    reportData: [],
    segments: [],
    categories: [],
    timeline: [],
    loading: true,
    exportLoading: false,
    summaryLoading: false,
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
    apiService.getReports("tickets", {
      zone_id: this.state.zone_id,
      start: moment(this.state.start).format('YYYY-MM-DD'),
      end: moment(this.state.end).format('YYYY-MM-DD')
    }).then(resp => {

      let segments = {labels: [], colors: [], counters: [], data: [], type: {mmt: 0, pm: 0, inspection: 0}}
      resp.ticketByTypes.map(segment => {
        segments.labels.push(segment.type_name)
        segments.counters.push(segment.typeCount)
        segments.colors.push(segment.type_color.class)
        segments.data.push({label: segment.type_name, color: segment.type_color.class, counter: segment.typeCount})
        segments.type[segment.type] = segment.typeCount
      })

      let categories = {labels: [], colors: [], counters: [], data: []}
      resp.ticketByCat.map(category => {
        categories.labels.push(category.catName)
        categories.counters.push(category.catCount)
        categories.colors.push("gold")
        categories.data.push({label: category.catName, color: "gold", counter: category.catCount})
      })

      let timeline = {
        days: [],
        values: [
          {name: "MMT", data: []},
          {name: "PM", data: []},
          {name: "Inspection", data: []},
        ]
      }
      let index, valueKey, dateIndex, loop = 0
      resp.dailyTicket.map(element => {
        dateIndex = timeline.days.indexOf(element.date)
        if(dateIndex >= 0){
          valueKey = dateIndex
        } else {
          valueKey = loop
          timeline.values[0].data[valueKey] = 0
          timeline.values[1].data[valueKey] = 0
          timeline.values[2].data[valueKey] = 0
          timeline.days.push(element.date)
          loop++
        }
        switch (element.type) {
          case "mmt":
            index = 0
            break;
          case "pm":
            index = 1
            break;
          case "inspection":
            index = 2
            break;
        }
        timeline.values[index].data[valueKey] = element.typeCount
      })

      this.setState({reportData: resp, segments: segments, categories: categories, timeline: timeline}, () => this.setState({loading: false}))
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

    const exportToExcel = event => {
      this.setState({exportLoading: true})
      apiService.exportReports("tickets", {
        zone_id: this.state.zone_id,
        start: moment(this.state.start).format('YYYY-MM-DD'),
        end: moment(this.state.end).format('YYYY-MM-DD')
      }).then(response => {
        this.setState({exportLoading: false})
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          'tickets.xlsx'
        );
        document.body.appendChild(link);
        link.click();
      })
    }

    const exportSummary = event => {
      this.setState({summaryLoading: true})
      apiService.exportSummary("tickets", {
        zone_id: this.state.zone_id,
        start: moment(this.state.start).format('YYYY-MM-DD'),
        end: moment(this.state.end).format('YYYY-MM-DD')
      }).then(response => {
        this.setState({summaryLoading: false})
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          'summary.xlsx'
        );
        document.body.appendChild(link);
        link.click();
      })
    }

    return (
      <>
        <div className="mb-3">
          <Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
            <Flex mobileFlex={false} justifyContent="start" alignItems="center">
              <h3 className="mb-0 mr-3 font-weight-semibold">Reports</h3>
              <AppBreadcrumb/>
            </Flex>
            <div>
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
            </div>
            {CAN_VIEW_MODULE(137) ?
              <div className="ml-3">
                <Button type="primary" loading={this.state.exportLoading} onClick={exportToExcel}>Export to Excel</Button>
              </div> : ""}
            {CAN_VIEW_MODULE(146) ?
              <div className="ml-1">
                <Button type="primary" loading={this.state.summaryLoading} onClick={exportSummary}>Export All</Button>
              </div> : ""}
          </Flex>
        </div>
        {this.state.loading ? <Spin/> :
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={16}>
              <Row gutter={16}>
                <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                  <StatisticWidget
                    title="Repair Time"
                    value={parseAsInt(this.state.reportData.badFinishTime?.badFinishCount, true)}
                    status={parseAsInt(this.state.reportData.badFinishTimePrev?.badFinishCount)-parseAsInt(this.state.reportData.badFinishTime?.badFinishCount)}
                    subtitle={`Compare to prev month (${moment(this.state.start).subtract(1, "month").format("MMM")})`}
                  />
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                  <StatisticWidget
                    title="Response Time"
                    value={parseAsInt(this.state.reportData.badResponseTime?.badRespCount, true)}
                    status={parseAsInt(this.state.reportData.badResponseTimePrev?.badRespCount)-parseAsInt(this.state.reportData.badResponseTime?.badRespCount)}
                    subtitle={`Compare to prev month (${moment(this.state.start).subtract(1, "month").format("MMM")})`}
                  />
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={8}>
                  <StatisticWidget
                    title="Delivery Time"
                    value={parseAsInt(this.state.reportData.badDelvTime?.badDelvCount, true)}
                    status={parseAsInt(this.state.reportData.badDelvTimePrev?.badDelvCount)-parseAsInt(this.state.reportData.badDelvTime?.badDelvCount)}
                    subtitle={`Compare to prev month (${moment(this.state.start).subtract(1, "month").format("MMM")})`}
                  />
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <DailyGraph timeline={this.state.timeline} segments={this.state.segments} />
                </Col>
                <Col span={24}>
                  <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={6}>
                      <StatisticWidget
                        title="Follow-up Tickets"
                        value={parseAsInt(this.state.reportData.followupTickets, true)}
                        status={<IssuesCloseOutlined />}
                        statusColor="primary"
                      />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={6}>
                      <StatisticWidget
                        title="Raised Problems"
                        value={parseAsInt(this.state.reportData.raisedProbTickets, true)}
                        status={<WarningOutlined />}
                        statusColor="warning"
                      />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={6}>
                      <StatisticWidget
                        title="Needed Parts"
                        value={parseAsInt(this.state.reportData.neededPartsTickets, true)}
                        status={<ShoppingCartOutlined />}
                        statusColor="gray"
                      />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={6}>
                      <StatisticWidget
                        title="Repeated Calls"
                        value={parseAsInt(this.state.reportData.repeatedTickets, true)}
                        status={<WarningOutlined />}
                        statusColor="danger"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8}>
              <DistributeByCategory title="Categories" segments={this.state.categories}/>
              <Tabs defaultActiveKey="1" type="line" tabPosition="top">
                <TabPane tab="Numbers" key="1">
                  <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                      <DataDisplayWidget
                        icon={<FileDoneOutlined />}
                        value={this.state.reportData.allTickets}
                        title="Total Tickets"
                        color="cyan"
                        vertical={true}
                        avatarSize={55}
                      />
                      <DataDisplayWidget
                        icon={<CalendarOutlined />}
                        value={this.state.segments.type.mmt}
                        title="MMT"
                        color="red"
                        vertical={true}
                        avatarSize={55}
                      />
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
                      <DataDisplayWidget
                        icon={<AlertOutlined />}
                        value={this.state.segments.type.pm}
                        title="PM"
                        color="blue"
                        vertical={true}
                        avatarSize={55}
                      />
                      <DataDisplayWidget
                        icon={<UserSwitchOutlined />}
                        value={this.state.segments.type.inspection}
                        title="Inspection"
                        color="volcano"
                        vertical={true}
                        avatarSize={55}
                      />
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Graph" key="2">
                  <DistributeByCategory title="Types" segments={this.state.segments}/>
                </TabPane>
              </Tabs>
            </Col>
          </Row>
        }
      </>
    )
  }
}

export default TicketsReport;
