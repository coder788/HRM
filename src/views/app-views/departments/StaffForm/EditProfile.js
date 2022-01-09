import React, { Component } from "react";
import {
  Form,
  Avatar,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  message,
  Upload,
  Spin,
  Cascader,
  Select,
  Switch,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ROW_GUTTER } from "constants/ThemeConstant";
import Flex from "components/shared-components/Flex";
import apiService from "services/ApiService";
import {
  WEB_CONFIG,
  GET_AUTH_HEADER,
  API_BASE_URL,
  getAllZones,
  CAN_VIEW_MODULE,
} from "configs/AppConfig";
import moment from "moment";

export class EditProfile extends Component {
  formRef = React.createRef();

  componentDidMount() {
    if (this.props.profileid) {
      apiService.getUser(this.props.profileid).then((resp) => {
        this.setState({
          loading: false,
          avatarUrl: resp.photo_link,
          isActive: resp.active,
        });
        this.formRef.current.setFieldsValue({
          fname: resp.fname,
          lname: resp.lname,
          email: resp.email,
          username: resp.username,
          role_id: resp.role_id,
          birthdate: moment(resp.userinfo.birthdate, "YYYY-MM-DD"),
          mobile: resp.mobile,
          idnum: resp.userinfo.idnum,
          address: resp.userinfo.address,
          zone_id: [resp.dc_id, resp.zone_id],
        });
        this.roleAvailZone(this.props.profileid === "me" ? 0 : resp.role_id);
      });
    }
    this.getZones();
  }

  getZones() {
    this.setState({ zones: getAllZones() });
  }

  avatarEndpoint = `${API_BASE_URL}/user/upload_photo`;
  avatarHeaders = GET_AUTH_HEADER();

  state = {
    loading: !!this.props.profileid,
    zones: [],
    avatarUrl: "",
    uploaded_path: "",
    districtSelect: "zones",
  };

  getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  roleAvailZone = (role_id) => {
    if ([3, 4, 5].includes(role_id)) {
      this.setState({ districtSelect: "zones" });
    } else if ([2].includes(role_id)) {
      this.setState({ districtSelect: "districts" });
    } else {
      this.setState({ districtSelect: false });
    }
  };

