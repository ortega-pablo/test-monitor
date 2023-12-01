import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const App = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const socket = io.connect('localhost:5000', {
      transports: ['websocket'],
    });

    // Esta función asincrónica manejará la obtención de la transmisión de video local
    const setupLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        return stream;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    // Llamar a la función para configurar la transmisión de video local
    setupLocalVideo().then((localStream) => {
      if (localStream && localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    });

    // Configurar el manejador de eventos para la transmisión de video remota
    socket.on('video_frame', (data) => {
      console.log('Received video frame:', data.data);
      // Asignar la transmisión de video remota al elemento de video remoto
      if (remoteVideoRef.current) {
        console.log("Estoy asignando la transmisión de video remota", remoteVideoRef.current.src)
        remoteVideoRef.current.src = 'data:image/png;base64,' + data.data;
      }
    });

    // Emitir el evento para comenzar la transmisión
    socket.emit('start_stream');
  }, []);

  return (
    <div>
      <h1>Real-time Video Filter</h1>
      <div id="videoContainer">
        <video ref={localVideoRef} width="400" height="300" autoPlay></video>
        <p>{/* Aquí puedes mostrar otros elementos si es necesario */}</p>
        <img ref={remoteVideoRef} width="400" height="300" autoPlay></img>
      </div>
    </div>
  );
};

export default App;
