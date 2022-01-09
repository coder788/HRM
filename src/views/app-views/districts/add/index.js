import React, {Component} from 'react';
import DistrictForm from '../form';
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import {Button, Form, message} from "antd";
import apiService from "services/ApiService";

export class AddDistrict extends Component {
  formRef = React.createRef();

  componentDidMount() {
    document.getElementById("radiusHtml").value = 10
    this.formRef.current.setFieldsValue({
      radius: 10
    })
  }

  onFinish = values => {
    const params = {
      name: values.name,
      about: values.about,
      latitude: document.getElementById("gmapsLatitude").value,
      longitude: document.getElementById("gmapsLongitude").value,
      radius: document.getElementById("radiusHtml").value,
    }

    message.loading({content: 'Sending...', key: 'updatable'});

    apiService.createDistrict(params).then(resp => {
      message.success({content: 'Done!', key: 'updatable', duration: 2})
      this.props.history.push("/app/districts/list")
    })
  };

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
              <h2 className="mb-3">New District</h2>
              <div className="mb-3">
                <Button className="mr-2" onClick={() => this.props.history.goBack()}>Discard</Button>
                <Button type="primary" htmlType="submit">
                  Add District
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container" style={{marginTop: 100}}>
          <DistrictForm style={{marginTop: 100}} mode="ADD" bordered={true} saveBtn={false} />
        </div>
			</Form>
      </>
    )
  }
}

export default AddDistrict
