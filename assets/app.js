let currentCards = [];
let currentIndex = 0;
let showingBack = false;

let totalAnswered = 0;
let correctCount = 0;

const setList = document.getElementById("setList");
const studyView = document.getElementById("studyView");
const flashcard = document.getElementById("flashcard");
const cardText = document.getElementById("cardText");
const counter = document.getElementById("counter");
const choicesContainer = document.getElementById("choices");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const modeSelect = document.getElementById("modeSelect");
const flashControls = document.getElementById("flashControls");
const correctBtn = document.getElementById("correctBtn");
const wrongBtn = document.getElementById("wrongBtn");
const homeControls = document.getElementById("homeControls");
const shuffleBtn = document.getElementById("shuffleBtn");

let studyMode = modeSelect ? modeSelect.value : 'flashcard';

if (modeSelect) {
  modeSelect.addEventListener('change', () => {
    studyMode = modeSelect.value;
    renderCard();
  });
}

if (shuffleBtn) {
  shuffleBtn.addEventListener('click', () => {
    if (!currentCards || currentCards.length === 0) return;
    shuffle(currentCards);
    currentIndex = 0;
    renderCard();
  });
}

async function loadSets() {
  const response = await fetch("data/index.json");
  const data = await response.json();

  data.sets.forEach(set => {

    const div = document.createElement("div");

    div.className = "set-card";

    div.innerHTML = `
      <h3>${set.title}</h3>
      <p>${set.description}</p>
      <small>${set.cardCount} cards</small>
    `;

    div.onclick = () => loadStudySet(set.id);

    setList.appendChild(div);
  });
}

async function loadStudySet(id) {

  const response = await fetch(`data/${id}.json`);

  const set = await response.json();

  currentCards = set.cards;
  currentIndex = 0;
  totalAnswered = 0;
  correctCount = 0;
  updateProgress();

  document.getElementById("setTitle").textContent =
    set.title;

  setList.classList.add("hidden");
  if (homeControls) {
    homeControls.classList.add('hidden');
    homeControls.style.display = 'none';
  }
  studyView.classList.remove("hidden");

  renderCard();
}

function renderCard() {

  showingBack = false;

  cardText.textContent =
    currentCards[currentIndex].front;

  counter.textContent =
    `${currentIndex + 1} / ${currentCards.length}`;
  
  // show UI depending on study mode
  if (studyMode === 'multiple') {
    if (flashControls) flashControls.style.display = 'none';
    choicesContainer.style.display = 'flex';
    const { options } = generateChoices(currentIndex);
    renderChoices(options);
    // in multiple choice mode the flashcard should not be clickable
    if (flashcard) flashcard.style.cursor = 'default';
  } else {
    // flashcard mode
    choicesContainer.style.display = 'none';
    if (flashControls) flashControls.style.display = 'none';
    // clear any leftover choices
    choicesContainer.innerHTML = '';
    // disable flash controls until answer revealed
    if (correctBtn) correctBtn.disabled = true;
    if (wrongBtn) wrongBtn.disabled = true;
    if (flashcard) flashcard.style.cursor = 'pointer';
  }
}

flashcard.addEventListener("click", () => {

  // only allow flipping in flashcard mode
  if (studyMode !== 'flashcard') return;

  showingBack = !showingBack;

  cardText.textContent =
    showingBack
      ? currentCards[currentIndex].back
      : currentCards[currentIndex].front;

  if (studyMode === 'multiple') {
    if (showingBack) {
      const correctText = currentCards[currentIndex].back;
      Array.from(choicesContainer.children).forEach(btn => {
        if (btn.dataset.choice === correctText) btn.classList.add('correct');
        btn.disabled = true;
      });
    }
  } else {
    // flashcard mode: only enable check/x after reveal
    if (showingBack) {
      if (flashControls) flashControls.style.display = 'flex';
      if (correctBtn) correctBtn.disabled = false;
      if (wrongBtn) wrongBtn.disabled = false;
    } else {
      if (flashControls) flashControls.style.display = 'none';
      if (correctBtn) correctBtn.disabled = true;
      if (wrongBtn) wrongBtn.disabled = true;
    }
  }
});

document.getElementById("nextBtn")
  .addEventListener("click", () => {

    if (currentIndex < currentCards.length - 1) {
      currentIndex++;
      renderCard();
    }
});

document.getElementById("prevBtn")
  .addEventListener("click", () => {

    if (currentIndex > 0) {
      currentIndex--;
      renderCard();
    }
});

