// script.js

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------
    // 1. 변수 선언
    // ---------------------------

    // 화면 요소
    const screens = {
        difficulty: document.getElementById('difficulty-screen'),
        mainMenu: document.getElementById('main-menu-screen'),
        study: document.getElementById('study-screen'),
        game: document.getElementById('game-screen'),
        manageLearned: document.getElementById('manage-learned-sajaseongeo-screen')
    };

    // 난이도 선택 버튼
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // 메인 메뉴 버튼
    const studyBtn = document.getElementById('study-btn');
    const gameBtn = document.getElementById('game-btn');
    const manageLearnedSajaseongeoBtn = document.getElementById('manage-learned-sajaseongeo-btn');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty');

    // 관리 화면 버튼
    const backToMenuFromManagedBtn = document.getElementById('back-to-menu-from-managed');

    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const sajaseongeoCharacter = document.getElementById('sajaseongeo-character');
    const sajaseongeoMeaning = document.getElementById('sajaseongeo-meaning');
    const sajaseongeoChinese = document.getElementById('sajaseongeo-chinese');
    const speakBtn = document.getElementById('speak-btn');
    const speakBtnOverlay = document.getElementById('speak-btn-overlay');
    const writingCanvas = document.getElementById('writing-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const goFirstBtn = document.getElementById('go-first-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');

    // 유래 정보 요소
    const sajaseongeoOrigin = document.getElementById('sajaseongeo-origin');

    // 낱말게임 화면 요소
    const quizMeaningReadingBtn = document.getElementById('quiz-meaning-reading-btn');
    const quizSajaseongeoBtn = document.getElementById('quiz-sajaseongeo-btn');
    const matchingGameBtn = document.getElementById('matching-game-btn');
    const quizGame = document.getElementById('quiz-game');
    const matchingGame = document.getElementById('matching-game');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');
    const nextQuizBtn = document.getElementById('next-quiz-btn');
    const matchingGameBoard = document.getElementById('matching-game-board');
    const matchingFeedback = document.getElementById('matching-feedback');
    const restartMatchingBtn = document.getElementById('restart-matching-btn');
    const backToMenuFromGameBtn = document.getElementById('back-to-menu-from-game');

    const currentScoreSpan = document.getElementById('current-score');
    const highScoreSpan = document.getElementById('high-score');

    // 학습완료 사자성어 관리 요소
    const learnedSajaseongeoList = document.getElementById('learned-sajaseongeo-list');

    // 퀴즈 유형 버튼 요소
    const backToMenuFromStudyBtn = document.getElementById('back-to-menu-from-study');

    // ---------------------------
    // 2. 전역 변수 선언
    // ---------------------------

    let selectedLevel = '초급'; // 현재 선택된 난이도 ('초급', '중급', '고급')
    let selectedQuizType = ''; // 현재 선택된 퀴즈 유형 ('meaningChinese' 또는 'sajaseongeo')
    let quizQuestions = []; // 퀴즈 질문 배열
    let sajaseongeoData = []; // 사자성어 데이터 배열
    let currentIndex = 0;
    let isRandom = false;
    let shuffledIndices = [];
    let isProcessing = false; // 매칭 게임 처리 중 여부
    let currentUtterances = [];
    let currentSajaseongeo = null; // 현재 사자성어

    let currentTypingInterval = null; // 현재 타이핑 인터벌 ID

    // ---------------------------
    // 3. 헬퍼 함수
    // ---------------------------

    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length -1; i >0; i--) {
            const j = Math.floor(Math.random() * (i+1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 최고 점수 관련 함수들

    // 최고 점수 가져오기 함수
    function getHighScores() {
        return JSON.parse(localStorage.getItem('highScores')) || {};
    }

    // 특정 난이도의 최고 점수 가져오기 함수
    function getHighScore(level) {
        const highScores = getHighScores();
        return highScores[level] || 0;
    }

    // 특정 난이도의 최고 점수 저장하기 함수
    function setHighScore(level, score) {
        const highScores = getHighScores();
        if (!highScores[level] || score > highScores[level]) {
            highScores[level] = score;
            localStorage.setItem('highScores', JSON.stringify(highScores));
            updateHighScoreUI(level, score);
        }
    }

    // 최고 점수 UI 업데이트 함수
    function updateHighScoreUI(level, score) {
        // 현재 퀴즈 화면의 최고 점수 업데이트
        if (selectedLevel === level) {
            highScoreSpan.innerText = score.toString();
        }
    }

    // 초기 로드 시 모든 최고 점수 UI 업데이트
    function initializeHighScoresUI() {
        const highScores = getHighScores();
        for (const level in highScores) {
            if (highScores.hasOwnProperty(level)) {
                updateHighScoreUI(level, highScores[level]);
            }
        }
    }

    // 학습완료 사자성어 관리 함수

    // 사자성어 저장 함수 (레벨별)
    function markSajaseongeoAsLearned(sajaseongeo) {
        let learned = JSON.parse(localStorage.getItem('learnedSajaseongeo')) || {};
        if (!learned[selectedLevel]) {
            learned[selectedLevel] = [];
        }
        if (!learned[selectedLevel].includes(sajaseongeo)) {
            learned[selectedLevel].push(sajaseongeo);
            localStorage.setItem('learnedSajaseongeo', JSON.stringify(learned));
            loadLearnedSajaseongeoManagement();
        }
    }

    // 사자성어 해제 함수 (레벨별)
    function unmarkSajaseongeoAsLearned(sajaseongeo) {
        let learned = JSON.parse(localStorage.getItem('learnedSajaseongeo')) || {};
        if (learned[selectedLevel]) {
            const index = learned[selectedLevel].indexOf(sajaseongeo);
            if (index > -1) {
                learned[selectedLevel].splice(index, 1);
                localStorage.setItem('learnedSajaseongeo', JSON.stringify(learned));
                loadLearnedSajaseongeoManagement();
            }
        }
    }

    // 사자성어 불러오기 (레벨별)
    function getLearnedSajaseongeo() {
        return JSON.parse(localStorage.getItem('learnedSajaseongeo')) || {};
    }

    // 사자성어 관리 화면 로딩 함수
    function loadLearnedSajaseongeoManagement() {
        if (!learnedSajaseongeoList) return;

        learnedSajaseongeoList.innerHTML = '';
        const learnedSajaseongeo = getLearnedSajaseongeo()[selectedLevel] || [];

        if (learnedSajaseongeo.length === 0) {
            learnedSajaseongeoList.innerText = '학습완료 사자성어가 없습니다.';
            return;
        }

        learnedSajaseongeo.forEach(sajaseongeo => {
            const div = document.createElement('div');
            div.classList.add('learned-sajaseongeo-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = `learned-${sajaseongeo}`;

            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    unmarkSajaseongeoAsLearned(sajaseongeo);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `learned-${sajaseongeo}`;
            label.innerText = sajaseongeo;

            div.appendChild(checkbox);
            div.appendChild(label);
            learnedSajaseongeoList.appendChild(div);
        });
    }

    // 화면 전환 함수
    function showScreen(screen) {
        // 모든 화면 비활성화
        Object.values(screens).forEach(s => s.classList.remove('active'));
        // 선택된 화면 활성화
        screen.classList.add('active');

        // 화면 전환 시 필요한 초기화 작업 수행
        if (screen === screens.manageLearned) {
            loadLearnedSajaseongeoManagement();
        } else if (screen === screens.game) {
            // 게임 화면으로 전환 시 TTS 중지 및 타이핑 인터벌 중지
            stopAllTTS();
            clearTyping();
        } else if (screen === screens.study) {
            // 학습 화면으로 전환 시 사자성어 표시
            displaySajaseongeo();
        } else {
            // 다른 화면으로 전환 시 TTS 중지 및 타이핑 인터벌 중지
            stopAllTTS();
            clearTyping();
        }
    }

    // ---------------------------
    // 4. 이벤트 핸들러 설정
    // ---------------------------

    // 난이도 선택 버튼 클릭 이벤트
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const levelName = btn.getAttribute('data-level'); // "초급", "중급", "고급"
            selectedLevel = levelName;
            const selectedLevelTitle = document.getElementById('selected-level-title');
            if (selectedLevelTitle) {
                selectedLevelTitle.innerText = `난이도: ${selectedLevel}`;
            }
            studyLevelSpan.innerText = levelName; // 학습하기 화면에 표시
            loadSajaseongeoData();
            showScreen(screens.mainMenu);
        });
    });

    // 메인 메뉴 버튼 클릭 이벤트
    if (studyBtn) {
        studyBtn.addEventListener('click', () => {
            showScreen(screens.study);
            initializeStudy(); // 학습하기 초기화
        });
    }

    if (gameBtn) {
        gameBtn.addEventListener('click', () => {
            showScreen(screens.game);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('meaningChinese'); // 퀴즈(뜻중국어) 초기화
        });
    }

    if (manageLearnedSajaseongeoBtn) {
        manageLearnedSajaseongeoBtn.addEventListener('click', () => {
            showScreen(screens.manageLearned);
        });
    }

    if (backToDifficultyBtn) {
        backToDifficultyBtn.addEventListener('click', () => {
            showScreen(screens.difficulty);
        });
    }

    if (backToMenuFromManagedBtn) {
        backToMenuFromManagedBtn.addEventListener('click', () => {
            showScreen(screens.mainMenu);
        });
    }

    if (backToMenuFromStudyBtn) {
        backToMenuFromStudyBtn.addEventListener('click', () => { 
            showScreen(screens.mainMenu);
        });
    }

    if (backToMenuFromGameBtn) {
        backToMenuFromGameBtn.addEventListener('click', () => {
            showScreen(screens.mainMenu);
        });
    }

    // 퀴즈 유형 버튼 클릭 이벤트
    if (quizMeaningReadingBtn) {
        quizMeaningReadingBtn.addEventListener('click', () => {
            showScreen(screens.game);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('meaningChinese'); // 퀴즈(뜻중국어) 초기화
        });
    }

    if (quizSajaseongeoBtn) {
        quizSajaseongeoBtn.addEventListener('click', () => {
            showScreen(screens.game);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('sajaseongeo'); // 퀴즈(사자성어) 초기화
        });
    }

    if (matchingGameBtn) {
        matchingGameBtn.addEventListener('click', () => {
            showScreen(screens.game);
            quizGame.style.display = 'none';
            matchingGame.style.display = 'block';
            initializeMatchingGame();
        });
    }

    // ---------------------------
    // 5. 학습하기 초기화 함수
    // ---------------------------

    function initializeStudy() {
        currentIndex = getSavedIndex(selectedLevel) || 0;
        // 순서 선택
        isRandom = Array.from(orderOptions).find(r => r.checked).value === 'random';
        // 준비
        if (isRandom) {
            shuffledIndices = shuffleArray([...Array(sajaseongeoData.length).keys()]);
        } else {
            shuffledIndices = [...Array(sajaseongeoData.length).keys()];
        }
        displaySajaseongeo();
    }

    // ---------------------------
    // 6. TTS (텍스트 투 스피치) 기능
    // ---------------------------

    function playSajaseongeoTTS() {
        if (!currentSajaseongeo) return;

        // 웹 브라우저의 SpeechSynthesis 사용 시 기존 음성 중지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // 기존 utterances 배열 초기화
        currentUtterances = [];

        const koreanText = `${currentSajaseongeo.사자성어}`;
        const meaningText = `${currentSajaseongeo.뜻}`;
        const chineseText = `${currentSajaseongeo.중국어}`;
        const originText = `${currentSajaseongeo.유래 || ''}`; // 유래가 없는 경우 빈 문자열

        // 안드로이드 환경에서 TTS 지원 시
        if (typeof Android !== 'undefined' && Android.speak) {      
            Android.speak(koreanText, meaningText, chineseText, originText); // 네 개의 파라미터로 전달
        }
        // 웹 브라우저에서 TTS 지원 시
        else if ('speechSynthesis' in window) {
            const utteranceKorean = new SpeechSynthesisUtterance(koreanText);
            utteranceKorean.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceKorean);
            currentUtterances.push(utteranceKorean);

            const utteranceMeaning = new SpeechSynthesisUtterance(meaningText);
            utteranceMeaning.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceMeaning);
            currentUtterances.push(utteranceMeaning);

            const utteranceChinese = new SpeechSynthesisUtterance(chineseText);
            utteranceChinese.lang = 'zh-CN';
            window.speechSynthesis.speak(utteranceChinese);
            currentUtterances.push(utteranceChinese);

            // "유래" 읽기 음성 추가 (타이핑 완료 후)
            if (originText.trim() !== '') {
                const utteranceOrigin = new SpeechSynthesisUtterance(originText);
                utteranceOrigin.lang = 'ko-KR';
                utteranceOrigin.onend = () => {
                    // 추가 동작이 필요하면 여기에
                };
                window.speechSynthesis.speak(utteranceOrigin);
                currentUtterances.push(utteranceOrigin);
            }
        }
        else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    }

    // 모든 TTS 중지 함수
    function stopAllTTS() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        currentUtterances = [];
    }

    // ---------------------------
    // 7. 퀴즈 게임 함수
    // ---------------------------

    // 퀴즈 초기화 함수
    function initializeQuiz(quizType) {
        selectedQuizType = quizType;

        if (sajaseongeoData.length === 0) {
            console.warn('사자성어 데이터가 로드되지 않았습니다.');
            return;
        }

        let quizData = [];
        if (selectedQuizType === 'meaningChinese') {
            // 퀴즈(뜻중국어): 뜻과 중국어를 보여주고 사자성어를 맞추는 퀴즈
            quizData = sajaseongeoData.filter(item => item.뜻 && item.중국어);
        } else if (selectedQuizType === 'sajaseongeo') {
            // 퀴즈(사자성어): 사자성어를 보여주고 뜻과 중국어를 맞추는 퀴즈
            quizData = sajaseongeoData.filter(item => item.뜻 && item.중국어);
        }

        const totalQuestions = Math.min(20, quizData.length);
        quizQuestions = shuffleArray([...Array(quizData.length).keys()])
                            .slice(0, totalQuestions)
                            .map(index => quizData[index]);
        currentScoreSpan.innerText = '0';

        let highScore = getHighScore(selectedLevel);
        highScoreSpan.innerText = highScore.toString();

        loadNextQuizQuestion();
    }

    // 다음 퀴즈 질문 로드 함수
    function loadNextQuizQuestion() {
        if (quizQuestions.length === 0) {
            quizQuestion.innerHTML = '<b style="color: #ff6347;">퀴즈 완료!</b>';
            quizOptions.innerHTML = '';
            quizFeedback.innerText = '';
            nextQuizBtn.style.display = 'none';

            let currentScore = parseInt(currentScoreSpan.innerText);
            let highScore = getHighScore(selectedLevel);
            if (currentScore > highScore) {
                setHighScore(selectedLevel, currentScore);
                alert(`축하합니다! 새로운 최고 점수: ${currentScore}점`);
            } else {
                alert(`현재 점수: ${currentScore}점. 최고 점수: ${highScore}점`);
            }
            return;
        }

        const currentQuestion = quizQuestions.shift();

        if (selectedQuizType === 'meaningChinese') {
            // 퀴즈(뜻중국어): 뜻과 중국어를 보여주고 사자성어를 맞추는 퀴즈
            quizQuestion.innerHTML = `"<span style="color: #1e90ff; font-weight: bold;">${currentQuestion.뜻} (${currentQuestion.중국어})</span>"인 사자성어는?`;

            // 옵션 생성 (정답 포함 총 4개)
            let options = [currentQuestion.사자성어];
            while (options.length < 4 && sajaseongeoData.length > options.length) {
                const randomSajaseongeo = sajaseongeoData[Math.floor(Math.random() * sajaseongeoData.length)].사자성어;
                if (!options.includes(randomSajaseongeo)) {
                    options.push(randomSajaseongeo);
                }
            }
            options = shuffleArray(options);

            // 옵션 버튼 생성
            quizOptions.innerHTML = '';
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.innerText = option;
                btn.classList.add('quiz-option-btn');
                btn.addEventListener('click', () => {
                    if (option === currentQuestion.사자성어) {
                        quizFeedback.style.color = '#32cd32';
                        quizFeedback.innerText = `정답입니다! ${currentQuestion.뜻} (${currentQuestion.중국어})`;
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore += 10;
                        currentScoreSpan.innerText = currentScore.toString();
                    } else {
                        quizFeedback.style.color = '#ff0000';
                        quizFeedback.innerText = '오답입니다.';
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore -= 5;
                        if (currentScore < 0) currentScore = 0;
                        currentScoreSpan.innerText = currentScore.toString();
                    }
                    nextQuizBtn.style.display = 'block';
                    
                    // 모든 옵션 버튼 비활성화
                    const allButtons = quizOptions.querySelectorAll('button');
                    allButtons.forEach(button => {
                        button.disabled = true;
                    });
                });
                quizOptions.appendChild(btn);
            });

        } else if (selectedQuizType === 'sajaseongeo') {
            // 퀴즈(사자성어): 사자성어를 보여주고 뜻과 중국어를 맞추는 퀴즈
            quizQuestion.innerHTML = `<span style="color: #1e90ff;"> "${currentQuestion.사자성어}"</span>의 뜻과 중국어는 무엇인가요?`;

            // 정답 조합
            let correctAnswer = `${currentQuestion.뜻} (${currentQuestion.중국어})`;

            // 옵션 생성 (정답 포함 총 4개)
            let options = [correctAnswer];
            while (options.length < 4 && sajaseongeoData.length > options.length) {
                const randomSajaseongeo = sajaseongeoData[Math.floor(Math.random() * sajaseongeoData.length)];
                const randomAnswer = `${randomSajaseongeo.뜻} (${randomSajaseongeo.중국어})`;
                if (!options.includes(randomAnswer)) {
                    options.push(randomAnswer);
                }
            }
            options = shuffleArray(options);

            // 옵션 버튼 생성
            quizOptions.innerHTML = '';
            options.forEach(option => {
                const btn = document.createElement('button');
                btn.innerText = option;
                btn.classList.add('quiz-option-btn');
                btn.addEventListener('click', () => {
                    if (option === correctAnswer) {
                        quizFeedback.style.color = '#32cd32';
                        quizFeedback.innerText = `정답입니다! ${currentQuestion.사자성어} (${currentQuestion.중국어})`;
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore += 10;
                        currentScoreSpan.innerText = currentScore.toString();
                    } else {
                        quizFeedback.style.color = '#ff0000';
                        quizFeedback.innerText = '오답입니다.';
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore -= 5;
                        if (currentScore < 0) currentScore = 0;
                        currentScoreSpan.innerText = currentScore.toString();
                    }
                    nextQuizBtn.style.display = 'block';
                    
                    // 모든 옵션 버튼 비활성화
                    const allButtons = quizOptions.querySelectorAll('button');
                    allButtons.forEach(button => {
                        button.disabled = true;
                    });
                });
                quizOptions.appendChild(btn);
            });
        }

        // Reset quizFeedback and hide nextQuizBtn
        quizFeedback.innerText = '';
        nextQuizBtn.style.display = 'none';
    }

    // 다음 퀴즈 로드 버튼 이벤트
    if (nextQuizBtn) {
        nextQuizBtn.addEventListener('click', () => {
            loadNextQuizQuestion();
        });
    }

    // ---------------------------
    // 8. 사자성어 데이터 로드
    // ---------------------------

    function loadSajaseongeoData() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                sajaseongeoData = data[selectedLevel] && data[selectedLevel]["학습하기"] ? data[selectedLevel]["학습하기"] : [];

                if (selectedQuizType) {
                    initializeQuiz(selectedQuizType);
                }

                initializeStudy();
            })
            .catch(error => {
                console.error('Error loading 사자성어 data:', error);
                sajaseongeoData = [];
            });
    }

    // ---------------------------
    // 9. 낱말게임 시작 함수
    // ---------------------------

    function startMatchingGame() {
        showScreen(screens.game);
        quizGame.style.display = 'none';
        matchingGame.style.display = 'block';
        initializeMatchingGame();
    }

    // ---------------------------
    // 10. 매칭 게임 함수
    // ---------------------------

    // 매칭 게임 데이터 준비
    let matchingPairs = [];
    let selectedItems = [];
    let matchedCount = 0;

    function initializeMatchingGame() {
        matchingGameBoard.innerHTML = '';
        matchingFeedback.innerText = '';
        matchedCount = 0;
        isProcessing = false;

        // 준비할 매칭 쌍을 선택 (최대 8쌍)
        const pairCount = Math.min(8, sajaseongeoData.length);
        matchingPairs = shuffleArray([...Array(sajaseongeoData.length).keys()]).slice(0, pairCount).map(index => sajaseongeoData[index]);

        // 사자성어와 뜻을 섞어서 배치
        let items = [];
        matchingPairs.forEach(pair => {
            items.push({ type: 'sajaseongeo', text: pair.사자성어 });
            items.push({ type: 'meaning', text: pair.뜻 });
        });
        items = shuffleArray(items);

        // 카드 생성
        items.forEach((item, idx) => {
            const div = document.createElement('div');
            div.classList.add('match-item');
            div.dataset.type = item.type;
            div.dataset.text = item.text;
            div.innerText = item.text;
            div.addEventListener('click', handleMatchingClick);
            matchingGameBoard.appendChild(div);
        });

        selectedItems = [];
    }

    function handleMatchingClick(e) {
        const clickedItem = e.currentTarget;

        if (isProcessing || clickedItem.classList.contains('matched')) {
            return;
        }

        const alreadySelectedIndex = selectedItems.indexOf(clickedItem);
        if (alreadySelectedIndex !== -1) {
            // 이미 선택된 카드 클릭 시 해제
            clickedItem.style.backgroundColor = '#add8e6';
            selectedItems.splice(alreadySelectedIndex, 1);
            return;
        }

        clickedItem.style.backgroundColor = '#90ee90';
        selectedItems.push(clickedItem);

        if (selectedItems.length === 2) {
            isProcessing = true;
            setTimeout(checkMatching, 500);
        }
    }

    function checkMatching() {
        const [item1, item2] = selectedItems;

        if (
            (item1.dataset.type === 'sajaseongeo' && item2.dataset.type === 'meaning' && isMatchingPair(item1.dataset.text, item2.dataset.text)) ||
            (item1.dataset.type === 'meaning' && item2.dataset.type === 'sajaseongeo' && isMatchingPair(item2.dataset.text, item1.dataset.text))
        ) {
            // 매칭 성공
            item1.classList.add('matched');
            item2.classList.add('matched');
            matchingFeedback.style.color = '#32cd32';
            matchingFeedback.innerText = '매칭 성공!';
            matchedCount += 1;

            // 매칭 성공한 사자성어 학습 완료로 표시
            const sajaseongeo = item1.dataset.type === 'sajaseongeo' ? item1.dataset.text : item2.dataset.text;
            markSajaseongeoAsLearned(sajaseongeo);

        } else {
            // 매칭 실패
            item1.style.backgroundColor = '#add8e6';
            item2.style.backgroundColor = '#add8e6';
            matchingFeedback.style.color = '#ff0000';
            matchingFeedback.innerText = '매칭 실패!';
        }
        selectedItems = [];
        isProcessing = false;

        if (matchedCount === matchingPairs.length) {
            matchingFeedback.innerText += ' 모든 매칭을 완료했습니다!';
        }
    }

    function isMatchingPair(sajaseongeo, meaning) {
        return sajaseongeoData.some(item => item.사자성어 === sajaseongeo && item.뜻 === meaning);
    }

    if (restartMatchingBtn) {
        restartMatchingBtn.addEventListener('click', () => {
            initializeMatchingGame();
        });
    }

    // ---------------------------
    // 11. 사자성어 표시 함수 (학습하기 화면)
    // ---------------------------

    function displaySajaseongeo() {
        if (sajaseongeoData.length === 0) return;
        const learnedSajaseongeo = getLearnedSajaseongeo()[selectedLevel] || [];
        const availableIndices = shuffledIndices.filter(index => !learnedSajaseongeo.includes(sajaseongeoData[index].사자성어));
        if (availableIndices.length === 0) {
            sajaseongeoChinese.innerText = '모든 사자성어를 학습 완료했습니다!';
            sajaseongeoCharacter.innerText = '';
            sajaseongeoMeaning.innerText = '';
            writingCanvas.getContext('2d').clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            // "유래" 정보 비우기
            sajaseongeoOrigin.innerText = '';
            // 스피커 버튼 비활성화
            speakBtn.disabled = true;
            speakBtnOverlay.disabled = true;
            // 학습완료 체크박스 비활성화
            markCompletedCheckbox.checked = false;
            markCompletedCheckbox.disabled = true;
            currentSajaseongeo = null;
            // 타이핑 인터벌 정리
            clearTyping();
            return;
        }
        // 현재 인덱스가 범위를 벗어나지 않도록 조정
        if (currentIndex >= availableIndices.length) {
            currentIndex = availableIndices.length - 1;
        }
        currentSajaseongeo = sajaseongeoData[availableIndices[currentIndex]];
        sajaseongeoChinese.innerText = currentSajaseongeo.중국어;
        sajaseongeoCharacter.innerText = currentSajaseongeo.사자성어;
        sajaseongeoMeaning.innerText = currentSajaseongeo.뜻;

        // 캔버스 초기화
        const ctxCanvas = writingCanvas.getContext('2d');
        ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

        // 사자성어 가이드 그리기

        // 동적 폰트 크기 설정
        const canvasWidth = writingCanvas.width;
        const canvasHeight = writingCanvas.height;
        const sajaseongeoText = currentSajaseongeo.중국어;
        const maxFontSize = 150; // 최대 폰트 크기 (중국어는 일반적으로 크기 조절)
        const minFontSize = 30;  // 최소 폰트 크기
        let fontSize = maxFontSize;

        while (fontSize > minFontSize) {
            ctxCanvas.font = `${fontSize}px 'hanchanzhengkaiti', sans-serif`;
            const textMetrics = ctxCanvas.measureText(sajaseongeoText);
            const textWidth = textMetrics.width;
            const textHeight = fontSize;

            if (textWidth <= canvasWidth * 0.8 && textHeight <= canvasHeight * 0.8) {
                break;
            }
            fontSize -= 10;
        }

        ctxCanvas.globalAlpha = 0.3; // 반투명
        ctxCanvas.textAlign = 'center';
        ctxCanvas.textBaseline = 'middle';
        ctxCanvas.fillStyle = '#000000';
        ctxCanvas.fillText(sajaseongeoText, canvasWidth / 2, canvasHeight / 2);
        ctxCanvas.globalAlpha = 1.0; // 다시 불투명하게

        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedSajaseongeo.includes(currentSajaseongeo.사자성어);

        // 유래 표시 및 타이핑 효과
        if (currentSajaseongeo.유래) {
            typeText(sajaseongeoOrigin, currentSajaseongeo.유래, 50, () => {
                readAloud(currentSajaseongeo.유래);
            });
        } else {
            sajaseongeoOrigin.innerText = '';
        }

        // 스피커 버튼 활성화
        speakBtn.disabled = false;
        speakBtnOverlay.disabled = false;
    }

    // ---------------------------
    // 12. Cordova deviceready 이벤트 핸들링
    // ---------------------------

    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);

    // ---------------------------
    // 13. 낱말게임 기능 구현
    // ---------------------------

    // (퀴즈 및 매칭 게임은 이미 위에서 구현됨)

    // ---------------------------
    // 14. 학습하기 초기화 및 진도 관리
    // ---------------------------

    // 학습 진도 저장
    function saveProgress(level, index) {
        let progress = JSON.parse(localStorage.getItem('sajaseongeoProgress')) || {};
        if (!progress[level] || progress[level] < index) {
            progress[level] = index;
            localStorage.setItem('sajaseongeoProgress', JSON.stringify(progress));
        }
    }

    // 학습 진도 불러오기
    function getSavedIndex(level) {
        let progress = JSON.parse(localStorage.getItem('sajaseongeoProgress')) || {};
        return progress[level] || 0;
    }

    // ---------------------------
    // 15. 초기화 및 최고 점수 UI 초기화
    // ---------------------------

    // 초기화 및 최고 점수 UI 초기화
    initializeHighScoresUI();

    // ---------------------------
    // 16. TextToSpeech 기능 구현
    // ---------------------------

    function readAloud(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ko-KR';
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    }

    function typeText(element, text, delay = 100, callback = null) {
        // 기존 인터벌이 있다면 중지
        if (currentTypingInterval) {
            clearInterval(currentTypingInterval);
            currentTypingInterval = null;
        }

        let index = 0;
        element.innerHTML = '';
        currentTypingInterval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
            } else {
                clearInterval(currentTypingInterval);
                currentTypingInterval = null;
                if (callback) callback();
            }
        }, delay);
    }

    // Speak Button 이벤트
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            playSajaseongeoTTS();
        });
    }

    if (speakBtnOverlay) {
        speakBtnOverlay.addEventListener('click', () => {
            playSajaseongeoTTS();
        });
    }

    // ---------------------------
    // 17. 캔버스 쓰기 기능 구현
    // ---------------------------

    // 캔버스 설정
    const ctxCanvas = writingCanvas.getContext('2d');
    ctxCanvas.lineWidth = 5;
    ctxCanvas.lineCap = 'round';
    ctxCanvas.lineJoin = 'round';
    let drawing = false;

    writingCanvas.addEventListener('mousedown', startDrawing);
    writingCanvas.addEventListener('mouseup', stopDrawing);
    writingCanvas.addEventListener('mousemove', drawCanvas);
    writingCanvas.addEventListener('touchstart', startDrawing, {passive: false});
    writingCanvas.addEventListener('touchend', stopDrawing);
    writingCanvas.addEventListener('touchmove', drawCanvas, {passive: false});

    function startDrawing(e) {
        e.preventDefault();
        drawing = true;
        ctxCanvas.beginPath();
        const { x, y } = getCanvasCoordinates(e);
        ctxCanvas.moveTo(x, y);
    }

    function stopDrawing(e) {
        e.preventDefault();
        drawing = false;
    }

    function drawCanvas(e) {
        if (!drawing) return;
        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        ctxCanvas.lineTo(x, y);
        ctxCanvas.stroke();
    }

    function getCanvasCoordinates(e) {
        const rect = writingCanvas.getBoundingClientRect();
        let x, y;
        if (e.touches) {
            x = (e.touches[0].clientX - rect.left) * (writingCanvas.width / rect.width);
            y = (e.touches[0].clientY - rect.top) * (writingCanvas.height / rect.height);
        } else {
            x = (e.clientX - rect.left) * (writingCanvas.width / rect.width);
            y = (e.clientY - rect.top) * (writingCanvas.height / rect.height);
        }
        return { x, y };
    }

    // 쓰기 초기화 버튼
    if (clearCanvasBtn) {
        clearCanvasBtn.addEventListener('click', () => {
            ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            displaySajaseongeo(); // 사자성어 가이드 다시 그리기
        });
    }

    // 처음으로 버튼
    if (goFirstBtn) {
        goFirstBtn.addEventListener('click', () => {
            currentIndex = 0;
            displaySajaseongeo();
            saveProgress(selectedLevel, currentIndex);
            playSajaseongeoTTS();
        });
    }

    // 이전 버튼
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                displaySajaseongeo();
                saveProgress(selectedLevel, currentIndex);
                playSajaseongeoTTS();
            }
        });
    }

    // 다음 버튼
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < sajaseongeoData.length - 1) {
                currentIndex++;
                displaySajaseongeo();
                saveProgress(selectedLevel, currentIndex);
                playSajaseongeoTTS();
            }
        });
    }

    // 순서 변경 시 초기화
    orderOptions.forEach(option => {
        option.addEventListener('change', () => {
            initializeStudy();
        });
    });

    // 학습완료 체크박스 이벤트
    if (markCompletedCheckbox) {
        markCompletedCheckbox.addEventListener('change', () => {
            const sajaseongeo = currentSajaseongeo ? currentSajaseongeo.사자성어 : null;
            if (sajaseongeo) {
                if (markCompletedCheckbox.checked) {
                    markSajaseongeoAsLearned(sajaseongeo);
                } else {
                    unmarkSajaseongeoAsLearned(sajaseongeo);
                }
                displaySajaseongeo(); // 업데이트 후 표시
                playSajaseongeoTTS();
            }
        });
    }

    // ---------------------------
    // 18. 타이핑 인터벌 중지 함수
    // ---------------------------

    function clearTyping() {
        if (currentTypingInterval) {
            clearInterval(currentTypingInterval);
            currentTypingInterval = null;
        }
        sajaseongeoOrigin.innerText = '';
    }

});
