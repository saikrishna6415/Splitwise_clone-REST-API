var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

var serviceAccount = require('../database/database.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://splitwise-7d6e6.firebaseio.com"
});

const db = admin.firestore()


// router.get('/', function (req, res, next) {
//   db.collection('users').get()
//     .then(snapshot => {
//       var users = snapshot.docs.map(doc=> doc.data())
//       console.log(users)
//       res.status(200).send(users)
//     });
// });

module.exports = router;
