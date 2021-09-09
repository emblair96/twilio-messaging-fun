import React, { useState } from "react";
import { 
  BrowserRouter as Router, 
  Route,
  useHistory
  } from 'react-router-dom';
  import {
  Grid,
  TextField,
  Card,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";

const styles = {
  header: {},
  grid: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  card: { padding: 40 },
  textField: { width: 300 },
  gridItem: { paddingTop: 12, paddingBottom: 12 },
  button: { width: 300 },
};

export default function WelcomeScreen() {
  let history = useHistory();

  const [userInfo, setUserInfo] = useState({
    room: "",
    email: ""
  });

  const login = () => {
  
    const { room, email } = userInfo;
    if (room && email) {
      console.log('hello???')
      history.push("chat", { room, email });
    }
  }

  const handleChange = (event) => {
    setUserInfo({...userInfo, [event.target.name]: event.target.value });
    console.log('EMAIL', userInfo)
  };


  return (
    <>
    <AppBar style={styles.header} elevation={10}>
      <Toolbar>
        <Typography variant="h6">
          Chat App with Twilio Programmable Chat and React
        </Typography>
      </Toolbar>
    </AppBar>
    <Grid
      style={styles.grid}
      container
      direction="column"
      justify="center"
      alignItems="center">
      <Card style={styles.card} elevation={10}>
        <Grid item style={styles.gridItem}>
          <TextField
            name="email"
            required
            style={styles.textField}
            label="Email address"
            placeholder="Enter email address"
            variant="outlined"
            type="email"
            value={userInfo.email}
            onChange={handleChange}/>
        </Grid>
        <Grid item style={styles.gridItem}>
          <TextField
            name="room"
            required
            style={styles.textField}
            label="Room"
            placeholder="Enter room name"
            variant="outlined"
            value={userInfo.room}
            onChange={handleChange}/>
        </Grid>
        <Grid item style={styles.gridItem}>
          <Button
            color="primary"
            variant="contained"
            style={styles.button}
            onClick={login}>
            Login
          </Button>
        </Grid>
      </Card>
    </Grid>
  </>
  )

}