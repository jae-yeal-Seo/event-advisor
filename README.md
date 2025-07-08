# 🎯 企業入社アドバイスシステム

質問に答えて、企業を選択し、3年後の自分からのアドバイスを受け取るシステムです。

## ✨ 主な機能

- **質問回答**: 10個の面接質問に回答
- **企業選択**: 日本の主要企業10社から選択
- **3年後のアドバイス**: ChatGPT APIを使用した個別化アドバイス
- **回答履歴**: 自分の回答を確認

## 🏢 対象企業

- トヨタ自動車
- ソニー
- 任天堂
- 楽天
- LINE
- サイバーエージェント
- DeNA
- メルカリ
- リクルート
- パナソニック

## 📁 プロジェクト構造

```
event-advisor/
├── index.html          # メインHTMLファイル
├── styles.css          # CSSスタイル
├── script.js           # JavaScriptロジック
├── data/
│   ├── companies.json  # 企業情報
│   └── interview_questions.json  # 面接質問
└── README.md           # プロジェクト説明
```

## 🚀 実行方法

1. プロジェクトフォルダに移動
2. Webサーバーを起動（ローカルサーバーが必要）
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```
3. ブラウザで `http://localhost:8000` にアクセス

## 🤖 ChatGPT API連携方法

現在のシステムは静的データに基づいてアドバイスを生成しています。より個別化されたアドバイスのためにChatGPT APIを連携できます。

### 1. OpenAI APIキー設定

```javascript
// script.jsに追加
const OPENAI_API_KEY = 'your-api-key-here';
```

### 2. ChatGPT API呼び出し関数

```javascript
async function getChatGPTAdvice(company, answers) {
    const prompt = `
    ${company.name}で3年間働いた経験者として、以下の情報を基に、現在の自分にアドバイスをしてください：

    企業情報：
    - 企業名: ${company.name}
    - 業界: ${company.industry}
    - 企業文化: ${company.culture}
    - 採用情報: ${company.recruitment}

    ユーザーの回答：
    ${answers}

    3年後の自分として、現在の自分にアドバイスをしてください。
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'あなたは企業で3年間働いた経験者です。実用的で具体的なアドバイスを提供してください。日本語で回答してください。'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 800,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('ChatGPT API呼び出し失敗:', error);
        return null;
    }
}
```

## 💡 ChatGPT API活用方法

### 1. 個別化されたアドバイス
- ユーザーの具体的な状況に合わせたアドバイス
- 経験、技術スタック、関心事を反映

### 2. リアルタイム面接練習
- 面接質問に対するリアルタイム回答生成
- 回答品質評価と改善提案

### 3. キャリア開発ロードマップ
- 個人状況に合わせたキャリア開発計画提示
- 段階的目標設定と達成方法

### 4. 業界トレンド分析
- 最新業界動向を反映
- 技術トレンドと市場変化への対応策

## 🔧 技術スタック

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **データ**: JSON
- **API**: OpenAI ChatGPT API (オプション)
- **スタイリング**: CSS Grid, Flexbox, CSS Animations

## 📱 レスポンシブデザイン

- モバイル、タブレット、デスクトップ対応
- タッチフレンドリーインターフェース
- アクセシビリティ配慮

## 🎨 UI/UX特徴

- モダンでクリーンなデザイン
- スムーズなアニメーション効果
- 直感的なユーザーインターフェース
- カードベースレイアウト

## 🔮 今後の改善案

1. **より多くの企業追加**
2. **リアルタイムChatGPT API連携**
3. **ユーザーアカウントシステム**
4. **アドバイス履歴保存**
5. **モバイルアプリ開発**
6. **多言語対応**

## 📄 ライセンス

MIT License

## 🤝 貢献方法

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 お問い合わせ

プロジェクトに関するお問い合わせは、イシューを作成してください。 