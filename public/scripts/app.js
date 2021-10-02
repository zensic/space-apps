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
          console.log("N0 avatar data found!");
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
  window.location.href='gameplay.html';
}
/* avatar selection end */