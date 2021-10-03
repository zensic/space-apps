document.addEventListener("DOMContentLoaded", (event) => {
  const app = firebase.app();
  console.log("Firebase initialized!");
});

var soundCheck = true;
function configureAudio(audioID) {
  const audio = document.getElementById(audioID);
  if (soundCheck == true) {
    soundCheck = false;
    audio.pause();
  } else if (soundCheck == false) {
    soundCheck = true;
    audio.play();
  }
}

function adjustVolume(audioID) {
  const audio = document.getElementById(audioID);
  audio.volume = 0.2; //Set a fix volume value
}

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
var command_type = "scenario";
var no_of_filler_tasks_executed = 0;

// adds user command input to command history
function handleCommand(command) {
  const line = document.createElement("p");
  line.innerHTML = "> " + command;
  history.appendChild(line);
  history.scrollTop = history.scrollHeight;
}

// initializes enter button listener
function initEnterListener($month, $stats) {
  command_input.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      // prints command out to the terminal
      handleCommand(command_input.value); 

      if (command_type == "scenario") {
        // returns consequence of action
        getEffect($month, command_input.value, $stats); 

      } else if ((command_type = "filler")) {
        // increase filler task count by 1
        no_of_filler_tasks_executed += 1; 
        getFillerTask($stats, $month);
      }

      command_input.value = "";
    }
  });
}

// gets filler tasks, updates status window
function getFillerTask($stats, $index) {
  console.log(command_type + " received");
  console.log($index + " received");

  var option = parseInt(command_input.value - 1).toString();
  console.log("Filler Task no. " + option);
  const db = firebase.firestore();
  var docRef = db.collection("filler_task").doc(option);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        var response = "";

        if (doc.data().type == "check") {
          var threshold = doc.data().threshold;
          var to_check = doc.data().to_check;
          var ok = true;

          switch (to_check) {
            case "hp":
              ok = $stats[to_check] >= threshold;
              break;
            case "mm":
              ok = $stats[to_check] >= threshold;
              break;
            case "bm":
              ok = $stats[to_check] >= threshold;
              break;
            case "rl":
              ok = $stats[to_check] <= threshold;
              break;
            case "sl":
              ok = $stats[to_check] <= threshold;
              break;
          }

          response = ok
            ? doc.data().positive_respond
            : doc.data().negative_respond;
        } else if (doc.data().type == "action") {
          updateStatus(
            doc.data().hp,
            doc.data().mm,
            doc.data().bm,
            doc.data().rl,
            doc.data().sl,
            $stats
          );
          response = doc.data().positive_respond;
        }
        handleCommand(response);

        if (no_of_filler_tasks_executed < 3) {
          var fish_fillet = `
          You are free to explore! Here's what you can do:<br/>
          1. Check Health<br/>
          2. Check Radiation Levels<br/>
          3. Eat fruits and vegetables<br/>
          4. Exercise<br/>
          5. Take radiation medicine<br/><br/>
          `;

          handleCommand(fish_fillet);
        } else {
          // change command_type back to scenario
          command_type = "scenario";

          // reset filler task counter
          no_of_filler_tasks_executed = 0;

          console.log("Getting next scenario");

          // goes to the next scenario
          getScenario($index[0].toString());
        }
      }
    })
    .catch((error) => {
      console.log("Error getting Filler Task:", error);
    });
}

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

// gets the effect of the action
// accepts two strings
function getStats($index, $action, $stats) {
  var sAction = "action-1";

  switch ($action) {
    case "1":
      var sAction = "action-1";
      break;
    case "2":
      var sAction = "action-2";
      break;
    case "3":
      var sAction = "action-3";
      break;
  }

  const db = firebase.firestore();
  var docRef = db
    .collection("scenario")
    .doc($index[0].toString())
    .collection(sAction)
    .doc("stats");
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        var eHp = doc.data().hp ? doc.data().hp : 0;
        var eMm = doc.data().mm ? doc.data().mm : 0;
        var eBm = doc.data().bm ? doc.data().bm : 0;
        var eRl = doc.data().rl ? doc.data().rl : 0;
        var eSl = doc.data().sl ? doc.data().sl : 0;

        updateStatus(eHp, eMm, eBm, eRl, eSl, $stats);

        // advance to next month
        $index[0] = $index[0] + 1;

        // change command_type back to filler
        command_type = "filler";

        // add filler tasks        
        var fish_fillet = `
        You are free to explore! Here's what you can do:<br/>
        1. Check Health<br/>
        2. Check Radiation Levels<br/>
        3. Eat fruits and vegetables<br/>
        4. Exercise<br/>
        5. Take radiation medicine<br/><br/>
        `;
        handleCommand(fish_fillet);
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

// gets the effect of the action
// accepts two strings
function getEffect($index, $action, $stats) {
  var sAction = "action-1";

  switch ($action) {
    case "1":
      var sAction = "action-1";
      break;
    case "2":
      var sAction = "action-2";
      break;
    case "3":
      var sAction = "action-3";
      break;
  }

  const db = firebase.firestore();
  var docRef = db
    .collection("scenario")
    .doc($index[0].toString())
    .collection(sAction)
    .doc("desc");
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        handleCommand(doc.data().effect); // print effect of action

        // updates the whole stats
        getStats($index, $action, $stats);

        // goes to the next scenario
        // getScenario($index[0].toString());
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
// accepts number of stat to change
function updateStatus($hp, $mm, $bm, $rl, $sl, $stsArr) {
  console.log($hp);
  $stsArr["hp"] =
    $stsArr["hp"] + $hp < 0
      ? 0
      : $stsArr["hp"] + $hp > 100
      ? 100
      : $stsArr["hp"] + $hp;
  $stsArr["mm"] =
    $stsArr["mm"] + $mm < 0
      ? 0
      : $stsArr["mm"] + $mm > 100
      ? 100
      : $stsArr["mm"] + $mm;
  $stsArr["bm"] =
    $stsArr["bm"] + $bm < 0
      ? 0
      : $stsArr["bm"] + $bm > 100
      ? 100
      : $stsArr["hp"] + $bm;
  $stsArr["rl"] =
    $stsArr["rl"] + $rl < 0
      ? 0
      : $stsArr["rl"] + $rl > 100
      ? 100
      : $stsArr["rl"] + $rl;
  $stsArr["sl"] =
    $stsArr["sl"] + $sl < 0
      ? 0
      : $stsArr["sl"] + $sl > 100
      ? 100
      : $stsArr["sl"] + $sl;
  console.log($sl);
  // updates the dom model
  document.getElementById("hp").innerHTML = $stsArr["hp"];
  document.getElementById("mm").innerHTML = $stsArr["mm"];
  document.getElementById("bm").innerHTML = $stsArr["bm"];
  document.getElementById("rl").innerHTML = $stsArr["rl"];
  document.getElementById("sl").innerHTML = $stsArr["sl"];
}

// if status < 100 / status > 100, returns true if alive, false if dead
function checkStatus($stats) {
  if ($stats["hp"] < 0) {
    return false;
  } else if ($stats["mm"] < 0) {
    return false;
  } else if ($stats["bm"] < 0) {
    return false;
  } else if ($stats["rl"] > 100) {
    return false;
  } else if ($stats["sl"] > 100) {
    return false;
  }
  return true;
}

// if no. of months > 3 years, player reaches mars, return true, else return false
function checkMonths($months) {}

// initialize first scenario
function initScenario() {
  document.addEventListener("DOMContentLoaded", (event) => {
    getScenario("0");
    getScenario("1");
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
