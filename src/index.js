import React from 'react';
import ReactDOM from 'react-dom';
import FaBed from 'react-icons/lib/fa/bed';
import FaCircleONotch from 'react-icons/lib/fa/circle-o-notch';
import axios from 'axios';

import 'bootstrap-beta/dist/css/bootstrap.css';
import WelcomeImg from '../../content/images/ChatHeader.png';

// Components
import Header from './components/header';
import SubjectContainer from './components/subject_selector';
import ChatBody from './components/chat_body';
import Footer from './components/footer';
import ConfirmExit from './components/confirm_modal';
import Survey from './components/survey';

const style = require('../../content/css/style.css');

const initialState = {
    chatstate: {},
    chatMessages: [],
    chatuniqueid: 1,
    showchatMsg: false,
    chatClose: false,
    exitChat: false,
    agentTyping: false,
    isminimized: false,
    newMessageFlag: false,
    surveyToken: false,
    agentName: '',
    clientName: '',
    startSessionSection: {},
    noActiveAgents: false,
    closeMessage: '',
    showServey: false,
    confirmClose: false,
    token: '',
    participantJoined: false,
    loading: true,
    stopTypingInterval: 3000,
    stopTypingTimer: null
};

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;
        this.getToken = this
            .getToken
            .bind(this);
        this.connectChat = this
            .connectChat
            .bind(this);
        this.getChatMessages = this
            .getChatMessages
            .bind(this);
        // let connect = this.getToken();
        this.checkAvailability();
        this.connectChat = this
            .connectChat
            .bind(this);
        this.sendChat = this
            .sendChat
            .bind(this);
        this.closeChat = this
            .closeChat
            .bind(this);
        this.handleFocus = this
            .handleFocus
            .bind(this);
        this.minimizeChat = this
            .minimizeChat
            .bind(this);
        this.sendFeedback = this
            .sendFeedback
            .bind(this);
        this.onExitChat = this
            .onExitChat
            .bind(this);
        this.returnChat = this
            .returnChat
            .bind(this);
        this.confirmExit = this
            .confirmExit
            .bind(this);
        this.sendStartTyping = this
            .sendStartTyping
            .bind(this);
        this.onStartTyping = this
            .onStartTyping
            .bind(this);
        this.stopTyping = this
            .stopTyping
            .bind(this);
    }

    onExitChat() {
        this.setState({
            exitChat: true
        }, () => {
            this.setState(initialState);
        });

        ReactDOM.unmountComponentAtNode(document.getElementById('app'));
    }

    sendStartTyping() {
        const requestData = `userId=${this.state.chatstate.userId}&alias=${this.state.chatstate.alias}&secureKey=${this.state.chatstate.secureKey}`;
        fetch(`https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat//${this.state.chatstate.chatId}/startTyping`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (requestData)
            })
            .then(response => response.json())
            .then((responseJson) => {})
            .catch((error) => {
                console.error(error);
            });
    }
    onStartTyping() {
        if (this.state.stopTypingTimer != null) {
            clearTimeout(this.state.stopTypingTimer);
            this.state.stopTypingTimer = null;
        } else {
            this.sendStartTyping();
        }
        this.state.stopTypingTimer = setTimeout(this.stopTyping, this.state.stopTypingInterval);
    };

    stopTyping() {
        clearTimeout(this.state.stopTypingTimer);
        this.state.stopTypingTimer = null;

        const requestData = `userId=${this.state.chatstate.userId}&alias=${this.state.chatstate.alias}&secureKey=${this.state.chatstate.secureKey}`;
        fetch(`https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat//${this.state.chatstate.chatId}/stopTyping`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (requestData)
            })
            .then(response => response.json())
            .then((responseJson) => {})
            .catch((error) => {
                console.error(error);
            });
    }

    getChatMessages(chatData) {
        // let conversationData = 'userId=' + chatData.userId + '&alias=' +
        // chatData.alias + '&secureKey=' + chatData.secureKey + '&transcriptPosition=' +
        // chatData.nextPosition + '&message=Test';
        const conversationData = `userId=${chatData.userId}&alias=${chatData.alias}&secureKey=${chatData.secureKey}&transcriptPosition=${chatData.nextPosition}&message=Test`;
        fetch(`https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat/${chatData.chatId}/refresh`, {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (conversationData)
            })
            .then(response => response.json())
            .then((responseJson) => {
                //console.log(responseJson);
                responseJson
                    .messages
                    .forEach((msg) => {
                        if (msg.from.type === 'Agent') {
                            if (msg.type === 'Message') {
                                if (this.state.agentName === '') {
                                    this.setState({agentName: msg.from.nickname});
                                }

                                const uniqueId = this.state.chatuniqueid;

                                const obj = {
                                    message: msg.text,
                                    type: 'agent',
                                    id: uniqueId + 1
                                };

                                const chatMessages = Object.assign(this.state.chatMessages);
                                chatMessages.push(obj);
                                this.setState((prevState) => {
                                    return {
                                        chatMessages,
                                        newMessageFlag: true,
                                        chatuniqueid: prevState.chatuniqueid + 1
                                    }
                                });
                                const objDiv = document.getElementById('chatBody');
                                objDiv.scrollTop = objDiv.scrollHeight;
                            }

                            if (msg.type === 'TypingStarted') {
                                this.setState({agentTyping: true});
                            }

                            if (msg.type === 'TypingStopped') {
                                this.setState({agentTyping: false});
                            }

                            if (msg.type === 'ParticipantJoined') {
                                this.setState({participantJoined: true})
                            }

                            if (msg.type === 'ParticipantLeft') {
                                this.setState({ 
                                    chatClose:true                                    
                                }); 
                                this.confirmExit();                                
                            }
                        }
                    });

                this.setState({chatstate: responseJson});
            })
            .catch((error) => {
                console.error(error);
            });
    }

    minimizeChat() {
        this.setState(prevState => ({
            isminimized: !prevState.isminimized
        }));
    }

    checkAvailability() {
        axios({
            method: 'GET',
            url: 'https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/CheckAvailability/SBS_Chat/ADP' +
                    '_SBS_Chat_IXQ/ADP_SBS_Chat_Target_VAG/'
        }).then((response) => {
            // console.log(response);  if (response.data.closedMessage &&
            // response.data.closedMessage !== '') {      this.setState({ noActiveAgents:
            // true, closeMessage: response.data.closedMessage, loading:false });  }  else
            {
                this.setState({startSessionSection: response.data, loading: false});
                //this.getToken();
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    handleFocus() {
        if (this.state.newMessageFlag === true) {
            this.setState({newMessageFlag: false});
        }
    }

    returnChat() {
        this.setState({chatClose: false});
        const objDiv = document.getElementById('chatBody');
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    confirmExit() {

        const requestData = 'userId=' + this.state.chatstate.userId + '&alias=' + this.state.chatstate.alias + '&secureKey=' + this.state.chatstate.secureKey;

        fetch(`https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat/${this.state.chatstate.chatId}/disconnect`, {
            method: 'POST',
            headers: {
                Accept: '*//*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (requestData)

            })
            .then(response => response.json())
            .then((responseJson) => {
                clearInterval(this.interval);
                if (!this.state.showServey) {
                    this.onExitChat();
                } else {
                    this.setState({
                        surveyToken: responseJson.surveyToken
                    }, () => {
                        this.setState({confirmClose: true});
                        // this.setState({ chatClose: false });
                        // document.getElementById('chatInput').style.display = 'none';
                    });
                }                
            })
            .catch((error) => {
                console.error(error);
            });
    }

    sendFeedback(questionId, answerId) {
        // console.log(this.state.chat)

        const requestData = {
            chatId: this.state.chatstate.chatId,
            ChatName: this.props.config.chat.chatName,
            AgentName: this.state.agentName,
            questionId,
            answerId,
            surveyToken: this.state.surveyToken
        };

        // let requestData = 'chatId=' + this.state.chatstate.chatId + '&ChatName=' +
        // this.props.config.chat.chatName + '&AgentName=' + this.state.agentName +
        // '&questionId=' + questionId + '&answerId=' + answerId + '&surveyToken=' +
        // this.state.surveyToken

        fetch('https://chatapi-fit.nj.adp.com/REST/CHATAPI2s/api/PostSurveyAnswer/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
                body: JSON.stringify(requestData)
            })
            .then(response => response.json())
            .then((responseJson) => {
                //console.log(responseJson);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    closeChat() {
        if (this.state.newMessageFlag === true) {
            this.setState({newMessageFlag: false});
        }
        // this.setState({ chatClose: true });
        if (this.state.showServey) {
            this.setState({chatClose: true});
        } else {
            ReactDOM.unmountComponentAtNode(document.getElementById('app'));
        }
    }

    sendChat(msg) {
        this.stopTyping();
        const obj = {
            message: msg,
            type: 'client',
            id: this.state.chatuniqueid + 1
        };
        const chatMessages = Object.assign(this.state.chatMessages);
        chatMessages.push(obj);
        this.setState((prevState) => {
            return {
                chatMessages,
                chatuniqueid: prevState.chatuniqueid + 1
            }
        });
        const clientData = 'userId=' + this.state.chatstate.userId + '&alias=' + this.state.chatstate.alias + '&secureKey=' + this.state.chatstate.secureKey + '&transcriptPosition=' + this.state.chatstate.nextPosition + '&message=' + msg;
        fetch('https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat/' + this.state.chatstate.chatId + '/send', {
            method: 'POST',
            headers: {
                Accept: '*//*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (clientData)
            })
            .then(response => response.json())
            .then((responseJson) => {
                this.setState({chatstate: responseJson});
                // console.log(JSON.stringify(responseJson));
                const objDiv = document.getElementById('chatBody');
                objDiv.scrollTop = objDiv.scrollHeight;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getToken(subject) {
        axios
            .post('http://localhost:3001/token')
            .then((response) => {
                const chatrequestdata = 'subject=' + subject + '&userData[TOKEN]=' + response.data;
                this.setState({token: chatrequestdata});
                this.connectChat(chatrequestdata);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    connectChat() {
        fetch('https://chatapi-fit.nj.adp.com/REST/ChatAPI2S/api/ChatProxy/SBS_Chat', {
            method: 'POST',
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
                body: (this.state.token)
            })
            .then(response => response.json())
            .then((responseJson) => {
                this.setState({
                    chatstate: responseJson,
                    showchatMsg: true,
                    showServey: true
                }, () => {
                    this.interval = setInterval(() => {
                        this.getChatMessages(this.state.chatstate);
                    }, 3000);
                });
                responseJson
                    .messages
                    .forEach((msg) => {
                        if (msg.from.type === 'Client') {
                            if (this.state.clientName === '') {
                                this.setState({clientName: msg.from.nickname});
                            }
                        }
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    render() {
        const {survey, userData} = this.props.config.chat;
        return (
            <div
                id="baseTemplate"
                style={{
                right: 10,
                bottom: 10,
                width: 400
            }}
                className={this.state.exitChat
                ? 'displayNone'
                : 'baseTemplate'}>
                <div>
                    <Header
                        closeChat={this.closeChat}
                        newMessageFlag={this.state.newMessageFlag}
                        minimizeChat={this.minimizeChat}
                        isMinimized={this.state.isminimized}/>
                    <div
                        className={this.state.isminimized
                        ? 'displayNone'
                        : ''}>
                        {!this.state.loading && this.state.noActiveAgents && <div id="divchatUnAvailable" className="chatUnAvailable">
                            <div
                                style={{
                                marginBottom: -20 + 'px'
                            }}>
                                Z&nbsp;
                                <sup>
                                    Z&nbsp;
                                    <sup>
                                        Z&nbsp;
                                    </sup>
                                </sup>
                            </div>
                            <div><FaBed size={64}/></div>
                            <div>{this.state.closeMessage}</div>
                        </div>
}
                    </div>
                    {this.state.loading && <div className="chatloading">
                        <FaCircleONotch size={64} className="fa-spin"/>
                    </div>
}
                    {!this.state.loading && !this.state.noActiveAgents && <div
                        id="chatArea"
                        className={this.state.isminimized
                        ? 'displayNone'
                        : ''}>
                        <div id="chatViewportWrapper" className="chatViewportWrapper">
                            <div id="chatViewport" className="chatViewport">

                                <div
                                    id="welcomeImageDiv"
                                    className={'welcomeImageDiv ' + (this.state.showchatMsg
                                    ? 'displayNone'
                                    : '')}>
                                    <img
                                        id="welcomeImage"
                                        alt="WelcomeImage"
                                        src={WelcomeImg}
                                        className="welcomeImage"/>
                                </div>
                                <div
                                    className={'chat-panel ' + (!this.state.chatClose
                                    ? ''
                                    : 'displayNone')}>
                                    <div
                                        className={this.state.showchatMsg
                                        ? 'displayNone'
                                        : 'chattopic'}>
                                        <SubjectContainer options={userData.subject} showChat={this.getToken}/>
                                    </div>

                                    {this.state.showchatMsg && <div>
                                        <ChatBody
                                            showchatMsg={this.state.showchatMsg}
                                            chatMessages={this.state.chatMessages}
                                            agentTyping={this.state.agentTyping}
                                            startSessionSection={this.state.startSessionSection}
                                            participantJoined={this.state.participantJoined}
                                            clientName={this.state.clientName}
                                            agentName={this.state.agentName}/>
                                        <Footer
                                            sendChat={this.sendChat}
                                            showchatMsg={this.state.showchatMsg}
                                            handleFocus={this.handleFocus}
                                            participantJoined={this.state.participantJoined}
                                            onStartTyping={this.onStartTyping}/>
                                    </div>
}
                                </div>
                                {(this.state.chatClose && !this.state.confirmClose) && <ConfirmExit returnChat={this.returnChat} confirmExit={this.confirmExit}/>}
                                {this.state.confirmClose && <div
                                    id="chatFeedback"
                                    className={this.state.confirmClose
                                    ? 'feedback-text'
                                    : 'displayNone'}>
                                    <Survey
                                        onExitChat={this.onExitChat}
                                        questions={survey.questions}
                                        sendFeedback={this.sendFeedback}/>
                                </div>}
                            </div>
                        </div>
                    </div>
}
                </div>
            </div>
        );
    }
}

export const init = (chatConfig) => {
    ReactDOM.render(
        <App config={chatConfig}/>, document.getElementById('app'));
};
