import firebase from "firebase-admin";
import * as cert from "./serviceAccountKey.json";

firebase.initializeApp({
  credential: firebase.credential.cert(cert as any),
  databaseURL: process.env.DATABASE_URL
});

const firestore: FirebaseFirestore.Firestore = firebase.firestore();
firestore.settings({ timestampsInSnapshots: true });

export { firestore };
export default firebase;
