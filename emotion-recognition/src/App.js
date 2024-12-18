import React, { useRef, useEffect } from "react";
import "./App.css";

import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { drawMesh } from "./utilities";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const blazeface = require('@tensorflow-models/blazeface')

  //  Load blazeface
  const runFaceDetectorModel = async () => {

    const model = await blazeface.load()
    console.log("FaceDetection Model is Loaded..")
    setInterval(() => {
      detect(model);
    }, 100);

  }

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const face = await net.estimateFaces(video);
      //console.log(face);

      // Websocket
      const socket = new WebSocket('ws://localhost:8000')
      const imageSrc = webcamRef.current.getScreenshot()
      const apiCall = {
        event: "localhost:subscribe",
        data: {
          image: imageSrc
        },
      };
      socket.onopen = () => socket.send(JSON.stringify(apiCall))
      socket.onmessage = function (event) {
        const pred_log = JSON.parse(event.data)
        document.getElementById("Angry").value = Math.round(pred_log['predictions']['angry'] * 100)
        document.getElementById("Neutral").value = Math.round(pred_log['predictions']['neutral'] * 100)
        document.getElementById("Happy").value = Math.round(pred_log['predictions']['happy'] * 100)
        document.getElementById("Fear").value = Math.round(pred_log['predictions']['fear'] * 100)
        document.getElementById("Surprise").value = Math.round(pred_log['predictions']['surprise'] * 100)
        document.getElementById("Sad").value = Math.round(pred_log['predictions']['sad'] * 100)
        document.getElementById("Disgust").value = Math.round(pred_log['predictions']['disgust'] * 100)

        document.getElementById("emotion_text").innerText = pred_log['emotion']

        // Get canvas context
        const ctx = canvasRef.current.getContext("2d");
        requestAnimationFrame(() => { drawMesh(face, pred_log, ctx) });
      }
    }
  };

  useEffect(() => { runFaceDetectorModel() }, []);
  return (
    <div className="App">
      <div className="content">
        <div className="status" id="emotion_text" name="emotion_text" value="Neutral">
          -
        </div>
        <div className="container">
          <div className="face-container">
            <Webcam
              className="webcam"
              ref={webcamRef}
            />

            <canvas
              ref={canvasRef}
              className="canvas"
            />
          </div>

          <div className="Prediction">
            <div className="predict">
              <label forhtml="Angry" style={{ color: 'red' }}>Angry </label>
              <progress id="Angry" value="0" max="100" >10%</progress>
            </div>

            <div className="predict">
              <label forhtml="Neutral" style={{ color: 'lightgreen' }}>Neutral </label>
              <progress id="Neutral" value="0" max="100">10%</progress>
            </div>
            <div className="predict">

              <label forhtml="Happy" style={{ color: 'orange' }}>Happy </label>
              <progress id="Happy" value="0" max="100" >10%</progress>
            </div>
            <div className="predict">

              <label forhtml="Fear" style={{ color: 'lightblue' }}>Fear </label>
              <progress id="Fear" value="0" max="100" >10%</progress>
            </div>
            <div className="predict">

              <label forhtml="Surprise" style={{ color: 'yellow' }}>Surprised </label>
              <progress id="Surprise" value="0" max="100" >10%</progress>
            </div>
            <div className="predict">

              <label forhtml="Sad" style={{ color: 'gray' }} >Sad </label>
              <progress id="Sad" value="0" max="100" >10%</progress>
            </div>
            <div className="predict">

              <label forhtml="Disgust" style={{ color: 'pink' }} >Disgusted </label>
              <progress id="Disgust" value="0" max="100" >10%</progress>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

export default App;
