var admin = require("firebase-admin");

var serviceAccount = require("./tamang-app-firebase-adminsdk-bnzn4-91f1c23b3e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
