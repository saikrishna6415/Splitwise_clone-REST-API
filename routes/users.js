var express = require('express');
var router = express.Router();
// var admin = require("firebase-admin");
var database = require('../models/db')
var { db } = require('../models/db')


router.get('/', function (req, res, next) {
  const data = database.getAllusers()
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
  //   .catch(err => console.log(err))
});


router.get('/:userid', function (req, res, next) {
  var id = req.params.userid
  // console.log(id)
  const data = database.getUser(id);
  data.then(result => {
    console.log(result)
    if (result) {
      res.status(200).send(result)
    } else {
      res.status(404).send({ data: { error: `User doesn't Exist` } })
    }
  })
    .catch(err => res.send({ data: { error: "error occured" } }))
});

router.get('/:userid/getfriends', async function (req, res, next) {
  // id = current user 
  let id = req.params.userid
  const data = database.getFriends(id);
  data.then(result => {
    if (result.length === 0) {
      res.status(200).send({ data: { error: `friends doesn't Exist` } })
    } else {
      res.status(200).send(result)
    }
  })
    .catch(err => res.send({ data: { error: "error occured" } }))
});

router.post('/:userid/addfriend', async function (req, res, next) {
  var user = req.params.userid
  var friendDetails = req.body
  const data = database.addFriend(friendDetails, user);
  data.then((result) => {
    console.log(result)
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data()
        })
      res.status(200).send(data1.friends)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})



router.delete('/:userid/deletefriend/:id', async function (req, res) {
  var user = req.params.userid
  var friendToDel = req.params.id
  const data = database.deleteFriend(friendToDel, user);
  data.then((result) => {
    console.log(result)
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().friends
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})


router.post('/:userid/addexpense', async function (req, res) {
  var user = req.params.userid
  var expenseDetails = req.body
  const data = database.addExpenseGroup(expenseDetails, user);
  data.then((result) => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));

})

router.delete('/:userid/deleteexpense', async function (req, res) {
  var user = req.params.userid
  var expenseDetails = req.body
  console.log(expenseDetails)
  const data = database.deleteExpense(expenseDetails, user);
  data.then(result => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})


router.post('/:userid/settleup', async function (req, res) {
  var settleupDetails = req.body
  console.log(settleupDetails)
  var user = req.params.userid
  const data = database.settleUp(settleupDetails, user);
  data.then(result => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  })
})

router.delete('/:userid/deletesettle', async function (req, res) {
  var settleupDetails = req.body
  var user = req.params.userid
  const data = database.deletSettle(settleupDetails, user);
  data.then(result => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})


// router.post('/addexpense', async function (req, res) {
//   var expenseDetails = req.body
//   const data = database.addExpenseGroup(expenseDetails);
//   data.then(result => {
//     // console.log(result)
//     res.status(200).send(result)
//   })
//     .catch(err => console.log(err))
// })

module.exports = router;
