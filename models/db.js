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

async function addFriend(friendDetails, id) {
    const user = id
    // const user = friendDetails.currentUser
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
                        // console.log('friend exist')
                        status = false
                    }
                })
            }
            if (status === true && flag === true) {
                db.collection("users").doc(user).update({
                    friends: [...userDetails.friends, { name: newFriendDetails.name, id: parseInt(newFriendId), email: newFriendDetails.email, balance: 0 }]
                })
                // console.log(newFriendId)
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


async function deleteFriend(friendDetails, id) {
    // const userId = '1'
    const userId = id
    // userId = current user 
    const friendtodelete = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                if (doc.id === friendDetails || doc.id === userId) {
                    var friends = doc.data().friends
                    var friendList = friends.filter(friend => {
                        if (friend.id === parseInt(friendDetails) || friend.id === parseInt(userId))
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
            // console.log(doc.data)
            // res.status(200).send(doc.data())
            return doc.data()
        });
    return deletedFriend
}

async function settleUp(settleupDetails, userId) {
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

    // console.log(owes)
    const findudata = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                // console.log(doc.id)
                if (doc.id === settleupDetails.userId || doc.id === settleupDetails.friendId) {
                    var data = settleUp(settleupDetails, doc.data(), doc.id)
                    // console.log(data);
                    db.collection("users").doc(doc.id).set({
                        ...data
                    })
                }
                // if (doc.id === settleupDetails.friendId) {
                //     friendData = doc.data()
                // }
            })
        })
    function settleUp(settle, data, id) {
        if (settle.friendpaid > 0 && settle.userpaid === 0) {
            var settleupDetails = { expenseId: settle.expenseId, description: 'payment', fromId: settle.friendId, toId: settle.userId, friendpaid: settle.friendpaid, amount: settle.amount }
        } else if (settle.friendpaid === 0 && settle.userpaid > 0) {
            var settleupDetails = { expenseId: settle.expenseId, description: 'payment', fromId: settle.userId, toId: settle.friendId, userpaid: settle.userpaid, amount: settle.amount }

        }
        data.expenses.push(settleupDetails)
        data.friends.forEach((frnd) => {
            if (frnd.id === parseInt(settle.friendId) && id === settle.userId) {
                frnd.balance -= settle.amount;
            }
            if (frnd.id === parseInt(settle.userId) && id === settle.friendId) {
                frnd.balance += settle.amount;
            }
        });
        data.totalBalance = 0;
        data.totalOwe = 0;
        data.totalOwed = 0;
        data.friends.forEach(frnd => {
            if (frnd.balance > 0) {
                data.totalOwed += frnd.balance;
                data.totalBalance += frnd.balance;
            }
            if (frnd.balance < 0) {
                data.totalOwe -= frnd.balance;
                data.totalBalance += frnd.balance;
            }
        })

        return data
    }
    const settle = await db.collection('users').doc(userId).get()
        .then(doc => {
            return doc.data().expenses
            // res.status(200).send(doc.data().expenses)
        });
    return settle

}

