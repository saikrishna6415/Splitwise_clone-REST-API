var express = require('express');
var router = express.Router();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
var database = require('../database/dbconnection')
var { db } = require('../database/dbconnection')




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



router.get('/:userid/getallexpenses', async function (req, res) {
  var user = req.params.userid
  const data = db.collection('users').doc(user).get()
    .then(doc => {
      return doc.data()
    })
  data.then(result => {
    if (result.expenses.length > 0) {
      res.status(200).send(result.expenses)
    } else {
      res.send({ data: { msg: " expenses doesn't exists" } })
    }
  })
    .catch((err) => res.send({ data: { error: "an error occured" } }));
})



router.get('/:userid/getexpense/:expenseid', async function (req, res) {
  var user = req.params.userid
  var expenseId = req.params.expenseid
  const data = db.collection('users').doc(user).get()
    .then(doc => {
      return doc.data()
    })
  data.then(result => {
    if (result.expenses.length > 0) {
      var expense;
      result.expenses.forEach(exp => {
        if (exp.expenseId === parseInt(expenseId)) {
          expense = exp
        }
      })
      console.log(expense)
      expense ? res.status(200).send(expense) : res.send({ data: { msg: "expense does not exist" } })
    } else {
      res.status(404).send({ data: { msg: "No expenses" } })
    }
  })
    .catch((err) => res.send({ data: { error: "an error occured" } }))
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



router.delete('/:userid/deleteexpense/:expenseid', async function (req, res) {
  var user = req.params.userid
  var expenseId = req.params.expenseid
  const data = database.deleteExpense(expenseId, user);
  data.then(result => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      // console.log(data1)
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



router.delete('/:userid/deletesettle/:expenseid', async function (req, res) {
  var settleupId = req.params.expenseid
  var user = req.params.userid
  const data = database.deletSettle(settleupId, user);
  data.then(result => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().expenses
        })
      // console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})




router.get('/:userid/getallgroups', async function (req, res) {
  var user = req.params.userid
  const data = db.collection('users').doc(user).get()
    .then(doc => {
      return doc.data()
    })
  data.then(result => {
    if (result.groups.length > 0) {
      res.status(200).send(result.groups)
    } else {
      res.send({ data: { msg: " groups doesn't exists" } })
    }
  })
    .catch((err) => res.send({ data: { error: "an error occured" } }));
})




router.get('/:userid/getgroup/:groupid', async function (req, res) {
  var user = req.params.userid
  var groupId = req.params.groupid
  const data = db.collection('users').doc(user).get()
    .then(doc => {
      return doc.data()
    })
  data.then(result => {
    if (result.groups.length > 0) {
      console.log(result.groups.length)
      var group;
      result.groups.forEach(grp => {
        if (grp.groupid === parseInt(groupId)) {
          group = grp
        }
      })
      group ? res.status(200).send(group) : res.send({ data: { msg: "group does not exist" } })
    }
  })
    .catch((err) => res.send({ data: { error: "an error occured" } }));
})



router.post('/:userid/addgroup', async function (req, res) {
  var user = req.params.userid
  var groupDetails = req.body
  const data = database.addGroup(groupDetails, user);
  data.then((result) => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().groups
        })
      console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})



router.delete('/:userid/deletegroup/:groupid', async function (req, res) {
  var user = req.params.userid
  var groupId = req.params.groupid
  const data = database.deleteGroup(groupId, user);
  data.then((result) => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data().groups
        })
      // console.log(data1)
      res.status(200).send(data1)
    }, 2000)
  }).catch((err) => res.send({ data: { error: "an error occured" } }));
})


module.exports = router;
