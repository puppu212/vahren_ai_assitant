"use client";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function VahrenTechnicalApp() {
const [key, setKey] = useState("");
const [input, setInput] = useState("");
const [chat, setChat] = useState<{ role: string; text: string }[]>([]);
const [mounted, setMounted] = useState(false);
const [loading, setLoading] = useState(false);

useEffect(() => {
setMounted(true);
const savedKey = localStorage.getItem("vahren_user_key");
if (savedKey) setKey(savedKey);
}, []);

const handleSend = async () => {
if (!key || !input.trim() || loading) return;
setLoading(true);
try {
const res = await fetch("/reference.md");
const referenceText = await res.text();
const genAI = new GoogleGenerativeAI(key);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const newChat = [...chat, { role: "user", text: input }];
      setChat(newChat);
      const currentInput = input;
      setInput("");

      const prompt = `あなたはヴァーレントゥーガ（VT）のデータ設計アシスタントです。

以下の資料に基づき、VTの仕様に沿って回答してください。アプリ自体の設計については答えず、常にゲームデータ設計の文脈を維持してください。

【仕様書】
${referenceText}

【設計相談】
${currentInput}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setChat([...newChat, { role: "model", text: response.text() }]);
    } catch (e) {
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }

};

// ハイドレーションエラー対策：マウントされるまで中身を描画しない
if (!mounted) {
return <div className="min-h-screen bg-[#0f172a]" />;
}

return (
<div className="min-h-screen bg-[#0f172a] text-white p-4 font-sans selection:bg-blue-500/40">
<div className="max-w-5xl mx-auto h-[92vh] flex flex-col border border-slate-700 rounded-2xl bg-[#1e293b] shadow-2xl overflow-hidden relative">
<header className="p-4 border-b border-slate-700 bg-[#0f172a] flex justify-between items-center px-8">
<div className="flex items-center gap-4">
<h1 className="text-sm font-black tracking-widest text-blue-400 italic uppercase">Vahren_AI_Assistant</h1>
</div>
<div className="flex items-center gap-3">
<div className={`flex items-center gap-3 bg-slate-800 border rounded-xl px-4 py-2 transition-all ${!key ? 'border-blue-500 shadow-md' : 'border-slate-600'}`}>
<span className="text-[10px] font-bold text-slate-400 font-mono">KEY:</span>
<input
type="password"
value={key}
onChange={(e) => { setKey(e.target.value); localStorage.setItem("vahren_user_key", e.target.value); }}
className="bg-transparent text-sm w-64 outline-none text-white font-mono"
placeholder="APIキーをペースト"
/>
</div>
</div>
</header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0f172a]">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-5 rounded-2xl border ${msg.role === 'user' ? 'bg-blue-700 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
                <div className="text-[10px] font-bold mb-2 opacity-50 italic uppercase tracking-widest">
                  {msg.role === 'user' ? 'User_Request' : 'Assistant_Reply'}
                </div>
                <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
              </div>
            </div>
          ))}
          {loading && <div className="text-blue-500/50 text-[10px] font-bold ml-4 tracking-widest">ANALYZING...</div>}
        </main>

        <footer className="p-6 bg-[#1e293b] border-t border-slate-700">
          <div className="flex gap-4 items-end">
            <textarea
              className="flex-1 bg-[#0f172a] border border-slate-600 rounded-xl p-4 outline-none focus:border-blue-500 text-sm text-white resize-none h-24 transition-all font-sans"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={key ? "設計相談を入力..." : "APIキーを入力してください"}
              disabled={!key}
            />
            <button
              onClick={handleSend}
              disabled={loading || !key}
              className={`h-24 px-8 rounded-xl text-[11px] font-black transition-all ${!key ? "bg-slate-800 text-slate-600 opacity-40" : "bg-blue-600 text-white shadow-lg"}`}
            >
              SEND
            </button>
          </div>
        </footer>
      </div>
    </div>

);
}
