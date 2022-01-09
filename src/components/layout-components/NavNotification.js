import React from 'react';
import { Menu, Dropdown, Badge, Avatar, List, Button, notification } from 'antd';
import { 
  MailOutlined, 
  BellOutlined, 
  WarningOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import Flex from 'components/shared-components/Flex'
import {WEB_CONFIG, WSSOCKET} from "configs/AppConfig";
import apiService from "services/ApiService";
import moment from "moment";

const getIcon = (type, icon) => {
  switch (icon) {
    case 'mail':
      return type === "icon" ? <MailOutlined /> : ""
    case 'alert':
      return type === "icon" ? <WarningOutlined /> : "bg-danger"
    case 'info':
      return type === "icon" ? <CheckCircleOutlined /> : ""
    default:
      return type === "icon" ? <CheckCircleOutlined /> : ""
  }
}

const getNotificationBody = (list, loading, gotoLink) => {
  return list.length > 0 ?
  <List
    size="small"
    itemLayout="horizontal"
    dataSource={list}
    loading={loading}
    renderItem={item => (
      <List.Item className="list-clickable">
        <Flex alignItems="center">
          <div className="pr-3">
            {item.from? <Avatar src={item.from.photo_link} /> : <Avatar className={`ant-avatar-${item.action} ${getIcon("bg", item.action)}`} icon={getIcon("icon", item.action)} />}
          </div>
          <div className="mr-3">
            <span className="font-weight-bold text-dark">{item.from? item.from.full_name : item.subject} </span>
            <span className="text-gray-light" onClick={(e) => gotoLink(e, item.link)}>{item.text}</span>
          </div>
          <small className="ml-auto">{(moment(item.created_at).isSame(new Date(), "day")) ? moment(item.created_at).format("hh:mmA") : moment(item.created_at).format("DD/MM")}</small>
        </Flex>
      </List.Item>
    )}
  />
  :
  <div className="empty-notification">
    <img src="/img/others/empty-notifs.svg" alt="empty" />
    <p className="mt-3">You have viewed all notifications</p>
  </div>;
}

export class NavNotification extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      unreadCounter: 0,
      visible: false,
      loading: false,
    }
    this.handleVisibleChange = this.handleVisibleChange.bind(this);
    this.gotoLink = this.gotoLink.bind(this);
  }

  componentWillUnmount() {
    WSSOCKET.off(`arabianfal_database_notification:new-${WEB_CONFIG("id")}`)
  }

  componentDidMount() {
    WSSOCKET.on(`arabianfal_database_notification:new-${WEB_CONFIG("id")}`, function (newNotificationData) {
      console.log("new notification", newNotificationData)
      notification.info({
        message: newNotificationData.from? newNotificationData.from.full_name : newNotificationData.subject,
        description: newNotificationData.text
      })
      this.newNotification(newNotificationData)
    }.bind(this))

    apiService.getProfile().then(resp => {
      this.setState({data: resp.notifications, unreadCounter: resp.unread_notifications_count})
    })
  }

  newNotification(newNotificationData) {
    this.setState({data: [newNotificationData, ...this.state.data], unreadCounter: this.state.unreadCounter+1})
  }

  markAllAsRead() {
    this.setState({loading: true})
    apiService.notifsMarkAllRead().then(resp => {
      this.setState({data: [], unreadCounter: 0, loading: false})
    })
  }

  handleVisibleChange(flag){
    this.setState({visible: flag})
  }

  gotoLink(e, link){
    e.preventDefault()
    if(! link || link === "") return
    this.props.gotoLink(link)
  }

  render() {
    const notificationList = (
      <div className="nav-dropdown nav-notification">
        <div className="nav-notification-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Notification</h4>
          <Button type="link" onClick={() => this.markAllAsRead()} size="small">Clear </Button>
        </div>
        <div className="nav-notification-body">
          {getNotificationBody(this.state.data, this.state.loading, this.gotoLink)}
        </div>
        {
          this.state.data.length > 0 ?
            <div className="nav-notification-footer">
              <a className="d-block" href="/app/dashboard" onClick={(e) => this.gotoLink(e, '/app/dashboard')}>View all</a>
            </div>
            :
            null
        }
      </div>
    );

    return (
      <Dropdown
        placement="bottomRight"
        overlay={notificationList}
        onVisibleChange={this.handleVisibleChange}
        visible={this.state.visible}
        trigger={['click']}
      >
        <Menu mode="horizontal">
          <Menu.Item>
            <Badge count={this.state.unreadCounter}>
              <BellOutlined className="nav-icon mx-auto" type="bell" />
            </Badge>
          </Menu.Item>
        </Menu>
      </Dropdown>
    )
  }
}

export default NavNotification;
