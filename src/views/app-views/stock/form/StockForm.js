import React, {useEffect, useState} from 'react'
import {Button, Card, Cascader, Col, Form, Input, message, Row, Select, Tooltip, Upload} from 'antd';
import {ImageSvg} from 'assets/svg/icon';
import CustomIcon from 'components/util-components/CustomIcon'
import {BarcodeOutlined, FolderAddOutlined, LoadingOutlined, ProfileOutlined, ShoppingCartOutlined} from '@ant-design/icons';
import {GET_AUTH_HEADER, API_BASE_URL, getAllZones, CAN_VIEW_MODULE} from "configs/AppConfig";
import apiService from "services/ApiService";
import CategoryModal from "./CategoryModal";

const {Dragger} = Upload;
const {Option} = Select;

const imageUploadProps = {
  name: 'file',
  multiple: false,
  listType: "picture-card",
  showUploadList: false,
  headers: GET_AUTH_HEADER(),
  action: `${API_BASE_URL}/stock/upload_photo`
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

const StockForm = props => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [modalCatState, setModalCatState] = useState(false);

  useEffect(() => {
    categoriesList()
  }, [])

  const categoriesList = () => {
    setCategoriesLoading(true)
    apiService.stockCategories().then(resp => {
      setCategories(resp)
      setCategoriesLoading(false)
    })
  }

  const openCategoryModal = () => {
    setModalCatState(true)
  }
  const closeCategoryModal = () => {
    setModalCatState(false)
    categoriesList()
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
              <Row>
                <Col xs={24} sm={24} md={15}>
                  <Form.Item name="title" label="Title" rules={rules.title}>
                    <Input placeholder="Title" prefix={<ProfileOutlined className="site-form-item-icon"/>}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={10}>
                  <Form.Item name="model" label="Model" rules={rules.model}>
                    <Input placeholder="Model" prefix={<BarcodeOutlined className="site-form-item-icon"/>}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={6}>
                  <Form.Item name="quantity" label="Quantity" rules={rules.quantity}>
                    <Input placeholder="Quantity" prefix={<ShoppingCartOutlined className="site-form-item-icon"/>}/>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col xs={24} sm={24} md={10}>
                  <Form.Item name="zone" label="Zone" rules={rules.zone}>
                    <Cascader options={getAllZones()} placeholder="Choose Zone"/>
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
                {(CAN_VIEW_MODULE(89)) ?
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
      <CategoryModal visible={modalCatState} closeModal={closeCategoryModal}/>
    </>
  )
}

const rules = {
  title: [
    {
      required: true,
      message: 'Please enter a title for the item',
    }
  ],
  model: [
    {
      required: true,
      message: 'Please enter a unique model code',
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
  quantity: [
    {
      required: true,
      message: 'Please enter the item quantity in stock',
    }
  ],
  zone: [
    {
      required: true,
      message: 'Please set the ticket zone',
    }
  ],
}

export default StockForm
