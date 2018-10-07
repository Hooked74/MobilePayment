const program = require("commander");
const firebase = require("firebase-admin");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

firebase.initializeApp({
  credential: firebase.credential.cert(require("../server/config/serviceAccountKey.json")),
  databaseURL: process.env.DATABASE_URL
});

const firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

program
  .option("-e, --email", "Custom email")
  .option("-p, --password", "Custom password")
  .parse(process.argv);

let data;

firestore
  .collection("users")
  .where("provider", "==", "local")
  .get()
  .then(snapshot => {
    const uid = snapshot.docs.length + 1;
    const password = program.password || "secretPassword";
    const salt = crypto.randomBytes(128).toString("base64");
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1, 128, "sha1");

    const userData = {
      id: `${uid}`,
      name: "John Doe",
      email: program.email || `user${uid}@example.com`,
      createAt: new Date().toISOString(),
      lastLoginAt: null,
      passwordHash,
      salt,
      provider: "local"
    };
    data = { ...userData, password };

    return firestore.collection("users").add(userData);
  })
  .then(() => console.log(data))
  .catch(e => console.log(e));
