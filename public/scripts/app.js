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
  var docRef = db.collection("space-apps").doc("2");
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
