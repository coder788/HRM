import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Card,
  Avatar,
  Dropdown,
  Menu,
  Cascader,
  DatePicker,
  Table,
  Badge,
  Input,
} from "antd";
import StatisticWidget from "components/shared-components/StatisticWidget";
import ChartWidget from "components/shared-components/ChartWidget";
import AvatarStatus from "components/shared-components/AvatarStatus";
import GoalWidget from "components/shared-components/GoalWidget";
import {
  SendOutlined,
  SyncOutlined,
  EyeOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  FileDoneOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  AlertOutlined,
  MailOutlined,
  WarningOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  IssuesCloseOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import apiService from "services/ApiService";
import { withRouter } from "react-router-dom";
import DataDisplayWidget from "components/shared-components/DataDisplayWidget";
import Flex from "components/shared-components/Flex";
import { CAN_VIEW_MODULE, getAllZones, WEB_CONFIG } from "configs/AppConfig";
import moment from "moment";
import { useHistory } from "react-router-dom";
import AppBreadcrumb from "components/layout-components/AppBreadcrumb";
import { COLORS } from "constants/ChartConstant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faToolbox,
  faCheckDouble,
  faExclamationTriangle,
  faFistRaised,
} from "@fortawesome/free-solid-svg-icons";

const { RangePicker } = DatePicker;
const { Search } = Input;

const getIcon = (type, icon) => {
  switch (icon) {
    case "mail":
      return type === "icon" ? <MailOutlined /> : "";
    case "alert":
      return type === "icon" ? <WarningOutlined /> : "bg-danger";
    case "info":
      return type === "icon" ? <CheckCircleOutlined /> : "";
    default:
      return type === "icon" ? <CheckCircleOutlined /> : "";
  }
};

const latestTransactionOption = (
  deleteAllNotifications,
  markAllNotifsRead,
  refreshNotifs
) => (
  <Menu>
    <Menu.Item key="0" onClick={() => refreshNotifs()}>
      <span>
        <div className="d-flex align-items-center">
          <SyncOutlined spin />
          <span className="ml-2">Refresh</span>
        </div>
      </span>
    </Menu.Item>
    {CAN_VIEW_MODULE(50) ? (
      <Menu.Item key="1" onClick={() => markAllNotifsRead()}>
        <span>
          <div className="d-flex align-items-center">
            <EyeOutlined />
            <span className="ml-2">Mark All Read</span>
          </div>
        </span>
      </Menu.Item>
    ) : (
      ""
    )}
    {CAN_VIEW_MODULE(51) ? (
      <Menu.Item key="2" onClick={() => deleteAllNotifications()}>
        <span>
          <div className="d-flex align-items-center">
            <DeleteOutlined />
            <span className="ml-2">Delete All</span>
          </div>
        </span>
      </Menu.Item>
    ) : (
      ""
    )}
  </Menu>
);

const cardDropdown = (menu) => (
  <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
    <a
      href="/#"
      className="text-gray font-size-lg"
      onClick={(e) => e.preventDefault()}
    >
      <EllipsisOutlined />
    </a>
  </Dropdown>
);