  render() {
    const { Option } = Select;

    const onFinish = (values) => {
      const key = "updatable";
      message.loading({ content: "Updating...", key });

      let params = {
        id:
          this.props.profileid && this.props.profileid !== "me"
            ? this.props.profileid
            : "",
        password: values.password,
        fname: values.fname,
        lname: values.lname,
        email: values.email,
        username: values.username,
        birthdate: values.birthdate.format("YYYY-MM-DD"),
        mobile: values.mobile,
        idnum: values.idnum,
        address: values.address,
        photo: this.state.uploaded_path,
        dc_id:
          this.state.districtSelect && values.zone_id[0]
            ? values.zone_id[0]
            : 0,
        zone_id:
          this.state.districtSelect && values.zone_id[1]
            ? values.zone_id[1]
            : 0,
      };

      if (!this.props.profileid || this.props.profileid !== "me") {
        params.role_id = values.role_id;
        params.active = this.state.isActive;
      }

      if (this.props.profileid && this.props.profileid !== "me") {
        apiService.updateUser(params).then((resp) => {
          this.setState({ uploaded_path: "" });
          message.success({ content: "Done!", key, duration: 2 });
        });
      } else if (this.props.profileid) {
        apiService.updateUser(params).then((resp) => {
          this.setState({ uploaded_path: "" });
          message.success({ content: "Done!", key, duration: 2 });
        });
      } else {
        apiService.createUser(params).then((resp) => {
          this.setState({ uploaded_path: "" });
          message.success({ content: "Done!", key, duration: 2 });
          setTimeout(() => {
            this.props.gotoLink("/app/employee/list");
          }, 500);
        });
      }
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    const onUploadAavater = (info) => {
      const key = "updatable";
      if (info.file.status === "uploading") {
        message.loading({ content: "Uploading...", key, duration: 1000 });
        return;
      }
      if (info.file.status === "done") {
        this.getBase64(info.file.originFileObj, (imageUrl) =>
          this.setState({
            avatarUrl: imageUrl,
          })
        );
        this.setState({ uploaded_path: info.file.response.path });
        message.success({ content: "Uploaded!", key, duration: 1.5 });
      }
    };

    const onRemoveAvater = () => {
      this.setState({
        avatarUrl: "",
      });
    };

    const onChangeActive = (checked) => {
      this.setState({ isActive: checked });
    };

    const roleChanged = (role_id) => {
      this.formRef.current.setFieldsValue({ zone_id: [] });
      this.roleAvailZone(role_id);
    };

    const { avatarUrl, loading } = this.state;

    return (
      <>
        <Spin spinning={loading}>
          <Flex
            alignItems="center"
            mobileFlex={false}
            className="text-center text-md-left"
          >
            <Avatar size={90} src={avatarUrl} icon={<UserOutlined />} />
            <div className="ml-md-3 mt-md-0 mt-3">
              <Upload
                onChange={onUploadAavater}
                showUploadList={false}
                action={this.avatarEndpoint}
                headers={this.avatarHeaders}
                accept="image/*"
              >
                <Button type="primary">Change Avatar</Button>
              </Upload>
              <Button className="ml-2" onClick={onRemoveAvater}>
                Remove
              </Button>
            </div>
          </Flex>
          <div className="mt-4">
            <Form
              ref={this.formRef}
              name="basicInformation"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Row>
                <Col xs={24} sm={24} md={24} lg={16}>
                  <Row gutter={ROW_GUTTER}>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="First Name"
                        name="fname"
                        rules={[
                          {
                            required: true,
                            message: "Please input first name",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Last Name"
                        name="lname"
                        rules={[
                          {
                            required: true,
                            message: "Please input last name",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Username"
                        name="username"
                        rules={[
                          {
                            required: true,
                            max: 50,
                            message: "Please input username",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    {!this.props.profileid ? (
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            {
                              required: true,
                              max: 50,
                              min: 8,
                              message: "Please input valid password",
                            },
                          ]}
                        >
                          <Input.Password />
                        </Form.Item>
                      </Col>
                    ) : (
                      ""
                    )}
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          {
                            required: true,
                            type: "email",
                            message: "Please enter a valid email",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Date of Birth"
                        name="birthdate"
                        rules={[
                          {
                            required: true,
                            type: "date",
                            message: "Please enter a valid birth date",
                          },
                        ]}
                      >
                        <DatePicker className="w-100" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="Mobile Number"
                        name="mobile"
                        rules={[
                          {
                            required: true,
                            type: "string",
                            max: 12,
                            min: 12,
                            message: "Please enter a valid mobile number",
                          },
                        ]}
                      >
                        <Input placeholder="966xxxxxxxxx" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={12}>
                      <Form.Item
                        label="ID Number"
                        name="idnum"
                        rules={[
                          {
                            required: true,
                            type: "string",
                            max: 10,
                            message: "Please enter a valid national ID number",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24}>
                      <Form.Item
                        label="Address"
                        name="address"
                        rules={[
                          {
                            required: false,
                            type: "string",
                            max: 150,
                            message: "Please enter physical address",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    {!this.props.profileid ||
                    (this.props.profileid && this.props.profileid !== "me") ? (
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item label="Role" name="role_id">
                          <Select onChange={roleChanged}>
                            {WEB_CONFIG("settings").roles.map((elm, i) => {
                              return (
                                <Option key={elm.id} value={elm.id}>
                                  {elm.title}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </Col>
                    ) : (
                      ""
                    )}
                    {this.state.districtSelect ? (
                      <Col xs={24} sm={24} md={12}>
                        <Form.Item label="Zone" name="zone_id">
                          <Cascader
                            options={
                              this.state.districtSelect === "districts"
                                ? getAllZones(true)
                                : this.state.zones
                            }
                            placeholder="Please select"
                          />
                        </Form.Item>
                      </Col>
                    ) : (
                      ""
                    )}
                    {!this.props.profileid ||
                    (this.props.profileid && this.props.profileid !== "me") ? (
                      <Col xs={24} sm={24} md={24}>
                        <Form.Item label="Active">
                          <Switch
                            checked={this.state.isActive}
                            onChange={onChangeActive}
                          />
                        </Form.Item>
                      </Col>
                    ) : (
                      ""
                    )}
                  </Row>
                  <Button type="primary" htmlType="submit">
                    Save Change
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </Spin>
      </>
    );
  }
}

export default EditProfile;
