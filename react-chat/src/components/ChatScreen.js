import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Backdrop,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  List,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import axios from "axios";
import ChatItem from "./ChatItem";
// import { response } from "../../../sdk-starter-node/app";
const Chat = require("twilio-chat");

const styles = {
  textField: { width: "100%", borderWidth: 0, borderColor: "transparent" },
  textFieldContainer: { flex: 1, marginRight: 12 },
  gridItem: { paddingTop: 12, paddingBottom: 12 },
  gridItemChatList: { overflow: "auto", height: "70vh" },
  gridItemMessage: { marginTop: 12, marginBottom: 12 },
  sendButton: { backgroundColor: "#3f51b5" },
  sendIcon: { color: "white" },
  mainGrid: { paddingTop: 100, borderWidth: 1 },
};


export default function ChatScreen(props) {
  const location = useLocation();

  const [chatRoomData, setChatRoomData] = useState({
    text: "",
    messages: [],
    loading: false,
    channel: null
  });

  let scrollDiv = React.useRef(null);

  const scrollToBottom = () => {
    const scrollHeight = scrollDiv.current.scrollHeight;
    const height = scrollDiv.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    scrollDiv.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  };

  const handleMessageAdded = (message) => {
    let { messages } = chatRoomData;
    setChatRoomData({
        messages: [...messages, message],
      },
      scrollToBottom
    );
  };

  const joinChannel = async (channel) => {
    if (channel.channelState.status !== "joined") {
     await channel.join();
   }
 
   setChatRoomData({ 
       channel: channel.channelState.uniqueName, 
       loading: false 
   });
 
   channel.on("messageAdded", handleMessageAdded);
   scrollToBottom();
 };
 

 const getToken = async (email) => {
  const response = await axios.get(`http://localhost:5000/token/${email}`);
  const { data } = response;
  return data.token;
}


 useEffect(async() => {
  let token = "";
  const { email, room } = location.state;

  if (!email || !room) {
    props.history.replace("/");
  }

  setChatRoomData({loading: true});

  try {
    token = await getToken(email);

  } catch {
    throw new Error("Unable to get token, please reload this page");
  }

  const client = await Chat.Client.create(token);

  client.on("tokenAboutToExpire", async () => {
    token = await getToken(location.state.email);
      client.updateToken(token);
    });
  
    client.on("tokenExpired", async () => {
      token = await getToken(location.state.email);
      client.updateToken(token);
    });
  
    client.on("channelJoined", async (channel) => {
    // getting list of all messages since this is an existing channel
    // TODO: figure out why messages aren't iterating right
    const messageData = await channel.getMessages();
    if (messageData.items) {
      // let messageData = messageData.items;
      setChatRoomData({
        messages: messageData.items,
      })
    }
    
    console.log('check here', chatRoomData)
    scrollToBottom();
  });

  try {
    const channel = await client.getChannelByUniqueName(room);
    joinChannel(channel);
  } catch(err) {
    try {
      const channel = await client.createChannel({
        uniqueName: room,
        friendlyName: room,
      });
      joinChannel(channel);
    } catch(error) {
      console.log(error)
      throw new Error("Unable to create channel, please reload this page");
    }
  } 

  console.log(chatRoomData, 'eyoooo')

 }, [])

 // TODO: why aren't messages sending?
 const sendMessage = () => {
  const { text, channel } = chatRoomData;
  if (text) {
    setChatRoomData({ loading: true });
    channel.sendMessage(String(text).trim());
    setChatRoomData({ text: "", loading: false });
  }
};

  return (
    <Container component="main" maxWidth="md">
    <Backdrop open={chatRoomData.loading} style={{ zIndex: 99999 }}>
      <CircularProgress style={{ color: "white" }} />
    </Backdrop>

    <AppBar elevation={10}>
      <Toolbar>
        <Typography variant="h6">
          {`Room: ${location.state.room}, User: ${location.state.email}`}
        </Typography>
      </Toolbar>
    </AppBar>

    <CssBaseline />

    <Grid container direction="column" style={styles.mainGrid}>
      <Grid item style={styles.gridItemChatList} ref={scrollDiv}>
        <List dense={true}>
            {chatRoomData.messages &&
              chatRoomData.messages.map((message,index) => 
                <ChatItem
                  key={index}
                  message={message}
                  email={location.state.email}/>
              )}
        </List>
      </Grid>

      <Grid item style={styles.gridItemMessage}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center">
          <Grid item style={styles.textFieldContainer}>
            <TextField
              required
              style={styles.textField}
              placeholder="Enter message"
              variant="outlined"
              multiline
              rows={2}
              value={chatRoomData.text}
              // TODO: figure out issue with setting messages above on line 124
              // disabled={!chatRoomData.channel}
              onChange={(event) =>
                setChatRoomData({ text: event.target.value })
              }/>
          </Grid>
          
          <Grid item>
            <IconButton
              style={styles.sendButton}
              onClick={sendMessage}
              disabled={!chatRoomData.channel}>
              <Send style={styles.sendIcon} />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Container>
  )
}