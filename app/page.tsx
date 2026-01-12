"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  // 파일이 선택되면 실행되는 함수
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // [번역 시작] 버튼 누르면 실행되는 함수
  const handleTranslate = async () => {
    if (!file) {
      alert("PDF 파일을 먼저 넣어주세요!");
      return;
    }

    setIsLoading(true);
    setStatus("📚 책을 읽고 있습니다... (텍스트 추출 중)");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. 백엔드(8003번)에게 파일 전송
      const response = await fetch("http://localhost:8003/translate_book", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("서버 연결 실패! 백엔드가 켜져 있나요?");
      }

      setStatus("🤖 AI가 열심히 번역하고 PDF를 굽는 중... (잠시만 기다리세요)");

      // 2. 응답받은 파일(Blob)을 다운로드 링크로 변환
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `translated_${file.name}`; // 저장될 파일명
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus("✅ 번역 완료! 다운로드가 시작됩니다.");
    } catch (error) {
      console.error(error);
      setStatus("❌ 실패했습니다. (터미널에서 백엔드 에러를 확인하세요)");
      alert("번역 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg text-center border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-3">AI 번역기 🤖</h1>
        <p className="text-gray-500 mb-10 text-lg">PDF 원서를 넣으면 한글 번역본을 드려요</p>

        {/* 파일 업로드 박스 */}
        <div className="mb-8 group">
          <label className="flex flex-col items-center justify-center w-full h-40 cursor-pointer bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl hover:bg-blue-100 hover:border-blue-500 transition-all duration-300">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <div className="text-center">
                <span className="text-4xl mb-2 block">📂</span>
                <span className="text-blue-600 font-bold text-lg group-hover:scale-105 transition-transform block">
                {file ? file.name : "여기를 클릭해 PDF 업로드"}
                </span>
            </div>
          </label>
        </div>

        {/* 번역 시작 버튼 */}
        <button
          onClick={handleTranslate}
          disabled={isLoading || !file}
          className={`w-full py-5 rounded-2xl text-white font-bold text-xl transition-all transform duration-200
            ${isLoading 
              ? "bg-gray-400 cursor-not-allowed scale-95" 
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-blue-500/30 active:scale-95"
            }`}
        >
          {isLoading ? "⏳ 작업 진행 중..." : "번역 시작하기 ✨"}
        </button>

        {/* 상태 메시지 (작업 중일 때만 뜸) */}
        {status && (
          <div className={`mt-8 p-4 rounded-xl text-sm font-medium animate-pulse
            ${status.includes("실패") ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"}`}>
            {status}
          </div>
        )}
      </div>

      <p className="mt-10 text-xs text-gray-400">
        Personal Use Only | Powered by Gemini
      </p>
    </div>
  );
}