const tableColumns = (gotoLink) => {
  return [
    {
      title: "",
      dataIndex: "read_at",
      key: "status",
      render: (read_at) => (
        <div className="text-right">
          <Badge className="mr-0" color={read_at ? "gray" : "blue"} />
        </div>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (subject, item) => (
        <div className="d-flex align-items-center">
          {item.from ? (
            <Avatar src={item.from.photo_link} />
          ) : (
            <Avatar
              className={`ant-avatar-${item.action} ${getIcon(
                "bg",
                item.action
              )}`}
              icon={getIcon("icon", item.action)}
            />
          )}
          <span className="ml-2">
            {item.from ? item.from.full_name : item.subject}
          </span>
        </div>
      ),
    },
    {
      title: "Message",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Since",
      dataIndex: "created_at",
      key: "date",
      render: (created_at) => <>{moment(created_at).fromNow()}</>,
    },
    {
      title: "",
      key: "link",
      render: (_, record) =>
        record.link && record.link !== "" ? (
          <div
            className="text-right"
            style={{ cursor: "pointer" }}
            onClick={(e) => gotoLink(e, record.link)}
          >
            <ArrowRightOutlined />
          </div>
        ) : (
          ""
        ),
    },
  ];
};

const DisplayDataSet = (props) => (
  <Row gutter={16}>
    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
      <DataDisplayWidget
        icon={<FileDoneOutlined />}
        value={props.allTickets}
        title="Total Tickets"
        color="cyan"
        vertical={true}
        avatarSize={55}
      />
      <DataDisplayWidget
        icon={<CalendarOutlined />}
        value={props.segments.type?.mmt}
        title="MMT"
        color="red"
        vertical={true}
        avatarSize={55}
      />
    </Col>
    <Col xs={24} sm={24} md={24} lg={12} xl={12} xxl={12}>
      <DataDisplayWidget
        icon={<AlertOutlined />}
        value={props.segments.type?.pm}
        title="PM"
        color="blue"
        vertical={true}
        avatarSize={55}
      />
      <DataDisplayWidget
        icon={<UserSwitchOutlined />}
        value={props.segments.type?.inspection}
        title="Inspection"
        color="volcano"
        vertical={true}
        avatarSize={55}
      />
    </Col>
  </Row>
);

export const DefaultDashboard = () => {
  const [staffList, setStaffList] = useState([]);
  const [notifications, setNotications] = useState([]);
  const [notifsPaging, setNotifsPaging] = useState({ current: 1, pageSize: 8 });
  const [date, setDate] = useState({ start: moment(), end: moment() });
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [virgin, setVirgin] = useState(true);
  const [zoneID, setZone] = useState("");
  const [reportData, setReportData] = useState("");
  const [segments, setSegments] = useState("");
  const [timeline, setTimeline] = useState({});
  const [successRate, setSuccessRate] = useState(0);
  let history = useHistory();

  useEffect(() => {
    if (virgin) {
      setVirgin(false);
      loadNotifications(notifsPaging);
    }
    loadReports();
  }, [zoneID, date]);

  useEffect(() => {
    if (CAN_VIEW_MODULE(42)) {
      loadStaff("");
    }
  }, [zoneID]);

  const loadReports = () => {
    apiService
      .getReports("tickets", {
        zone_id: zoneID,
        start: moment(date.start).format("YYYY-MM-DD"),
        end: moment(date.end).format("YYYY-MM-DD"),
      })
      .then((resp) => {
        let segments = { type: { mmt: 0, pm: 0, inspection: 0 } };
        resp.ticketByTypes.map((segment) => {
          segments.type[segment.type] = segment.typeCount;
        });

        let timeline = {
          days: [],
          values: [
            { name: "MMT", data: [] },
            { name: "PM", data: [] },
            { name: "Inspection", data: [] },
          ],
        };
        let index,
          loop = 0;
        resp.dailyTicket.map((element) => {
          timeline.days.push(element.date);
          switch (element.type) {
            case "mmt":
              index = 0;
              break;
            case "pm":
              index = 1;
              break;
            case "inspection":
              index = 2;
              break;
          }
          timeline.values[0].data[loop] = 0;
          timeline.values[1].data[loop] = 0;
          timeline.values[2].data[loop] = 0;
          timeline.values[index].data[loop] = element.typeCount;
          loop++;
        });

        const successRate =
          !resp.badFinishTime || resp.badFinishTime.badFinishCount === 0
            ? 100
            : 100 -
              parseInt(
                (resp.badFinishTime.badFinishCount / resp.allTickets) * 100
              );

        setSuccessRate(successRate);
        setReportData(resp);
        setTimeline(timeline);
        setSegments(segments);
      });
  };

  const loadStaff = (query) => {
    apiService
      .getUsers({ zone_id: zoneID, limit: 8, name: query })
      .then((resp) => {
        setStaffLoading(false);
        if (resp.data.length > 0) {
          setStaffList(resp.data);
        } else {
          setStaffList([]);
        }
      });
  };

  const loadNotifications = (pagination) => {
    if (!pagination) pagination = notifsPaging;
    setNotifsLoading(true);
    apiService
      .getNotifications(pagination.current, pagination.pageSize)
      .then((resp) => {
        setNotifsLoading(false);
        if (resp.data.length > 0) {
          setNotications(resp.data);
        } else {
          setNotications(false);
        }
        setNotifsPaging({
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: resp.total,
        });
      });
  };

  const deleteAllNotifications = () => {
    setNotifsLoading(true);
    apiService.notifsDeleteAll().then((resp) => {
      setNotifsLoading(false);
      setNotications(false);
    });
  };

  const markAllNotifsRead = () => {
    setNotifsLoading(true);
    apiService.notifsMarkAllRead().then((resp) => {
      setNotifsLoading(false);
      const data = notifications.map((elm) => {
        elm.read_at = true;
        return elm;
      });
      setNotications(data);
    });
  };

  const gotoLink = (e, link) => {
    e.preventDefault();
    if (!link || link === "") return;
    history.push(link);
  };

  const zoneCascChanged = (value) => {
    setZone(value[1]);
  };

  const startChat = (e, to_uid) => {
    setChatLoading(to_uid);
    apiService
      .sendMessage({
        message: "",
        ticket_id: 0,
        to_userid: to_uid,
        hello: 1,
      })
      .then((resp) => {
        setChatLoading(false);
        history.push(`/app/chat/${resp}`);
      });
  };

  const dateChanged = (date) => {
    setDate({
      start: date[0].format("YYYY-MM-DD"),
      end: date[1].format("YYYY-MM-DD"),
    });
  };

  const disabledDate = (current) => {
    return current && current > moment().endOf("day");
  };

  const parseAsInt = (number, asString) =>
    isNaN(parseInt(number))
      ? asString
        ? "0"
        : 0
      : asString
      ? number.toString()
      : parseInt(number);

  return (
    <>
      <div className="app-page-header">
        <h3 className="mb-0 mr-3 font-weight-semibold">Dashboard</h3>
        <AppBreadcrumb />
        <Flex
          className="py-2 ml-5"
          mobileFlex={false}
          justifyContent="start"
          alignItems="center"
        >
          <Cascader
            options={getAllZones()}
            placeholder="All Districts"
            onChange={zoneCascChanged}
          />
          <RangePicker
            disabledDate={disabledDate}
            className="ml-3"
            defaultValue={[date.start, date.end]}
            onChange={dateChanged}
            ranges={{
              Today: [moment(), moment()],
              "This Week": [moment().startOf("week"), moment().endOf("week")],
              "This Month": [
                moment().startOf("month"),
                moment().endOf("month"),
              ],
              "Last Week": [
                moment().subtract(1, "weeks").startOf("isoWeek"),
                moment().subtract(1, "weeks").endOf("isoWeek"),
              ],
              "Last 30 days": [moment().subtract(30, "days"), moment()],
              "Last 90 days": [moment().subtract(90, "days"), moment()],
            }}
          />
        </Flex>
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={24} md={24} lg={18}>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={24} xl={8}>
              <StatisticWidget
                title="Repair Time"
                value={parseAsInt(
                  reportData.badFinishTime?.badFinishCount,
                  true
                )}
                status={
                  parseAsInt(reportData.badFinishTimePrev?.badFinishCount) -
                  parseAsInt(reportData.badFinishTime?.badFinishCount)
                }
                subtitle={`Compare to prev month (${moment(date.start)
                  .subtract(1, "month")
                  .format("MMM")})`}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={8}>
              <StatisticWidget
                title="Response Time"
                value={parseAsInt(
                  reportData.badResponseTime?.badRespCount,
                  true
                )}
                status={
                  parseAsInt(reportData.badResponseTimePrev?.badRespCount) -
                  parseAsInt(reportData.badResponseTime?.badRespCount)
                }
                subtitle={`Compare to prev month (${moment(date.start)
                  .subtract(1, "month")
                  .format("MMM")})`}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={8}>
              <StatisticWidget
                title="Delivery Time"
                value={parseAsInt(reportData.badDelvTime?.badDelvCount, true)}
                status={
                  parseAsInt(reportData.badDelvTimePrev?.badDelvCount) -
                  parseAsInt(reportData.badDelvTime?.badDelvCount)
                }
                subtitle={`Compare to prev month (${moment(date.start)
                  .subtract(1, "month")
                  .format("MMM")})`}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <StatisticWidget
                title="Follow-up Tickets"
                value={parseAsInt(reportData.followupTickets, true)}
                status={<IssuesCloseOutlined />}
                statusColor="primary"
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <StatisticWidget
                title="Raised Problems"
                value={parseAsInt(reportData.raisedProbTickets, true)}
                status={<FontAwesomeIcon icon={faFistRaised} />}
                statusColor="warning"
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <StatisticWidget
                title="Repeated Calls"
                value={parseAsInt(reportData.repeatedTickets, true)}
                status={<FontAwesomeIcon icon={faExclamationTriangle} />}
                statusColor="danger"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <StatisticWidget
                title="Open Tickets"
                value={parseAsInt(reportData.openTickets, true)}
                status={<FontAwesomeIcon icon={faToolbox} />}
                statusColor="warning"
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={8}>
              <StatisticWidget
                title="Closed Tickets"
                value={parseAsInt(reportData.closedTickets, true)}
                status={<FontAwesomeIcon icon={faCheckDouble} />}
                statusColor="success"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <ChartWidget
                title="Daily Tickets"
                series={timeline.values}
                xAxis={timeline.days}
                height={490}
                customOptions={{
                  colors: [COLORS[7], COLORS[6], COLORS[8]],
                  stroke: {
                    width: 2.5,
                    curve: "smooth",
                  },
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={24} lg={6}>
          <GoalWidget
            title="Success Rate"
            value={successRate}
            subtitle={
              successRate === 100
                ? "success is our passion"
                : "Need more effort to hit the target"
            }
            extra={
              CAN_VIEW_MODULE(104) ? (
                <Button
                  type="primary"
                  onClick={(e) => gotoLink(e, "/app/reports/tickets")}
                >
                  Learn More
                </Button>
              ) : (
                ""
              )
            }
          />
          <DisplayDataSet
            allTickets={reportData.allTickets}
            segments={segments}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        {CAN_VIEW_MODULE(42) ? (
          <Col xs={24} sm={24} md={24} lg={8}>
            <Card
              title="Staff"
              loading={staffLoading}
              extra={
                <Search
                  placeholder="search by name"
                  onSearch={(value) => loadStaff(value)}
                  style={{ width: 180 }}
                />
              }
            >
              <div className="mt-3">
                {staffList.length > 0
                  ? staffList.map((staff, i) =>
                      staff.id !== WEB_CONFIG("id") ? (
                        <div
                          key={i}
                          className={`d-flex align-items-center justify-content-between mb-4`}
                        >
                          <AvatarStatus
                            id={i}
                            src={staff.photo_link}
                            name={staff.full_name}
                            subTitle={staff.role.title}
                          />
                          {CAN_VIEW_MODULE(132) ? (
                            <div>
                              <Button
                                icon={<SendOutlined />}
                                type="default"
                                size="small"
                                loading={
                                  chatLoading && chatLoading === staff.id
                                }
                                onClick={(e) => startChat(e, staff.id)}
                              >
                                Chat
                              </Button>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      ) : (
                        ""
                      )
                    )
                  : ""}
              </div>
            </Card>
          </Col>
        ) : (
          ""
        )}
        <Col xs={24} sm={24} md={24} lg={16}>
          <Card
            title="Notifications"
            extra={cardDropdown(
              latestTransactionOption(
                deleteAllNotifications,
                markAllNotifsRead,
                loadNotifications
              )
            )}
          >
            {notifications ? (
              <Table
                className="no-border-last"
                columns={tableColumns(gotoLink)}
                dataSource={notifications}
                loading={notifsLoading}
                rowKey="id"
                pagination={notifsPaging}
                onChange={loadNotifications}
              />
            ) : (
              <div className="empty-notification text-center">
                <img src="/img/others/empty-notifs.svg" alt="empty" />
                <p className="mt-3">You have no notifications</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default withRouter(DefaultDashboard);
