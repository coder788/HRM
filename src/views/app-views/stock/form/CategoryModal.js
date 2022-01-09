import React from 'react'
import {Form, Input, message, Modal} from 'antd';
import apiService from "services/ApiService";

const CategoryModal = props => {
  const [formCategory] = Form.useForm();

  const saveCategoryModal = () => {
    formCategory.submit()
  }

  const onFinish = values => {
    const params = {
      title: values.title,
    }

    message.loading({content: 'Sending...', key: 'updatable'});

    apiService.stockCategoriesCreate(params).then(resp => {
      message.success({content: 'Done!', key: 'updatable', duration: 2})
      props.closeModal()
    })
  };

  return (
    <Modal
      title="New Category"
      visible={props.visible}
      onCancel={props.closeModal}
      destroyOnClose={true}
      onOk={saveCategoryModal}
      okText="Add Category"
      style={{top: 20}}
    >
      <Form
        form={formCategory}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            {
              required: true,
              message: 'Please enter title field. It is a required.',
            },
						{
							max: 100,
							message: 'Please enter a valid title not more than 100 characters',
						},
          ]}
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CategoryModal
