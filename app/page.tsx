"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function VahrenApp() {
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. 起動時にブラウザの保存済みキーを読み込む
  useEffect(() => {
    setIsClient(true);
    const savedKey = localStorage.getItem("vahren_user_key");
    if (savedKey) setKey(savedKey);
  }, []);

  const handleSend = async () => {
    if (!key) return alert("Google GeminiのAPIキーを入力してください");
    if (!input.trim() || loading) return;

    setLoading(true);

    try {
      // 2. public/reference.md から知識データを読み込む
      const res = await fetch("/reference.md");
      
      // ファイルが見つからない場合のエラーハンドリング
      if (!res.ok) {
        throw new Error("public/reference.md が見つかりません。ファイル名と場所を確認してください。");
      }
      
      const referenceText = await res.text();

      // 3. Gemini 3 API の準備
      const genAI = new GoogleGenerativeAI(key);
      // 2026年の標準モデル gemini-3-flash を指定
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

      const newChat = [...chat, { role: "user", text: input }];
      setChat(newChat);
      setInput("");

      // 4. 命令文（プロンプト）の作成
      const prompt = `
あなたはヴァーレントゥーガ（Vahren Tuuga）の専門家です。
以下の【提供資料】を絶対の知識として、ユーザーの質問に回答してください。

【提供資料】
${referenceText}

【質問】
${input}
`;

      // 5. AIからの回答を取得
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChat([...newChat, { role: "model", text: text }]);
    } catch (e: any) {
      console.error(e);
      alert("エラー: " + (e.message || "通信に失敗しました。APIキーを確認してください。"));
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col h-[90vh] border border-gray-800 rounded-3xl overflow-hidden bg-[#0d1117] shadow-2xl">
        
        {/* ヘッダー */}
        <header className="p-5 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-blue-500">
              VAHREN <span className="text-white">AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Scenario Development Assistant v3</p>
          </div>
          <div className="w-full sm:w-80">
            <input 
              type="password" 
              placeholder="Paste Gemini API Key here..." 
              className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                localStorage.setItem("vahren_user_key", e.target.value);
              }}
            />
          </div>
        </header>

        {/* チャットエリア */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {chat.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 text-2xl font-bold">V</div>
              <p className="text-gray-400 font-medium">リファレンスを読み込みました。<br/>シナリオの相談を始めてください。</p>
            </div>
          )}
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-900/20' 
                  : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </main>

        {/* 入力欄 */}
        <footer className="p-6 bg-gray-900/50 border-t border-gray-800">
          <div className="flex gap-3">
            <input 
              className="flex-1 bg-gray-800 border border-gray-700 p-4 rounded-2xl outline-none focus:border-blue-500 text-white placeholder-gray-500 transition-all shadow-inner" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="質問やアイデアを入力..."
            />
            <button 
              onClick={handleSend} 
              disabled={loading}
              className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                loading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white'
              }`}
            >
              {loading ? '思考中' : '送信'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}