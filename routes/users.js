var express = require('express');
var router = express.Router();
// var admin = require("firebase-admin");
var database = require('../models/db')
var { db } = require('../models/db')


const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
/* GET home page. */
// Swagger set up
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Spliwise API Documenetation",
      version: "1.0.0",
      description:
        "A splitwise project to understand API endpoints",
    },
    servers: [
      {
        url: "http://localhost:3000/"
      },
      {
        url: "https://splitwise-api.herokuapp.com/"
      }
    ]
  },
  apis: ['./routes/users.js']
};
const specs = swaggerJsdoc(options);
router.use("/docs", swaggerUi.serve);
router.get(
  "/docs",
  swaggerUi.setup(specs, {
    explorer: true
  })
);

/**
 * @swagger
 * path:
 *  /users/:
 *    get:
 *      description: An array of users
 *      responses:
 *          "200":
 *            description: A successfull response
 *              
 */

router.get('/', function (req, res, next) {
  const data = database.getAllusers()
  data.then(result => {
    // console.log(result)
    res.status(200).send(result)
  })
    .catch(err => next(err))
});

/**
 * @swagger
 *
 * /users/{userid}:
 *   get:
 *     description: Get user by ID
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: UserId to get user details.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */
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
    .catch(err => next(err))
});


/**
 * @swagger
 *
 * /users/{userid}/getfriends:
 *   get:
 *     description: Get all friends
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: Get all friends.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */
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
    .catch(err => next(err))
});



/**
 * @swagger
 *
 * /users/{userid}/addfriend:
 *   post:
 *     description: Add a friend
 *     produces:
 *     - application/json
 *     parameters:
 *     - in : path
 *       name: userid
 *     requestBody:
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     name:         
 *                        type: string
 *                     email:          
 *                        type: string
 *     responses:
 *         '200':
 *             description: successfull response
 *         '500':
 *             description: internal server error
 * 
 */

router.post('/:userid/addfriend', async function (req, res, next) {
  var user = req.params.userid
  var friendDetails = req.body
  const data = database.addFriend(friendDetails, user);
  data.then((result) => {
    setTimeout(async () => {
      const data1 = await db.collection('users').doc(user).get()
        .then(doc => {
          return doc.data()
        })
      res.status(200).send(data1.friends)
    }, 2000)
  }).catch((err) => next(err));
})


/**
 * @swagger
 *
 * /users/{userid}/deletefriend/{id}:
 *   delete:
 *     description: delete a friend
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: id
 *         in: path
 *         description: delete friend.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */


router.delete('/:userid/deletefriend/:id', async function (req, res, next) {
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
  }).catch((err) => next(err));
})



/**
 * @swagger
 *
 * /users/{userid}/getallexpenses:
 *   get:
 *     description: Get all expenses
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: Get all expesnes of a user.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */
router.get('/:userid/getallexpenses', async function (req, res, next) {
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
    .catch((err) => next(err));
})


/**
 * @swagger
 *
 * /users/{userid}/getexpense/{id}:
 *   get:
 *     description: get a expense by Id
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: id
 *         in: path
 *         description: get a expense by Id
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */


router.get('/:userid/getexpense/:expenseid', async function (req, res, next) {
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
      expense ? res.status(200).send(expense) : res.send({ data: { msg: "expense does not exist" } })
    } else {
      res.status(404).send({ data: { msg: "No expenses" } })
    }
  })
    .catch((err) => next(err))
})




/**
 * @swagger
 *
 * /users/{userid}/addexpense:
 *   post:
 *     description: Add a expense
 *     produces:
 *     - application/json
 *     parameters:
 *     - in : path
 *       name: userid
 *     requestBody:
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     expenseId:         
 *                        type: integer
 *                     userid:          
 *                        type: string
 *                     userpaid:         
 *                        type: integer
 *                     userowedshare:          
 *                        type: integer
 *                     friends:
 *                        type : array
 *                        items : 
 *                           type : object
 *                           properties:
 *                             id : 
 *                                type : string
 *                             paidShare :
 *                                type : integer
 *                             owedShare :
 *                                type : integer
 *                     description :
 *                        type : string
 *                     amount :
 *                        type : string
 *                     date :
 *                        type : string
 *                     groupId :
 *                        type : integer
 *     responses:
 *         '200':
 *             description: successfull response
 *         '500':
 *             description: internal server error
 * 
 */
