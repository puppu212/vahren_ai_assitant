"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function VahrenApp() {
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. ブラウザでの初期化（保存されたキーを読み込む）
  useEffect(() => {
    setIsClient(true);
    setKey(localStorage.getItem("vahren_user_key") || "");
  }, []);

  const handleSend = async () => {
    if (!key) return alert("まずはGoogle GeminiのAPIキーを入力してください");
    if (!input.trim()) return;

    setLoading(true);

    try {
      // 2. public/reference.md から知識データを読み込む
      const res = await fetch("/reference.md");
      const referenceText = await res.text();

      // 3. Gemini API の準備
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const newChat = [...chat, { role: "user", text: input }];
      setChat(newChat);
      setInput("");

      // 4. プロンプト（命令文）の構築
      const prompt = `
あなたはヴァーレントゥーガ（Vahren Tuuga）のシナリオ開発・設定の専門家です。
以下の【提供された資料】の内容を絶対的な正解として扱い、その知識に基づいて質問に回答してください。
資料に載っていない数値や仕様については、推測であることを断った上で一般的な知識を補足してください。

【提供された資料】
${referenceText}

【ユーザーからの質問】
${input}
`;

      // 5. AIに送信
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChat([...newChat, { role: "model", text: text }]);
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。APIキーが正しいか、または通信環境を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col h-[90vh] border border-gray-800 rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
        
        {/* ヘッダー：APIキー入力 */}
        <header className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Vahren Scenario Assistant
              </h1>
              <p className="text-xs text-gray-500">v1.0 - Based on reference.md</p>
            </div>
            <div className="w-full sm:w-72">
              <input 
                type="password" 
                placeholder="Google Gemini API Key..." 
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  localStorage.setItem("vahren_user_key", e.target.value);
                }}
              />
            </div>
          </div>
        </header>

        {/* チャット表示エリア */}
        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
              <p className="text-lg">準備完了です。シナリオについて質問してください。</p>
              <p className="text-sm italic">（例：新しいスキルの案を出して、このデータの矛盾を探して 等）</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-none animate-pulse text-gray-400">
                思考中...
              </div>
            </div>
          )}
        </main>

        {/* 入力フッター */}
        <footer className="p-4 bg-gray-900 border-t border-gray-800">
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-gray-800 border border-gray-700 p-3 rounded-xl outline-none focus:border-blue-500 text-white placeholder-gray-500 transition" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
              placeholder="シナリオの相談をする..."
            />
            <button 
              onClick={handleSend} 
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${
                loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/20'
              }`}
            >
              {loading ? '送信中...' : '送信'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}