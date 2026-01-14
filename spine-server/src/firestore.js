var admin = require("firebase-admin"); // 

var serviceAccount = require("./firestroekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://spineanalysis0106test1.firebasestorage.app" //  
});

const db = admin.firestore();
module.exports = db;