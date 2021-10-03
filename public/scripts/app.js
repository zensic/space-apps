document.addEventListener("DOMContentLoaded", (event) => {
  const app = firebase.app();
  console.log("Firebase initialized!");
});

var soundCheck = false;
function configureAudio(audioID) {
  const audio = document.getElementById(audioID);
  if (soundCheck == true) {
    soundCheck = false;
    audio.pause();
    document.getElementById("toggleSound").innerHTML = "Off";
    sessionStorage.setItem("audio", "off");
  } else if (soundCheck == false) {
    soundCheck = true;
    audio.play();
    document.getElementById("toggleSound").innerHTML = "On";
    sessionStorage.setItem("audio", "on");
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

function initAvatar() {
  document
  .getElementById("avatar-desc")
  .getElementsByTagName("p")[0].innerHTML =  `Astronaut is an individual who is trained, equipped and deployed by a human spaceflight program to serve as a commander or crew member aboard a spacecraft.<br/><br/><em>Terminology</em><br/>

  <br/>- Astronaut - Known as a professional space traveler.
  <br/>- Cosmonaut - Astronaut employed by the Russian Federal Space Agency (or its Soviet predecessor)
  <br/>- Taikonaut - For professional space travelers from China.
  <br/>- Parastronaut - European Space Agency envisions recruiting an astronaut with a physical disability.<br/>
  
  <br/><strong><em>Info:</em></strong><br/>On the 12th of April 1961, a gentleman who was known as Yuri Gagarin became the first human to journey into outer space.
  <br/><br/>
  You can find more information <a href="https://en.wikipedia.org/wiki/Astronaut" target="_blank">here</a>.`;
}

/* avatar selection start */
function setAvatar($avatar, $sessionAvatar, $btnID) {
  $sessionAvatar[0] = $avatar; // assign avatr to session avatar

  const db = firebase.firestore();
  var docRef = db.collection("avatar").doc($avatar);
  const btnList = ['astronaut-btn','biologist-btn','engineer-btn','scientist-btn'];
  for (i = 0; i < btnList.length; i++) {
    if($btnID == btnList[i]){
      document.getElementById(btnList[i]).style.backgroundColor = "#00ff41";
      document.getElementById(btnList[i]).style.fontWeight = "bold";
    }else{
      document.getElementById(btnList[i]).style.backgroundColor = "white";
      document.getElementById(btnList[i]).style.fontWeight = "normal";
    }  
  }


  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
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
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
}

/*function handleChoose($sessionAvatar) {
  sessionStorage.setItem("avatar", $sessionAvatar);
  window.location.href = "gameplay.html";
}*/

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

function setPlyrDetails($avatar) {
  const plyrName = document.getElementById("avatarNm").value;
  sessionStorage.setItem("name", plyrName);
  sessionStorage.setItem("avatar", $avatar);
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

      // option count + 1
      if (
        command_input.value == 1 ||
        command_input.value == 2 ||
        command_input.value == 3
      ) {
        addOptionCount(command_input.value);
      }

      command_input.value = "";
    }
  });
}

// option count + 1
function addOptionCount(option) {
  console.log("setTestddd fired!");
  const db = firebase.firestore();
  const incre = firebase.firestore.FieldValue.increment(1);

  // Add 1 count to the selected option
  db.collection("option_count")
    .doc(option)
    .update({
      count: incre,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
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
          <strong>Side Tasks</strong><br/>You are free to explore! <br/><br/><strong>Here's what you can do:</strong><br/><em>
          1. Check Health<br/>
          2. Check Radiation Levels<br/>
          3. Eat fruits and vegetables<br/>
          4. Exercise<br/>
          5. Take radiation medicine</em><br/><br/>
          `;
          handleCommand(fish_fillet);
        } else {
          // change command_type back to scenario
          command_type = "scenario";

          // reset filler task counter
          no_of_filler_tasks_executed = 0;

          // goes to the next scenario
          getScenario($index[0].toString());
        }
      }
    })
    .catch((error) => {
      console.log("Error getting Filler Task:", error);
    });
}

//Pass in selected avatar
function getSlctAvatarDetails() {
  document.addEventListener("DOMContentLoaded", (e) => {
    var avatarImg = "";
    var slctAvatar = sessionStorage.getItem("avatar");
    var plyrNm = sessionStorage.getItem("name");

    const db = firebase.firestore();
    const docRef = db.collection("avatar").doc(slctAvatar);
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          avatarImg = doc.data().iconImage;
          document.getElementById("avatar-icon").src = avatarImg;
          document.getElementById("player-stat").innerHTML =
            plyrNm + "'s Status";
        } else {
          console.log("No such document!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  });
}

// gets the scenario and updates the dom
function getScenario($index) {
  const db = firebase.firestore();
  var docRef = db.collection("scenario").doc($index);
  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        handleCommand(doc.data().detail);
        document.getElementById("scenario-img").src = doc.data().image;
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

        // check if player is alive
        if (!checkStatus($stats)) {
          // if not alive game over
          window.location.href = "gameover.html";
        }

        // check if enough turns have passed
        if (checkMonths($index[0])) {
          // if not alive game over
          window.location.href = "endscene.html";
        }

        // advance to next month
        $index[0] = $index[0] + 1;
        document.getElementById("game-month").innerHTML = $index[0].toString();

        // change command_type back to filler
        command_type = "filler";

        // add filler tasks
        var fish_fillet = `
        <strong>Side Tasks</strong><br/>You are free to explore! <br/><br/><strong>Here's what you can do:</strong><br/><em>
        1. Check Health<br/>
        2. Check Radiation Levels<br/>
        3. Eat fruits and vegetables<br/>
        4. Exercise<br/>
        5. Take radiation medicine</em><br/><br/>
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
    default:
      return "";
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

  //Lead player to gameover page when checkStatus return false
  if (!checkStatus($stsArr)) {
    window.location.href = "gameover.html";
  }
}

// if status < 100 / status > 100, returns true if alive, false if dead
function checkStatus($stats) {
  if ($stats["hp"] < 1) {
    return false;
  } else if ($stats["mm"] < 1) {
    return false;
  } else if ($stats["bm"] < 1) {
    return false;
  } else if ($stats["rl"] > 99) {
    return false;
  } else if ($stats["sl"] > 99) {
    return false;
  }
  return true;
}

// if no. of months > 3 years, player reaches mars, return true, else return false
function checkMonths($months) {
  console.log("Month: " + $months);
  if ($months > 4) {
    return true;
  }
  return false;
}

// initialize first scenario
function initScenario() {
  document.addEventListener("DOMContentLoaded", (e) => {
    getScenario("0");
    getScenario("1");
  });
}
/* gameplay section end */

/*Completion section start--------------------------------*/
function setCertName() {
  document.getElementById("cert-username").innerHTML =
    sessionStorage.getItem("name");
}

/*Completion section ends---------------------------------*/
