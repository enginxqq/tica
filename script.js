// Para basamakları
const moneyLadder = [
    500,        // 1. soru
    1000,       // 2. soru (Garantili)
    2000,       // 3. soru
    3000,       // 4. soru
    5000,       // 5. soru (Garantili)
    7500,       // 6. soru
    15000,      // 7. soru
    30000,      // 8. soru
    50000,      // 9. soru
    100000,     // 10. soru (Garantili)
    200000,     // 11. soru
    400000,     // 12. soru
    800000,     // 13. soru
    1000000     // 14. soru (Büyük ödül)
];

// Oyun değişkenleri
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timer;
let jokers = { '50-50': true, 'phone': true, 'audience': true };
let isMusicPlaying = false;
let canAnswer = true;

// Ses efektleri
const sounds = {
    correct: document.getElementById('correct-sound'),
    wrong: document.getElementById('wrong-sound'),
    final: document.getElementById('final-sound'),
    background: document.getElementById('background-music')
};

// Oyunu başlat
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    questions = shuffleArray([...questions]); // Soruları karıştır
    updateMoneyLadder();
    loadQuestion();
    startTimer();
    playSound('background');
}

// Para basamaklarını güncelle
function updateMoneyLadder() {
    const ladder = document.getElementById('money-ladder');
    ladder.innerHTML = '';
    
    moneyLadder.reverse().forEach((amount, index) => {
        const step = document.createElement('div');
        step.className = 'money-step';
        if (moneyLadder.length - 1 - index === currentQuestionIndex) {
            step.classList.add('current');
        }
        if ([4, 9, 13].includes(index)) { // Garantili basamaklar
            step.classList.add('guaranteed');
        }
        step.textContent = `${amount.toLocaleString()} TL`;
        ladder.appendChild(step);
    });
    moneyLadder.reverse();
}

// Zamanlayıcıyı başlat
function startTimer() {
    timeLeft = 30;
    clearInterval(timer);
    
    const timerDisplay = document.getElementById('time-left');
    timerDisplay.style.color = '#ffd700';
    
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerDisplay.style.color = 'red';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame(true);
        }
    }, 1000);
}

// Soru yükle
function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame(false);
        return;
    }

    canAnswer = true;
    const question = questions[currentQuestionIndex];
    document.getElementById('question').textContent = question.q;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    const shuffledOptions = shuffleArray([...question.a]);

    shuffledOptions.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => {
            if (canAnswer) {
                canAnswer = false;
                selectOption(optionDiv, option === question.correct);
            }
        };
        optionsDiv.appendChild(optionDiv);
    });

    updateMoneyLadder();
    startTimer();
}

// Cevap seçimi
function selectOption(optionDiv, isCorrect) {
    clearInterval(timer);
    
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(option => option.style.pointerEvents = 'none');
    
    if (isCorrect) {
        optionDiv.classList.add('correct');
        playSound('correct');
        score = moneyLadder[currentQuestionIndex];
        document.getElementById('score-amount').textContent = score.toLocaleString();
        
        setTimeout(() => {
            if (currentQuestionIndex >= questions.length - 1) {
                endGame(false);
                return;
            }
            
            currentQuestionIndex++;
            loadQuestion();
            allOptions.forEach(option => option.style.pointerEvents = 'auto');
        }, 2000);
    } else {
        optionDiv.classList.add('wrong');
        playSound('wrong');
        
        // Doğru cevabı göster
        allOptions.forEach(option => {
            if (option.textContent === questions[currentQuestionIndex].correct) {
                option.classList.add('correct');
            }
        });
        
        setTimeout(() => endGame(false), 2000);
    }
}

