import React from 'react';
import {Alert, Badge, Breadcrumb, Button, Card, Cascader, Col, DatePicker, Divider, Empty, Form, Input, message, Modal, Popconfirm, Radio, Rate, Row, Select, Skeleton, Spin, Steps, Switch, TimePicker, Upload} from 'antd';
import moment from 'moment';
import {AlertOutlined, CalendarOutlined, DeleteOutlined, InboxOutlined, PlusCircleOutlined} from '@ant-design/icons';
import apiService from "services/ApiService";
import Flex from 'components/shared-components/Flex';
import {API_BASE_URL, CAN_VIEW_MODULE, GET_AUTH_HEADER, getAllZones, WEB_CONFIG} from "configs/AppConfig";
import customTheme from "./custom.css";

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

const {RangePicker} = DatePicker;
const {Option} = Select;
const {Dragger} = Upload;
const {Step} = Steps;

const badgeColors = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
];

const dateFormat = 'YYYY-MM-DD'

const AgendaList = props => {
  const {list, onDelete} = props
  return (
    (list.length === 0) ? <Empty description={false}/> :
      list.map(list => (
        <div key={list.date} className="calendar-list">
          <h4>
            <CalendarOutlined/>
            <span className="ml-2">{list.date}</span>
          </h4>
          {
            list.event.map((eventItem, i) => (
              <div key={`${eventItem.title}-${i}`} className="calendar-list-item">
                <div className="d-flex">
                  <Badge color={eventItem.bullet}/>
                  <div>
                    <h5 className="mb-1">{eventItem.title}</h5>
                    <span className="text-muted">{eventItem.start} - {eventItem.end}</span>
                  </div>
                </div>
                {(CAN_VIEW_MODULE(126)) ?
                  <div className="calendar-list-item-delete">
                    <Popconfirm placement="top" title="Are you sure you want to delete this mission ?" onConfirm={() => onDelete(list.date, i, eventItem.id)} okText="Yes" cancelText="No">
                      <DeleteOutlined/>
                    </Popconfirm>
                  </div> : ""}
              </div>
            ))
          }
        </div>
      ))
  )
}

export class AssignTicket extends React.Component {

  constructor(props) {
    super(props);

    this.calendarRef = React.createRef()
    this.formRef = React.createRef()
    this.raiseFormRef = React.createRef()

    this.uploadImage = this.uploadImage.bind(this)

    this.state = {
      loading: false,
      loadTicket: false,
      calendarList: false,
      modalVisible: false,
      raiseModalVisible: false,
      staffAvailable: "",
      staffCheckup: true,
      role: this.props.match.params.type ? this.props.match.params.type : "technician",
      searchZone: ["", ""],
      agendaList: [],
      uploadImgs: [],
      agendaListLoading: true,
      uploadVehicleImgs: false,
      fetchingVehicles: false,
      vehicles: [],
      currStep: 0,
      staffList: [],
      helperList: [],
      ticket: {},
      staffListLoading: false,
      staffId: "",
      selectedDate: moment().format(dateFormat),
      dateRange: [moment().subtract(5, 'days'), moment().add(5, 'days')],
      datePortion: null,
      dateHackValue: null,
    }
  }

  componentDidMount() {
    if(this.props.match.params.id){
      this.setState({loadTicket: true})
      apiService.getTicket(this.props.match.params.id).then(resp => {
        this.setState({ticket: resp, loadTicket: false})
      })
    }
    this.refreshHelperList()
    this.refreshStaffList()
    this.refreshCalendar()
  }

  refreshHelperList = () => {
    apiService.getUsers({role_id: 9}).then(resp => {
      this.setState({helperList: resp.data})
    })
  }

  refreshStaffList = () => {
    this.setState({staffListLoading: true})
    if(this.state.role === "qc"){
      apiService.getUsers({role_id: 6}).then(resp => {
        this.setState({staffListLoading: false, staffList: resp.data})
      })
    } else {
      apiService.getUsers({role_id: (this.state.role === "technician") ? 4 : 5}).then(resp => {
        this.setState({staffListLoading: false, staffList: resp.data})
      })
    }
  }

