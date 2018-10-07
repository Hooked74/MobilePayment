import { firestore } from "../config/firebase";

abstract class Model {
  public db: FirebaseFirestore.Firestore = firestore;
  protected collectionName: string;
}

export default Model;
