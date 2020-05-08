var express = require('express');
var router = express.Router();
// var admin = require("firebase-admin");
var database = require('../models/db')

// var serviceAccount = require('../database/database.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://splitwise-7d6e6.firebaseio.com"
// });

// const db = admin.firestore()


router.get('/', function (req, res) {
  const data = database.getAllusers()
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});


router.get('/:id', function (req, res) {
  var id = req.params.id
  // console.log(id)
  const data = database.getUser(id);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});

router.get('/getfriends/:id', async function (req, res) {
  // id = current user 
  let id = req.params.id
  // console.log(id)
  const data = database.getFriends(id);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});

router.post('/addfriend', async function (req, res) {
  var friendDetails = req.body
  const data = database.addFriend(friendDetails);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});


router.delete('/deletefriend/:id', async function (req, res) {
  var friendToDel = req.params.id
  const data = database.deleteFriend(friendToDel);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})


router.post('/addexpense', async function (req, res) {
  var expenseDetails = req.body
  const data = database.addExpense(expenseDetails);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})


router.post('/settleup', async function (req, res) {
  var settleupDetails = req.body
  const data = database.settleUp(settleupDetails);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})



router.post('/addexpense2', async function (req, res) {
  var expenseDetails = req.body
  const data = database.addExpense2(expenseDetails);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})

module.exports = router;
