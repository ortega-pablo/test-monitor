// video-filter-frontend/src/App.js
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const App = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const socket = io.connect('http://192.168.100.9:5000', {
  transports: ['websocket'],
  withCredentials: false,  // Permite cookies
  extraHeaders: {
    'Access-Control-Allow-Origin': '*',
  },
});

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;

        const remoteStream = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream;

        socket.on('response', (data) => {
          console.log(data);
        });

        socket.on('video_frame', (data) => {
          console.log('Received video frame:', data);
          remoteVideoRef.current.src = 'data:image/jpg;base64,' + data.data;
        });

        socket.emit('start_stream');
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>Real-time Video Filter</h1>
      <div id="videoContainer">
        <video ref={localVideoRef} width="400" height="300" autoPlay></video>
        <video ref={remoteVideoRef} width="400" height="300" autoPlay></video>
      </div>
    </div>
  );
};

export default App;
