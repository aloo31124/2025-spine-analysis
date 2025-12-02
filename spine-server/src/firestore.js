var admin = require("firebase-admin"); // 

var serviceAccount = require("./firestroekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://spineanalysis1006test1.firebasestorage.app" //  open  backup2 newshop Firebase Storage Bucket
});

const db = admin.firestore();
module.exports = db;