import React from 'react'
import {Card, Col, Form, Input, message, Radio, Row, Upload} from 'antd';
import {ImageSvg} from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import {BarcodeOutlined, LoadingOutlined} from '@ant-design/icons';
import {GET_AUTH_HEADER, API_BASE_URL} from "configs/AppConfig";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTruck, faTruckPickup} from "@fortawesome/free-solid-svg-icons";

const {Dragger} = Upload;

const imageUploadProps = {
  name: 'file',
  multiple: false,
  listType: "picture-card",
  showUploadList: false,
  headers: GET_AUTH_HEADER(),
  action: `${API_BASE_URL}/vehicles/upload_photo`
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

const VehicleForm = props => {
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
                <Col xs={24} sm={24} md={15}>
                  <Form.Item name="type" label="Vehicle Type" rules={[{required: true}]}>
                    <Radio.Group size="middle" buttonStyle="solid">
                      <Radio.Button value="mobile"><FontAwesomeIcon icon={faTruck} /> Mobile Workshop</Radio.Button>
                      <Radio.Button value="pickup"><FontAwesomeIcon icon={faTruckPickup} /> Pick Up</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={15}>
                  <Form.Item name="plate_num" label="Plate Number" rules={rules.plate_num}>
                    <Input placeholder="eg. 4031RUA" prefix={<BarcodeOutlined className="site-form-item-icon"/>}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item name="company" label="Company" rules={rules.company}>
                    <Input placeholder="Toyota" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item name="model" label="Model" rules={rules.model} className="ml-3">
                    <Input placeholder="Hilux" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={5}>
                  <Form.Item name="year" label="Year" rules={rules.year} className="ml-3">
                    <Input placeholder="2020" />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={24}>
                  <Form.Item name="notes" label="Notes" rules={rules.notes}>
                    <Input.TextArea rows={12} placeholder="Write some notes..."/>
                  </Form.Item>
                </Col>
              </Row>
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
  plate_num: [
    {
      required: true,
      message: 'Please enter the vehicle plate number',
    }
  ],
  company: [
    {
      required: true,
      message: 'Please enter the manufacture company  name',
    }
  ],
  model: [
    {
      required: true,
      message: 'Please enter the vehicle model',
    }
  ],
  year: [
    {
      required: true,
      message: 'Please enter the vehicle manufacturing year',
    }
  ],
  notes: [
    {
      required: false,
      type: "string",
      max: 255,
      message: 'Please enter some notes',
    }
  ],
}

export default VehicleForm
