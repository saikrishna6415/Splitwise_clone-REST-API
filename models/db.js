var admin = require("firebase-admin");

var serviceAccount = require('../database/database.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://splitwise-7d6e6.firebaseio.com"
});

const db = admin.firestore()


async function getAllusers() {
    const data = await db.collection('users').get()
        .then(snapshot => {
            var users = snapshot.docs.map(doc => doc.data())
            // console.log(users)
            return users
            // res.status(200).send(users)
        });
    return data
}

async function getUser(id) {
    const data = await db.collection('users').doc(id).get()
        .then(doc => {
            return doc.data()
        })
    return data
}

async function getFriends(id) {
    const friendsData = await db.collection('users').doc(id).get()
        .then(doc => {
            return doc.data().friends
        })
        .catch(err => console.log(err))
    return friendsData
}

async function addFriend(friendDetails) {
    const user = '1'
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
                if (doc.data().email === friendDetails.email) {
                    newFriendDetails = doc.data()
                    newFriendId = doc.id
                    flag = true;
                }
            })
            // var status
            if (userDetails.friends.length > 0) {
                userDetails.friends.forEach((friend) => {
                    if (friend.email === newFriendDetails.email) {
                        console.log('friend exist')
                        status = false
                    }
                })
            }
            if (status === true && flag === true) {
                db.collection("users").doc(user).update({
                    friends: [...userDetails.friends, { name: newFriendDetails.name, id: parseInt(newFriendId), email: newFriendDetails.email, balance: 0 }]
                })
                console.log(newFriendId)
                db.collection("users").doc(newFriendId).update({
                    friends: [...newFriendDetails.friends, { id: parseInt(userDetails.id), name: userDetails.name, email: userDetails.email, balance: 0 }]
                })
            };
        })
        .catch(err => console.log(err))
    const newFriend = await db.collection('users').doc(user).get()
        .then(doc => {
            return doc.data()
            // res.status(200).send(doc.data())
        });
    return newFriend

}


async function deleteFriend(id) {
    const userId = '1'
    // userId = current user 
    const friendtodelete = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                if (doc.id === id || doc.id === userId) {
                    var friends = doc.data().friends
                    var friendList = friends.filter(friend => {
                        if (friend.id === id || friend.id === parseInt(userId))
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
    const deletedFriend = await db.collection('users').doc(userId).get()
        .then(doc => {
            console.log(doc.data)
            // res.status(200).send(doc.data())
            return doc.data()
        });
    return deletedFriend
}


async function addExpense(expenseDetails) {

    // var expenseId = 4
    // var userId = '1'
    // var userpaid = 50
    // var userowedshare = 25
    // var friendId = '2'
    // var friendpaid = 0
    // var friendowedShare = 0
    // var description = 'cooldrinks'
    // var amount = 50
    var data;
    var owes;
    var friendData;
    var fromId;
    var toId;
    if (expenseDetails.userpaid === 0 && expenseDetails.friendpaid > 0) {
        owes = expenseDetails.friendowedShare
        fromId = expenseDetails.userId
        toId = expenseDetails.friendId
    } else if (expenseDetails.userpaid > 0 && expenseDetails.friendpaid === 0) {
        owes = expenseDetails.userowedshare
        fromId = expenseDetails.friendId
        toId = expenseDetails.userId
    } else if (userpaid === friendpaid) {
        owes = 0
        fromId = expenseDetails.userId
        toId = expenseDetails.friendId
    }
    else if (expenseDetails.userpaid + expenseDetails.friendpaid === expenseDetails.amount) {
        if (expenseDetails.userpaid > expenseDetails.friendpaid) {
            fromId = expenseDetails.friendId
            toId = expenseDetails.userId
        }
        else {
            fromId = expenseDetails.userId
            toId = expenseDetails.friendId
        }
        owes = (expenseDetails.userpaid - expenseDetails.friendpaid) / 2
    }
    const findudata = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                // console.log(doc.id)
                if (doc.id === expenseDetails.userId) {
                    data = doc.data()
                }
                if (doc.id === expenseDetails.friendId) {
                    friendData = doc.data()
                }
            })
        })
    let updateUserdocument = await db.collection('users').doc(expenseDetails.userId).update({
        expenses: [...data.expenses, {
            id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
            repayments: [{ from: fromId, to: toId, amount: Math.abs(owes) }]
        }],
        totalOwed: data.totalOwed + owes,
        totalBalance: data.totalOwed + owes - data.totalOwe,
        friends: data.friends.map(friend => {
            if (friend.id === parseInt(expenseDetails.friendId)) {
                friend.balance += owes
                return friend
            }
            return friend
        })
    })
    console.log('user udated')
    let updateFriendDocument = await db.collection('users').doc(expenseDetails.friendId).update({
        expenses: [...data.expenses, {
            id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
            repayments: [{ from: fromId, to: toId, amount: owes }]
        }],
        totalOwe: friendData.totalOwe + owes,
        totalBalance: friendData.totalOwed - (friendData.totalOwe + owes),
        friends: friendData.friends.map(friend => {
            if (friend.id === parseInt(expenseDetails.userId)) {
                friend.balance -= owes
                return friend
            }
            return friend
        })
    })
        .catch(err => console.log(err))
    const expenses = await db.collection('users').doc(expenseDetails.userId).get()
        .then(doc => {
            return doc.data()
            // res.status(200).send(doc.data().expenses)
        });
    return expenses
}


