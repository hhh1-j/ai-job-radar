"use client";

import { useState } from "react";

export default function AIJobRadar() {
  const [inputText, setInputText] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    console.log("🔘 按钮被点击，inputText:", inputText?.substring(0, 50));
    
    if (!inputText || inputText.trim() === "") {
      console.log("❌ 输入为空");
      setError("请输入岗位描述");
      return;
    }
    
    console.log("🚀 开始发送请求...");
    setLoading(true);
    setError(null);
    setResult("");
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText.trim() }),
      });
      
      console.log("📡 响应状态:", res.status);
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        console.error("❌ 请求失败:", data);
        setError(typeof data.error === "string" ? data.error : `请求失败（${res.status}）`);
        return;
      }
      
      if (typeof data.result === "string") {
        console.log("✅ 收到结果，长度:", data.result.length);
        setResult(data.result);
      } else {
        console.error("❌ 返回数据格式异常:", data);
        setError("返回数据格式异常");
      }
    } catch (e) {
      console.error("❌ 网络请求失败:", e);
      setError(e instanceof Error ? e.message : "网络请求失败");
    } finally {
      console.log("🔄 请求结束，loading=false");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* 标题区 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">AI 岗位雷达</h1>
          <p className="text-gray-600">粘贴 JD，秒获面试备战清单</p>
        </div>

        {/* 输入区 - 添加 id 和 name */}
        <div className="space-y-2">
          <textarea
            id="jd-input"
            name="jd-input"
            value={inputText}
            onChange={(e) => {
              console.log("📝 输入变化，长度:", e.target.value.length);
              setInputText(e.target.value);
            }}
            placeholder="请粘贴岗位描述或 JD..."
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 bg-white"
          />
          <p className="text-xs text-gray-400">当前字数: {inputText.length}</p>
        </div>

        {/* 按钮区 - 添加 id */}
        <button
          id="analyze-btn"
          name="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors cursor-pointer ${
            loading || !inputText.trim()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {loading ? "分析中..." : "开始分析"}
        </button>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* 结果区 */}
        <div className="p-4 bg-gray-100 rounded-lg min-h-[120px]">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📊 分析结果</h3>
          <div
            className="text-gray-800 text-sm leading-relaxed"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {result || "等待输入..."}
          </div>
        </div>

        {/* 页脚 */}
        <p className="text-center text-xs text-gray-400 mt-4">智能分析，助力求职</p>
      </div>
    </main>
  );
}