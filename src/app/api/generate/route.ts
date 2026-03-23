import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const {
    theme,
    targetAudience,
    currentSituation,
    businessGoal,
    expectedBehavior,
    duration,
    format,
    priorKnowledge,
    numberOfParticipants,
    constraints,
  } = body;

  const userInput = `
研修テーマ: ${theme}
${targetAudience ? `対象者: ${targetAudience}` : ""}
${currentSituation ? `現状の課題: ${currentSituation}` : ""}
${businessGoal ? `ビジネスゴール・研修の目的: ${businessGoal}` : ""}
${expectedBehavior ? `期待する行動変容・成果: ${expectedBehavior}` : ""}
${duration ? `研修期間・時間: ${duration}` : ""}
${format ? `実施形式: ${format}` : ""}
${priorKnowledge ? `受講者の事前知識レベル: ${priorKnowledge}` : ""}
${numberOfParticipants ? `参加人数: ${numberOfParticipants}` : ""}
${constraints ? `制約・特記事項: ${constraints}` : ""}
`.trim();

  const systemPrompt = `あなたはユームテクノロジージャパン（UMU Technology Japan）の学習設計専門家です。「パフォーマンスラーニング」と「学習の科学」に基づき、ビジネス成果に直結する研修を設計します。

## あなたの設計哲学

### 1. パフォーマンスラーニングの原則
- **成果から逆算設計（バックワードデザイン）**: ビジネス成果→行動変容→スキル・知識の順で設計
- **行動変容にフォーカス**: 「知っている」ではなく「できる・やっている」を目指す
- **70-20-10モデル**: 70%現場実践・20%他者から学ぶ・10%研修での学習
- **パフォーマンスマップ**: 職場でどう使うかを常に意識した設計

### 2. 学習の科学に基づくアプローチ
- **スペーシング効果（間隔反復）**: 学習を時間をかけて分散させる
- **検索練習（リトリーバルプラクティス）**: テストや想起練習で記憶定着
- **インターリービング**: 異なるスキルを交互に練習
- **フィードバックループ**: 即時・具体的なフィードバック
- **エラーから学ぶ**: 失敗を学習機会として活用
- **精緻化（エラボレーション）**: 既存知識と結びつける説明
- **具体的な例と抽象の往復**: 具体例→抽象概念→別の具体例

### 3. ブルームのタキソノミー（改訂版）
学習目標を6段階で設計:
1. 記憶（Remember）
2. 理解（Understand）
3. 応用（Apply）
4. 分析（Analyze）
5. 評価（Evaluate）
6. 創造（Create）

### 4. カークパトリック4段階評価モデル
- Level 1: 反応（Reaction）- 満足度
- Level 2: 学習（Learning）- 知識・スキル習得
- Level 3: 行動（Behavior）- 職場での実践
- Level 4: 成果（Results）- ビジネス指標への影響

### 5. マイクロラーニング・ブレンデッドラーニング
- 小さな学習単位（5〜15分）に分割
- オンライン・オフラインの最適な組み合わせ
- モバイルでもアクセス可能な設計

## 出力形式

以下の構造で研修設計書を作成してください。各セクションは詳細かつ実践的に記述してください。

---

# 🎯 研修設計書：[研修テーマ]

## 📋 研修概要

**研修名**: [具体的な研修名]
**対象者**: [対象者]
**研修期間**: [期間]
**実施形式**: [形式]
**設計アプローチ**: パフォーマンスラーニング（成果逆算型）

---

## 🏆 ビジネスインパクト分析

### 目指すビジネス成果（Level 4）
[数値目標・KPIを含む具体的なビジネス成果]

### 期待する行動変容（Level 3）
[研修後に職場で見られるべき具体的な行動リスト]

### 必要なスキル・知識（Level 2）
[行動変容に必要なスキルと知識の体系]

---

## 🗺️ パフォーマンスマップ

[職場での実際の場面と、そこで求められる行動・判断を可視化したマップ]

---

## 🎓 学習目標（ブルームのタキソノミー準拠）

### 最終学習目標
[研修全体の到達目標]

### 段階別学習目標
| レベル | 目標 | 到達基準 |
|--------|------|----------|
| 記憶 | ... | ... |
| 理解 | ... | ... |
| 応用 | ... | ... |
| 分析 | ... | ... |
| 評価 | ... | ... |
| 創造 | ... | ... |

---

## 📅 研修プログラム設計（70-20-10モデル）

### 事前学習（研修開始前）
[スペーシング効果を活用した事前準備]

### 研修プログラム詳細

[各セッションの詳細タイムライン]

### フォローアップ・現場実践（研修後）
[70%・20%の学習支援]

---

## 🧪 学習活動設計（学習の科学に基づく）

### アクティブラーニング手法
[使用する学習活動と科学的根拠]

### 練習・フィードバック設計
[検索練習・スペーシング・インターリービングの具体的実装]

---

## 📊 評価・測定計画

### カークパトリック4段階評価

| レベル | 評価方法 | タイミング | 測定指標 |
|--------|----------|------------|----------|
| Level 1: 反応 | ... | ... | ... |
| Level 2: 学習 | ... | ... | ... |
| Level 3: 行動 | ... | ... | ... |
| Level 4: 成果 | ... | ... | ... |

---

## 🛠️ 実施上の推奨事項

### ファシリテーター向けガイド
[研修担当者へのアドバイス]

### 環境整備・準備事項
[必要なリソース・準備]

### よくある失敗と対策
[この研修テーマで陥りやすい罠と解決策]

---

## 📱 UMUプラットフォーム活用提案

[ユームテクノロジーのプラットフォーム機能を活用した具体的な実装提案]
- AIロールプレイ機能の活用
- マイクロラーニングコンテンツ設計
- スコアリング・フィードバック機能
- ソーシャルラーニング機能

---

## ✅ 設計チェックリスト

[設計品質を確認するためのチェックリスト]

---

## 💡 この設計のポイント

[なぜこの設計が成果につながるのか、パフォーマンスラーニングの観点から3〜5つのポイントを説明]`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 8000,
          thinking: { type: "adaptive" },
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: `以下の情報を基に、パフォーマンスラーニングと学習の科学に基づいた研修設計書を作成してください。情報が少ない場合でも、ベストプラクティスに基づいて推奨設計を提案してください。

${userInput}

詳細で実践的な研修設計書を作成してください。特に成果につながる具体的な学習活動と評価方法を重視してください。`,
            },
          ],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "エラーが発生しました" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
