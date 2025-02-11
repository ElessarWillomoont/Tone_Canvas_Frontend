"use client";

import React, { useState } from "react";
import config from "../public/config.json";
import { usePointerContext } from "../contexts/PointerContext"; // 使用全局状态上下文
import { useCorpusStatusContext } from "../contexts/CorpusStatus"; // 使用 CorpusStatus 上下文

export default function SwitchAudioButton() {
  const [isSwitching, setIsSwitching] = useState(false);
  const { audioIsInitialized, appStatus, setAppStatus } = usePointerContext(); // 读取音频初始化状态和全局变量
  const {
    currentFileName,
    setCurrentFileName,
    currentIndex,
    setCurrentIndex,
    totalCorpus,
    setTotalCorpus,
  } = useCorpusStatusContext();

  // 查询并更新 CorpusStatus
  const updateCorpusStatus = async () => {
    try {
      const fileNameResponse = await fetch(`${config.backendUrl}/api/get-file-name`);
      if (!fileNameResponse.ok) {
        throw new Error("Failed to fetch file name");
      }
      const fileNameData = await fileNameResponse.json();

      const progressResponse = await fetch(`${config.backendUrl}/api/get-progress`);
      if (!progressResponse.ok) {
        throw new Error("Failed to fetch progress");
      }
      const progressData = await progressResponse.json();

      if (fileNameData.fileName !== currentFileName) {
        setCurrentFileName(fileNameData.fileName);
      }
      if (progressData.current_index !== currentIndex) {
        setCurrentIndex(progressData.current_index);
      }
      if (progressData.total_files !== totalCorpus) {
        setTotalCorpus(progressData.total_files);
      }
    } catch (error) {
      console.error("Error updating CorpusStatus:", error);
    }
  };

  // 记录按钮按下日志
  const logButtonPress = async (buttonName: string) => {
    try {
      const response = await fetch(`${config.backendUrl}/api/send-button-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ button_name: buttonName }),
      });

      if (!response.ok) {
        throw new Error("Failed to log button press");
      }

      const result = await response.json();
      console.log("Button press logged:", result.message);
    } catch (error) {
      console.error("Error logging button press:", error);
    }
  };

  const handleSwitchClick = async () => {
    try {
      setIsSwitching(true);
      await logButtonPress("Switch"); // 记录按钮按下日志
      await updateCorpusStatus(); // 更新 CorpusStatus

      const response = await fetch(`${config.backendUrl}/api/switch-wav-file`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to switch audio file");
      }
      const result = await response.json();
      console.log("Switched to audio file index:", result.currentIndex);

      setAppStatus("Play"); // 更新全局状态
    } catch (error) {
      console.error("Error switching audio file:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {audioIsInitialized && (
        <button
          onClick={handleSwitchClick}
          disabled={isSwitching} // 禁用按钮以防止重复切换
          style={{
            position: "relative",
            marginTop: "3%",
            marginLeft: "3%",
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: isSwitching ? "gray" : "blue",
            color: "white",
            border: "none",
            borderRadius: "5px",
            zIndex: 1000, // 确保按钮在前端可见
          }}
        >
          {isSwitching ? "Switching..." : "Switch"}
        </button>
      )}
      {appStatus === "Switch" && (
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "green",
            borderRadius: "50%",
            marginLeft: "10px",
          }}
        ></div>
      )}
    </div>
  );
}
