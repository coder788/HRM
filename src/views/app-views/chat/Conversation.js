import React from 'react'
import {Avatar, Divider, Input, Form, Button, Menu, message, Upload, Spin, Tooltip, Image, Modal, Tag} from 'antd';
import {FileOutlined, SendOutlined, PaperClipOutlined, LikeOutlined, UserOutlined, DeleteOutlined, TagsOutlined, InboxOutlined} from '@ant-design/icons';
import { Scrollbars } from 'react-custom-scrollbars';
import Flex from 'components/shared-components/Flex';
import EllipsisDropdown from 'components/shared-components/EllipsisDropdown'
import {GET_AUTH_HEADER, WEB_CONFIG, WSSOCKET, API_BASE_URL, IMAGE_PLACEHOLDER_URL, CAN_VIEW_MODULE} from 'configs/AppConfig';
import apiService from "services/ApiService";
import customTheme from './custom.css'
import AvatarStatus from "components/shared-components/AvatarStatus";
import moment from "moment";
import UserView from "../staff/list/UserView";

const { confirm } = Modal;

export class Conversation extends React.Component {
	formRef = React.createRef();
	chatBodyRef = React.createRef()

	state = {
		prev_chat_id: null,
		chat_id: null,
		chatinfo: null,
		hint: "Offline",
		ticket_id: 0,
		last_id: 0,
		peer: {},
		loading: false,
		msgList: false,
		uploadProcess: false,
		uploadPath: false,
		uploadLink: false,
		uploadFileList: [],
		userProfileVisible: false,
		selectedUser: null
	}

	componentWillUnmount() {
		//console.log("componentWillUnmount")
		this.turnOffSockets(this.state.chat_id)
	}

	turnOffSockets(chat_id){
		WSSOCKET.emit("sendSignal", `chat-actions-${this.state.chat_id}`, '{"action":"offline","userid":"' + WEB_CONFIG("id") + '"}')

		WSSOCKET.off(`arabianfal_database_chat:newMessage-${chat_id}`)
		WSSOCKET.off(`chat-actions-${chat_id}`)
	}

	componentDidMount() {
		//console.log("componentDidMount")
		//console.log(this.props.match.params.id)
		this.setState({
			chat_id: this.props.match.params.id,
			prev_chat_id: null
		}, this.initChat)
	}

	componentDidUpdate(prevProps) {
		//console.log(prevProps.chatid)
		//console.log(this.props.chatid)

		if(this.state.chat_id !== this.props.chatid){
			this.setState({
				chat_id: this.props.chatid,
				prev_chat_id: prevProps.chatid
			}, this.initChat)
		}
	}

	initChat = () => {
		if(this.state.prev_chat_id){
			this.turnOffSockets(this.state.prev_chat_id)
		}
		if(this.state.chat_id){
			WSSOCKET.emit("sendSignal", `chat-actions-${this.state.chat_id}`, '{"action":"online","userid":"' + WEB_CONFIG("id") + '"}')

			WSSOCKET.on(`chat-actions-${this.state.chat_id}`, function(data){
				//console.log("lisetner action", data)
				if(parseInt(data.userid) === WEB_CONFIG("id")) return
				switch (data.action){
					case "typing":
						this.setState({hint: "Typing..."})
						const timer = setTimeout(() => {
							this.setState({hint: "Online"})
						}, 2000);
						return () => clearTimeout(timer)
					case "online":
						this.setState({hint: "Online"})
						break
					case "offline":
						this.setState({hint: "Offline"})
						break
					default:
						break
				}
			}.bind(this))

			WSSOCKET.on(`arabianfal_database_chat:newMessage-${this.state.chat_id}`, function(newMsgData){
				//console.log("lisetner", newMsgData)
				if(newMsgData.sender.id !== WEB_CONFIG("id")){
					this.setState({
						msgList: [...this.state.msgList, newMsgData]
					}, this.scrollToBottom)
				}
			}.bind(this))
			this.getConversation(this.state.chat_id)
		}
	}

