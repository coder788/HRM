import React, {useEffect, useState} from 'react'
import {Card, Col, Form, message, Row, Select, Spin, Tag, Upload} from 'antd';
import {ImageSvg} from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import {LoadingOutlined} from '@ant-design/icons';
import {GET_AUTH_HEADER, API_BASE_URL} from "configs/AppConfig";
import BasicFields from "./basic_fields";
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";

const {Dragger} = Upload;
const {Option} = Select;

const imageUploadProps = {
  name: 'file',
  multiple: false,
  listType: "picture-card",
  showUploadList: false,
  headers: GET_AUTH_HEADER(),
  action: `${API_BASE_URL}/equipments/upload_photo`
}

const beforeUpload = file => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 10;
  if (!isLt2M) {
    message.error('File must smaller than 10MB!');
  }
  return isJpgOrPng && isLt2M;
}

const EquipmentForm = props => {
  const [fetching, setFetchingState] = useState(false);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    setCustomers(props.customers)
  }, [props.customers]);

  const fetchUser = value => {
    setCustomers([])
    setFetchingState(true)
    apiService.searchCustomers(value).then(resp => {
      setCustomers(resp.data)
      setFetchingState(false)
    })
  };

  return (
    <>
      <Form
        form={props.form}
        layout="vertical"
      >
        <Row gutter={16} style={{marginTop: 100}}>
          <Col xs={24} sm={24} md={17}>
            <Card title="Basic Info">
              <Row>
                <Col xs={24} sm={24} md={24}>
                  <Form.Item name="customer_id" label="Customer" rules={rules.customer_id}>
                    <Select
                      allowClear
                      labelInValue={false}
                      placeholder="Select Customer"
                      notFoundContent={fetching ? <Spin size="small"/> : null}
                      showSearch={true}
                      filterOption={false}
                      onSearch={fetchUser}
                      size="large"
                    >
                      {customers.map(customer => (
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
              </Row>
              <BasicFields />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={7}>
            <Card title="Photo">
              <Dragger {...imageUploadProps} beforeUpload={beforeUpload} onChange={e => props.handleUploadChange(e)}>
                {
                  props.uploadedImg ?
                    <img src={props.uploadedImg} alt="avatar" className="img-fluid"/>
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
                            <CustomIcon className="display-3" svg={ImageSvg}/>
                            <p>Click or drag file to upload</p>
                          </div>
                      }
                    </div>
                }
              </Dragger>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  )
}

const rules = {
  customer_id: [
    {
      required: true,
      message: 'Please choose customer',
    }
  ],
}

export default EquipmentForm
