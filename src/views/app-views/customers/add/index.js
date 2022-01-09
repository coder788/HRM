import React, {Component} from 'react';
import CustomerForm from '../form';
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import {Button, Form, message, Spin} from "antd";
import apiService from "services/ApiService";

export class AddCustomer extends Component {
  formRef = React.createRef();

  onFinish = values => {
    const params = {
      dc_id: values.zone_id[0],
      zone_id: values.zone_id[1],
      fname: values.fname,
      lname: values.lname,
      house_num: values.house_num,
      email: values.email,
      mobile: values.mobile,
      phone: values.phone,
      address: values.address,
      latitude: document.getElementById("gmapsLatitude").value,
      longitude: document.getElementById("gmapsLongitude").value,
    }

    message.loading({content: 'Sending...', key: 'updatable'});

    apiService.createCustomer(params).then(resp => {
      message.success({content: 'Done!', key: 'updatable', duration: 2})
      this.props.history.push("/app/customers/list")
    })
  };

  updateHouseNumber = newvalue => {
    this.formRef.current.setFieldsValue({house_num: newvalue})
  }

  render() {
    return (
      <>
			<Form
				ref={this.formRef}
				layout="vertical"
				onFinish={this.onFinish}
			>
        <PageHeaderAlt className="bg-white border-bottom" overlap>
          <div className="container">
            <Flex className="py-2" mobileFlex={false} justifyContent="between" alignItems="center">
              <h2 className="mb-3">New Customer</h2>
              <div className="mb-3">
                <Button className="mr-2" onClick={() => this.props.history.goBack()}>Discard</Button>
                <Button type="primary" htmlType="submit">
                  Add Customer
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container" style={{marginTop: 100}}>
          <CustomerForm style={{marginTop: 100}} mode="ADD" bordered={true} saveBtn={false} updateHouseNumber={this.updateHouseNumber} />
        </div>
			</Form>
      </>
    )
  }
}

export default AddCustomer
