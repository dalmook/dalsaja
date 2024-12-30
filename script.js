// script.js

document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------
    // 1. 변수 선언
    // ---------------------------

    // 화면 요소
    const difficultyScreen = document.getElementById('difficulty-screen');
    const mainMenuScreen = document.getElementById('main-menu-screen');
    const studyScreen = document.getElementById('study-screen');
    const gameScreen = document.getElementById('game-screen');
    const manageLearnedHanjaScreen = document.getElementById('manage-learned-hanja-screen');

    // 난이도 선택 버튼
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // 메인 메뉴 버튼
    const studyBtn = document.getElementById('study-btn');
    const gameBtn = document.getElementById('game-btn');
    const manageLearnedHanjaBtn = document.getElementById('manage-learned-hanja-btn');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty');

    // 관리 화면 버튼
    const backToMenuFromManagedBtn = document.getElementById('back-to-menu-from-managed');

    // 학습하기 화면 요소
    const studyLevelSpan = document.getElementById('study-level');
    const hanjaCharacter = document.getElementById('hanja-character');
    const hanjaMeaning = document.getElementById('hanja-meaning');
    const hanjaReading = document.getElementById('hanja-reading');
    const hanjaChinese = document.getElementById('hanja-chinese');
    const speakBtn = document.getElementById('speak-btn');
    const writingCanvas = document.getElementById('writing-canvas');
    const clearCanvasBtn = document.getElementById('clear-canvas-btn');
    const goFirstBtn = document.getElementById('go-first-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');
    const hanjaOrigin = document.getElementById('hanja-origin');

    // 낱말게임 화면 요소
    const quizMeaningReadingBtn = document.getElementById('quiz-meaning-reading-btn');
    const quizHanjaBtn = document.getElementById('quiz-hanja-btn');
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

    // 학습완료 한자 관리 요소
    const learnedHanjaList = document.getElementById('learned-hanja-list');

    // 퀴즈 유형 버튼 요소
    const backToMenuFromStudyBtn = document.getElementById('back-to-menu-from-study');

    // ---------------------------
    // 2. 전역 변수 선언
    // ---------------------------

    let selectedLevel = '초급'; // 현재 선택된 난이도 ('초급', '중급', '고급')
    let selectedQuizType = ''; // 현재 선택된 퀴즈 유형 ('meaningChinese' 또는 'hanja')
    let quizQuestions = []; // 퀴즈 질문 배열
    let hanjaData = []; // 한자 데이터 배열
    let currentIndex = 0;
    let isRandom = false;
    let shuffledIndices = [];
    let isProcessing = false; // 매칭 게임 처리 중 여부
    let currentUtterances = [];
    let currentHanja = null; // 현재 한자

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

    // 학습완료 한자 관리 함수

    // 한자 저장 함수 (레벨별)
    function markHanjaAsLearned(hanja) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        if (!learned[selectedLevel]) {
            learned[selectedLevel] = [];
        }
        if (!learned[selectedLevel].includes(hanja)) {
            learned[selectedLevel].push(hanja);
            localStorage.setItem('learnedHanja', JSON.stringify(learned));
            loadLearnedHanjaManagement();
        }
    }

    // 한자 해제 함수 (레벨별)
    function unmarkHanjaAsLearned(hanja) {
        let learned = JSON.parse(localStorage.getItem('learnedHanja')) || {};
        if (learned[selectedLevel]) {
            const index = learned[selectedLevel].indexOf(hanja);
            if (index > -1) {
                learned[selectedLevel].splice(index, 1);
                localStorage.setItem('learnedHanja', JSON.stringify(learned));
                loadLearnedHanjaManagement();
            }
        }
    }

    // 한자 불러오기 (레벨별)
    function getLearnedHanja() {
        return JSON.parse(localStorage.getItem('learnedHanja')) || {};
    }

    // 한자 관리 화면 로딩 함수
    function loadLearnedHanjaManagement() {
        if (!learnedHanjaList) return;

        learnedHanjaList.innerHTML = '';
        const learnedHanja = getLearnedHanja()[selectedLevel] || [];

        if (learnedHanja.length === 0) {
            learnedHanjaList.innerText = '학습완료 한자가 없습니다.';
            return;
        }

        learnedHanja.forEach(hanja => {
            const div = document.createElement('div');
            div.classList.add('learned-hanja-item');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.id = `learned-${hanja}`;

            checkbox.addEventListener('change', () => {
                if (!checkbox.checked) {
                    unmarkHanjaAsLearned(hanja);
                }
            });

            const label = document.createElement('label');
            label.htmlFor = `learned-${hanja}`;
            label.innerText = hanja;

            div.appendChild(checkbox);
            div.appendChild(label);
            learnedHanjaList.appendChild(div);
        });
    }

    // 화면 전환 함수
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
        if (screen === manageLearnedHanjaScreen) {
            loadLearnedHanjaManagement();
        }
    }

    // ---------------------------
    // 4. 이벤트 핸들러 설정
    // ---------------------------

    // 난이도 선택 버튼 클릭 이벤트
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const levelName = btn.getAttribute('data-level'); // "8", "7", etc.
            selectedLevel = levelName;
            const selectedLevelTitle = document.getElementById('selected-level-title');
            if (selectedLevelTitle) {
                selectedLevelTitle.innerText = `급수: ${selectedLevel}급`;
            }
            studyLevelSpan.innerText = levelName; // 학습하기 화면에 표시
            loadHanjaData();
            showScreen(mainMenuScreen);
        });
    });

    // 메인 메뉴 버튼 클릭 이벤트
    studyBtn.addEventListener('click', () => {
        showScreen(studyScreen);
        initializeStudy(); // 학습하기 초기화
    });

    gameBtn.addEventListener('click', () => {
        showScreen(gameScreen);
        quizGame.style.display = 'block';
        matchingGame.style.display = 'none';
        initializeQuiz('meaningChinese'); // 퀴즈(뜻중국어) 초기화
    });

    manageLearnedHanjaBtn.addEventListener('click', () => {
        showScreen(manageLearnedHanjaScreen);
    });

    backToDifficultyBtn.addEventListener('click', () => {
        showScreen(difficultyScreen);
    });

    backToMenuFromManagedBtn.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    backToMenuFromStudyBtn.addEventListener('click', () => { 
        showScreen(mainMenuScreen);
    });

    backToMenuFromGameBtn.addEventListener('click', () => {
        showScreen(mainMenuScreen);
    });

    // 퀴즈 유형 버튼 클릭 이벤트
    if (quizMeaningReadingBtn) {
        quizMeaningReadingBtn.addEventListener('click', () => {
            showScreen(gameScreen);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('meaningChinese'); // 퀴즈(뜻중국어) 초기화
        });
    }

    if (quizHanjaBtn) {
        quizHanjaBtn.addEventListener('click', () => {
            showScreen(gameScreen);
            quizGame.style.display = 'block';
            matchingGame.style.display = 'none';
            initializeQuiz('hanja'); // 퀴즈(한자) 초기화
        });
    }

    matchingGameBtn.addEventListener('click', () => {
        startMatchingGame();
    });

    // ---------------------------
    // 5. 학습하기 초기화 함수
    // ---------------------------

    function initializeStudy() {
        currentIndex = getSavedIndex(selectedLevel) || 0;
        // 순서 선택
        isRandom = Array.from(orderOptions).find(r => r.checked).value === 'random';
        // 준비
        if (isRandom) {
            shuffledIndices = shuffleArray([...Array(hanjaData.length).keys()]);
        } else {
            shuffledIndices = [...Array(hanjaData.length).keys()];
        }
        displayHanja();
    }

    // ---------------------------
    // 6. TTS (텍스트 투 스피치) 기능
    // ---------------------------

    function playHanjaTTS() {
        if (!currentHanja) return;

        // 웹 브라우저의 SpeechSynthesis 사용 시 기존 음성 중지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // 기존 utterances 배열 초기화
        currentUtterances = [];

        const hanjaText = `${currentHanja.사자성어}`;
        const meaningText = `${currentHanja.뜻}`;
        const chineseText = `${currentHanja.중국어}`;
        const originText = `${currentHanja.유래}`;

        // 안드로이드 환경에서 TTS 지원 시
        if (typeof Android !== 'undefined' && Android.speak) {      
            Android.speak(hanjaText, meaningText, chineseText, originText); // 네 개의 파라미터로 전달
        }
        // 웹 브라우저에서 TTS 지원 시
        else if ('speechSynthesis' in window) {
            const utteranceHanja = new SpeechSynthesisUtterance(hanjaText);
            utteranceHanja.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceHanja);
            currentUtterances.push(utteranceHanja);

            const utteranceMeaning = new SpeechSynthesisUtterance(meaningText);
            utteranceMeaning.lang = 'ko-KR';
            window.speechSynthesis.speak(utteranceMeaning);
            currentUtterances.push(utteranceMeaning);

            const utteranceChinese = new SpeechSynthesisUtterance(chineseText);
            utteranceChinese.lang = 'zh-CN';
            window.speechSynthesis.speak(utteranceChinese);
            currentUtterances.push(utteranceChinese);

            // "유래" 읽기 음성 추가 (타이핑 완료 후)
            const utteranceOrigin = new SpeechSynthesisUtterance(originText);
            utteranceOrigin.lang = 'ko-KR';
            utteranceOrigin.onend = () => {
                // 추가 동작이 필요하면 여기에
            };
            currentUtterances.push(utteranceOrigin);
        }
        else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    }

    // ---------------------------
    // 7. 퀴즈 게임 함수
    // ---------------------------

    // 퀴즈 초기화 함수
    function initializeQuiz(quizType) {
        selectedQuizType = quizType;

        if (hanjaData.length === 0) {
            console.warn('한자 데이터가 로드되지 않았습니다.');
            return;
        }

        let quizData = [];
        if (selectedQuizType === 'meaningChinese') {
            // 퀴즈(뜻중국어): 뜻과 중국어를 보여주고 사자성어를 맞추는 퀴즈
            quizData = hanjaData.filter(item => item.뜻 && item.중국어);
        } else if (selectedQuizType === 'hanja') {
            // 퀴즈(한자): 사자성어를 보여주고 뜻과 중국어를 맞추는 퀴즈
            quizData = hanjaData.filter(item => item.뜻 && item.중국어);
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
            quizQuestion.innerHTML = `"<span style="color: #1e90ff; font-weight: bold;">${currentQuestion.뜻} (${currentQuestion.중국어})</span>"인 한자는 무엇인가요?`;

            // 옵션 생성 (정답 포함 총 4개)
            let options = [currentQuestion.사자성어];
            while (options.length < 4 && hanjaData.length > options.length) {
                const randomHanja = hanjaData[Math.floor(Math.random() * hanjaData.length)].사자성어;
                if (!options.includes(randomHanja)) {
                    options.push(randomHanja);
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

        } else if (selectedQuizType === 'hanja') {
            // 퀴즈(한자): 한자를 보여주고 뜻과 중국어를 맞추는 퀴즈
            quizQuestion.innerHTML = `<span style="color: #1e90ff;"> "${currentQuestion.사자성어}"</span>의 뜻과 중국어는 무엇인가요?`;

            // 정답 조합
            let correctAnswer = `${currentQuestion.뜻} (${currentQuestion.중국어})`;

            // 옵션 생성 (정답 포함 총 4개)
            let options = [correctAnswer];
            while (options.length < 4 && hanjaData.length > options.length) {
                const randomHanja = hanjaData[Math.floor(Math.random() * hanjaData.length)];
                const randomAnswer = `${randomHanja.뜻} (${randomHanja.중국어})`;
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
    nextQuizBtn.addEventListener('click', () => {
        loadNextQuizQuestion();
    });

    // ---------------------------
    // 8. 한자 데이터 로드
    // ---------------------------

    function loadHanjaData() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                hanjaData = data[selectedLevel] && data[selectedLevel]["학습하기"] ? data[selectedLevel]["학습하기"] : [];

                if (selectedQuizType) {
                    initializeQuiz(selectedQuizType);
                }

                initializeStudy();
            })
            .catch(error => {
                console.error('Error loading 한자 data:', error);
                hanjaData = [];
            });
    }

    // ---------------------------
    // 9. 낱말게임 시작 함수
    // ---------------------------

    function startMatchingGame() {
        showScreen(gameScreen);
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
        const pairCount = Math.min(8, hanjaData.length);
        matchingPairs = shuffleArray([...Array(hanjaData.length).keys()]).slice(0, pairCount).map(index => hanjaData[index]);

        // 한자와 뜻을 섞어서 배치
        let items = [];
        matchingPairs.forEach(pair => {
            items.push({ type: 'hanja', text: pair.사자성어 });
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
            (item1.dataset.type === 'hanja' && item2.dataset.type === 'meaning' && isMatchingPair(item1.dataset.text, item2.dataset.text)) ||
            (item1.dataset.type === 'meaning' && item2.dataset.type === 'hanja' && isMatchingPair(item2.dataset.text, item1.dataset.text))
        ) {
            // 매칭 성공
            item1.classList.add('matched');
            item2.classList.add('matched');
            matchingFeedback.style.color = '#32cd32';
            matchingFeedback.innerText = '매칭 성공!';
            matchedCount += 1;

            // 매칭 성공한 한자 학습 완료로 표시
            const hanja = item1.dataset.type === 'hanja' ? item1.dataset.text : item2.dataset.text;
            markHanjaAsLearned(hanja);

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

    function isMatchingPair(hanja, meaning) {
        return hanjaData.some(item => item.사자성어 === hanja && item.뜻 === meaning);
    }

    if (restartMatchingBtn) {
        restartMatchingBtn.addEventListener('click', () => {
            initializeMatchingGame();
        });
    }

    // ---------------------------
    // 11. 한자 표시 함수 (학습하기 화면)
    // ---------------------------

    function displayHanja() {
        if (hanjaData.length === 0) return;
        const learnedHanja = getLearnedHanja()[selectedLevel] || [];
        const availableIndices = shuffledIndices.filter(index => !learnedHanja.includes(hanjaData[index].사자성어));
        if (availableIndices.length === 0) {
            hanjaChinese.innerText = '모든 한자를 학습 완료했습니다!';
            hanjaCharacter.innerText = '';
            hanjaMeaning.innerText = '';
            hanjaReading.innerText = '';
            writingCanvas.getContext('2d').clearRect(0, 0, writingCanvas.width, writingCanvas.height);
            // 스피커 아이콘은 기존 'speak-btn'을 활용
            markCompletedCheckbox.checked = false;
            markCompletedCheckbox.disabled = true;
            hanjaOrigin.innerText = '';
            currentHanja = null;
            return;
        }
        // 현재 인덱스가 범위를 벗어나지 않도록 조정
        if (currentIndex >= availableIndices.length) {
            currentIndex = availableIndices.length - 1;
        }
        currentHanja = hanjaData[availableIndices[currentIndex]];
        hanjaChinese.innerText = currentHanja.중국어;
        hanjaCharacter.innerText = currentHanja.사자성어;
        hanjaMeaning.innerText = currentHanja.뜻;
        hanjaReading.innerText = currentHanja.중국어;

        // 캔버스 초기화
        const ctxCanvas = writingCanvas.getContext('2d');
        ctxCanvas.clearRect(0, 0, writingCanvas.width, writingCanvas.height);

        // 한자 가이드 그리기

        // 동적 폰트 크기 설정
        const canvasWidth = writingCanvas.width;
        const canvasHeight = writingCanvas.height;
        const hanjaText = currentHanja.중국어;
        const maxFontSize = 150; // 최대 폰트 크기 (중국어는 일반적으로 크기 조절)
        const minFontSize = 30;  // 최소 폰트 크기
        let fontSize = maxFontSize;

        while (fontSize > minFontSize) {
            ctxCanvas.font = `${fontSize}px 'hanchanzhengkaiti', sans-serif`;
            const textMetrics = ctxCanvas.measureText(hanjaText);
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
        ctxCanvas.fillText(hanjaText, canvasWidth / 2, canvasHeight / 2);
        ctxCanvas.globalAlpha = 1.0; // 다시 불투명하게

        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedHanja.includes(currentHanja.사자성어);

        // 유래 표시 및 타이핑 효과
        if (currentHanja.유래) {
            typeText(hanjaOrigin, currentHanja.유래, 50, () => {
                readAloud(currentHanja.유래);
            });
        } else {
            hanjaOrigin.innerText = '';
        }
    }

    // ---------------------------
    // 12. 텍스트 타이핑 효과 함수
    // ---------------------------

    function typeText(element, text, delay = 100, callback = null) {
        let index = 0;
        element.innerHTML = '';
        const interval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index);
                index++;
            } else {
                clearInterval(interval);
                if (callback) callback();
            }
        }, delay);
    }

    // ---------------------------
    // 13. 음성 읽기 함수
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

    // ---------------------------
    // 14. Cordova deviceready 이벤트 핸들링
    // ---------------------------

    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);

    // ---------------------------
    // 15. 낱말게임 기능 구현
    // ---------------------------

    // (퀴즈 및 매칭 게임은 이미 위에서 구현됨)

    // ---------------------------
    // 16. 학습하기 초기화 및 진도 관리
    // ---------------------------

    // 학습 진도 저장
    function saveProgress(level, index) {
        let progress = JSON.parse(localStorage.getItem('hanjaProgress')) || {};
        if (!progress[level] || progress[level] < index) {
            progress[level] = index;
            localStorage.setItem('hanjaProgress', JSON.stringify(progress));
        }
    }

    // 학습 진도 불러오기
    function getSavedIndex(level) {
        let progress = JSON.parse(localStorage.getItem('hanjaProgress')) || {};
        return progress[level] || 0;
    }

    // ---------------------------
    // 17. 초기화 및 최고 점수 UI 초기화
    // ---------------------------

    // 초기화 및 최고 점수 UI 초기화
    initializeHighScoresUI();

    // ---------------------------
    // 18. TextToSpeech 기능 구현
    // ---------------------------

    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            playHanjaTTS();
        });
    }

    // ---------------------------
    // 19. 캔버스 쓰기 기능 구현
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
            displayHanja(); // 한자 가이드 다시 그리기
        });
    }

    // 처음으로 버튼
    if (goFirstBtn) {
        goFirstBtn.addEventListener('click', () => {
            currentIndex = 0;
            displayHanja();
            saveProgress(selectedLevel, currentIndex);
            playHanjaTTS();
        });
    }

    // 이전 버튼
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                displayHanja();
                saveProgress(selectedLevel, currentIndex);
                playHanjaTTS();
            }
        });
    }

    // 다음 버튼
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < hanjaData.length - 1) {
                currentIndex++;
                displayHanja();
                saveProgress(selectedLevel, currentIndex);
                playHanjaTTS();
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
            const hanja = currentHanja ? currentHanja.사자성어 : null;
            if (hanja) {
                if (markCompletedCheckbox.checked) {
                    markHanjaAsLearned(hanja);
                } else {
                    unmarkHanjaAsLearned(hanja);
                }
                displayHanja(); // 업데이트 후 표시
                playHanjaTTS();
            }
        });
    }

});