  uploadImage = info => {
    const {status} = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
      this.setState({uploadImgs: [...this.state.uploadImgs, info.file.response.path]})
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  }
  dragerProps = () => {
    return {
      name: 'file',
      multiple: true,
      action: `${API_BASE_URL}/tickets/actions/upload_photo`,
      headers: GET_AUTH_HEADER(),
      onChange: this.uploadImage,
    }
  }

  cellRender = value => {
    const listData = this.getListData(value.format((dateFormat)));
    return (
      <ul className="calendar-event">
        {listData.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            <Badge color={item.bullet} text={item.title}/>
          </li>
        ))}
      </ul>
    );
  }

  getListData = (value) => {
    //console.log("newdate", value)
    let listData = [];
    this.state.calendarList.forEach(elm => {
      if (elm.date === value) {
        listData = elm.event
      }
    })
    return listData
  }

  refreshCalendar = () => {
    let listData = []
    this.setState({agendaListLoading: true})

    let jobAction
    if(this.state.role === "technician"){
      jobAction = "tech_job|followup_job"
    } else if(this.state.role === "qc"){
      jobAction = "qc_job"
    } else {
      jobAction = "delv_job"
    }

    apiService.getTicketActions({
      action: jobAction,
      staff_id: this.state.staffId,
      from_date: this.state.dateRange[0].format("YYYY-MM-DD"),
      to_date: this.state.dateRange[1].format("YYYY-MM-DD"),
      dc_id: this.state.searchZone[0],
      zone_id: this.state.searchZone[1],
    }).then(resp => {
      Object.keys(resp).forEach((date) => {
        resp[date].forEach(data => {
          listData.push({
            id: data.id,
            title: data.staff.full_name,
            date: moment(date).format(dateFormat),
            start: data.created_at,
            end: moment(data.estimated_end).format("YYYY-MM-DDTHH:mm:ss"),
            backgroundColor: moment(data.created_at).isBefore() ? 'rgb(241,103,103)' : 'rgb(0,153,255)',
          })
        })
      })
      this.setState({calendarList: listData, agendaListLoading: false}, () => {
        this.updateAgendaData()
        let calendarApi = this.calendarRef.current.getApi()
        calendarApi.setOption('visibleRange', {start: this.state.dateRange[0].format(dateFormat), end: this.state.dateRange[1].format(dateFormat)})
      })
    })
  }

  updateAgendaData = () => {
    let agendaData = []
    let events = []
    this.state.calendarList.forEach(data => {
      if(data.date === this.state.selectedDate){
        events.push({
          id: data.id,
          title: data.title,
          bullet: moment(data.start).isBefore() ? 'red' : 'cyan',
          start: moment(data.start).format('hh:mm A'),
          end: moment(data.end).format('hh:mm A'),
        })
      }
    })
    agendaData.push({
      date: this.state.selectedDate,
      event: events
    })
    this.setState({agendaList: agendaData})
  }

  onSelect = selectedDate => {
    console.log(selectedDate.date)
    this.setState({selectedDate: moment(selectedDate.date).format(dateFormat)}, () => {
      this.updateAgendaData()
    })
  }

  addMission = () => {
    this.setState({modalVisible: true})
  }

  raiseProblem = (ticketid) => {
    this.setState({raiseModalVisible: true})
  }

  onChangeVehicle = (checked) => {
    this.setState({uploadVehicleImgs: checked})
  }

  fetchVehicles = value => {
    this.setState({fetchingVehicles: true, vehicles: []})
    apiService.getVehicles({query: value}).then(resp => {
      const data = resp.data.map(vehicle => ({
        text: vehicle.title + ` (${vehicle.plate_num})`,
        value: vehicle.id,
      }));
      this.setState({fetchingVehicles: false, vehicles: data})
    })
  };

  onDeleteEvent = (date, index, id) => {
    this.setState({loading: true})

    apiService.delTicketAction(id).then(resp => {
      const agendaData = this.state.agendaList.map(calendarList => {
        if (calendarList.date === date) {
          calendarList.event = calendarList.event.filter((_, i) => i !== index)
        }
        return calendarList
      }).filter(elm => elm.event.length !== 0)

      const calendarData = this.state.calendarList.filter(elm => elm.id !== id)

      this.setState({agendaList: agendaData, calendarList: calendarData, loading: false})
    })
  }

  sendRaisedReq = () => {
    const params = {
      reason: this.raiseFormRef.current.getFieldValue("cause")
    }
    apiService.raiseProblem(WEB_CONFIG("role").name === "foreman" ? "foreman" : "supervisor", this.raiseFormRef.current.getFieldValue("ticket_id"), params).then(resp => {
      this.closeRaiseModal()
    })
  }

  checkStaffAvailability = () => {
    let values = this.formRef.current.getFieldsValue()
    let start_time, estimated_end, date
    if(this.state.ticket.type === "mmt"){
      start_time = moment(this.state.selectedDate + values.start.format(' HH:mm'))
      estimated_end = moment(this.state.selectedDate + values.end.format(' HH:mm'))
      date = moment()
    } else {
      start_time = moment(values.date.format(dateFormat) + values.start.format(' HH:mm'))
      estimated_end = moment(values.date.format(dateFormat) + values.end.format(' HH:mm'))
      date = moment(values.date.format(dateFormat))
    }

    let params = {
      staff_id: values.staff_id,
      start_time: start_time.format(`${dateFormat} HH:mm`),
      estimated_end: estimated_end.format(`${dateFormat} HH:mm`),
    }

    this.setState({loading: true})
    apiService.staffAvailability(params).then((resp) => {
      console.log(resp.busy)
      this.setState({loading: false, staffAvailable: !resp.busy, staffCheckup: resp.check_up})
    })

  }

  onAddEvent = values => {
    console.log(values)

    let start_time, estimated_end, date
    if(this.state.ticket.type === "mmt"){
      start_time = moment(this.state.selectedDate + values.start.format(' HH:mm'))
      estimated_end = moment(this.state.selectedDate + values.end.format(' HH:mm'))
      date = moment()
    } else {
      start_time = moment(values.date.format(dateFormat) + values.start.format(' HH:mm'))
      estimated_end = moment(values.date.format(dateFormat) + values.end.format(' HH:mm'))
      date = moment(values.date.format(dateFormat))
    }

    let params = {
      staff_id: values.staff_id,
      ticket_id: values.ticket_id,
      start_time: start_time.format(`${dateFormat} HH:mm`),
      estimated_end: estimated_end.format(`${dateFormat} HH:mm`),
    }

    if(this.state.role === "technician"){
      const techParams = {
        helper_id: values.helper_id,
        vehicle_id: values.vehicle_id,
        condition: !!(values.condition),
        images: this.state.uploadImgs,
      }
      params = {...params, ...techParams}
    }

    let action
    if(this.state.role === "technician"){
      action = "assign_tech"
    } else if(this.state.role === "qc"){
      action = "assign_qc"
    } else {
      action = "assign_delivery"
    }

    this.setState({loading: true})
    apiService.assignMission(action, params).then(resp => {
      const data = [{
        id: resp.id,
        title: resp.staff.full_name,
        bullet: "cyan",
        start: start_time.format('hh:mm A'),
        end: estimated_end.format('hh:mm A'),
      }]

      const calendarData = [{
        id: resp.id,
        title: resp.staff.full_name,
        date: date.format(dateFormat),
        start: start_time.format(`${dateFormat} HH:mm`),
        end: estimated_end.format(`${dateFormat} HH:mm`),
      }]

      const newCalendarArr = this.state.agendaList
      const isExistingDate = newCalendarArr.find(x => x.date === this.state.selectedDate)
      if (isExistingDate) {
        for (let elm of newCalendarArr) {
          if (elm.date === this.state.selectedDate) {
            elm.event = [...elm.event, ...data]
          }
        }
      } else {
        newCalendarArr.push({date: this.state.selectedDate, event: data})
      }
      const sortedNewCalendarArr = newCalendarArr.sort((a, b) => moment(a.date) - moment(b.date))

      this.setState({agendaList: sortedNewCalendarArr, calendarList: [...this.state.calendarList, ...calendarData], loading: false})
      this.closeModal()
    }, error => {
      this.setState({loading: false})
    })
  }

  closeModal = () => {
    this.setState({modalVisible: false, uploadVehicleImgs: false, uploadImgs: [], currStep: 0, staffAvailable: "", staffCheckup: true})
  }

  closeRaiseModal = () => {
    this.setState({raiseModalVisible: false})
  }

  goTo = (e, link) => {
    e.preventDefault()
    this.props.history.push(link)
  }

  zoneCascChanged = (zone) => {
    console.log(zone)
    this.setState({staffListLoading: true})
    if(this.state.role === "qc"){
      apiService.getUsers({role_id: 6}).then(resp => {
        this.setState({staffList: resp.data, staffListLoading: false})
      })
    } else {
      apiService.getUsers({role_id: (this.state.role === "technician") ? 4 : 5, zone_id: zone[1]}).then(resp => {
        this.setState({staffList: resp.data, staffListLoading: false})
      })
    }

    this.setState({searchZone: zone}, () => this.refreshCalendar())
  }

  handleChangeStaff = (staff_id) => {
    console.log(staff_id)
    if(staff_id === "all") staff_id = ""
    this.setState({staffId: staff_id}, () => this.refreshCalendar())
  }

  handleChangeRole = (role) => {
    this.setState({role: role}, () => {
      this.refreshStaffList()
      this.refreshCalendar()
    })
  }

  onChangePortion = (date) => {
    console.log(date)
    this.setState({datePortion: date})
  }

  onChangeRange = (date) => {
    console.log(date)
    this.setState({dateRange: date}, () => this.refreshCalendar())
  }

  disabledDate = current => {
    if (!this.state.datePortion || this.state.datePortion.length === 0) {
      return false
    }
    const tooLate = this.state.datePortion[0] && current.diff(this.state.datePortion[0], 'days') > 7
    const tooEarly = this.state.datePortion[1] && this.state.datePortion[1].diff(current, 'days') > 7
    return tooEarly || tooLate
  }

  onOpenChange = open => {
    if (open) {
      this.setState({dateHackValue: [], datePortion: []})
    } else {
      this.setState({dateHackValue: undefined})
    }
  }

  fieldsStep = (step) => {
    switch (step){
      case 0:
        return ['ticket_id','staff_id','helper_id','start','end','date']
      case 1:
        return ['appearance','health_condition','uniform','hair_cover','shoe_cover','gloves','face_shield','tool_box']
      case 2:
        return ['vehicle_id','vehicle_appearance','vehicle_cleanliness','vehicle_interior_condition','vehicle_tire_condition']
      default:
        return []
    }
  }

  nextStep = () => {
    if(this.state.currStep === 0 && !this.state.staffCheckup){
      this.gotoStep(2)
      return
    }
    this.formRef.current.validateFields(this.fieldsStep(this.state.currStep)).then(values => {
      this.setState({currStep: this.state.currStep + 1})
    }).catch(errorInfo => console.log(errorInfo))
  }

  gotoStep = (step) => {
    if(step === 1 && !this.state.staffCheckup){
      return
    }
    this.formRef.current.validateFields(this.fieldsStep(this.state.currStep)).then(values => {
      this.setState({currStep: step})
    }).catch(errorInfo => {})
  }

  startTimeChanged = (time) => {
    let end = time.format("YYYY-MM-DDTHH:mm:ss")
    this.formRef.current.setFieldsValue({ end: moment(end).add(4, "hours") })
  }

  render() {
    return (
      <>
        <Breadcrumb className="mb-3">
          <Breadcrumb.Item>
            <a href="#" onClick={(e) => this.goTo(e, '/app')}>Home</a>
          </Breadcrumb.Item>
          {this.props.match.params?.id ? <Breadcrumb.Item>
            <a href="#" onClick={(e) => this.goTo(e, `/app/tickets/view/${this.props.match.params?.id}`)}>Ticket</a>
          </Breadcrumb.Item> : ""}
          <Breadcrumb.Item>{this.props.match.params?.id ?  "Assign Mission" : "Mission Sheet"}</Breadcrumb.Item>
        </Breadcrumb>
        <Card className="calendar mb-0">
          {(this.state.calendarList) ?
            <Row>
              {(this.state.agendaListLoading) ? <SkeletonCalendar/> :
                <Col xs={24} sm={24} md={9} lg={6} className="pr-3">
                  <h2 className="mb-4">Agenda {(this.state.loading) ? <Spin/> : ""}</h2>
                  <AgendaList
                    list={this.state.agendaList}
                    onDelete={this.onDeleteEvent}
                  />
                  {this.props.match.params?.id && CAN_VIEW_MODULE([108,109,110]) ?
                    <Button type="primary" icon={<PlusCircleOutlined/>} block onClick={() => this.addMission()} loading={this.state.loadTicket}>Create Mission</Button> : ""}
                  {this.props.match.params?.id && CAN_VIEW_MODULE([124,125]) ?
                    <Button danger onClick={() => this.raiseProblem(this.props.match.params?.id)} block icon={<AlertOutlined />} className="mt-2">Raise A Problem</Button> : ""}
                </Col>}
              <Col xs={24} sm={24} md={15} lg={18}>
                <Flex justifyContent="between" alignItems="center" className="py-4">
                  <RangePicker
                    onChange={this.onChangeRange}
                    value={this.state.dateHackValue || this.state.dateRange}
                    disabledDate={this.disabledDate}
                    onCalendarChange={this.onChangePortion}
                    onOpenChange={this.onOpenChange}
                  />
                  <Cascader options={getAllZones()} placeholder="All Districts" onChange={this.zoneCascChanged}/>
                  {! this.props.match.params.id ?
                    <Select defaultValue={this.state.role} style={{width: 120}} onChange={this.handleChangeRole}>
                      {(CAN_VIEW_MODULE(108)) ? <Option value="technician">Technician</Option> : ""}
                      {(CAN_VIEW_MODULE(109)) ?<Option value="delivery">Delivery</Option> : ""}
                      {(CAN_VIEW_MODULE(110)) ?<Option value="qc">QC</Option> : ""}
                    </Select> : ""}
                  <Select defaultValue="all" style={{width: 120}} loading={this.state.staffListLoading} onChange={this.handleChangeStaff}>
                    <Option value="all">All Staff</Option>
                    {this.state.staffList.map((staff, i) => (
                      <Option key={`staff-${i}`} value={staff.id}>{staff.full_name}</Option>
                    ))}
                  </Select>
                </Flex>
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                  ref={this.calendarRef}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,list'
                  }}
                  dateClick={this.onSelect}
                  visibleRange={{start: this.state.dateRange[0].format(dateFormat), end: this.state.dateRange[1].format(dateFormat)}}
                  weekends={true}
                  events={this.state.calendarList}
                  selectable={true}
                />
              </Col>
            </Row> : ""
          }
          <Modal
            title={`Raise a problem`}
            visible={this.state.raiseModalVisible}
            destroyOnClose={true}
            onCancel={this.closeRaiseModal}
            onOk={this.sendRaisedReq}
          >
            <Form
              ref={this.raiseFormRef}
              layout="vertical"
              initialValues={{ ticket_id: this.props.match.params?.id, cause: "Do not have available staff" }}
            >
              <Form.Item name="ticket_id" hidden={true}>
                <Input/>
              </Form.Item>
              <Form.Item name="cause" label="Give a reason" rules={[{required: true, message: 'Reason is a required field'}]}>
                <Input.TextArea />
              </Form.Item>
            </Form>
          </Modal>
          <Modal
            title={`Ticket #${this.props.match.params?.id}`}
            visible={this.state.modalVisible}
            footer={null}
            destroyOnClose={true}
            onCancel={this.closeModal}
          >
            <Form
              ref={this.formRef}
              layout="vertical"
              onFinish={this.onAddEvent}
              initialValues={{
                ticket_id: this.props.match.params?.id,
                staff_id: "",
                helper_id: "",
                start: moment(new Date()),
                end: moment().add(4, 'hours'),
                date: moment(this.state.selectedDate ? this.state.selectedDate : new Date(), dateFormat)
              }}
            >
              {(this.state.role === "technician") ?
                <Steps current={this.state.currStep} style={{cursor: "pointer"}} className="mb-4">
                  <Step title="Appointment" description="" onClick={() => this.gotoStep(0)}/>
                  <Step title="Crew" description="Evaluation" onClick={() => this.gotoStep(1)}/>
                  <Step title="Vehicle" description="Evaluation" onClick={() => this.gotoStep(2)}/>
                </Steps> : ""}
              <div className={this.state.currStep !== 0 ? "d-none" : ""}>
                <Form.Item name="ticket_id" hidden={true}>
                  <Input/>
                </Form.Item>
                {this.state.staffAvailable !== "" && this.state.staffAvailable ?
                  <Alert message="The selected staff is free at this time" type="success" className="mb-3" /> : ""
                }
                {this.state.staffAvailable !== "" && !this.state.staffAvailable ?
                  <Alert message="The selected staff is busy at this time" type="error" className="mb-3" /> : ""
                }
                <Form.Item name="staff_id" label="Staff" rules={[{required: true, message: 'Please select a guy from your staff'}]}>
                  <Select
                    showSearch={true}
                    onChange={this.checkStaffAvailability}
                    listHeight={500}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="">Choose Staff</Option>
                    {this.state.staffList.map((staff, i) => (
                      <Option key={`staff-${i}`} value={staff.id}>{staff.full_name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                {this.state.role === "technician" ?
                <Form.Item name="helper_id" label="Helper" rules={[{required: true, message: 'Please select a guy from your helper staff'}]}>
                  <Select
                    showSearch={true}
                    listHeight={500}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="">Choose Staff</Option>
                    {this.state.helperList.map((staff, i) => (
                      <Option key={`helper-${i}`} value={staff.id}>{staff.full_name}</Option>
                    ))}
                  </Select>
                </Form.Item> : ""}
                <Row gutter="16">
                  <Col span={12}>
                    <Form.Item name="start" label="Start" rules={[{required: true, message: 'Start time is required'}]}>
                      <TimePicker format={"hh:mm A"} className="w-100" onChange={e => {this.startTimeChanged(e); this.checkStaffAvailability();}} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="end" label="End" rules={[{required: true, message: 'Estimated end time is required'}]}>
                      <TimePicker format={"hh:mm A"} className="w-100" onChange={this.checkStaffAvailability} />
                    </Form.Item>
                  </Col>
                </Row>
                {this.state.ticket.type !== "mmt" ?
                  <Form.Item name="date" label="Date" rules={[{required: true, message: 'Date is required'}]}>
                    <DatePicker format={dateFormat} className="w-100" onChange={this.checkStaffAvailability} />
                  </Form.Item> : ""}
              </div>
              {(this.state.role === "technician" && this.state.staffCheckup) ?
                <div className={this.state.currStep !== 1 ? "d-none" : ""}>
                  <Divider orientation="left">Crew Evaluation</Divider>
                  <Row gutter="4">
                    <Col span={8}>
                      <Form.Item name="appearance" label="Appearance" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="health_condition" label="Health Condition" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="uniform" label="Uniform" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter="4">
                    <Col span={8}>
                      <Form.Item name="hair_cover" label="Hair Cover" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="shoe_cover" label="Shoe Cover" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="gloves" label="Gloves" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter="4">
                    <Col span={8}>
                      <Form.Item name="face_shield" label="Face Shield" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="tool_box" label="Tool Box" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </div> : ""}
                {(this.state.role === "technician") ?
                <div className={this.state.currStep !== 2 ? "d-none" : ""}>
                  <Divider orientation="left">Vehicle Evaluation</Divider>
                  <Form.Item name="vehicle_id" label="Vehicle" rules={[{required: true}]}>
                    <Select
                      allowClear
                      labelInValue={false}
                      placeholder="Choose Vehicle"
                      notFoundContent={this.state.fetchingVehicles ? <Spin size="small"/> : null}
                      showSearch={true}
                      filterOption={false}
                      onSearch={this.fetchVehicles}
                    >
                      {this.state.vehicles.map(d => (
                        <Option key={d.value} value={d.value}>{d.text}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Row gutter="4">
                    <Col span={8}>
                      <Form.Item name="vehicle_appearance" label="Appearance" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="vehicle_cleanliness" label="Cleanliness" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="vehicle_interior_condition" label="Interior Condition" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="vehicle_tire_condition" label="Tire Condition" rules={[{required: true, message: "Required"}]} valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item label="Condition">
                        <Form.Item name="condition" noStyle valuePropName="checked">
                          <Switch onChange={this.onChangeVehicle} />
                        </Form.Item>
                        <span className="ml-2">Vehicle Damages</span>
                      </Form.Item>
                    </Col>
                  </Row>
                  {(this.state.uploadVehicleImgs) ? <Dragger className="mb-3" {...this.dragerProps()}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload the vehicle damages photos</p>
                    <p className="ant-upload-hint">Support for a single or bulk upload.</p>
                  </Dragger> : ""}
                  <Form.Item className="text-right mb-0">
                    <Button type="primary" htmlType="submit" loading={this.state.loading}>
                      Add Mission
                    </Button>
                  </Form.Item>
                </div> : ""}
              {(this.state.role === "technician") ?
                (this.state.currStep !== 2) ?
                  <Form.Item className="text-right mb-0">
                    <Button type="primary" htmlType="button" onClick={() => this.nextStep()}>Next</Button>
                  </Form.Item> : ""
                :
                <Form.Item className="text-right mb-0">
                  <Button type="primary" htmlType="submit" loading={this.state.loading}>
                    Add Mission
                  </Button>
                </Form.Item>}
            </Form>
          </Modal>
        </Card>
      </>
    )
  }
}

const SkeletonCalendar = () => (
  <Col xs={24} sm={24} md={9} lg={6}>
    <h2 className="mb-4">Agenda</h2>
    {[0, 1, 2, 3].map((i) => (
      <div key={`skeleton-${i}`} className="calendar-list">
        <h4>
          <CalendarOutlined/>
          <Skeleton className="w-50 ml-2 d-inline-block" active={true} paragraph={false} title={{width: 150}}/>
        </h4>
        {[0, 1].map((i2) => (
          <div key={`skeleton-${i}-${i2}`} className="calendar-list-item">
            <div className="d-flex">
              <Badge color="gray"/>
              <div>
                <Skeleton active={true} paragraph={false} title={{width: 100}}/>
                <Row className="mt-1" gutter={6} align="middle">
                  <Col span={8}>
                    <Skeleton active={true} paragraph={false}/>
                  </Col>
                  <Col span={8}>
                    <Skeleton active={true} paragraph={false}/>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        ))}
      </div>
    ))}
  </Col>
)

export default AssignTicket
