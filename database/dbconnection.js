var admin = require("firebase-admin");

var serviceAccount = require('./database.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://splitwise-7d6e6.firebaseio.com"
});

const db = admin.firestore()

module.exports = { db }