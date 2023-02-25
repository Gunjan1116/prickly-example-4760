import * as event from "./event.js";
import * as change from "./change.js";
import * as state from "./state.js"
// <---------- Sending offer to the other user ------------>

let connectedUserDetails;
let peerConnection;
const defaultConstraints={
    audio:false,
    video:false
}
const configuration={
    iceServers:[
        {
            urls: "stun:stun.1.google.com:13902"
        }
    ]
}
export const getLocalPreview=()=>{
    navigator.mediaDevices.getUserMedia(defaultConstraints)
    .then((stream)=>{
       change.updateLocalVideo(stream);
        state.setLocalStream(stream);
    }).catch((err)=>{
        console.log("error occured when trying to access camera",err)
    })
}
const createPeerConnection=()=>{
    peerConnection= new RTCPeerConnection(configuration)
    peerConnection.onicecandidate=(event)=>{
        console.log("geeting ice candidates from stun server")
        if(event.candidate){
            //sending our ice candiadate to other peer
        }
    }
    peerConnection.onconnectionstatechange= (event)=>{
        if(peerConnection.connectionState==="connected"){
            console.log("successfully connected to other peer")
        }
    }
    //receiving track
    const remoteStream=new MediaStream();
    state.setRemoteStream(remoteStream);
    change.updateRemoteVideo(remoteStream);
    peerConnection.ontrack=(event)=>{
        remoteStream.addTrack(event.track);
    }
    //add our stream to peer connection
    if(connectedUserDetails.connection_type==="personal_code_video"){
        const localStream= state.getState().localStream;
        for(const track of localStream.getTrack()){
            peerConnection.addTrack(track,localStream)
        }
    }
}


export const preOffers=(connection_type,personal_code)=>{
    console.log(connection_type,personal_code)
    connectedUserDetails={
        connection_type,
        socketId:personal_code
    }
    if(connection_type=="personal_code_chat"||connection_type=="personal_code_video"){
        let data={
            connection_type,
            personal_code
        }
        change.showCallingPopUp(callingDialogRejectCallHandler)
        event.preOffers(data)
    }
}
export const RecivingPreOffer=(data)=>{
    console.log("WebRtc got pre offer")
    console.log(data);
    const {connection_type,personal_code}=data
    connectedUserDetails={
        socketId:personal_code,
        connection_type
    }
    if(connection_type=="personal_code_chat"||connection_type=="personal_code_video"){
        change.showIncomingPopUp(connection_type,acceptCall,rejectCall)
    }
}
const acceptCall=()=>{
    
    console.log("call accepted")
    createPeerConnection()
    sendPreOfferAnswer("Call_Accepted");
    change.showCallElements(connectedUserDetails.connection_type)

}
const rejectCall=()=>{
    console.log("call rejected")
    sendPreOfferAnswer("Call_Rejected");
}
const callingDialogRejectCallHandler=()=>{
    console.log("Rejecting call!!")
}
const sendPreOfferAnswer=(preOfferAnswer)=>{
    const data={
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer
    }
    change.removeAllDialogs();
    event.sendPreOfferAnswer(data);
}

export const handlePreOfferAnswer=(data)=>{
    const {preOfferAnswer}=data;
    console.log("pre offer answers came")
    console.log(data);
    change.removeAllDialogs();
    if(preOfferAnswer==="Not_Found"){
        change.showInfoDialog(preOfferAnswer)
        //if not found
    }
    if(preOfferAnswer==="Call_Unavailable"){
        change.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer==="Call_Rejected"){
        change.showInfoDialog(preOfferAnswer)
    }
    if(preOfferAnswer==="Call_Accepted"){
        //send webrtc offer
        change.showCallElements(connectedUserDetails.connection_type)
        createPeerConnection();
        sendWebRTCOffer();
    }
}
const sendWebRTCOffer=()=>{
}