async function addExpenseGroup(expenseDetails, userId) {
    var alldetails = [{ paidShare: expenseDetails.userpaid, id: expenseDetails.userid, owedShare: expenseDetails.userowedshare }]

    expenseDetails.friends.forEach(friend => {
        alldetails.push({ paidShare: friend.paidShare, id: friend.id, owedShare: friend.owedShare })
    })
    for (let i = 0; i < alldetails.length; i++) {
        alldetails[i].balance = alldetails[i].paidShare - alldetails[i].owedShare
    }
    const expenseInfo = { expenseId: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description, payments: alldetails }
    const addexpense = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if (alldetails.some((function (user) { return user.id === doc.id }))) {
                    // console.log(doc.id)
                    var data = newExpense(expenseInfo, alldetails, doc.data(), doc.id)
                    db.collection("users").doc(doc.id).update({
                        ...data,
                        // expenses: [...data.expenses, expenseInfo]
                    })
                    // console.log(data)
                }
            })
        }).then(() => {
            expenseData = db.collection('users').doc(expenseDetails.userid).get()
                .then(doc => {
                    return doc.data()
                    // res.status(200).send(doc.data().expenses)
                });
        })
    function newExpense(expense, bill, data, id) {
        // console.log(expense)
        data.expenses.unshift(expense);
        // const n = bill.friends.length;
        if (alldetails.some((user) => {
            if (user.id === id)
                return user
        })) {

            for (let i = 0; i < bill.length; i++) {
                if ((bill[i].id) === id) {
                    console.log("amount", bill[i].paidShare - bill[i].owedShare)
                    // var amount = 
                }
            }
            data.friends.forEach(friend => {
                var amount = 0
                for (let i = 0; i < bill.length; i++) {
                    if (parseInt(bill[i].id) === friend.id) {
                        friend.balance -= bill[i].paidShare - bill[i].owedShare
                    }
                }
            })

            console.log('ext')

        }
        data.totalOwed = 0
        data.totalBalance = 0
        data.totalOwe = 0
        // data.expenses = [...data.expenses, expenseInfo]

        data.friends.forEach(frnd => {
            // console.log(frnd)
            if (frnd.balance > 0) {
                data.totalOwed += frnd.balance;
                data.totalBalance += frnd.balance;
            }
            if (frnd.balance < 0) {
                data.totalOwe -= frnd.balance;
                data.totalBalance += frnd.balance;
            }
        })
        // console.log(data)

        return data
    }
    const expenses = await db.collection('users').doc(userId).get()
        .then(doc => {
            return doc.data()
            // res.status(200).send(doc.data().expenses)
        });
    return expenses
}

async function deleteExpense(expenseDetails,user) {
    var expenseInfo = expenseDetails.payments
    // console.log(expenseInfo)
    const addexpense = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach((doc) => {
                if (expenseInfo.some((function (user) { return user.id === doc.id }))) {
                    // console.log(doc.id)
                    var data = newExpense(expenseDetails, expenseInfo, doc.data(), doc.id)
                    db.collection("users").doc(doc.id).update({
                        ...data,
                        // expenses: [...data.expenses, expenseInfo]
                    })
                    // console.log(data)
                }
            })
        })
        // .then(() => {
        //     expenseData = db.collection('users').doc(user).get()
        //         .then(doc => {
        //             return doc.data()
        //             // res.status(200).send(doc.data().expenses)
        //         });
        // })
    function newExpense(expense, bill, data, id) {
        const index = data.expenses.findIndex(Item => Item.id === expense.expenseId);
        // console.log(index)
        data.expenses.splice(index, 1);

        // console.log(expense)
        // data.expenses.unshift(expense);
        // const n = bill.friends.length;
        if (expenseInfo.some((user) => {
            if (user.id === id)
                return user
        })) {

            for (let i = 0; i < bill.length; i++) {
                if ((bill[i].id) === id) {
                    // console.log("amount", bill[i].paidShare - bill[i].owedShare)
                    var amount = bill[i].paidShare - bill[i].owedShare
                }
            }
            data.friends.forEach(friend => {
                // var amount = 0

                for (let i = 0; i < bill.length; i++) {
                    if (parseInt(bill[i].id) === friend.id) {
                        friend.balance += bill[i].paidShare - bill[i].owedShare
                    }
                }
            })

            // console.log('ext')

        }
        data.totalOwed = 0
        data.totalBalance = 0
        data.totalOwe = 0
        // data.expenses = [...data.expenses, expenseInfo]

        data.friends.forEach(frnd => {
            // console.log(frnd)
            if (frnd.balance > 0) {
                data.totalOwed += frnd.balance;
                data.totalBalance += frnd.balance;
            }
            if (frnd.balance < 0) {
                data.totalOwe -= frnd.balance;
                data.totalBalance += frnd.balance;
            }
        })
        // console.log(data)

        return data
    }
    const expenses = await db.collection('users').doc(user).get()
        .then(doc => {
            return doc.data()
            // res.status(200).send(doc.data().expenses)
        });
    return expenses
}




module.exports = {
    getUser,
    getFriends,
    addFriend,
    deleteFriend,
    getAllusers,
    // addExpense, 
    settleUp,
    addExpenseGroup,
    deleteExpense,
    //  dummycal
}