// グローバル変数
let companies = [];
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let selectedCompany = null;

// ChatGPT API設定（オプション）
const OPENAI_API_KEY = API_KEYS?.OPENAI_API_KEY || ''; // 実際の使用時にAPIキーを入力してください

// ユニコード文字を安全にbase64エンコードする関数
function utf8_to_b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', async function() {
    await loadData();
    loadAnswersFromStorage(); // 保存された回答を読み込み
    setupEventListeners();
    renderCompanies();
});

// データ読み込み
async function loadData() {
    try {
        const [companiesResponse, questionsResponse] = await Promise.all([
            fetch('data/companies.json'),
            fetch('data/interview_questions.json')
        ]);
        
        companies = (await companiesResponse.json()).companies;
        questions = (await questionsResponse.json()).questions;
        
        // 最初の10問のみ使用
        questions = questions.slice(0, 10);
        
    } catch (error) {
        console.error('データ読み込み失敗:', error);
        showError('データの読み込みに失敗しました。');
    }
}

// イベントリスナー設定
function setupEventListeners() {
    // 質問開始ボタン
    document.getElementById('startQuestionnaire').addEventListener('click', startQuestionnaire);
    
    // 次の質問ボタン
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
    
    // 前の質問ボタン
    document.getElementById('prevQuestion').addEventListener('click', prevQuestion);
    
    // ChatGPTアドバイス取得ボタン
    document.getElementById('getChatGPTAdvice').addEventListener('click', handleChatGPTAdvice);
    
    // 回答入力フィールドでEnterキー
    document.getElementById('answerInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            nextQuestion();
        }
    });
}

// 企業レンダリング
function renderCompanies() {
    const companyGrid = document.getElementById('companyGrid');
    const loadingContainer = document.getElementById('loadingContainer');
    
    // ローディング状態を非表示
    loadingContainer.style.display = 'none';
    
    // 企業グリッドを表示
    companyGrid.style.display = 'grid';
    companyGrid.innerHTML = '';

    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card fade-in';
        companyCard.innerHTML = `
            <h3>${company.name}</h3>
            <p>${company.description}</p>
            <div class="company-meta">
                <span>${company.industry}</span>
                <span>${company.location}</span>
                <span>${company.employees}</span>
            </div>
        `;
        
        companyCard.addEventListener('click', () => selectCompany(company));
        companyGrid.appendChild(companyCard);
    });
}

// 企業選択
function selectCompany(company) {
    selectedCompany = company;
    
    // 選択された企業情報表示
    document.getElementById('companyName').textContent = company.name;
    document.getElementById('companyDescription').textContent = company.description;
    document.getElementById('companyIndustry').textContent = company.industry;
    document.getElementById('companyLocation').textContent = company.location;
    document.getElementById('companyEmployees').textContent = company.employees;
    document.getElementById('companyCulture').textContent = company.culture;
    document.getElementById('companyRecruitment').textContent = company.recruitment;

    
    // ロゴ設定（企業名の最初の文字を使用）
    const logo = document.getElementById('companyLogo');
    const svgContent = `
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" fill="#3498db" rx="40"/>
            <text x="40" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle">${company.name.charAt(0)}</text>
        </svg>
    `;
    logo.src = `data:image/svg+xml;base64,${utf8_to_b64(svgContent)}`;
    
    // セクション表示
    document.getElementById('companySelection').style.display = 'none';
    document.getElementById('selectedCompany').style.display = 'block';
}

// アンケート開始
function startQuestionnaire() {
    currentQuestionIndex = 0;
    userAnswers = [];
    clearAnswersFromStorage(); // 新しい質問開始時に前の回答をクリア
    
    // 選択された企業バッジ表示
    document.getElementById('selectedCompanyBadge').textContent = selectedCompany.name;
    
    // セクション表示
    document.getElementById('selectedCompany').style.display = 'none';
    document.getElementById('questionSection').style.display = 'block';
    
    showQuestion(currentQuestionIndex);
    updateProgress();
}

// 質問表示
function showQuestion(index) {
    if (index >= questions.length) {
        showCompletion();
        return;
    }
    
    const question = questions[index];
    document.getElementById('currentQuestion').textContent = question.question;
    document.getElementById('questionTips').innerHTML = `<strong>💡 ヒント:</strong> ${question.tips}`;
    
    // 既存の回答があれば表示
    const answerInput = document.getElementById('answerInput');
    answerInput.value = userAnswers[index] || '';
    
    // ボタン状態更新
    document.getElementById('prevQuestion').disabled = index === 0;
    
    updateProgress();
}