async function settleUp(settleupDetails) {
    // var expenseId = 5
    // var userId = '1'
    // var userpaid = 0
    // var userowedshare = 25
    // var friendId = '2'
    // var friendpaid = 25
    // var friendowedShare = 0
    // var amount = 25
    var data;
    var owes;
    var friendData;
    var fromId;
    var toId;
    if (settleupDetails.userpaid > 0) {
        owes = settleupDetails.userpaid
        fromId = settleupDetails.friendId
        toId = settleupDetails.userId

    }
    else {
        owes = settleupDetails.friendpaid
        fromId = settleupDetails.userId
        toId = settleupDetails.friendId
    }
    // owes = (userpaid - friendpaid) / 2

    console.log(owes)
    const findudata = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                console.log(doc.id)
                if (doc.id === settleupDetails.userId) {
                    data = doc.data()
                }
                if (doc.id === settleupDetails.friendId) {
                    friendData = doc.data()
                }
            })
        })
    let updateUserdocument = await db.collection('users').doc(settleupDetails.userId).update({
        expenses: [...data.expenses, {
            id: settleupDetails.expenseId, amount: settleupDetails.amount, description: 'payment',
            repayments: [{ from: fromId, to: toId, amount: Math.abs(owes) }]
        }],
        totalOwed: data.totalOwed - owes,
        totalBalance: data.totalOwed - (data.totalOwe + owes),
        friends: data.friends.map(friend => {
            if (friend.id === parseInt(settleupDetails.friendId)) {
                friend.balance -= owes
                return friend
            }
            return friend
        })
    })
    console.log('user udated')
    let updateFriendDocument = await db.collection('users').doc(settleupDetails.friendId).update({
        expenses: [...data.expenses, {
            id: settleupDetails.expenseId, amount: settleupDetails.amount, description: 'payment',
            repayments: [{ from: fromId, to: toId, amount: Math.abs(owes) }]
        }],
        totalOwe: friendData.totalOwe - owes,
        totalBalance: friendData.totalOwed - (friendData.totalOwe - owes),
        friends: friendData.friends.map(friend => {
            if (friend.id === parseInt(settleupDetails.userId)) {
                friend.balance += owes
                return friend
            }
            return friend
        })
    })
        .catch(err => console.log(err))
    const settle = await db.collection('users').doc(settleupDetails.userId).get()
        .then(doc => {
            return doc.data().expenses
            // res.status(200).send(doc.data().expenses)
        });
    return settle

}

module.exports = {
    getUser,
    getFriends,
    addFriend,
    deleteFriend,
    getAllusers,
    addExpense,
    settleUp,
}