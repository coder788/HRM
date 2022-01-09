import React from "react";
import { Menu, Dropdown, Avatar } from "antd";
import { connect } from 'react-redux'
import { 
  EditOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import Icon from 'components/util-components/Icon';
import { signOut } from 'redux/actions/Auth';
import {CAN_VIEW_MODULE, WEB_CONFIG} from "configs/AppConfig";

let menuItem = []

if(CAN_VIEW_MODULE(134)){
  menuItem.push({
    title: "Edit Profile",
    icon: EditOutlined ,
    path: "/app/staff/edit/me/profile"
  })
}
if(CAN_VIEW_MODULE(133)){
  menuItem.push({
    title: "Change Password",
    icon: SecurityScanOutlined,
    path: "/app/staff/edit/me/password"
  })
}
if(CAN_VIEW_MODULE(135)){
  menuItem.push({
    title: "Notification Settings",
    icon: SettingOutlined,
    path: "/app/staff/edit/me/notification"
  })
}

export const NavProfile = ({signOut}) => {
  const fullName = WEB_CONFIG("full_name")
  const profileImg = WEB_CONFIG("photo_link");
  const profileRole = WEB_CONFIG("role").title;

  const profileMenu = (
    <div className="nav-profile nav-dropdown">
      <div className="nav-profile-header">
        <div className="d-flex">
          <Avatar size={45} src={profileImg} />
          <div className="pl-3">
            <h4 className="mb-0">{fullName}</h4>
            <span className="text-muted">{profileRole}</span>
          </div>
        </div>
      </div>
      <div className="nav-profile-body">
        <Menu>
          {menuItem.map((el, i) => {
            return (
              <Menu.Item key={i}>
                <a href={el.path}>
                  <Icon className="mr-3" type={el.icon} />
                  <span className="font-weight-normal">{el.title}</span>
                </a>
              </Menu.Item>
            );
          })}
          <Menu.Item key={menuItem.legth + 1} onClick={e => signOut()}>
            <span>
              <LogoutOutlined className="mr-3"/>
              <span className="font-weight-normal">Sign Out</span>
            </span>
          </Menu.Item>
        </Menu>
      </div>
    </div>
  );
  return (
    <Dropdown placement="bottomRight" overlay={profileMenu} trigger={["click"]}>
      <Menu className="d-flex align-item-center" mode="horizontal">
        <Menu.Item>
          <Avatar src={profileImg} />
        </Menu.Item>
      </Menu>
    </Dropdown>
  );
}

export default connect(null, {signOut})(NavProfile)