// 次の質問
function nextQuestion() {
    const answerInput = document.getElementById('answerInput');
    const answer = answerInput.value.trim();
    
    if (!answer) {
        showError('回答を入力してください。');
        return;
    }
    
    // 回答を保存
    userAnswers[currentQuestionIndex] = answer;
    saveAnswersToStorage(); // ローカルストレージに保存
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questions.length) {
        showCompletion();
    } else {
        showQuestion(currentQuestionIndex);
    }
}

// 前の質問
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(currentQuestionIndex);
    }
}

// 進捗更新
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
}

// 完了画面表示
function showCompletion() {
    document.getElementById('questionSection').style.display = 'none';
    document.getElementById('completionSection').style.display = 'block';
    
    // 選択された企業バッジ表示
    document.getElementById('completionCompanyBadge').textContent = selectedCompany.name;
}

// ChatGPTアドバイス処理
async function handleChatGPTAdvice() {
    const button = document.getElementById('getChatGPTAdvice');
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    // ローディング状態表示
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    button.disabled = true;
    
    try {
        const advice = await getChatGPTAdvice(selectedCompany, userAnswers);
        if (advice) {
            displayAdvice(advice);
            document.getElementById('completionSection').style.display = 'none';
            document.getElementById('adviceResult').style.display = 'block';
            document.getElementById('answerHistory').style.display = 'block';
            renderAnswerHistory();
        } else {
            showError('ChatGPTアドバイスの取得に失敗しました。');
        }
    } catch (error) {
        console.error('ChatGPTアドバイス生成失敗:', error);
        showError('ChatGPTアドバイスの取得に失敗しました。');
    } finally {
        // ローディング状態解除
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

// 回答履歴表示
function showAnswerHistory() {
    document.getElementById('completionSection').style.display = 'none';
    document.getElementById('answerHistory').style.display = 'block';
    renderAnswerHistory();
}

// 回答履歴レンダリング
function renderAnswerHistory() {
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = '';
    
    userAnswers.forEach((answer, index) => {
        const question = questions[index];
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item fade-in';
        historyItem.innerHTML = `
            <div class="history-question">
                <strong>Q${index + 1}:</strong> ${question.question}
            </div>
            <div class="history-answer">
                <strong>A:</strong> ${answer}
            </div>
        `;
        historyContainer.appendChild(historyItem);
    });
}

// ChatGPT API呼び出し
async function getChatGPTAdvice(company, answers) {
    if (!OPENAI_API_KEY) {
        // APIキーがない場合はシミュレーションされた応答を返す
        return simulateChatGPTResponse(company, answers);
    }

    const companyData = `
    企業情報：
    - 企業名: ${company.name}
    - 業界: ${company.industry}
    - 企業文化: ${company.culture}
    - 採用情報: ${company.recruitment}
    - 企業説明: ${company.description}
    `;
    const answersText = answers.map((answer, index) => 
        `Q${index + 1}: ${questions[index].question}\nA: ${answer}`
    ).join('\n\n');


    try {
        const response = await fetch('https://zj5cf78mu1.execute-api.ap-northeast-1.amazonaws.com/event-cors-free/get-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                companyData: companyData,
                answersText: answersText
            })
        });

        const data = await response.json();
        if (data.body && typeof data.body === 'string') {
            return JSON.parse(data.body).choices[0].message.content;
        } else {
            throw new Error('API Gateway 응답 형식 에러');
        }
    } catch (error) {
        console.error('API Gateway 호출 실패:', error);
        return simulateChatGPTResponse(company, answers);
    }
}