	deleteConversation = chatID => {
		confirm({
			title: "Do you want to delete this chat ?",
			content: "This action will permanently delete all chat data.",
			onOk: (function () {
				return new Promise((resolve, reject) => {
					apiService.deleteChat(chatID).then(resp => {
						this.setState({loading: false})
						this.props.archiveChat(chatID)
						resolve()
					}).catch(error => {
						this.setState({loading: false})
					})
				}).catch(() => console.log("Oops errors!"));
			}.bind(this)),
			onCancel() {}
		});
	}

	archiveConversation = chatID => {
		this.setState({loading: true})
		apiService.archiveChat(chatID).then(resp => {
			this.setState({loading: false})
			this.props.archiveChat(chatID)
		})
	}

	getConversation = currentId => {
		this.setState({loading: true})
		apiService.getChatMessages(currentId, "").then(resp => {
			const messages = resp.messages
			resp.messages = []
			this.setState({
				last_id: (messages[0].id) ? messages[0].id : 0,
				ticket_id: resp.ticket_id,
				peer: (resp.sender.id === WEB_CONFIG("id")) ? resp.receiver : resp.sender,
				chatinfo: resp,
				msgList: messages,
				loading: false
			}, this.scrollToBottom)
		})
	}

	openExternalLink = (link) => {
		window.open(link, '_blank')
	}

	getMsgType = obj => {
		if (obj.type === "file" && obj.media.match(/.(jpg|jpeg|jpe|png|gif)$/i)) obj.type = 'image'
		switch (obj.type) {
			case 'text':
				return <span>{obj.message}</span>
			case 'image':
				return (
					obj.message ?
					<div className="msg-file">
						<Image src={obj.media_link}
									 className="d-block"
									 fallback={IMAGE_PLACEHOLDER_URL}
									 placeholder={<Image src={IMAGE_PLACEHOLDER_URL}/>}
						/>
						<span className="mt-1 d-block">{obj.message}</span>
					</div> : <Image src={obj.media_link}
													className="d-block"
													fallback={IMAGE_PLACEHOLDER_URL}
													placeholder={<Image src={IMAGE_PLACEHOLDER_URL}/>}
						/>
				)
			case 'file':
				return (
					<Flex alignItems="center" className="msg-file">
						<FileOutlined className="font-size-md"/>
						<span onClick={() => this.openExternalLink(obj.media_link)} className="ml-2 font-weight-semibold text-link pointer" style={{cursor: "pointer"}}>
							<u>{obj.message ? obj.message : "View File"}</u>
						</span>
					</Flex>
				)
			default:
				return null;
		}
	}

	conversationScroll = (values, chatID) => {
		if(values.top === 0 && this.state.last_id !== -1 && !this.state.loading){
			this.setState({loading: true})
			apiService.getChatMessages(chatID, this.state.last_id).then(resp => {
				if(resp.messages.length > 0){
					const lastElmKey = resp.messages.length-1
					let createdDate = resp.messages[lastElmKey].created_at
					createdDate = (moment(createdDate).isSame(new Date(), "day")) ? moment(createdDate).format("hh:mm A") : moment(createdDate).format("DD/MM/YYYY")
					resp.messages.push({type: "date", created_at: createdDate, sender: {id: WEB_CONFIG("id")}})
					this.setState({
						loading: false,
						last_id: (resp.messages[0].id) ? resp.messages[0].id : 0,
						msgList: resp.messages.concat(this.state.msgList)
					}, () => this.chatBodyRef.current.scrollTop(this.chatBodyRef.current.getScrollHeight()-values.scrollHeight-100))
				} else {
					this.setState({loading: false,last_id: -1})
				}
			})
		}
	}

	scrollToBottom = () => {
		this.chatBodyRef.current.scrollToBottom()
	}

