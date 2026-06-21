let currentCards = [];
let currentIndex = 0;
let showingBack = false;

const setList = document.getElementById("setList");
const studyView = document.getElementById("studyView");
const flashcard = document.getElementById("flashcard");
const cardText = document.getElementById("cardText");
const counter = document.getElementById("counter");

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

  document.getElementById("setTitle").textContent =
    set.title;

  setList.classList.add("hidden");
  studyView.classList.remove("hidden");

  renderCard();
}

function renderCard() {

  showingBack = false;

  cardText.textContent =
    currentCards[currentIndex].front;

  counter.textContent =
    `${currentIndex + 1} / ${currentCards.length}`;
}

flashcard.addEventListener("click", () => {

  showingBack = !showingBack;

  cardText.textContent =
    showingBack
      ? currentCards[currentIndex].back
      : currentCards[currentIndex].front;
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
});

loadSets();