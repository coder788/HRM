import React, { Component } from "react";
import {
  Card,
  Table,
  Tag,
  Tooltip,
  message,
  Button,
  Popconfirm,
  Input,
  Select,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import moment from "moment";
import UserView from "./UserView";
import AvatarStatus from "components/shared-components/AvatarStatus";
import apiService from "services/ApiService";
import Flex from "components/shared-components/Flex";
import { CAN_VIEW_MODULE, WEB_CONFIG } from "configs/AppConfig";

export class UserList extends Component {
  state = {
    users: [],
    reqParams: { role_id: "", query: "" },
    userProfileVisible: false,
    chatLoading: false,
    loading: true,
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
    },
    selectedUser: null,
  };

  getUsers = (params = {}) => {
    apiService
      .getUsers({
        page: params.pagination.current,
        pages: params.pagination.pageSize,
        role_id: this.state.reqParams.role_id,
        name: this.state.reqParams.query,
      })
      .then((resp) => {
        this.setState({
          users: resp.data,
          loading: false,
          pagination: {
            current: params.pagination.current,
            pageSize: resp.per_page,
            total: resp.total,
          },
        });
      });
  };

  componentDidMount() {
    const { pagination } = this.state;
    this.getUsers({ pagination });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.getUsers({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      ...filters,
    });
  };

  deleteUser = (userId) => {
    this.setState({ loading: true });
    apiService
      .delUser(userId)
      .then((resp) => {
        this.setState({
          loading: false,
          users: this.state.users.filter((item) => item.id !== userId),
        });
        message.success({ content: `Deleted user ${userId}`, duration: 2 });
      })
      .catch((error) => {
        this.setState({ loading: false });
      });
  };

  showUserProfile = (userInfo) => {
    this.setState({
      userProfileVisible: true,
      selectedUser: userInfo,
    });
  };

  closeUserProfile = () => {
    this.setState({
      userProfileVisible: false,
      selectedUser: null,
    });
  };

  render() {
    const {
      users,
      pagination,
      loading,
      userProfileVisible,
      selectedUser,
      selectedRowKeys,
    } = this.state;
    const categories = WEB_CONFIG("settings").roles;
    const { Option } = Select;

    const addStaff = () => {
      this.props.history.push("/app/employee/add");
    };

    const editUserProfile = (userID) => {
      this.props.history.push(`/app/employee/edit/${userID}`);
    };

    const startChat = (to_uid) => {
      this.setState({ chatLoading: to_uid });
      apiService
        .sendMessage({
          message: "",
          ticket_id: 0,
          to_userid: to_uid,
          hello: 1,
        })
        .then((resp) => {
          this.setState({ chatLoading: false });
          this.props.history.push(`/app/chat/${resp}`);
        });
    };

    const rowSelection = {
      onChange: (key, rows) => {
        this.setState({ selectedRows: rows });
        this.setState({ selectedRowKeys: key });
      },
    };

    const onSearch = (e) => {
      this.setState({ reqParams: { query: e.currentTarget.value } }, () =>
        this.getUsers({ pagination })
      );
    };

    const handleShowCategory = (value) => {
      if (value !== "All") {
        this.setState({ reqParams: { role_id: value } }, () =>
          this.getUsers({ pagination })
        );
      } else {
        this.setState({ reqParams: { role_id: "" } }, () =>
          this.getUsers({ pagination })
        );
      }
    };

    const tableColumns = [
      {
        title: "User",
        dataIndex: "full_name",
        render: (_, record) => (
          <div className="d-flex">
            <AvatarStatus
              src={record.photo_link}
              name={record.full_name}
              subTitle={record.email}
            />
          </div>
        ),
        sorter: {
          compare: (a, b) => {
            a = a.full_name.toLowerCase();
            b = b.full_name.toLowerCase();
            return a > b ? -1 : b > a ? 1 : 0;
          },
        },
      },
      {
        title: "Role",
        dataIndex: "role",
        render: (role) => <Tag color={role.color}>{role.title}</Tag>,
        sorter: {
          compare: (a, b) => a.role.title.length - b.role.title.length,
        },
      },
      {
        title: "Joined Date",
        dataIndex: "created_at",
        render: (date) => <span>{moment(date).format("DD/MM/YYYY")} </span>,
        sorter: (a, b) => moment(a.created_at) - moment(b.created_at),
      },
      {
        title: "Status",
        dataIndex: "active",
        render: (status) => (
          <Tag className="text-capitalize" color={status ? "cyan" : "red"}>
            {status ? "Active" : "Banned"}
          </Tag>
        ),
        sorter: {
          compare: (a, b) => a.active.length - b.active.length,
        },
      },
      {
        title: "",
        dataIndex: "actions",
        render: (_, elm) => (
          <div className="text-right">
            {elm.id !== WEB_CONFIG("id") && CAN_VIEW_MODULE(132) ? (
              <Tooltip title="Chat">
                <Button
                  type="default"
                  className="mr-2"
                  icon={<MessageOutlined />}
                  loading={
                    this.state.chatLoading && this.state.chatLoading === elm.id
                  }
                  onClick={() => {
                    startChat(elm.id);
                  }}
                  size="small"
                />
              </Tooltip>
            ) : (
              ""
            )}
            {CAN_VIEW_MODULE(39) ? (
              <Tooltip title="Edit">
                <Button
                  type="primary"
                  className="mr-2"
                  icon={<EditOutlined />}
                  onClick={() => {
                    editUserProfile(elm.id);
                  }}
                  size="small"
                />
              </Tooltip>
            ) : (
              ""
            )}
            {CAN_VIEW_MODULE(38) ? (
              <Tooltip title="View">
                <Button
                  type="default"
                  className="mr-2"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    this.showUserProfile(elm);
                  }}
                  size="small"
                />
              </Tooltip>
            ) : (
              ""
            )}
            {CAN_VIEW_MODULE(44) ? (
              <Popconfirm
                placement="top"
                title="Are you sure ?"
                onConfirm={() => {
                  this.deleteUser(elm.id);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Tooltip>
              </Popconfirm>
            ) : (
              ""
            )}
          </div>
        ),
      },
    ];
    return (
      <Card>
        <Flex alignItems="center" justifyContent="between" mobileFlex={false}>
          <Flex className="mb-1" mobileFlex={false}>
            <div className="mr-md-3 mb-3">
              <Input
                placeholder="Search"
                prefix={<SearchOutlined />}
                onChange={(e) => onSearch(e)}
              />
            </div>
            <div className="mb-3">
              <Select
                defaultValue="All"
                className="w-100"
                style={{ minWidth: 180 }}
                onChange={handleShowCategory}
                placeholder="Category"
              >
                <Option value="All">All</Option>
                {categories.map((elm) => (
                  <Option key={elm.id} value={elm.id}>
                    {elm.title}
                  </Option>
                ))}
              </Select>
            </div>
          </Flex>
          {CAN_VIEW_MODULE(43) ? (
            <div>
              <Button
                onClick={addStaff}
                type="primary"
                icon={<PlusCircleOutlined />}
                block
              >
                New Employee
              </Button>
            </div>
          ) : (
            ""
          )}
        </Flex>
        <div className="table-responsive">
          <Table
            columns={tableColumns}
            dataSource={users}
            pagination={pagination}
            onChange={this.handleTableChange}
            loading={loading}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              type: "checkbox",
              preserveSelectedRowKeys: false,
              ...rowSelection,
            }}
          />
          <UserView
            data={selectedUser}
            visible={userProfileVisible}
            history={this.props.history}
            close={() => {
              this.closeUserProfile();
            }}
          />
        </div>
      </Card>
    );
  }
}

export default UserList;
