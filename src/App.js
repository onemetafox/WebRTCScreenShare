import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import blue from '@material-ui/core/colors/blue';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import VideoCamIcon from '@material-ui/icons/Videocam';
import CallIcon from '@material-ui/icons/Call';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import PhoneIcon from '@material-ui/icons/CallEnd';
import VideoOnIcon from '@material-ui/icons/Videocam';
import VideoOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import LocalVideoView from './LocalVideoView';
import RemoteVideoView from './RemoteVideoView';
import css from './layout.css';
import Signaling from './Signaling';
import $ from "jquery";
const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },

  btnTool: {
    color: 'white',
    marginRight: 20,
  },
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class App extends Component {

  constructor(props) {
    super(props);

    this.selfView = null;
    this.remoteView = null;
    this.signaling = null;

    this.state = {
      peers: [],
      self_id: null,
      open: false,
      localStream: null,
      remoteStream: null,
      audio_muted: false,
      video_muted: false,
      share_muted:false,
      room_name : ''
    };
    this.getRender = this.getRender.bind(this);
    this.addRoom = this.addRoom.bind(this);
  }
  handleClickOpen = () => {
    setOpen(true);
  };

  handleClose = () => {
    setOpen(false);
  };
  componentDidMount = () => {
    
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  addRoom = () => {
      this.setState({room_name : $("#room_name").val()})
      var url = 'wss://' + window.location.hostname + ':4443';
      console.log(this.state);
      this.signaling = new Signaling(url, $("#room_name").val());
      this.signaling.on('peers',(peers, self) => {
        this.setState({peers, self_id: self});
      });
      this.signaling.on("share_scree",(from, sessions) => {
        console.log("This is the test of the screen share");
      });
      this.signaling.on('new_call',(from, sessios) => {
        this.setState({ open:true });
      });

      this.signaling.on('localstream',(stream) => {
        this.setState({localStream: stream});
      });

      this.signaling.on('addstream',(stream) => {
        this.setState({remoteStream: stream});
      });

      this.signaling.on('removestream',(stream) => {
        this.setState({remoteStream: null});
      });

      this.signaling.on('call_end',(to, session) => {
        this.setState({ open:false, localStream: null, remoteStream: null });
      });

      this.signaling.on('leave',(to) => {
        this.setState({ open:false, localStream: null, remoteStream: null });
      });
      // setOpen(false);

  };

  handleInvitePeer = (peer_id, type) => {
    this.signaling.invite(peer_id, type);
  }

  handleBye = () => {
    this.signaling.bye();
  }

  /**
     * video open/close
     */
  onVideoOnClickHandler = () => {
    let video_muted = !this.state.video_muted;
    this.onToggleLocalVideoTrack(video_muted);
    this.setState({ video_muted });
  }

  onToggleLocalVideoTrack = (muted) => {
    var videoTracks = this.state.localStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.log("No local video available.");
      return;
    }
    console.log("Toggling video mute state.");
    for (var i = 0; i < videoTracks.length; ++i) {
      videoTracks[i].enabled = !muted;
    }
  }
  /**
     * share open/close
     */
   onShareOnClickHandler = (peer_id) => {
    let share_muted = !this.state.share_muted;
    this.onToggleLocalShareTrack(share_muted);
    this.setState({ share_muted });
    this.signaling.shareScreen(peer_id);
  }

  onToggleLocalShareTrack = (muted) => {
    // var shareTracks = this.state.localStream.getShareTracks();
    if (shareTracks.length === 0) {
      console.log("No local share available.");
      return;
    }
    console.log("Toggling share mute state.");
    for (var i = 0; i < shareTracks.length; ++i) {
      shareTracks[i].enabled = !muted;
    }
  }

  /**
     * mic open/close
     */
  onAudioClickHandler = () => {
    let audio_muted = !this.state.audio_muted;
    this.onToggleLocalAudioTrack(audio_muted);
    this.setState({ audio_muted });
  }

  getRender(){
    if(this.state.room_name == ""){
      return <Dialog open={open} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Add Room Name</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  To create vdieo calling room please insert the room name.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="room_name"
                  label="Room Name"
                  type="Text"
                  ref = "room_name"
                  // onChange = {e => this.setState({...this.state, room_name: e.target.value})}
                  fullWidth 
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={this.addRoom} color="primary">
                  Add Room
                </Button>
              </DialogActions>
            </Dialog>
        }
  }

  onToggleLocalAudioTrack = (muted) => {
    var audioTracks = this.state.localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.log("No local audio available.");
      return;
    }
    console.log("Toggling audio mute state.");
    for (var i = 0; i < audioTracks.length; ++i) {
      audioTracks[i].enabled = !muted;
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <MuiThemeProvider theme={theme}>
        {this.getRender()}
        <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit" className={classes.flex}>
                Video/Audio Calling Room
            </Typography>
              {/* <Button color="inherit">Join</Button> */}
            </Toolbar>
          </AppBar>
          <List>
            {
              this.state.peers.map((peer, i) => {
                return (
                  <div key={peer.id}>
                    <ListItem button >
                      <ListItemText primary={peer.name + '  [' + peer.user_agent + ']' + (peer.id === this.state.self_id ? ' (Yourself)' : '')} secondary={ (peer.id === this.state.self_id ? 'self' : 'peer') + '-id: ' + peer.id} />
                      {peer.id !== this.state.self_id &&
                        <div>
                          <IconButton color="primary" onClick={() => this.handleInvitePeer(peer.id, 'audio')} className={classes.button} aria-label="Make a voice call.">
                            <CallIcon />
                          </IconButton>
                          <IconButton color="primary" onClick={() => this.handleInvitePeer(peer.id, 'video')} className={classes.button} aria-label="Make a video call.">
                            <VideoCamIcon />
                          </IconButton>
                          {/* <IconButton color="primary" onClick={() =>this.onShareOnClickHandler(peer.id, 'share')} className={classes.button} aria-label="Make a video call.">
                          {
                            this.state.share_muted ? <StopScreenShareIcon /> : <ScreenShareIcon />
                          }
                          </IconButton> */}
                        </div>
                      }
                    </ListItem>
                    <Divider />
                  </div>
                )
              })
            }
          </List>
          <Dialog
            fullScreen
            open={this.state.open}
            onClose={this.handleClose}
            TransitionComponent={Transition}
          >
            <AppBar className={classes.appBar}>
              <Toolbar>
                <Typography variant="title" color="inherit" className={classes.flex}>
                  Calling
              </Typography>
              </Toolbar>
            </AppBar>
            <div>
              {
                this.state.remoteStream != null ? <RemoteVideoView stream={this.state.remoteStream} id={'remoteview'} /> : null
              }
              {
                this.state.localStream != null ? <LocalVideoView stream={this.state.localStream} muted={this.state.video_muted} id={'localview'} /> : null
              }
            </div>
            <div className={css.btnTools}>
              <Button variant="fab" mini color="primary" aria-label="add" style={styles.btnTool} onClick={this.onVideoOnClickHandler}>
                {
                  this.state.video_muted ? <VideoOffIcon /> : <VideoOnIcon />
                }
              </Button>
              <Button variant="fab" color="secondary" aria-label="add" style={styles.btnTool} onClick={this.handleBye}>
                <PhoneIcon />
              </Button>
              <Button variant="fab" mini color="primary" aria-label="add" style={styles.btnTool} onClick={this.onAudioClickHandler}>
                {
                  this.state.audio_muted ? <MicOffIcon /> : <MicIcon />
                }
              </Button>
              <Button variant="fab" mini color="primary" aria-label="add" style={styles.btnTool} onClick={this.onShareOnClickHandler}>
                {
                  this.state.share_muted ? <StopScreenShareIcon /> : <ScreenShareIcon />
                }
              </Button>
            </div>

          </Dialog>

        </div>
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