router.post('/:userid/addexpense', async function (req, res, next) {
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
  }).catch((err) => next(err));
})



/**
 * @swagger
 *
 * /users/{userid}/deleteexpense/{expenseid}:
 *   delete:
 *     description: delete a expense
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: expenseid
 *         in: path
 *         description: delete expense.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */

router.delete('/:userid/deleteexpense/:expenseid', async function (req, res, next) {
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
  }).catch((err) => next(err));
})


/**
 * @swagger
 *
 * /users/{userid}/settleup:
 *   post:
 *     description: settlup
 *     produces:
 *     - application/json
 *     parameters:
 *     - in : path
 *       name: userid
 *     requestBody:
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     expenseId:         
 *                        type: integer
 *                     userId:          
 *                        type: string
 *                     userpaid:         
 *                        type: integer
 *                     userowedshare:          
 *                        type: integer
 *                     friendId:
 *                        type : string
 *                     friendpaid:         
 *                        type: integer
 *                     friendowedShare :          
 *                        type: integer
 *                     description :
 *                        type : string
 *                     amount :
 *                        type : integer
 *                     date :
 *                        type : string
 *     responses:
 *         '200':
 *             description: successfull response
 *         '500':
 *             description: internal server error
 * 
 */

router.post('/:userid/settleup', async function (req, res, next) {
  var settleupDetails = req.body
  // console.log(settleupDetails)
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
  }).catch((err) => next(err))
})

/**
 * @swagger
 *
 * /users/{userid}/deletesettle/{expenseid}:
 *   delete:
 *     description: delete a settle
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: expenseid
 *         in: path
 *         description: delete settle.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */

router.delete('/:userid/deletesettle/:expenseid', async function (req, res, next) {
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
  }).catch((err) => next(err));
})



/**
 * @swagger
 *
 * /users/{userid}/getallgroups:
 *   get:
 *     description: Get all groups
 *     parameters:
 *       - name: userid
 *         in: path
 *         description: Get all groups of a user.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */

router.get('/:userid/getallgroups', async function (req, res, next) {
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
    .catch((err) => next(err));
})




/**
 * @swagger
 *
 * /users/{userid}/getgroup/{groupid}:
 *   get:
 *     description: get a group by groupid
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: groupid
 *         in: path
 *         description: get a expense by groupid
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */

router.get('/:userid/getgroup/:groupid', async function (req, res, next) {
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
    .catch((err) => next(err));
})



/**
 * @swagger
 *
 * /users/{userid}/addgroup:
 *   post:
 *     description: Add a group
 *     produces:
 *     - application/json
 *     parameters:
 *     - in : path
 *       name: userid
 *     requestBody:
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     groupid:         
 *                        type: integer
 *                     name:          
 *                        type: string
 *                     members:
 *                        type : array
 *                        items : 
 *                           type : object
 *                           properties:
 *                             id : 
 *                                type : string
 *                             name :
 *                                type : integer
 *                             email :
 *                                type : integer
 *     responses:
 *         '200':
 *             description: successfull response
 *         '500':
 *             description: internal server error
 * 
 */

router.post('/:userid/addgroup', async function (req, res, next) {
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
  }).catch((err) => next(err));
})

/**
 * @swagger
 *
 * /users/{userid}/deletegroup/{groupid}:
 *   delete:
 *     description: delete a group
 *     parameters:
 *       - name: userid
 *         in: path
 *       - name: groupid
 *         in: path
 *         description: delete group.
 *         required: true
 *     responses:
 *       200:
 *         description: successfull response
 */

router.delete('/:userid/deletegroup/:groupid', async function (req, res, next) {
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
  }).catch((err) => next(err));
})


module.exports = router;
