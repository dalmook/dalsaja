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
    const sajaseongeoChinese = document.getElementById('sajaseongeo-chinese');
    const sajaseongeoKorean = document.getElementById('sajaseongeo-korean');
    const sajaseongeoMeaning = document.getElementById('sajaseongeo-meaning');
    const speakBtn = document.getElementById('speak-btn');
    const prevBtn = document.getElementById('prev-btn');
    const firstBtn = document.getElementById('first-btn');
    const nextBtn = document.getElementById('next-btn');
    const orderOptions = document.getElementsByName('order');
    const markCompletedCheckbox = document.getElementById('mark-completed');

    // 유래 정보 요소
    const sajaseongeoOrigin = document.getElementById('sajaseongeo-origin');

    // 낱말게임 화면 요소
    const quizMeaningReadingBtn = document.getElementById('quiz-meaning-reading-btn');
    const quizSajaseongeoBtn = document.getElementById('quiz-sajaseongeo-btn');
    const quizGame = document.getElementById('quiz-game');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');
    const nextQuizBtn = document.getElementById('next-quiz-btn');

    const currentScoreSpan = document.getElementById('current-score');
    const highScoreSpan = document.getElementById('high-score');

    // 학습완료 사자성어 관리 요소
    const learnedSajaseongeoList = document.getElementById('learned-sajaseongeo-list');

    // 퀴즈 유형 버튼 요소
    const backToMenuFromStudyBtn = document.getElementById('back-to-menu-from-study');

    // 게임 화면의 "뒤로" 버튼
    const backToMenuFromGameBtn = document.getElementById('back-to-menu-from-game');

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
            stopAllTTS();
        });
    }

    if (backToMenuFromManagedBtn) {
        backToMenuFromManagedBtn.addEventListener('click', () => {
            showScreen(screens.mainMenu);
            stopAllTTS();
        });
    }

    if (backToMenuFromStudyBtn) {
        backToMenuFromStudyBtn.addEventListener('click', () => { 
            showScreen(screens.mainMenu);
            stopAllTTS();
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
            initializeQuiz('meaningChinese'); // 퀴즈(뜻중국어) 초기화
        });
    }

    if (quizSajaseongeoBtn) {
        quizSajaseongeoBtn.addEventListener('click', () => {
            showScreen(screens.game);
            quizGame.style.display = 'block';
            initializeQuiz('sajaseongeo'); // 퀴즈(사자성어) 초기화
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
        console.log(`Shuffled Indices: ${shuffledIndices}`); // 디버깅용 로그
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
        }
        else {
            console.warn("이 브라우저는 음성 합성을 지원하지 않습니다.");
        }
    }

    // 모든 TTS 중지 함수
    function stopAllTTS() {
        console.log("stopAllTTS() 호출됨");
    
        // 브라우저 환경에서 speechSynthesis 중지
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            console.log("speechSynthesis 중지됨");
        }
    
        // 안드로이드 환경에서 TTS 중지
        if (typeof Android !== 'undefined' && Android.stop) {
            Android.stop();
            console.log("안드로이드 TTS 중지 요청");
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
                        quizFeedback.classList.add('correct');
                        quizFeedback.innerText = `정답입니다! ${currentQuestion.뜻} (${currentQuestion.중국어})`;
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore += 10;
                        currentScoreSpan.innerText = currentScore.toString();
                    } else {
                        quizFeedback.classList.remove('correct');
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
                        quizFeedback.classList.add('correct');
                        quizFeedback.innerText = `정답입니다! ${currentQuestion.사자성어} (${currentQuestion.중국어})`;
                        let currentScore = parseInt(currentScoreSpan.innerText);
                        currentScore += 10;
                        currentScoreSpan.innerText = currentScore.toString();
                    } else {
                        quizFeedback.classList.remove('correct');
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
        quizFeedback.classList.remove('correct');
        nextQuizBtn.style.display = 'none';
    }

    // 다음 퀴즈 로드 버튼 이벤트
    if (nextQuizBtn) {
        nextQuizBtn.addEventListener('click', () => {
            loadNextQuizQuestion();
        });
    }

    // ---------------------------
    // 6. "학습 완료" 체크박스 기능 개선
    // ---------------------------

    markCompletedCheckbox.addEventListener('change', () => {
        if (markCompletedCheckbox.checked && currentSajaseongeo) {
            console.log(`학습 완료: ${currentSajaseongeo.사자성어}`);
            markSajaseongeoAsLearned(currentSajaseongeo.사자성어);
            // 다음 사자성어로 이동
            moveToNextSajaseongeo();
        }
    });

    function moveToNextSajaseongeo() {
        // 현재 인덱스 저장
        saveProgress(selectedLevel, currentIndex);
        // 다음 인덱스로 이동
        if (currentIndex < shuffledIndices.length - 1) {
            currentIndex++;
            displaySajaseongeo();
            // 체크박스 초기화
            markCompletedCheckbox.checked = false;
        } else {
            alert('마지막 사자성어입니다.');
            markCompletedCheckbox.checked = false;
        }
    }

    // ---------------------------
    // 7. 사자성어 데이터 로드
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
    // 8. 사자성어 표시 함수 (학습하기 화면)
    // ---------------------------

    function displaySajaseongeo() {
        if (sajaseongeoData.length === 0) return;
        const learnedSajaseongeo = getLearnedSajaseongeo()[selectedLevel] || [];
        const availableIndices = shuffledIndices.filter(index => !learnedSajaseongeo.includes(sajaseongeoData[index].사자성어));
        
        // 콘솔 로그 (디버깅용)
        console.log(`Available Indices: ${availableIndices}`);
        console.log(`Current Index: ${currentIndex}`);
        console.log(`Total Available: ${availableIndices.length}`);

        if (availableIndices.length === 0) {
            sajaseongeoChinese.innerText = '모든 사자성어를 학습 완료했습니다!';
            sajaseongeoMeaning.innerText = '';
            // "유래" 정보 비우기
            sajaseongeoOrigin.innerText = '';
            // 스피커 버튼 비활성화
            speakBtn.disabled = true;
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
        sajaseongeoKorean.innerText = currentSajaseongeo.사자성어;
        sajaseongeoMeaning.innerText = currentSajaseongeo.뜻;

        // 주석 표시 영역 초기화
        const annotationsDiv = document.getElementById('sajaseongeo-annotations');
        annotationsDiv.innerHTML = ''; // 기존 내용 삭제

        if (currentSajaseongeo.annotations && currentSajaseongeo.annotations.length > 0) {
            currentSajaseongeo.annotations.forEach(annotation => {
                const span = document.createElement('span');
                span.classList.add('annotation');
                span.innerHTML = `${annotation.meaning} (${annotation.character}) `;
                annotationsDiv.appendChild(span);
            });
        }

        // 학습완료 체크박스 상태 설정
        markCompletedCheckbox.disabled = false;
        markCompletedCheckbox.checked = learnedSajaseongeo.includes(currentSajaseongeo.사자성어);

        // 유래 표시 및 타이핑 효과
        if (currentSajaseongeo.유래) {
            typeText(sajaseongeoOrigin, currentSajaseongeo.유래, 50);
        } else {
            sajaseongeoOrigin.innerText = '';
        }

        // 스피커 버튼 활성화
        speakBtn.disabled = false;
    }

    // ---------------------------
    // 9. Cordova deviceready 이벤트 핸들링
    // ---------------------------

    document.addEventListener('deviceready', () => {
        console.log('Cordova is ready');
        // Cordova 관련 초기화 작업 가능
    }, false);

    // ---------------------------
    // 10. 학습하기 초기화 및 진도 관리
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
    // 11. 초기화 및 최고 점수 UI 초기화
    // ---------------------------

    // 초기화 및 최고 점수 UI 초기화
    initializeHighScoresUI();

    // ---------------------------
    // 12. TextToSpeech 기능 구현
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

    // ---------------------------
    // 13. "이전"과 "다음" 버튼 이벤트 핸들러 추가
    // ---------------------------

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            console.log('이전 버튼 클릭됨'); // 디버깅용 로그
            if (currentIndex > 0) {
                currentIndex--;
                stopAllTTS();
                displaySajaseongeo();
                saveProgress(selectedLevel, currentIndex);
            } else {
                alert('처음 사자성어입니다.');
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            console.log('다음 버튼 클릭됨'); // 디버깅용 로그
            if (currentIndex < shuffledIndices.length - 1) {
                currentIndex++;
                stopAllTTS();
                displaySajaseongeo();
                saveProgress(selectedLevel, currentIndex);
            } else {
                alert('마지막 사자성어입니다.');
            }
        });
    }
    if (firstBtn) {
        firstBtn.addEventListener('click', () => {
            console.log('처음 버튼 클릭됨'); // 디버깅용 로그
            if (currentIndex < shuffledIndices.length - 1) {
                currentIndex = 0;
                stopAllTTS();
                displaySajaseongeo();
                saveProgress(selectedLevel, currentIndex);
            } else {
                alert('마지막 사자성어입니다.');
            }
        });
      }

    // ---------------------------
    // 14. clearTyping 함수 정의
    // ---------------------------

    function clearTyping() {
        if (currentTypingInterval) {
            clearInterval(currentTypingInterval);
            currentTypingInterval = null;
        }
        sajaseongeoOrigin.innerText = '';
    }

});
