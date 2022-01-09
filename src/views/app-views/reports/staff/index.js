import React, {Component} from "react";
import {Badge, Card, Cascader, Col, DatePicker, Row, Spin, Tag, Tooltip, Tabs, Table, Button} from 'antd';
import apiService from 'services/ApiService'
import Flex from "components/shared-components/Flex";
import {CAN_VIEW_MODULE, getAllZones} from "configs/AppConfig";
import AppBreadcrumb from "components/layout-components/AppBreadcrumb";
import DonutChartWidget from "components/shared-components/DonutChartWidget";
import AvatarStatus from "components/shared-components/AvatarStatus";
import Chart from "react-apexcharts";
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

const RolesByCategory = (props) => (
  <DonutChartWidget
    series={props.roles.counters}
    labels={props.roles.labels}
    title="Staff Summary"
    extra={
      <Row  justify="center">
        <Col xs={20} sm={20} md={20} lg={24}>
          <div className="mt-4 mx-auto" style={{maxWidth: 200}}>
            {props.roles.data.map(elm => (
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

const DonutTemplate2 = (props) => (
  <Card title={props.title}>
    <div className="mt-3">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
            <Table
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  render: (_, staff) => (
                    <AvatarStatus src={staff[props.staffVar].photo_link} name={staff[props.staffVar].full_name} subTitle={staff[props.staffVar].role.title} />
                  )
                },{
                  title: "Value",
                  dataIndex: 'value',
                  render: (_, staff) => (
                    <Tooltip title={props.tooltip}>
                      <Tag color={props.color}>
                        {staff[props.numberVar]}
                        {props.suffix ? " "+props.suffix : ""}
                      </Tag>
                    </Tooltip>
                  )
                }
                ]}
              dataSource={props.techs}
              pagination={false}
            />
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

const DonutTemplate = (props) => (
  <Card title={props.title}>
    <div className="mt-3">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12} lg={12}>
          {props.techs.map((staff, i) => (
            <div key={i} className={`d-flex align-items-center justify-content-between mb-3 border-bottom pb-3`}>
              <AvatarStatus id={i} src={staff[props.staffVar].photo_link} name={staff[props.staffVar].full_name} subTitle={staff[props.staffVar].role.title} />
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

export class StaffReport extends Component {

  state = {
    reportData: [],
    roles: [],
    loading: true,
    exportLoading: false,
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
    apiService.getReports("staff", {
      zone_id: this.state.zone_id,
      start: moment(this.state.start).format('YYYY-MM-DD'),
      end: moment(this.state.end).format('YYYY-MM-DD')
    }).then(resp => {

      let roles = {labels: [], colors: [], counters: [], data: []}
      resp.staffRoles.map(role => {
        roles.labels.push(role.role.title)
        roles.counters.push(role.staffCount)
        roles.colors.push(role.role.color)
        roles.data.push({label: role.role.title, color: role.role.color, counter: role.staffCount})
      })

      this.setState({reportData: resp, roles: roles}, () => this.setState({loading: false}))
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
      apiService.exportReports("staff", {
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
          'staff.xlsx'
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
            {CAN_VIEW_MODULE(136) ?
              <div className="ml-3">
                <Button type="primary" loading={this.state.exportLoading} onClick={exportToExcel}>Export to Excel</Button>
              </div> : ""}
          </Flex>
        </div>
        {this.state.loading ? <Spin/> :
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={16}>
              <Row gutter={16}>
                <Col span={24}>
                  <Tabs defaultActiveKey="1" type="line" tabPosition="top">
                    <TabPane tab="Performance" key="1">
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.issuedTickets}
                        title="Most Issued Tickets"
                        staffVar="staff"
                        numberVar="numTickets"
                        tooltip="Number of tickets"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.bestRepairTime}
                        title="Fastest Repair Time"
                        staffVar="staff"
                        numberVar="totalRepairTime"
                        tooltip="Total Repair Times"
                        color="green"
                        suffix="Minute"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.badResponseTime}
                        title="Bad Response Time"
                        staffVar="staff"
                        numberVar="totalResolvedTime"
                        tooltip="Total delay time"
                        color="red"
                        suffix="Minute"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.bestResponseTime}
                        title="Best Response Time"
                        staffVar="staff"
                        numberVar="totalResolvedTime"
                        tooltip="Total response time"
                        color="green"
                        suffix="Minute"
                      />
                    </TabPane>
                    <TabPane tab="Feedback" key="2">
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.mostReview}
                        title="Best Rated"
                        staffVar="staff"
                        numberVar="reviewValue"
                        numberVar2="numTickets"
                        tooltip="Total Ratings"
                        tooltip2="Tickets"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.mostFollowup}
                        title="Most Make Follow-up"
                        staffVar="staff"
                        numberVar="followupTimes"
                        tooltip="Follow-up Times"
                        color="green"
                        suffix="Time"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.terminatedTickets}
                        title="Most Terminated Tickets"
                        staffVar="staff"
                        numberVar="numTickets"
                        tooltip="Number of tickets"
                        color="red"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.repeatedTickets}
                        title="Most Repeated Calls"
                        staffVar="staff"
                        numberVar="numTickets"
                        tooltip="Number of tickets"
                        color="red"
                      />
                    </TabPane>
                    <TabPane tab="Delivery" key="3">
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.stock}
                        title="Most Requested Parts"
                        staffVar="techboy"
                        numberVar="quantity"
                        tooltip="Item"
                        color="red"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.bestDeliveryTime}
                        title="Fastest Delivery Time"
                        staffVar="staff"
                        numberVar="totalDeliveryTime"
                        tooltip="Total Delivery Time"
                        suffix="Minute"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.mostDeliveryTimes}
                        title="Most Delivery Times"
                        staffVar="staff"
                        numberVar="deliveryTimes"
                        tooltip="Total Delivery Times"
                        color="green"
                      />
                      <DonutTemplate
                        arrWalker={this.arrWalker}
                        techs={this.state.reportData.badDeliveryTime}
                        title="Bad Delivery Time"
                        staffVar="staff"
                        numberVar="totalDeliveryTime"
                        tooltip="Total Delay Time"
                        suffix="Minute"
                        color="red"
                      />
                    </TabPane>
                  </Tabs>
                </Col>
              </Row>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8}>
              <RolesByCategory roles={this.state.roles}/>
            </Col>
          </Row>
        }
      </>
    )
  }
}

export default StaffReport;
