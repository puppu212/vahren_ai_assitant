"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function VahrenApp() {
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
  const [mounted, setMounted] = useState(false); // マウント状態を管理
  const [loading, setLoading] = useState(false);

  // マウント後にのみ表示を許可することでハイドレーションエラーを防止
  useEffect(() => {
    setMounted(true);
    const savedKey = localStorage.getItem("vahren_user_key");
    if (savedKey) setKey(savedKey);
  }, []);

  const handleSend = async () => {
    if (!key) return alert("Google GeminiのAPIキーを入力してください");
    if (!input.trim() || loading) return;

    setLoading(true);

    try {
      const res = await fetch("/reference.md");
      if (!res.ok) throw new Error("public/reference.md が見つかりません。");
      const referenceText = await res.text();

      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const newChat = [...chat, { role: "user", text: input }];
      setChat(newChat);
      const currentInput = input;
      setInput("");

      const prompt = `あなたはヴァーレントゥーガの専門家です。以下の資料に基づき回答してください。\n\n【資料】\n${referenceText}\n\n【質問】\n${currentInput}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setChat([...newChat, { role: "model", text: response.text() }]);
    } catch (e: any) {
      alert("エラー: " + (e.message || "通信失敗"));
    } finally {
      setLoading(false);
    }
  };

  // サーバーサイドレンダリング時は何も表示しない（エラー回避）
  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 font-sans">
      <div className="max-w-4xl mx-auto h-[90vh] flex flex-col border border-slate-800 rounded-3xl bg-[#1e293b] shadow-2xl overflow-hidden">
        <header className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-blue-400 tracking-tight">VAHREN SCENARIO AI</h1>
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">gemini-3-flash-preview</p>
          </div>
          <div className="w-full sm:w-72">
            <input 
              type="password" 
              placeholder="API Key..." 
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                localStorage.setItem("vahren_user_key", e.target.value);
              }}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/30">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && <div className="text-blue-400 animate-pulse text-sm">Thinking...</div>}
        </main>

        <footer className="p-6 bg-slate-900/50 border-t border-slate-800 flex gap-3">
          <input 
            className="flex-1 bg-slate-800 border border-slate-700 p-4 rounded-2xl outline-none focus:border-blue-500" 
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="相談内容を入力..."
          />
          <button onClick={handleSend} disabled={loading} className="bg-blue-600 px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 disabled:opacity-50">送信</button>
        </footer>
      </div>
    </div>
  );
}