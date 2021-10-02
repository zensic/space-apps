document.addEventListener("DOMContentLoaded", (event) => {
  const app = firebase.app();
  console.log("Firebase initialized!");
});

function setTest() {
  console.log("setTest fired!");
  // Add a new document in collection "cities"
  const db = firebase.firestore();
  db.collection("space-apps")
    .doc("2")
    .set({
      name: "hazard1",
      stats: "100",
      description: "Hello World",
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

function getTest() {
  console.log("getTest fired!");

  const db = firebase.firestore();
  var docRef = db
    .collection("scenario")
    .doc("1")
    .collection("action-1")
    .doc("desc");
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

/* avatar selection start */
function setAvatar($avatar, $sessionAvatar) {
  $sessionAvatar[0] = $avatar; // assign avatr to session avatar

  const db = firebase.firestore();
  var docRef = db.collection("avatar").doc($avatar);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("Document data:", doc.data());

        if (doc.data().description) {
          document
            .getElementById("avatar-img")
            .getElementsByTagName("img")[0].src = doc.data().image;
          document
            .getElementById("avatar-img")
            .getElementsByTagName("img")[0].alt = $avatar;
          document
            .getElementById("avatar-desc")
            .getElementsByTagName("h3")[0].innerHTML = $avatar;
          document
            .getElementById("avatar-desc")
            .getElementsByTagName("p")[0].innerHTML = doc.data().description;
        } else {
          console.log("No avatar data found!");
        }
        //return [doc.data().image, doc.data().description];
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  return [];
}

function handleChoose($sessionAvatar) {
  sessionStorage.setItem("avatar", $sessionAvatar);
  window.location.href = "gameplay.html";
}
/* avatar selection end */

/* gameplay section start */
const history = document.getElementById("command-history");
const command_input = document.getElementById("command-input");

// adds user command input to command history
function handleCommand(command) {
  const line = document.createElement("p");
  line.innerHTML = "> " + command;
  history.appendChild(line);
  history.scrollTop = history.scrollHeight;
}

command_input.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    handleCommand(command_input.value);
    command_input.value = "";
  }
});

function readInput(command) {}

// adds one to the count and updates the dom
function addMonth($month) {
  $month[0] = $month[0] + 1;
  document.getElementById("game-month").innerHTML = $month[0];
}

// gets the scenario and updates the dom
function getScenario($index) {
  const db = firebase.firestore();
  var docRef = db.collection("scenario").doc($index);
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log(doc.data().detail);
        handleCommand(doc.data().detail);
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

// gets all actions of the given index
function getActions($index) {
  const db = firebase.firestore();
  var docRef = db
    .collection("scenario")
    .doc($index)
    .collection("action-1")
    .doc("stats");
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log(doc.data());
        handleCommand(doc.data().hp);
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

// validates the input field, returns true if passed
function validateInput($input, $numInputs) {
  try {
    if (parseInt($input) <= $numInputs && parseInt($input) > 0) {
      return true;
    }
  } catch (err) {
    console.log(err.message);
    return false;
  }
  return false;
}

// updates the current player status
function updateStatus($hp, $mm, $bm, $rl, $sl, $stsArr) {

}

// if status < 100 / status > 100, returns true if alive, false if dead
function checkStatus($hp, $mm, $bm, $rl, $sl) {
  if ($hp < 0) {
    return false;
  } else if ($mm < 0) {
    return false;
  } else if ($bm < 0) {
    return false;
  } else if ($rl > 100) {
    return false;
  } else if ($sl > 100) {
    return false;
  }
  return true;
}

// if no. of months > 3 years, player reaches mars, return true, else return false
function checkMonths($months) {}

function initScenario() {
  document.addEventListener("DOMContentLoaded", (event) => {
    getScenario("0");
    getScenario("1");
    getActions("1");
  });
}

const openModalButtons = document.querySelectorAll("[data-modal-target]");
const closeModalButtons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    openModal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    closeModal(modal);
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".modal");
    closeModal(modal);
  });
});

function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}
/* gameplay section end */
