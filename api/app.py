from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import cv2
import base64
import threading
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

cap = cv2.VideoCapture(0)
thread = None

def apply_sepia(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    sepia = np.array([[0.393, 0.769, 0.189],
                      [0.349, 0.686, 0.168],
                      [0.272, 0.534, 0.131]])

    sepia_frame = cv2.transform(gray, sepia)
    sepia_frame[np.where(sepia_frame > 255)] = 255
    sepia_frame = sepia_frame.astype(np.uint8)
    sepia_frame = cv2.cvtColor(sepia_frame, cv2.COLOR_GRAY2BGR)

    return sepia_frame

def video_stream():
    while True:
        ret, img = cap.read()
        if not ret:
            break

        sepia_frame = apply_sepia(img)
        _, buffer = cv2.imencode('.jpg', sepia_frame)
        frame = base64.b64encode(buffer.tobytes()).decode('utf-8')
        socketio.emit('video_frame', {'data': frame})
        socketio.sleep(0.03)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    emit('response', {'data': 'Connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('start_stream')
def start_stream():
    global thread
    if thread is None:
        thread = threading.Thread(target=video_stream)
        thread.start()
        print('Video streaming started...')

if __name__ == '__main__':
    socketio.run(app, host='192.168.100.9', port=5000, debug=True)
