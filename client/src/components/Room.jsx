import React from 'react';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import * as Automerge from 'automerge';

import CodeEditor from "./CodeEditor";
import NavbarComponent from "./Navbar";
import { useState } from 'react';
import Audios from './Audios';

function useForceUpdate(){
    const [value, setValue] = useState(0); // integer state
    return () => setValue(value => value + 1); // update the state to force render
}

function Room() {
    let { roomId } = useParams();

    const forceUpdate = useForceUpdate();
    
    const userAudio = useRef();
    const thisId = useRef();
    const userStream = useRef();
    let [partnerAudio, setPartnerAudio] = useState({dummy: true, arr: []});
    console.log("First", partnerAudio);
    const peerRef = useRef();
    const webSocketRef = useRef();

    const [codeC, setCodeC] = useState("");

    const doc = useRef(Automerge.init());

    const handleChange = (e) => {
        setCodeC(e);

        let newDoc = Automerge.change(doc.current, (doc) => {
            doc.code = e;
        });

        doc.current = newDoc;
    };

    const openMic = async () => {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const mics = allDevices.filter((device) => device.kind === "audioinput");

        // TODO add input device option
        // media device can be changed by changing the array index. 
        const constraints = {
            audio: {
                deviceId: mics[0].deviceId
            }
        }

        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        peerRef.current = {};

        openMic().then((stream) => {
            userAudio.current.srcObject = stream;
            userStream.current = stream;
        })

        webSocketRef.current = new WebSocket(`ws://localhost:8080/join?roomId=${roomId}`);

        webSocketRef.current.addEventListener("open", () => {
            console.log("Web socket open");
        });

        webSocketRef.current.addEventListener("message", async (e) => {
            const message = JSON.parse(e.data);

            if(message.toId && message.toId !== thisId.current) {
                return;
            }
            if(message.join) {
                callUser(message.id);
            }
            else
            if(message.offer) {
                console.log("Recieved offer");
                handleOffer(message.offer, message.id);
            }
            else
            if(message.answer) {
                console.log("Received answer", message.id);
                peerRef.current[message.id].setRemoteDescription(new RTCSessionDescription(message.answer));
            }
            else
            if(message.iceCandidate) {
                console.log("Recieving and adding ICE Candidate");
                try {
                    await peerRef.current[message.id].addIceCandidate(message.iceCandidate);
                } catch (err) {
                    console.log("Error adding ICE Candidate: ", err);
                }
            }
            else
            if(message.changes) {
                const ar = Uint8Array.from(message.changes.split(',').map(x => Number(x)));
                // console.log("Recieved doc: ", message.changes, ": - ", ar);

                let newDoc = Automerge.load(ar);

                doc.current = Automerge.merge(doc.current, newDoc);

                setCodeC(doc.current.code);
            }
            else
            if(message.id) {
                console.log("Setting id", message.id);
                thisId.current = message.id;
                console.log("Sending join message");
                webSocketRef.current.send(JSON.stringify({ id: thisId.current, join: true }));
            }
        });

        setInterval(sendDoc, 3000);

    }, []);

    const sendDoc = () => {
        let changes = Automerge.save(doc.current)

        // console.log(changes);

        webSocketRef.current.send(JSON.stringify({ id: thisId.current, changes: String(changes) }));
    };

    const handleOffer = async (offer, id) => {
        console.log("Creating answer");
        peerRef.current[id] = createPeer(id);
        console.log("Set at id", id);

        await peerRef.current[id].setRemoteDescription(new RTCSessionDescription(offer));

        userStream.current.getTracks().forEach(track => {
            peerRef.current[id].addTrack(track, userStream.current);
        });

        const answer = await peerRef.current[id].createAnswer();
        await peerRef.current[id].setLocalDescription(answer);

        webSocketRef.current.send(JSON.stringify({id: thisId.current, toId: id, answer }));
    }

    const callUser = (id) => {
        console.log("WebRTC connnecting latest joinee");
        peerRef.current[id] = createPeer(id);
        console.log("set at id", id);

        userStream.current.getTracks().forEach(track => {
            peerRef.current[id].addTrack(track, userStream.current);
        });
    };

    const createPeer = (id) => {
        console.log("Creating P2P Conn");
        const peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }
            ]
        });

        peer.onnegotiationneeded = ((e) => handleNegotiationNeeded(id));
        peer.onicecandidate = ((e) => handleIceCandidateEven(e, id));
        peer.ontrack = ((e) => handleTrackEvent(id, e));

        return peer;
    };

    const handleNegotiationNeeded = async (id) => {
        console.log("Creating offer");

        try {
            const myOffer = await peerRef.current[id].createOffer();
            await peerRef.current[id].setLocalDescription(myOffer);

            webSocketRef.current.send(JSON.stringify({ id: thisId.current, toId: id, offer: myOffer }));
            
        } catch (err) {
            console.log("Error during offer creation: ", err);
        }
    }

    const handleIceCandidateEven = (e, id) => {
        console.log("Found ICE Candidate");
        if(e.candidate) {
            console.log(e.candidate);
            webSocketRef.current.send(JSON.stringify({id: thisId.current, toId: id, iceCandidate: e.candidate}));
        }
    }

    const handleTrackEvent = (id, e) => {
        console.log("Recieved tracks");
        partnerAudio.arr.push(e.streams[0]);
        partnerAudio.dummy = !partnerAudio.dummy;
        setPartnerAudio(partnerAudio);
        console.log("aaaa-", partnerAudio);
        // forceUpdate();
    }

    console.log("UPdated");

    return ( 
        <>
        <div>
            <NavbarComponent />
            <CodeEditor vl={codeC} hcg={handleChange}/>
        </div>
        <div>
            <audio autoPlay={false} controls={true} ref={userAudio}></audio>
            {/* <audio autoPlay={true} controls={true} ref={partnerAudio}></audio> */}
            <Audios streams={partnerAudio}/>
        </div>
        </>
     );
}

export default Room;