document.getElementById("backBtn")
  .addEventListener("click", () => {

    studyView.classList.add("hidden");
    setList.classList.remove("hidden");
    if (homeControls) {
      homeControls.classList.remove('hidden');
      homeControls.style.display = '';
    }
});

// flash control handlers
if (correctBtn) correctBtn.addEventListener('click', () => {
  // mark correct and advance
  correctBtn.disabled = true;
  wrongBtn.disabled = true;
  totalAnswered++;
  correctCount++;
  updateProgress();
  setTimeout(() => {
    if (currentIndex < currentCards.length - 1) {
      currentIndex++;
      renderCard();
    }
    correctBtn.disabled = false;
    wrongBtn.disabled = false;
  }, 400);
});

if (wrongBtn) wrongBtn.addEventListener('click', () => {
  correctBtn.disabled = true;
  wrongBtn.disabled = true;

  totalAnswered++;
  updateProgress();

  // remove current card and insert later
  const card = currentCards.splice(currentIndex, 1)[0];
  const L = currentCards.length;
  const minInsert = currentIndex; // insert at or after current index
  const insertAt = Math.min(L, Math.floor(Math.random() * (L - minInsert + 1)) + minInsert);
  currentCards.splice(insertAt, 0, card);

  setTimeout(() => {
    if (currentIndex < currentCards.length) {
      renderCard();
    }
    correctBtn.disabled = false;
    wrongBtn.disabled = false;
  }, 500);
});

loadSets();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateChoices(correctIndex) {
  const correct = currentCards[correctIndex].back;

  const otherAnswers = currentCards
    .map(c => c.back)
    .filter((b, i) => i !== correctIndex && b && b !== correct);

  shuffle(otherAnswers);

  const picks = otherAnswers.slice(0, 3);
  while (picks.length < 3) {
    const variation = makeVariation(correct, picks.concat([]));
    picks.push(variation);
  }

  const options = picks.concat([]);
  const insertAt = Math.floor(Math.random() * (options.length + 1));
  options.splice(insertAt, 0, correct);

  return { options, correctIndex: insertAt };
}

function makeVariation(text, existing) {
  if (!text) return 'None of the above';
  const words = text.split(' ');
  if (words.length > 2) {
    const idx = Math.floor(words.length / 2);
    const w = words.slice(0, idx).concat(words.slice(idx + 1)).join(' ');
    if (!existing.includes(w) && w.trim()) return w;
  }
  const alt = text + ' (different)';
  if (!existing.includes(alt)) return alt;
  return 'Not this one';
}

function renderChoices(options) {
  choicesContainer.innerHTML = '';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.type = 'button';
    btn.textContent = opt;
    btn.dataset.choice = opt;
    btn.addEventListener('click', onChooseOption);
    choicesContainer.appendChild(btn);
  });
}

function onChooseOption(e) {
  const btn = e.currentTarget;
  if (btn.disabled) return;

  const selected = btn.dataset.choice;
  const correct = currentCards[currentIndex].back;

  // disable all buttons
  Array.from(choicesContainer.children).forEach(b => b.disabled = true);

  totalAnswered++;

  if (selected === correct) {
    correctCount++;
    btn.classList.add('correct');
    // advance to next card if available
    setTimeout(() => {
      if (currentIndex < currentCards.length - 1) {
        currentIndex++;
        renderCard();
      }
    }, 600);
  } else {
    btn.classList.add('wrong');
    Array.from(choicesContainer.children).forEach(b => {
      if (b.dataset.choice === correct) b.classList.add('correct');
    });

    // shuffle current card back into the deck at a random later position
    const card = currentCards.splice(currentIndex, 1)[0];
    const minPos = currentIndex + 1;
    const maxPos = Math.max(minPos, currentCards.length);
    const insertAt = Math.floor(Math.random() * (maxPos - minPos + 1)) + minPos;
    currentCards.splice(insertAt, 0, card);
    // do not advance currentIndex -- next card is now at same index
    setTimeout(() => {
      if (currentIndex < currentCards.length) {
        renderCard();
      }
    }, 800);
  }

  updateProgress();
}

function updateProgress() {
  const pct = totalAnswered === 0 ? 0 : Math.round((correctCount / totalAnswered) * 100);
  progressText.textContent = `Correct: ${pct}%`;
  progressFill.style.width = `${pct}%`;
}