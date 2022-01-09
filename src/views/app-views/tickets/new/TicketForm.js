import React, {useEffect, useState} from 'react'
import {Button, Card, Col, DatePicker, Form, Input, message, Radio, Row, Select, Spin, Tag, TimePicker, Tooltip, Upload} from 'antd';
import {DocsAltSvg} from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import Icon, {AlertOutlined, BarcodeOutlined, CalendarOutlined, EyeOutlined, LoadingOutlined, UserAddOutlined, CloudDownloadOutlined, FolderAddOutlined, DeleteOutlined, GoldOutlined} from '@ant-design/icons';
import {API_BASE_URL, CAN_VIEW_MODULE, GET_AUTH_HEADER, WEB_CONFIG} from "configs/AppConfig";
import apiService from "services/ApiService";
import CustomerModal from "./CustomerModal";
import EquipmentModal from "./EquipmentModal";
import CategoryModal from "./CategoryModal";
import custom from "./custom.css";
import Flex from "components/shared-components/Flex";

const {Dragger} = Upload;
const {Option} = Select;

const imageUploadProps = {
  name: 'file',
  multiple: false,
  listType: "picture-card",
  showUploadList: false,
  headers: GET_AUTH_HEADER(),
  action: `${API_BASE_URL}/tickets/upload_file`
}

const beforeUpload = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG/PDF file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 20;
  if (!isLt2M) {
    message.error('File must smaller than 20MB!');
  }
  return isJpgOrPng && isLt2M;
}

const IconComponents = {
  AlertOutlined: AlertOutlined,
  CalendarOutlined: CalendarOutlined,
  EyeOutlined: EyeOutlined,
};

