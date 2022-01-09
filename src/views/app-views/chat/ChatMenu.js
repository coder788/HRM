import React from "react";
import { Badge, Empty, Input, Skeleton, Tooltip } from "antd";
import AvatarStatus from "components/shared-components/AvatarStatus";
import { COLOR_1 } from "constants/ChartConstant";
import { InboxOutlined, SearchOutlined } from "@ant-design/icons";
import apiService from "services/ApiService";
import moment from "moment";
import { WEB_CONFIG, WSSOCKET } from "configs/AppConfig";
import { Scrollbars } from "react-custom-scrollbars";

export class ChatMenu extends React.Component {
  chatListRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      list: false,
      page: 1,
      query: "",
      id: parseInt(this.props.location.pathname.match(/\/([^/]+)\/?$/)[1]),
    };

    this.searchOnChange = this.searchOnChange.bind(this);
    this.searchOnEnter = this.searchOnEnter.bind(this);
  }

  componentWillUnmount() {
    WSSOCKET.off(`arabianfal_database_chat:newChat-${WEB_CONFIG("id")}`);
  }

  componentDidUpdate(prevProps) {
    if (this.state.arch_chat_id !== this.props.archiveChatID) {
      const chatlist = this.state.list.filter((item) => {
        return item.id !== this.props.archiveChatID;
      });
      this.setState({
        list: chatlist,
        arch_chat_id: this.props.archiveChatID,
        id: null,
      });
    }
  }

  componentDidMount() {
    this.getChatList();

    WSSOCKET.on(
      `arabianfal_database_chat:newChat-${WEB_CONFIG("id")}`,
      function (newChatData) {
        //console.log("lisetner", newChatData)
        let chatlist = this.state.list;
        for (let i = 0; i < chatlist.length; i++) {
          if (chatlist[i].id === newChatData.id) {
            let chatdata = chatlist[i];
            if (this.state.id === newChatData.id) chatdata.unread_count = 0;
            else
              chatdata.unread_count =
                parseInt(newChatData.lastmsg.sender.id) === WEB_CONFIG("id")
                  ? 0
                  : chatdata.unread_count + 1;
            chatdata.updated_at = newChatData.updated_at;
            chatdata.lastmsg.message = newChatData.lastmsg.message;
            chatlist = chatlist.filter((item) => {
              return item.id !== chatdata.id;
            });
            this.setState({
              list: [chatdata, ...chatlist],
            });
            return;
          }
        }
        this.setState({
          list: [newChatData, ...this.state.list],
        });
      }.bind(this)
    );
  }

  getChatList() {
    apiService.getChats(this.state.page, this.state.query).then((resp) => {
      this.setState({
        list: resp,
        page: this.state.page + 1,
      });
    });
  }

  chatScroll = (values) => {
    if (values.top === 1 && this.state.page !== -1 && !this.state.loading) {
      this.setState(
        { loading: true },
        this.chatListRef.current.scrollToBottom()
      );
      apiService.getChats(this.state.page, this.state.query).then((resp) => {
        if (resp.length > 0) {
          this.setState(
            {
              loading: false,
              page: this.state.page + 1,
              list: [...this.state.list, ...resp],
            },
            () =>
              this.chatListRef.current.scrollTop(
                this.chatListRef.current.getScrollHeight() -
                  values.scrollHeight -
                  100
              )
          );
        } else {
          this.setState({ loading: false, page: -1 });
        }
      });
    }
  };

  openChat(id) {
    const data = this.state.list.map((elm) => {
      if (elm.id === id) {
        elm.unread_count = 0;
      }
      return elm;
    });
    this.setState({ list: data, id: id });
    //this.props.history.push(`${this.props.match.url}/${id}`)
    this.props.openChat(id);
  }

  searchOnEnter(e) {
    this.setState(
      {
        query: e.target.value ? e.target.value : "",
        page: 1,
        list: false,
      },
      this.getChatList
    );
  }

  searchOnChange(e) {
    if (e.target.value === "" && this.state.query !== "") {
      this.searchOnEnter(e);
    } else {
      this.setState({ query: e.target.value });
    }
  }

  render() {
    const { id, list } = this.state;

    const ticketIdBadge = (ticket_id) => {
      return ticket_id !== 0 ? (
        <Badge
          className="ml-1"
          status="default"
          text={2343242}
          overflowCount={false}
          style={{
            backgroundColor: "#fff",
            color: "#999",
            boxShadow: "0 0 0 1px #d9d9d9 inset",
          }}
        />
      ) : (
        ""
      );
    };

    return (
      <div className="chat-menu">
        <div className="chat-menu-toolbar">
          <Input
            placeholder="Search"
            onPressEnter={this.searchOnEnter}
            allowClear
            onChange={this.searchOnChange}
            prefix={<SearchOutlined className="font-size-lg mr-2" />}
          />
        </div>
        <div className="chat-menu-list">
          {list && list.length === 0 ? (
            <Empty description={false} className="mt-5" />
          ) : !list ? (
            [0, 1, 2, 3].map((item, i) => (
              <div
                key={`chat-item-${i}`}
                className={`chat-menu-list-item ${i === 3 ? "last" : ""}`}
              >
                <Skeleton avatar paragraph={{ rows: 2 }} />
              </div>
            ))
          ) : (
            <>
              <Scrollbars
                ref={this.chatListRef}
                onScrollFrame={(values) => this.chatScroll(values)}
                autoHide
              >
                {list.map((item, i) => (
                  <div
                    key={`chat-item-${item.id}`}
                    onClick={() => this.openChat(item.id)}
                    className={`chat-menu-list-item ${
                      i === list.length - 1 ? "last" : ""
                    } ${item.id === id ? "selected" : ""}`}
                  >
                    {item.sender.id === WEB_CONFIG("id") ? (
                      <AvatarStatus
                        src={item.receiver.photo_link}
                        name={item.receiver.full_name}
                        subTitle={item.lastmsg.message}
                        nameSuffix={
                          <span className="chat-menu-list-item-num">
                            {item.ticket_id}
                          </span>
                        }
                      />
                    ) : (
                      <AvatarStatus
                        src={item.sender.photo_link}
                        name={item.sender.full_name}
                        subTitle={item.lastmsg.message}
                        nameSuffix={
                          <span className="chat-menu-list-item-num">
                            {item.ticket_id}
                          </span>
                        }
                      />
                    )}
                    {item.archive === 1 ? (
                      <div className="text-right">
                        <Tooltip title="Archived">
                          <InboxOutlined />
                        </Tooltip>
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="text-right">
                      <div className="chat-menu-list-item-time">
                        {moment(item.updated_at).isSame(new Date(), "day")
                          ? moment(item.updated_at).format("hh:mm A")
                          : moment(item.updated_at).format("DD/MM/YYYY")}
                      </div>
                      {item.unread_count === 0 ? (
                        ""
                      ) : (
                        <Badge
                          count={item.unread_count}
                          style={{ backgroundColor: COLOR_1 }}
                        />
                      )}
                    </div>
                  </div>
                ))}
                {this.state.loading
                  ? [0, 1, 2].map((item, i) => (
                      <div
                        key={`chat-item-loading-${i}`}
                        className={`chat-menu-list-item ${
                          i === 2 ? "last" : ""
                        }`}
                      >
                        <Skeleton avatar paragraph={{ rows: 1 }} />
                      </div>
                    ))
                  : ""}
              </Scrollbars>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default ChatMenu;