	onSend = values => {
		if (values.newMsg || this.state.uploadPath) {
			const newMsgData = {
				sender: {id: WEB_CONFIG("id")},
				type: (this.state.uploadPath)? "file" : "text",
				media: (this.state.uploadPath),
				message: this.formRef.current.getFieldValue("newMsg"),
				media_link: this.state.uploadLink
			}
			apiService.sendMessage({
				message: this.formRef.current.getFieldValue("newMsg"),
				media: this.state.uploadPath,
				chat_id: this.state.chat_id
			}).then(resp => {
			})
			this.formRef.current.setFieldsValue({newMsg: ''});
			this.setState({uploadPath: false, uploadLink: false, uploadProcess: false, uploadFileList: []})
			this.setState({msgList: [...this.state.msgList, newMsgData]}, this.scrollToBottom)
		}
	};

	emptyClick = (e) => {
		e.preventDefault()
	};

	sendOk = (e) => {
		e.preventDefault();
		this.formRef.current.setFieldsValue({
			newMsg: '👍'
		})
		this.formRef.current.submit()
	};

	chatContentHeader = (peer, chatID) => (
		<div className="chat-content-header">
			<div className="d-flex">
				<AvatarStatus src={peer.photo_link} name={peer.full_name} subTitle={peer.role.title}/>
				<span className="text-muted font-size-sm font-weight-light ml-1">{this.state.hint}</span>
			</div>
			{(this.state.loading) ? <Spin /> : ""}
			<div>
				<EllipsisDropdown menu={() => this.menu(chatID, peer)}/>
			</div>
		</div>
	)

	openTicket = (ticketid) => {
		if(ticketid === 0) return
		this.props.history.push(`/app/tickets/view/${ticketid}`)
	}

	showUserProfile = userInfo => {
		this.setState({
			userProfileVisible: true,
			selectedUser: userInfo
		});
	};

	closeUserProfile = () => {
		this.setState({
			userProfileVisible: false,
			selectedUser: null
		});
	}

	menu = (chatID, peer) => (
		<Menu>
			{(CAN_VIEW_MODULE(38)) ? <Menu.Item key="0" onClick={() => this.showUserProfile(peer)}>
				<UserOutlined />
				<span>Profile</span>
			</Menu.Item> : ""}
			{(CAN_VIEW_MODULE(22)) ? <Menu.Item key="1" onClick={() => this.openTicket(this.state.chatinfo.ticket_id)}>
				<TagsOutlined />
				{this.state.chatinfo.ticket_id !== 0 ? <span>Ticket <Tag color="purple">{this.state.chatinfo.ticket_id}</Tag></span> : <span>Public</span>}
			</Menu.Item> : ""}
			{(CAN_VIEW_MODULE(31)) ? <Menu.Item key="2" onClick={() => this.archiveConversation(chatID)}>
				<InboxOutlined />
				<span>Archive Chat</span>
			</Menu.Item> : ""}
			{(CAN_VIEW_MODULE(33)) ? <Menu.Divider /> : ""}
			{(CAN_VIEW_MODULE(33)) ?<Menu.Item key="3" onClick={() => this.deleteConversation(chatID)}>
				<DeleteOutlined />
				<span>Delete Chat</span>
			</Menu.Item> : ""}
		</Menu>
	);