// Joker kullanımı
function useJoker(jokerType) {
    if (!jokers[jokerType]) {
        alert('Bu jokeri daha önce kullandınız!');
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const options = Array.from(document.querySelectorAll('.option'));
    const correctAnswer = currentQuestion.correct;

    switch(jokerType) {
        case '50-50':
            const wrongOptions = options.filter(option => 
                option.textContent !== correctAnswer
            );
            shuffleArray(wrongOptions)
                .slice(0, 2)
                .forEach(option => {
                    option.style.visibility = 'hidden';
                });
            break;

        case 'phone':
            const isCorrect = Math.random() <= 0.8;
            const answer = isCorrect ? correctAnswer : 
                currentQuestion.a.filter(a => a !== correctAnswer)[
                    Math.floor(Math.random() * 3)
                ];
            
            const confidence = isCorrect ? 
                Math.floor(Math.random() * 15) + 85 : 
                Math.floor(Math.random() * 20) + 60;

            alert(
                `📞 Telefon Bağlantısı Kuruldu!\n\n` +
                `Arkadaşınız diyor ki:\n` +
                `"${currentQuestion.q} sorusu için...\n` +
                `%${confidence} eminlikle cevap '${answer}' olmalı."`
            );
            break;

        case 'audience':
            const percentages = {};
            let remaining = 100;

            percentages[correctAnswer] = Math.floor(Math.random() * 31) + 40;
            remaining -= percentages[correctAnswer];

            const wrongAnswers = currentQuestion.a.filter(a => a !== correctAnswer);
            wrongAnswers.forEach((answer, index) => {
                if (index === wrongAnswers.length - 1) {
                    percentages[answer] = remaining;
                } else {
                    const percent = Math.min(
                        Math.floor(Math.random() * remaining),
                        30
                    );
                    percentages[answer] = percent;
                    remaining -= percent;
                }
            });

            let graphResult = '📊 Seyirci Sonuçları:\n\n';
            Object.entries(percentages).forEach(([option, percent]) => {
                const bars = '█'.repeat(Math.floor(percent / 5));
                graphResult += `${option}: ${bars} %${percent}\n`;
            });
            
            alert(graphResult);
            break;
    }

    jokers[jokerType] = false;
    const jokerElement = document.getElementById(`joker-${jokerType}`);
    jokerElement.classList.add('disabled');
}

// Çekilme
function quitGame() {
    if (confirm('Çekilmek istediğinize emin misiniz?')) {
        playSound('final');
        saveHighScore(score);
        alert(`Tebrikler! ${score.toLocaleString()} TL kazandınız!`);
        location.reload();
    }
}

// Oyun sonu
function endGame(timeOut) {
    clearInterval(timer);
    playSound('final');
    
    let message;
    let guaranteedAmount = 0;

    // Garantili basamak kontrolü
    if (currentQuestionIndex >= 9) guaranteedAmount = moneyLadder[9];  // 100.000 TL
    else if (currentQuestionIndex >= 4) guaranteedAmount = moneyLadder[4];  // 5.000 TL
    else if (currentQuestionIndex >= 1) guaranteedAmount = moneyLadder[1];  // 1.000 TL

    if (timeOut) {
        message = 'Süre doldu!';
        score = guaranteedAmount;
    } else if (currentQuestionIndex >= questions.length - 1 && score === moneyLadder[moneyLadder.length - 1]) {
        message = 'Tebrikler! Tüm soruları doğru bildiniz!\nBir Milyoner oldunuz! 🎉';
    } else {
        if (!timeOut) {
            message = 'Yanlış cevap!';
            score = guaranteedAmount;
        }
    }
    
    message += `\nGarantili kazancınız: ${guaranteedAmount.toLocaleString()} TL`;
    message += `\nToplam Kazancınız: ${score.toLocaleString()} TL`;
    
    if (score > 0) {
        saveHighScore(score);
    }
    
    setTimeout(() => {
        alert(message);
        location.reload();
    }, 1000);
}

// Yüksek skorları kaydet ve göster
function saveHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    const name = prompt('Adınızı girin:');
    
    if (name) {
        highScores.push({
            name,
            score,
            date: new Date().toLocaleDateString()
        });
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Sadece en yüksek 10 skor
        
        localStorage.setItem('highScores', JSON.stringify(highScores));
    }
}

function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    let scoreList = '🏆 YÜKSEK SKORLAR 🏆\n\n';
    
    if (highScores.length === 0) {
        scoreList += 'Henüz yüksek skor yok!';
    } else {
        highScores.forEach((score, index) => {
            scoreList += `${index + 1}. ${score.name}: ${score.score.toLocaleString()} TL\n` +
                        `   Tarih: ${score.date}\n\n`;
        });
    }
    
    alert(scoreList);
}

// Sosyal medya paylaşımı
function shareScore(platform) {
    const text = `Kim Milyoner Olmak İster oyununda ${score.toLocaleString()} TL kazandım!`;
    const url = window.location.href;
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`);
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
    }
}

// Ses kontrolü
function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.log('Ses çalınamadı:', error));
    }
}

function toggleMusic() {
    const music = sounds.background;
    if (isMusicPlaying) {
        music.pause();
    } else {
        music.play().catch(error => console.log('Müzik çalınamadı:', error));
    }
    isMusicPlaying = !isMusicPlaying;
    document.querySelector('.music-control').innerHTML = 
        `<i class="fas fa-music"></i> Müzik: ${isMusicPlaying ? 'Açık' : 'Kapalı'}`;
}

// Yardımcı fonksiyonlar
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}