var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");

var serviceAccount = require('../database/database.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://splitwise-7d6e6.firebaseio.com"
});

const db = admin.firestore()


// router.get('/', function (req, res) {
//   db.collection('users').get()
//     .then(snapshot => {
//       var users = snapshot.docs.map(doc => doc.data())
//       console.log(users)
//       res.status(200).send(users)
//     });
// });

// router.get('/:id', function (req, res) {
//   var id = req.params.id
//   console.log(id)
//   db.collection('users').doc(id).get()
//     .then(doc => {
//       res.status(200).send(doc.data())
//     })
// });

router.get('/getfriends', function (req, res) {
  // var id = "1"
  // id = current user 
  console.log(id)
  db.collection('users').doc(id).get()
    .then(doc => {
      res.status(200).send(doc.data().friends)
    })
});



router.post('/addfriend', async function (req, res) {
  // const user = '1'
  // id = current user
  var newFriendDetails
  var userDetails;
  var newFriendId
  const userData = await db.collection('users').doc(user).get()
    .then(doc => {
      // console.log(doc)
      userDetails = doc.data()
      // console.log(userDetails)
    })

  const friendData = await db.collection("users").get()
    .then((snapshot) => {
      var status = true
      var flag = false

      snapshot.docs.forEach(doc => {
        // console.log(doc.id)
        if (doc.data().email === req.body.email) {
          newFriendDetails = doc.data()
          newFriendId = doc.id
          flag = true;
        }
      })
      console.log(userDetails)
      console.log(newFriendDetails)
      console.log(newFriendId)

      var status

      if (userDetails.friends.length > 0) {
        userDetails.friends.forEach((friend) => {
          if (friend.email === newFriendDetails.email) {
            console.log('friend exist')
            status = false
          }
          // status = true
        })
      }
      if (status === true && flag === true) {
        db.collection("users").doc(user).update({
          friends: [...userDetails.friends, { name: newFriendDetails.name, id: newFriendId, email: newFriendDetails.email, owes: 0 }]
        })
        console.log(newFriendId)
        db.collection("users").doc(newFriendId).update({
          friends: [...newFriendDetails.friends, { id: userDetails.id, name: userDetails.name, email: userDetails.email, owes: 0 }]
        })
      };
      db.collection('users').doc(user).get()
        .then(doc => {
          res.status(200).send(doc.data())
        });
    }
    )
});


router.delete('/deletefriend/:id', async function (req, res) {

  const userId = '1'
  // userId = current user 

  const friendId = req.params.id

  const deleteFriend = await db.collection("users").get()
    .then((snapshot) => {
      snapshot.docs.forEach(doc => {
        if (doc.id === friendId || doc.id === userId) {
          var friends = doc.data().friends
          var friendList = friends.filter(friend => {
            if (friend.id === friendId || friend.id === parseInt(userId))
              return false
            else {
              return true;
            }
          })
          //console.log('friends',friendList);
          db.collection("users").doc(doc.id).update({
            friends: friendList
          })
          console.log('friend deleted')
        }
      })
    })
  db.collection('users').doc(userId).get()
    .then(doc => {
      res.status(200).send(doc.data())
    });

})


module.exports = router;
