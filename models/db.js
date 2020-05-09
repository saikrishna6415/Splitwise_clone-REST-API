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


async function deleteFriend(friendDetails) {
    // const userId = '1'
    const userId = friendDetails.currentUser
    // userId = current user 
    const friendtodelete = await db.collection("users").get()
        .then((snapshot) => {
            snapshot.docs.forEach(doc => {
                if (doc.id === friendDetails.id || doc.id === userId) {
                    var friends = doc.data().friends
                    var friendList = friends.filter(friend => {
                        if (friend.id === friendDetails.id || friend.id === parseInt(userId))
                            return false
                        else {
                            return true;
                        }
                    })
                    //console.log('friends',friendList);
                    db.collection("users").doc(doc.friendDetails.id).update({
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


// async function addExpense(expenseDetails) {
//     var data;
//     var friendData;
//     var fromId;
//     var toId;
//     var amount
//     if (expenseDetails.userpaid > 0 && expenseDetails.friendpaid === 0) {
//         fromId = expenseDetails.friendId
//         toId = expenseDetails.userId
//         amount = expenseDetails.userpaid - expenseDetails.userowedshare
//     } else if (expenseDetails.userpaid > 0 && expenseDetails.friendpaid > 0) {
//         if (expenseDetails.userpaid > expenseDetails.userowedshare) {
//             fromId = expenseDetails.friendId
//             toId = expenseDetails.userId
//             amount = expenseDetails.userpaid - expenseDetails.userowedshare
//         } else if (expenseDetails.userpaid < expenseDetails.userowedshare) {
//             fromId = expenseDetails.userId
//             toId = expenseDetails.friendId
//             amount = expenseDetails.friendowedShare
//         } else {
//             fromId = expenseDetails.userId
//             toId = expenseDetails.friendId
//             amount = expenseDetails.userowedshare - expenseDetails.userpaid
//         }
//     } else if (expenseDetails.userpaid === 0 && expenseDetails.friendpaid > 0) {
//         fromId = expenseDetails.userId
//         toId = expenseDetails.friendId
//         amount = expenseDetails.friendpaid - expenseDetails.friendowedShare
//     }

//     console.log('repayment ' + fromId + 'to ' + toId + 'amount', amount)
//     console.log(fromId)
//     console.log(toId)
//     console.log(amount)
//     const findudata = await db.collection("users").get()
//         .then((snapshot) => {
//             snapshot.docs.forEach((doc) => {
//                 // console.log(doc.id)
//                 if (doc.id === expenseDetails.userId) {
//                     data = doc.data()
//                 }
//                 if (doc.id === expenseDetails.friendId) {
//                     friendData = doc.data()
//                 }
//             })
//         })
//     if ((fromId === expenseDetails.friendId) && (toId === expenseDetails.userId)) {
//         let updateUserdocument = await db.collection('users').doc(expenseDetails.userId).update({
//             expenses: [...data.expenses, {
//                 id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
//                 repayments: [{ from: fromId, to: toId, amount: Math.abs(amount) }]
//             }],
//             totalOwed: Math.abs(data.totalOwed += amount),
//             totalOwe: data.totalOwe,
//             totalBalance: data.totalBalance + (amount),
//             friends: data.friends.map(friend => {
//                 if (friend.id === parseInt(expenseDetails.friendId)) {
//                     friend.balance += (amount)
//                     return friend
//                 }
//                 return friend
//             })
//         })
//         let updateFriendDocument = await db.collection('users').doc(expenseDetails.friendId).update({
//             expenses: [...data.expenses, {
//                 id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
//                 repayments: [{ from: fromId, to: toId, amount: Math.abs(amount) }]
//             }],
//             totalOwe: Math.abs(friendData.totalOwe -= amount),
//             totalOwed: friendData.totalOwed,
//             totalBalance: friendData.totalBalance - (amount),
//             friends: friendData.friends.map(friend => {
//                 if (friend.id === parseInt(expenseDetails.userId)) {
//                     friend.balance -= amount
//                     return friend
//                 }
//                 return friend
//             })
//         })
//     } else {
//         let updateUserdocument = await db.collection('users').doc(expenseDetails.userId).update({
//             expenses: [...data.expenses, {
//                 id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
//                 repayments: [{ from: fromId, to: toId, amount: Math.abs(amount) }]
//             }],
//             totalOwe: Math.abs(data.totalOwe -= amount),
//             totalOwed: data.totalOwed,
//             totalBalance: data.totalBalance - (amount),
//             friends: data.friends.map(friend => {
//                 if (friend.id === parseInt(expenseDetails.friendId)) {
//                     friend.balance -= (amount)
//                     return friend
//                 }
//                 return friend
//             })
//         })
//         let updateFriendDocument = await db.collection('users').doc(expenseDetails.friendId).update({
//             expenses: [...data.expenses, {
//                 id: expenseDetails.expenseId, amount: expenseDetails.amount, description: expenseDetails.description,
//                 repayments: [{ from: fromId, to: toId, amount: Math.abs(amount) }]
//             }],
//             totalOwed: friendData.totalOwed += amount,
//             totalOwe: friendData.totalOwe,
//             totalBalance: friendData.totalBalance + (amount),
//             friends: friendData.friends.map(friend => {
//                 if (friend.id === parseInt(expenseDetails.userId)) {
//                     friend.balance += amount
//                     return friend
//                 }
//                 return friend
//             })
//         })
//     }
//     console.log('user udated')

//     const expenses = await db.collection('users').doc(expenseDetails.userId).get()
//         .then(doc => {
//             return doc.data()
//             // res.status(200).send(doc.data().expenses)
//         });
//     return expenses
// }


async function settleUp(settleupDetails) {
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
        totalBalance: friendData.totalOwed + (friendData.totalOwe - owes),
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

async function addExpenseGroup(expenseDetails) {
    // expenseDetails.friends.forEach(expenseDetail => {
    //     if (expenseDetails.userpaid > 0 && expenseDetail.paidShare === 0) {
    //         fromId = expenseDetail.id
    //         toId = expenseDetails.userid
    //         amount = expenseDetails.userpaid - expenseDetail.owedShare
    //     } else if (expenseDetails.userpaid > 0 && expenseDetail.paidShare > 0) {
    //         if (expenseDetails.userpaid > expenseDetail.owedShare) {
    //             fromId = expenseDetail.id
    //             toId = expenseDetails.userid
    //             amount = expenseDetails.userpaid - expenseDetail.owedShare
    //         } else if (expenseDetails.userpaid < expenseDetail.owedShare) {
    //             fromId = expenseDetails.userid
    //             toId = expenseDetail.id
    //             amount = expenseDetail.owedShare
    //         } else {
    //             fromId = expenseDetails.userid
    //             toId = expenseDetail.id
    //             amount = expenseDetails.userowedshare - expenseDetail.paidShare
    //         }
    //     } else if (expenseDetails.userpaid === 0 && expenseDetail.paidShare > 0) {
    //         fromId = expenseDetails.userid
    //         toId = expenseDetail.id
    //         amount = expenseDetail.paidShare - expenseDetail.owedShare
    //     }
    //     repayment.push({ from: fromId, to: toId, amount: Math.abs(amount) })

    // })
    // console.log(repayment)
    db.collection("users").get()
        .then((snapshot) => {
            // console.log(expenseDetails.friends)
            let friendarr = []
            snapshot.docs.forEach((doc) => {
                // console.log(doc.id)
                var ispresent = expenseDetails.friends.some((function (friend) { return friend.id === doc.id }))
                // console.log(ispresent)

                if (expenseDetails.friends.some((function (friend) { return friend.id === doc.id })) || doc.id === expenseDetails.userid) {
                    console.log(doc.id)
                    var data = newExpense(expenseDetails, doc.data(), doc.id)
                    db.collection("users").doc(doc.id).update({
                        ...data
                    })
                    console.log(data)
                }
            })
        })
    function newExpense(bill, data, id) {
        data.expenses.unshift(bill);
        const n = bill.friends.length;
        const split = bill.amount / (n + 1);
        if (bill.friends.some((function (frnd) { return frnd.id === id }))) {
            data.friends.forEach((friend) => {
                console.log(friend.id, bill.userid)
                if (friend.id === parseInt(bill.paidbyId)) {
                    friend.balance -= split;
                }
            })
        }
        else {
            data.friends.forEach((friend) => {
                if (bill.friends.some((function (frnd) { return parseInt(frnd.id) === friend.id }))) {
                    friend.balance += split;
                }
            })
        }
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

    const expenses = await db.collection('users').doc(expenseDetails.userid).get()
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
    addExpenseGroup
}