const TicketForm = props => {
  const ticketTypes = WEB_CONFIG("settings").ticket_types

  const [fetching, setFetchingState] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [modalState, setModalState] = useState(false);
  const [modalEquipState, setEquipModalState] = useState(false);
  const [modalCatState, setModalCatState] = useState(false);
  const [dateFieldState, setDateFieldState] = useState(false);

  useEffect(() => {
    ticketsCategoriesList()
  }, [])

  const ticketsCategoriesList = () => {
    setCategoriesLoading(true)
    apiService.ticketsCategories().then(resp => {
      setCategories(resp)
      setCategoriesLoading(false)
    })
  }

  const fetchUser = value => {
    props.updateCustomersList([])
    setFetchingState(true)
    apiService.searchCustomers(value).then(resp => {
      props.updateCustomersList(resp.data)
      setFetchingState(false)
    })
  };

  const changeDateFieldState = (event) => {
    if(event.target.value === "mmt"){
      setDateFieldState(false)
    } else {
      setDateFieldState(true)
    }
  }

  const openCustomerModal = () => {
    setModalState(true)
  }
  const closeCustomerModal = (user) => {
    setModalState(false)
    if(user.id){
      props.updateCustomersList([user])
      props.form.setFieldsValue({customer_id: user.id})
    }
  }

  const openEquipmentModal = () => {
    setEquipModalState(true)
  }
  const closeEquipmentModal = (equipment) => {
    setEquipModalState(false)
    if(equipment.id){
      props.updateEquipmentsList([equipment])
      props.form.setFieldsValue({equipment_id: equipment.id})
    }

  }

  const openCategoryModal = () => {
    setModalCatState(true)
  }
  const closeCategoryModal = () => {
    setModalCatState(false)
    ticketsCategoriesList()
  }

  return (
    <>
      <Form
        form={props.form}
        layout="vertical"
      >
        <Row gutter={16} style={{marginTop: 100}}>
          <Col xs={24} sm={24} md={17}>
            <Card title="Basic Info">
              <Row justify="center">
                <Col span={24} className="text-center">
                  <Form.Item name="type" rules={rules.type}>
                    <Radio.Group buttonStyle="solid" onChange={changeDateFieldState}>
                      {
                        ticketTypes.map((ticketType, index) => (
                            <Radio.Button theme={custom} key={index} value={ticketType.name} style={{height: 100, width: 110, textAlign: "center"}}>
                              <Icon style={{fontSize: '23px', color: ticketType.color, marginTop: 14, padding: "10px 12px", backgroundColor: ticketType.bgcolor}} className="rounded" component={IconComponents[ticketType.icon]}/>
                              <h5 className="mb-0 font-weight-bold mt-2">{ticketType.title}</h5>
                            </Radio.Button>
                          )
                        )
                      }
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Row className="mt-2">
                <Col xs={24} sm={24} md={12}>
                  <Form.Item name="code" rules={rules.code}>
                    <Input placeholder="Ticket Code" prefix={<BarcodeOutlined className="site-form-item-icon"/>}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row justify="center" align="middle">
                <Col span={20}>
                  <Form.Item name="customer_id" label="Customer" rules={rules.customer_id}>
                    <Select
                      allowClear
                      labelInValue={false}
                      placeholder="Select Customer"
                      notFoundContent={fetching ? <Spin size="small"/> : null}
                      showSearch={true}
                      filterOption={false}
                      onSearch={fetchUser}
                      onChange={props.selectedCustomer}
                      size="large"
                    >
                      {props.customer.map(customer => (
                        <Option key={customer.id} value={customer.id}>
                          <Flex alignItems="center" justifyContent="start" flexDirection="row">
                            <p>
                              <span className="font-weight-bold text-dark d-block">{customer.full_name}</span>
                              <span className="font-weight-light text-gray-light font-size-sm d-block">{customer.mobile === "" ? "No Mobile" : customer.mobile}</span>
                            </p>
                            <Tag color="blue" className="ml-2">{customer.house_num}</Tag>
                          </Flex>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {(CAN_VIEW_MODULE(58)) ?
                <Col span={4}>
                  <Tooltip title="New Customer" className="ml-2 mt-1 float-left">
                    <Button onClick={() => openCustomerModal()} type="default" size="small" icon={<UserAddOutlined/>}/>
                  </Tooltip>
                </Col> : ""}
              </Row>
              <Row align="middle">
                <Col span={14}>
                  <Form.Item name="equipment_id" label="Equipment">
                    <Select
                      allowClear
                      placeholder="Select Equipment"
                      size="large"
                    >
                      <Option key={-1} value={-1}>Out Of Scope</Option>
                      <Option key={0} value={0}>Not Specified</Option>
                      {props.equipments.map(equipment => (
                        <Option key={equipment.id} value={equipment.id}>
                          <Flex alignItems="center" justifyContent="start" flexDirection="row">
                            <p>
                              <span className="font-weight-bold text-dark d-block">{equipment.title}</span>
                              <span className="font-weight-light text-gray-light font-size-sm d-block">{equipment.number}</span>
                            </p>
                          </Flex>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {(CAN_VIEW_MODULE(79) && props.form.getFieldsValue().customer_id) ?
                  <Col span={4}>
                    <Tooltip title="New Equipment" className="ml-2 mt-1 float-left">
                      <Button onClick={() => openEquipmentModal()} type="default" size="small" icon={<GoldOutlined/>}/>
                    </Tooltip>
                  </Col> : ""}
              </Row>
              {(dateFieldState)?
                <Row>
                  <Col xs={24} sm={24} md={14}>
                    <Form.Item name="date" label="Schedule Date" rules={rules.date}>
                      <DatePicker placeholder="Select Ticket Date" style={{width: "100%"}}/>
                    </Form.Item>
                  </Col>
                </Row> : ""
              }
              <Row>
                <Col xs={24} sm={24} md={10}>
                  <Form.Item name="time" label="Issued Time" rules={rules.time}>
                    <TimePicker placeholder="Set Start Time" format='h:mm a' style={{width: "100%"}}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={24}>
                  <Form.Item name="description" label="Discription" rules={rules.description}>
                    <Input.TextArea rows={12} placeholder="Problem Discription"/>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={7}>
            <Card title="Documents">
              <Dragger {...imageUploadProps} beforeUpload={beforeUpload} onChange={e => props.handleUploadChange(e)}>
                {
                  props.uploadedImg ?
                    (
                      <div>
                        <CloudDownloadOutlined style={{ fontSize: "4.875rem" }} className="text-primary"/>
                        <div className="mt-3"><a href={props.uploadedImg}>Download</a></div>
                        <div className="text-danger position-absolute" style={{top: 5, right: 5}} onClick={props.resetUpload}><DeleteOutlined /> Remove</div>
                      </div>
                    )
                    :
                    <div>
                      {
                        props.uploadLoading ?
                          <div>
                            <LoadingOutlined className="font-size-xxl text-primary"/>
                            <div className="mt-3">Uploading</div>
                          </div>
                          :
                          <div>
                            <CustomIcon className="display-3" svg={DocsAltSvg}/>
                            <p>Click or drag file to upload</p>
                          </div>
                      }
                    </div>
                }
              </Dragger>
            </Card>
            <Card title="Organization">
              <Row justify="center" align="middle">
                <Col span={20}>
                  <Form.Item name="cat_id" label="Category">
                    <Select className="w-100" placeholder="Category" loading={categoriesLoading}>
                      <Option key={0} value={0}>Choose Category</Option>
                      {
                        categories.map(elm => (
                          <Option key={elm.id} value={elm.id}>{elm.title}</Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </Col>
                {(CAN_VIEW_MODULE(94)) ?
                <Col span={4}>
                  <Tooltip title="New Category" className="ml-2 mt-1 float-left">
                    <Button onClick={() => openCategoryModal()} type="default" size="small" icon={<FolderAddOutlined/>}/>
                  </Tooltip>
                </Col> : ""}
              </Row>
              <Form.Item name="tags" label="Tags">
                <Select mode="tags" style={{width: '100%'}} placeholder="Tags">
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
      <CustomerModal visible={modalState} closeModal={closeCustomerModal}/>
      <EquipmentModal visible={modalEquipState} customer_id={props.form.getFieldsValue().customer_id} closeModal={closeEquipmentModal}/>
      <CategoryModal visible={modalCatState} closeModal={closeCategoryModal}/>
    </>
  )
}

const rules = {
  code: [
    {
      required: true,
      message: 'Please enter ticket code',
    }
  ],
  description: [
    {
      required: true,
      message: 'Please enter the problem detailed description',
    }
  ],
  date: [
    {
      required: true,
      message: 'Please select a valid date',
    }
  ],
  time: [
    {
      required: true,
      message: 'Please pick a valid start time',
    }
  ],
  type: [
    {
      required: true,
      message: 'Please select the ticket type',
    }
  ],
  price: [
    {
      required: true,
      message: 'Please enter product price',
    }
  ],
  customer_id: [
    {
      required: true,
      message: 'Please select customer',
    }
  ],
  zone: [
    {
      required: true,
      message: 'Please set the ticket zone',
    }
  ],
}

export default TicketForm