	chatContentBody = (props, id) => (
		<div className="chat-content-body">
			<Scrollbars ref={this.chatBodyRef} onScrollFrame={(values) => this.conversationScroll(values, id)} autoHide>
				{
					props.map((elm, i) => (
						<div
							key={`msg-${id}-${i}`}
							className={`msg ${elm.type === 'date'? 'datetime' : ''} ${elm.sender.id !== WEB_CONFIG("id")? 'msg-recipient' : elm.sender.id === WEB_CONFIG("id")? 'msg-sent' : ''}`}
						>
							{
								elm.sender.id !== WEB_CONFIG("id") ?
									<div className="mr-2">
										<Avatar src={elm.sender.photo_link} />
									</div>
									:
									null
							}
							{
								elm.message || elm.media ?
									<div className={`bubble ${elm.sender.id === WEB_CONFIG("id")? 'ml-5' : ''}`}>
										<div className="bubble-wrapper">
											<Tooltip placement="right" title={(moment(elm.created_at).isSame(new Date(), "day")) ? moment(elm.created_at).format("hh:mm A") : moment(elm.created_at).format("DD/MM/YYYY hh:mm A")}>
											{this.getMsgType(elm)}
											</Tooltip>
										</div>
									</div>
									:
									null
							}
							{
								elm.type === 'date'?
									<Divider>{elm.created_at}</Divider>
									:
									null
							}
						</div>
					))
				}
			</Scrollbars>
		</div>
	)

	typingMsg(chat_id){
		WSSOCKET.emit("sendSignal", `chat-actions-${chat_id}`, '{"action":"typing","userid":"' + WEB_CONFIG("id") + '"}')
	}

	chatContentFooter = () => {

		const handleOnChange = (info) => {
			//console.log(info.file.status)
			this.setState({ uploadFileList: [...info.fileList] })
			if (info.file.status === 'uploading') {
				this.setState({uploadProcess: true})
			} else if (info.file.status === 'removed') {
				this.setState({uploadProcess: false})
			} else if (info.file.status === 'done') {
				this.setState({uploadPath: info.file.response.path, uploadLink: info.file.response.url})
				message.success(`${info.file.name} file uploaded successfully`);
			} else if (info.file.status === 'error') {
				message.error(`${info.file.name} file upload failed.`);
			}
		};
		
		const uploadProps = {
			name: 'file',
			action: `${API_BASE_URL}/chat/upload_file`,
			headers: GET_AUTH_HEADER(),
			onChange: handleOnChange,
			listType: 'text',
			fileList: this.state.uploadFileList
		};

		return (
			<div className="chat-content-footer">
				<Form name="msgInput" ref={this.formRef} onFinish={this.onSend} className="w-100">
					<Form.Item name="newMsg" className="mb-0">
						<Input
							onKeyUp={() => this.typingMsg(this.state.chat_id)}
							autoComplete="off"
							placeholder="Type a message..."
							suffix={
								<div className="d-flex align-items-center">
									{! this.state.uploadProcess ? <a href="/#" className="text-dark font-size-lg mr-3" onClick={this.sendOk}><LikeOutlined/></a> : ""}
									{(CAN_VIEW_MODULE(34)) ?<div className="mr-3">
										<Upload {...uploadProps}>
											{! this.state.uploadProcess ? <a href="/#" className="text-dark font-size-lg" onClick={this.emptyClick}><PaperClipOutlined/></a> : ""}
										</Upload>
									</div> : ""}
									{(CAN_VIEW_MODULE(36)) ?
									<Button shape="circle" type="primary" size="small" onClick={this.onSend} htmlType="submit">
										<SendOutlined/>
									</Button> : ""}
								</div>
							}
						/>
					</Form.Item>
				</Form>
			</div>
		)
	}

	ConversationEmpty = () => (
		<div className="chat-content-empty">
			<div className="text-center">
				<img src="/img/others/img-11.png" alt="Start a Conversation" />
				<h1 className="font-weight-light">Start a conversation</h1>
			</div>
		</div>
	)

	render() {
		const { peer, msgList, selectedUser, userProfileVisible } = this.state

		return (
			!this.state.chat_id ?
				this.ConversationEmpty()
				:
				!msgList ?
					<Spin className="p-3" />
					:
					<div className="chat-content">
						{this.chatContentHeader(peer, this.state.chat_id)}
						{this.chatContentBody(msgList, this.state.chat_id)}
						{this.chatContentFooter()}
						<UserView data={selectedUser} visible={userProfileVisible} close={()=> {this.closeUserProfile()}}/>
					</div>
		)
	}
}


export default Conversation
