var express = require('express');
var router = express.Router();
// var admin = require("firebase-admin");
var database = require('../models/db')
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// var serviceAccount = require('../database/database.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://splitwise-7d6e6.firebaseio.com"
// });

// const db = admin.firestore()
// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer"
      },
      servers: ["http://localhost:3000"]
    }
  },
  // ['.routes/*.js']
  apis: ["users.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



// Routes
/**
 * @swagger
 * /:
 *  get:
 *    description: Use to request all users
 *    responses:
 *      '200':
 *        description: A successful response
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: id
 *               email:
 *                 type: string
 *              expenses:
 *                  type:array
 *              friends:
 *                type:array
 *            
 */
router.get('/', function (req, res) {
  const data = database.getAllusers()
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});


router.get('/:userid', function (req, res) {
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
    .catch(err => console.log(err))
});

router.get('/:userid/getfriends', async function (req, res) {
  // id = current user 
  let id = req.params.userid
  // console.log(id)
  const data = database.getFriends(id);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});

router.post('/:userid/addfriend', async function (req, res) {
  var user = req.params.userid
  var friendDetails = req.body
  const data = database.addFriend(friendDetails, user);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
});


router.delete('/:userid/deletefriend/:id', async function (req, res) {
  var user = req.params.userid
  var friendToDel = req.params.id
  const data = database.deleteFriend(friendToDel, user);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})


router.post('/:userid/addexpense', async function (req, res) {
  var user = req.params.userid
  var expenseDetails = req.body
  const data = database.addExpenseGroup(expenseDetails, user);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})


router.post('/:userid/settleup', async function (req, res) {
  var settleupDetails = req.body
  var user = req.params.userid
  const data = database.settleUp(settleupDetails, user);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
})

router.delete('/:userid/deleteexpense', async function (req, res) {
  var user = req.params.userid
  var expenseDetails = req.body
  console.log(expenseDetails)
  const data = database.deleteExpense(expenseDetails, user);
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => console.log(err))
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
