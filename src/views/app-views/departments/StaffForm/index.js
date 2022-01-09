import React, { Component } from "react";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import InnerAppLayout from "layouts/inner-app-layout";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import Notification from "./Notification";
import Permissions from "./Permissions";
import { CAN_VIEW_MODULE } from "configs/AppConfig";
import Department from "./Department";

const SettingOption = ({ match, location }) => {
  return (
    <Menu
      defaultSelectedKeys={`${match.url}/profile`}
      mode="inline"
      selectedKeys={[location.pathname]}
    >
      {CAN_VIEW_MODULE(39) ||
      (CAN_VIEW_MODULE(134) && match.params.id === "me") ? (
        <Menu.Item key={`${match.url}/profile`}>
          <UserOutlined />
          <span>Edit Profile</span>
          <Link to={"profile"} />
        </Menu.Item>
      ) : (
        ""
      )}
      {CAN_VIEW_MODULE(40) ||
      (CAN_VIEW_MODULE(133) && match.params.id === "me") ? (
        <Menu.Item key={`${match.url}/password`}>
          <LockOutlined />
          <span>Change Password</span>
          <Link to={"password"} />
        </Menu.Item>
      ) : (
        ""
      )}
      {CAN_VIEW_MODULE(41) ||
      (CAN_VIEW_MODULE(135) && match.params.id === "me") ? (
        <Menu.Item key={`${match.url}/notification`}>
          <BellOutlined />
          <span>Notification</span>
          <Link to={`notification`} />
        </Menu.Item>
      ) : (
        ""
      )}
      {CAN_VIEW_MODULE(129) && match.params.id !== "me" ? (
        <Menu.Item key={`${match.url}/permissions`}>
          <KeyOutlined />
          <span>Permissions</span>
          <Link to={`permissions`} />
        </Menu.Item>
      ) : (
        ""
      )}
    </Menu>
  );
};

const SettingAddOption = ({ match, location }) => {
  return (
    <Menu
      defaultSelectedKeys={`${match.url}/profile`}
      mode="inline"
      selectedKeys={[location.pathname]}
    >
      <Menu.Item key={`${match.url}/profile`}>
        <UserOutlined />
        <span>Profile</span>
        <Link to={"profile"} />
      </Menu.Item>
    </Menu>
  );
};

const SettingContent = ({ match, history }) => {
  return (
    <Switch>
      <Redirect exact from={`${match.url}`} to={`${match.url}/profile`} />
      <Route
        path={`${match.url}/profile`}
        component={() => (
          <EditProfile
            gotoLink={(link) => history.push(link)}
            profileid={match.params.id}
          />
        )}
      />
      <Route
        path={`${match.url}/password`}
        component={() => <ChangePassword profileid={match.params.id} />}
      />
      <Route
        path={`${match.url}/notification`}
        component={() => <Notification profileid={match.params.id} />}
      />
      <Route
        path={`${match.url}/permissions`}
        component={() => <Permissions profileid={match.params.id} />}
      />
      <Route
        path={`${match.url}/departments`}
        component={() => <Department profileid={match.params.id} />}
      />
    </Switch>
  );
};

export class StaffForm extends Component {
  render() {
    return this.props.match.params.id ? (
      <InnerAppLayout
        sideContentWidth={320}
        sideContent={<SettingOption {...this.props} />}
        mainContent={<SettingContent {...this.props} />}
      />
    ) : (
      <InnerAppLayout
        sideContentWidth={320}
        sideContent={<SettingAddOption {...this.props} />}
        mainContent={<SettingContent {...this.props} />}
      />
    );
  }
}

export default StaffForm;
