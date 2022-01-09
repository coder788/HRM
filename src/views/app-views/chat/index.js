import React, {useState} from 'react'
import InnerAppLayout from 'layouts/inner-app-layout';
import ChatMenu from './ChatMenu';
import Conversation from "./Conversation";

const Chat = props => {

	const [chatid, setChatID] = useState((props.match.params.id)? props.match.params.id : null);
	const [archiveChatID, setArchChatID] = useState((props.match.params.id)? props.match.params.id : null);

	const openChat = chatID => {
		//console.log("openning chat: ", chatID)
		setChatID(chatID)
	}

	const archiveChat = chatID => {
		//console.log("archiving chat: ", chatID)
		setArchChatID(chatID)
		setChatID(null)
	}

	return (
		<div className="chat">
			<InnerAppLayout 
				sideContent={<ChatMenu openChat={openChat} archiveChatID={archiveChatID} {...props}/>}
				mainContent={<Conversation chatid={chatid} archiveChat={archiveChat} {...props}/>}
				sideContentWidth={450}
				sideContentGutter={false}
				border
			/>
		</div>
	)
}

export default Chat
