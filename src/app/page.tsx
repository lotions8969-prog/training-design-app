"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FormData {
  theme: string;
  targetAudience: string;
  currentSituation: string;
  businessGoal: string;
  expectedBehavior: string;
  duration: string;
  format: string;
  priorKnowledge: string;
  numberOfParticipants: string;
  constraints: string;
}

const initialForm: FormData = {
  theme: "",
  targetAudience: "",
  currentSituation: "",
  businessGoal: "",
  expectedBehavior: "",
  duration: "",
  format: "",
  priorKnowledge: "",
  numberOfParticipants: "",
  constraints: "",
};

export default function Home() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!form.theme.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setShowResult(true);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      // stream: true で日本語などマルチバイト文字がチャンク境界をまたいでも正しくデコード
      const decoder = new TextDecoder("utf-8", { fatal: false });
      // SSE行がチャンク境界で分断されてもパースできるようにバッファを保持
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // 最後の要素は未完成の可能性があるのでバッファに残す
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setGeneratedContent((prev) => prev + parsed.text);
              } else if (parsed.error) {
                setGeneratedContent("エラーが発生しました: " + parsed.error);
              }
            } catch {
              // skip parse errors
            }
          }
        }
      }
      // ストリーム終了後に残ったバッファを処理
      if (buffer.startsWith("data: ")) {
        const data = buffer.slice(6).trim();
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setGeneratedContent((prev) => prev + parsed.text);
            }
          } catch {
            // skip
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setGeneratedContent("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setGeneratedContent("");
    setShowResult(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completionPercent = form.theme
    ? Math.min(100, (Object.values(form).filter((v) => v.trim()).length / Object.keys(form).length) * 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ background: "linear-gradient(135deg, #1e3a8a, #1e40af, #2563eb)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "rgba(255,255,255,0.2)" }}>
              U
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">研修設計AIアシスタント</h1>
              <p className="text-blue-200 text-xs">Powered by UMU Performance Learning</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-blue-200 text-sm">
            <span>🧠 学習の科学</span>
            <span>🎯 パフォーマンスラーニング</span>
            <span>📊 成果逆算設計</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
            ユームテクノロジージャパン パフォーマンスラーニング設計
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            成果につながる研修を、<span style={{ color: "#2563eb" }}>AIが設計</span>します
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            テーマを入力するだけで、学習の科学に基づいた本格的な研修設計書を自動生成。情報を詳しく入力するほど、より精度の高い設計が得られます。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="space-y-6">
            {form.theme && (
              <div className="rounded-xl p-4" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">入力完成度</span>
                  <span className="text-sm font-bold text-blue-900">{Math.round(completionPercent)}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ background: "#bfdbfe" }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${completionPercent}%`,
                      background: completionPercent >= 70 ? "#16a34a" : completionPercent >= 40 ? "#d97706" : "#2563eb",
                    }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {completionPercent >= 70 ? "詳細な情報が揃っています。高品質な設計が期待できます！" : completionPercent >= 40 ? "追加情報を入力するとより精度が上がります" : "基本情報が入力されました"}
                </p>
              </div>
            )}

            {/* Required */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "white", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}>
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="text-white font-bold">研修テーマ</h3>
                  <p className="text-blue-200 text-xs">必須項目</p>
                </div>
              </div>
              <div className="p-6">
                <input
                  type="text"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  placeholder="例: 新人研修、マネジメント研修、営業力強化研修..."
                  className="w-full px-4 py-3 rounded-xl text-slate-800 placeholder-slate-400 outline-none text-base font-medium"
                  style={{ border: "2px solid #e2e8f0", background: "#f8fafc" }}
                />
              </div>
            </div>

            {/* Optional Fields */}
            <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "white", border: "1px solid #e2e8f0" }}>
              <div className="px-6 py-4 flex items-center gap-3" style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <span className="text-xl">✏️</span>
                <div>
                  <h3 className="text-slate-800 font-bold">詳細情報</h3>
                  <p className="text-slate-500 text-xs">入力するほど精度UP（任意）</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <FormField label="対象者" emoji="👥" name="targetAudience" value={form.targetAudience} onChange={handleChange} placeholder="例: 入社1年目の新入社員（文系・理系混合、20名）" type="input" />
                <FormField label="ビジネスゴール・研修の目的" emoji="🏆" name="businessGoal" value={form.businessGoal} onChange={handleChange} placeholder="例: 顧客満足度スコアを3ヶ月で10%向上させたい" type="textarea" />
                <FormField label="現状の課題" emoji="⚠️" name="currentSituation" value={form.currentSituation} onChange={handleChange} placeholder="例: 商談後のフォローアップが属人化しており、成約率が低い" type="textarea" />
                <FormField label="期待する行動変容・成果" emoji="🚀" name="expectedBehavior" value={form.expectedBehavior} onChange={handleChange} placeholder="例: 商談後24時間以内に提案書を送付できるようになる" type="textarea" />
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="研修期間・時間" emoji="📅" name="duration" value={form.duration} onChange={handleChange} placeholder="例: 2日間（計16時間）" type="input" />
                  <FormField label="参加人数" emoji="👤" name="numberOfParticipants" value={form.numberOfParticipants} onChange={handleChange} placeholder="例: 20名" type="input" />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span>🖥️</span> 実施形式
                  </label>
                  <select
                    name="format"
                    value={form.format}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-700 outline-none"
                    style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                  >
                    <option value="">選択してください</option>
                    <option value="対面（集合研修）">対面（集合研修）</option>
                    <option value="オンライン（ライブ）">オンライン（ライブ）</option>
                    <option value="ブレンデッド（対面＋オンライン）">ブレンデッド（対面＋オンライン）</option>
                    <option value="非同期オンライン（eラーニング）">非同期オンライン（eラーニング）</option>
                    <option value="OJT中心">OJT中心</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <span>📚</span> 受講者の事前知識レベル
                  </label>
                  <select
                    name="priorKnowledge"
                    value={form.priorKnowledge}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl text-slate-700 outline-none"
                    style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
                  >
                    <option value="">選択してください</option>
                    <option value="ビギナー（ほぼ未経験）">ビギナー（ほぼ未経験）</option>
                    <option value="初級（基礎知識あり）">初級（基礎知識あり）</option>
                    <option value="中級（実務経験1〜3年）">中級（実務経験1〜3年）</option>
                    <option value="上級（実務経験3年以上）">上級（実務経験3年以上）</option>
                    <option value="混在（レベル差あり）">混在（レベル差あり）</option>
                  </select>
                </div>

                <FormField label="制約・特記事項" emoji="📝" name="constraints" value={form.constraints} onChange={handleChange} placeholder="例: 予算50万円以内、講師は社内人材、受講者は多忙で事前課題は最小限に" type="textarea" />
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!form.theme.trim() || isGenerating}
              className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
              style={{
                background: !form.theme.trim() || isGenerating ? "#94a3b8" : "linear-gradient(135deg, #1e3a8a, #2563eb)",
                cursor: !form.theme.trim() || isGenerating ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  研修設計を生成中...
                </>
              ) : (
                <>✨ 研修設計書を生成する</>
              )}
            </button>

            {/* Tips */}
            <div className="rounded-xl p-4" style={{ background: "#fefce8", border: "1px solid #fef08a" }}>
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">💡 より良い設計のコツ</h4>
              <ul className="space-y-1 text-sm text-amber-700">
                <li>▸ ビジネスゴールを数値で入力すると成果測定が明確になります</li>
                <li>▸ 現状の課題を具体的に書くほどギャップ分析の精度が上がります</li>
                <li>▸ 期待する行動変容は「〜できるようになる」形式で記述すると効果的</li>
              </ul>
            </div>
          </div>

          {/* Right: Result */}
          <div ref={resultRef}>
            {!showResult ? (
              <div className="rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-96" style={{ background: "white", border: "2px dashed #e2e8f0" }}>
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">研修設計書がここに表示されます</h3>
                <p className="text-slate-500 text-sm max-w-xs">左のフォームに研修テーマを入力して「研修設計書を生成する」ボタンをクリックしてください</p>
                <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
                  {[{ icon: "🎯", label: "バックワード設計" }, { icon: "🧠", label: "学習の科学" }, { icon: "📊", label: "4段階評価" }].map((item) => (
                    <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: "#f8fafc" }}>
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs text-slate-600 font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl shadow-sm overflow-hidden" style={{ background: "white", border: "1px solid #e2e8f0" }}>
                <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h3 className="text-white font-bold">研修設計書</h3>
                      <p className="text-blue-200 text-xs">{isGenerating ? "AIが設計中..." : "設計完了 ✓"}</p>
                    </div>
                  </div>
                  {!isGenerating && generatedContent && (
                    <div className="flex gap-2">
                      <button onClick={handleCopy} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>{copied ? "✓ コピー済み" : "コピー"}</button>
                      <button onClick={handleReset} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>リセット</button>
                    </div>
                  )}
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: "75vh" }}>
                  {isGenerating && !generatedContent && (
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-5 rounded-lg shimmer" style={{ width: `${60 + i * 5}%` }} />
                          <div className="h-4 rounded shimmer" />
                          <div className="h-4 rounded shimmer" style={{ width: "85%" }} />
                        </div>
                      ))}
                    </div>
                  )}
                  {generatedContent && (
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent}</ReactMarkdown>
                      {isGenerating && <span className="inline-block w-2 h-5 ml-1 rounded animate-pulse" style={{ background: "#2563eb" }} />}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-16 text-center text-slate-400 text-sm pb-8">
          <p>Powered by <strong className="text-blue-600">UMU Performance Learning</strong> × <strong className="text-slate-600">Claude AI</strong></p>
          <p className="mt-1">学習の科学に基づいた研修設計で、成果につながる人材育成を実現</p>
        </footer>
      </main>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  emoji: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder: string;
  type: "input" | "textarea";
}

function FormField({ label, emoji, name, value, onChange, placeholder, type }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span>{emoji}</span> {label}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl resize-none outline-none text-sm text-slate-800 placeholder-slate-400"
          style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-slate-800 placeholder-slate-400"
          style={{ border: "1.5px solid #e2e8f0", background: "#f8fafc" }}
        />
      )}
    </div>
  );
}
