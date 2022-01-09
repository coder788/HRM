import React, {Component} from 'react';
import ZoneForm from '../form';
import PageHeaderAlt from "components/layout-components/PageHeaderAlt";
import Flex from "components/shared-components/Flex";
import {Button, Form, message} from "antd";
import apiService from "services/ApiService";

export class AddZone extends Component {
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
      dc_id: values.dc_id,
      about: values.about,
      latitude: document.getElementById("gmapsLatitude").value,
      longitude: document.getElementById("gmapsLongitude").value,
      radius: document.getElementById("radiusHtml").value,
    }

    message.loading({content: 'Sending...', key: 'updatable'});

    apiService.createZone(params).then(resp => {
      message.success({content: 'Done!', key: 'updatable', duration: 2})
      this.props.history.push("/app/zones/list")
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
              <h2 className="mb-3">New Zone</h2>
              <div className="mb-3">
                <Button className="mr-2" onClick={() => this.props.history.goBack()}>Discard</Button>
                <Button type="primary" htmlType="submit">
                  Add Zone
                </Button>
              </div>
            </Flex>
          </div>
        </PageHeaderAlt>
        <div className="container" style={{marginTop: 100}}>
          <ZoneForm style={{marginTop: 100}} mode="ADD" bordered={true} saveBtn={false} />
        </div>
			</Form>
      </>
    )
  }
}

export default AddZone
