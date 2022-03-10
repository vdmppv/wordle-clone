import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
console.log(rightGuessString)

let keyboard = document.getElementById("keyboard-wrapper");
let body = document.querySelector("body");
function initBoard() {
  
  let themeStoraged = localStorage.getItem('wordle-theme');
  body.classList.add(themeStoraged);
  keyboard.classList.add(themeStoraged);
  
  let gameBoard = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }
    
    gameBoard.appendChild(row);
  }
}

initBoard()

let toggleBtn = document.getElementById("theme");

toggleBtn.addEventListener("click", (e) => {
  if (e.pointerType === "mouse") { // fixed the bug when works when enter key is pressed
    body.classList.toggle("dark-theme");
    keyboard.classList.toggle("dark-theme");
    localStorage.setItem("wordle-theme", keyboard.classList.contains("dark-theme") ? "dark-theme" : "light-theme");
  }
})

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) return;

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter()
    return
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let letterRegex = pressedKey.match(/[a-z]/gi)
  if (!letterRegex || letterRegex.length > 1) 
    return
  else 
    insertLetter(pressedKey);
})

function insertLetter(pressedKey) {
  if (nextLetter === 5 || pressedKey.length > 1){
    return
  }
  pressedKey = pressedKey.toLowerCase()

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
  let box = row.children[nextLetter]

  animateCSS(box, "pulse")
  box.textContent = pressedKey
  box.classList.add("filled-box")
  currentGuess.push(pressedKey)
  nextLetter += 1
}

function deleteLetter () {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
  let box = row.children[nextLetter - 1]
  box.textContent = ""
  box.classList.remove("filled-box")
  currentGuess.pop()
  nextLetter -= 1
}

function checkGuess(){
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]

  let guessString = ''
  let rightGuess = Array.from(rightGuessString)

  for (const val of currentGuess) {
    guessString += val
  }

  if (guessString.length != 5) {
    toastr.error('Not enough letters! There must be 5 letters')
    return
  }

  if (!WORDS.includes(guessString)) {
    toastr.error('Word is not in the list!')
    return
  }

  for (let i = 0; i < 5; i++) {
    let letterColor = ''
    let box = row.children[i]
    let letter = currentGuess[i]

    let letterPosition = rightGuess.indexOf(currentGuess[i])

    if (letterPosition === -1){
      letterColor = '#a4a4a4'
    } 
    else {
      if (currentGuess[i] === rightGuess[i]){
        letterColor = '#6aaa64'
      } 
      else {
        letterColor = '#c9b458'
      }
      rightGuess[letterPosition] = "#"
    }

    let delay = 150 * i 
    setTimeout(() => {
      animateCSS(box, 'flipInX')
      box.style.backgroundColor = letterColor
      shadeKeyBoard(letter, letterColor)
    }, delay)
  }

  if (guessString === rightGuessString) {
    toastr.success("You guessed right! Game over!")
    guessesRemaining = 0
    // setTimeout(() => document.location.reload(), 4000)
    return
  }
  else {
    guessesRemaining -= 1
    currentGuess = []
    nextLetter = 0

    if (guessesRemaining === 0) {
      toastr.error("You are out of guesses! Game over!")
      toastr.info(`The right word was: "${rightGuessString}"`)
      // setTimeout(() => document.location.reload(), 4000)
      return
    }
  }
}
function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor
      if (oldColor === '#6aaa64'){
        return
      }

      if (oldColor === '#c9b458' && color != '#6aaa64'){
        return
      }

      elem.style.backgroundColor = color
      break
    }  
  }
}

document.getElementById("keyboard-wrapper").addEventListener("click", (e) =>{
  const target = e.target

  if (!target.classList.contains("keyboard-button")) {
    return
  }

  let key = target.textContent

  if (key === "Del") {
    key = "Backspace"
  }

  document.dispatchEvent(new KeyboardEvent("keyup", {'key' : key}))
})


const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});