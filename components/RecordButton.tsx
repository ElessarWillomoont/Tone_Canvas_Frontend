"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 读取全局状态
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // 读取 CorpusStatus

export default function RecordButton() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false); // 新增：记录上传状态
  const { audioIsInitialized } = usePointerContext();
  const { currentFileName } = useCorpusStatusContext();

  // ✅ 统一 API 请求的 headers 处理
  const getHeaders = (extraHeaders: Record<string, string> = {}) => {
    return {
      ...config.headers, // `config.json` 里的 headers
      ...extraHeaders,   // 组件里额外需要的 headers
    };
  };

  // ✅ 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const completeBlob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(completeBlob);
        setAudioUrl(URL.createObjectURL(completeBlob));
        setIsUploaded(false); // 录制新音频后，重置上传状态
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // ✅ 停止录音
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // ✅ 上传音频
  const uploadAudio = async () => {
    if (!audioBlob) {
      console.error("No recorded audio to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await fetch(`${config.backendUrl}/api/upload-audio`, {
        method: "POST",
        headers: getHeaders(), // ✅ 统一 headers
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Upload successful:", result);
      setIsUploaded(true); // 上传成功后，设置上传状态为已上传
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  return (
    <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 1000 }}>
      {audioIsInitialized && (
        <>
          {/* 录音按钮 */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              backgroundColor: isRecording ? "red" : "green",
              color: "white",
              border: "none",
              borderRadius: "5px",
              marginRight: "10px",
            }}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          {/* 播放按钮 */}
          {audioUrl && (
            <button
              onClick={() => {
                const audio = new Audio(audioUrl);
                audio.play();
              }}
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            >
              Play
            </button>
          )}

          {/* 上传按钮 */}
          {audioBlob && (
            <button
              onClick={uploadAudio}
              disabled={isUploaded} // 上传成功后禁用按钮
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                cursor: isUploaded ? "not-allowed" : "pointer", // 禁用时鼠标变为不可点击样式
                backgroundColor: isUploaded ? "gray" : "purple", // 上传后按钮为灰色
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              Upload
            </button>
          )}
        </>
      )}
    </div>
  );
}
