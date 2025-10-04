var admin = require("firebase-admin"); // 

var serviceAccount = require("./firestroekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //storageBucket: "gs://newshop-e45ca.firebasestorage.app" // aloo newshop Firebase Storage Bucket
  //storageBucket: "gs://newshopcopy.firebasestorage.app" // newaloo copy newshop Firebase Storage Bucket
  //storageBucket: "gs://newshopbackup1.firebasestorage.app" // newaloo backup1 newshop Firebase Storage Bucket
  storageBucket: "gs://newshopbackup2.firebasestorage.app" //  open  backup2 newshop Firebase Storage Bucket
});

const db = admin.firestore();
module.exports = db;