// ChatGPT APIシミュレーション（APIキーがない場合）
function simulateChatGPTResponse(company, answers) {
    const responses = {
        'トヨタ自動車': `💡 総合評価
        トヨタ自動車の面接官として、あなたの回答を評価しました。全体的に誠実で真摯な態度が見られますが、より具体的な経験や数値的な成果を盛り込むことで、より説得力のある回答になります。

        🎯 改善点
        • 具体的な数値や成果を含めた回答を心がける
        • トヨタの企業文化（改善活動、チームワーク）への理解を深める
        • 長期的なキャリアビジョンをより明確に示す

        ⭐ 良い点
        • 誠実で真摯な回答姿勢
        • 基本的なコミュニケーション能力
        • 学習意欲の高さ

        💪 今後のアドバイス
        • トヨタ生産方式（TPS）について学習し、理解を深める
        • チームワークや改善活動に関する具体的な経験を準備する
        • グローバルな視点でのキャリアプランを考える`,

        'ソニー': `💡 総合評価
        ソニーの面接官として、あなたの回答を評価しました。創造性とイノベーションへの関心が感じられますが、より具体的な技術スキルやプロジェクト経験をアピールすることで、より魅力的な応募者になります。

        🎯 改善点
        • 技術スキルやプロジェクト経験をより具体的に説明する
        • ソニーの多様な事業領域への理解を深める
        • グローバルな視点での経験や意欲を示す

        ⭐ 良い点
        • 創造性とイノベーションへの関心
        • 学習意欲の高さ
        • 基本的なコミュニケーション能力

        💪 今後のアドバイス
        • ソニーの技術分野（映像、音響、ゲームなど）について学習する
        • グローバルな視点でのキャリアプランを考える
        • 技術力と創造性の両方を磨く`,

        '任天堂': `💡 総合評価
        任天堂の面接官として、あなたの回答を評価しました。ゲームやエンターテイメントへの関心が感じられますが、より具体的なゲーム開発経験やユーザー体験への理解を深めることで、より魅力的な応募者になります。

        🎯 改善点
        • ゲーム開発やユーザー体験に関する具体的な経験を準備する
        • 任天堂の「遊び」の哲学への理解を深める
        • 技術力と創造性のバランスを意識した回答をする

        ⭐ 良い点
        • エンターテイメントへの関心
        • 基本的なコミュニケーション能力
        • 学習意欲の高さ

        💪 今後のアドバイス
        • 任天堂のゲーム作品や「遊び」の哲学について学習する
        • ユーザー体験（UX）デザインについて理解を深める
        • 技術力と創造性の両方を磨く`,

        '楽天': `💡 総合評価
        楽天の面接官として、あなたの回答を評価しました。ITやECへの関心が感じられますが、より具体的な技術スキルやグローバルな視点を示すことで、より魅力的な応募者になります。

        🎯 改善点
        • 技術スキルやプロジェクト経験をより具体的に説明する
        • グローバルな視点での経験や意欲を示す
        • 楽天の多様なサービスへの理解を深める

        ⭐ 良い点
        • ITやECへの関心
        • 基本的なコミュニケーション能力
        • 学習意欲の高さ

        💪 今後のアドバイス
        • 英語力を向上させ、グローバルな視点を身につける
        • 楽天の多様なサービスについて学習する
        • 技術力とビジネス感覚の両方を磨く`,

        'LINE': `💡 総合評価
        LINEの面接官として、あなたの回答を評価しました。コミュニケーションやユーザー体験への関心が感じられますが、より具体的な技術スキルやプロジェクト経験をアピールすることで、より魅力的な応募者になります。

        🎯 改善点
        • 技術スキルやプロジェクト経験をより具体的に説明する
        • ユーザー体験（UX）デザインへの理解を深める
        • グローバルなサービス展開への理解を深める

        ⭐ 良い点
        • コミュニケーションへの関心
        • 基本的なコミュニケーション能力
        • 学習意欲の高さ

        💪 今後のアドバイス
        • ユーザー体験（UX）デザインについて学習する
        • グローバルなサービス展開について理解を深める
        • 技術力とユーザー視点の両方を磨く`
    };
    
    // デフォルト応答
    const defaultResponse = `💡 総合評価
    ${company.name}の面接官として、あなたの回答を評価しました。基本的なコミュニケーション能力はありますが、より具体的な経験やスキルをアピールすることで、より魅力的な応募者になります。

    🎯 改善点
    • 具体的な経験や成果を数値で示す
    • 企業の文化や価値観への理解を深める
    • より具体的なキャリアプランを提示する

    ⭐ 良い点
    • 基本的なコミュニケーション能力
    • 学習意欲の高さ
    • 誠実な回答姿勢

    💪 今後のアドバイス
    • 企業の文化や価値観について学習する
    • 具体的な経験や成果を準備する
    • 長期的なキャリアプランを考える`;

    return responses[company.name] || defaultResponse;
}

// アドバイス表示
function displayAdvice(advice) {
    document.getElementById('adviceTitle').textContent = `${selectedCompany.name}面接官からのアドバイス`;
    document.getElementById('adviceText').innerHTML = advice.replace(/\n/g, '<br>');
    
    // アドバイスのセクションを表示
    document.getElementById('adviceResult').style.display = 'block';
    document.getElementById('adviceResult').classList.add('fade-in');
}

// エラー表示
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        background: #ffebee;
        color: #c62828;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
    `;
    errorDiv.textContent = message;
    container.insertBefore(errorDiv, container.firstChild);
    
    // 3秒後にエラーメッセージを削除
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// ローカルストレージから回答を読み込み
function loadAnswersFromStorage() {
    const savedAnswers = localStorage.getItem('userAnswers');
    if (savedAnswers) {
        userAnswers = JSON.parse(savedAnswers);
    }
}

// ローカルストレージに回答を保存
function saveAnswersToStorage() {
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
}

// ローカルストレージから回答を削除
function clearAnswersFromStorage() {
    localStorage.removeItem('userAnswers');
} 