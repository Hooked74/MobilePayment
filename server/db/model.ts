import { firestore } from "../config/firebase";

abstract class Model {
  public static uniq(): number {
    const unixTime = Date.now();
    return unixTime + parseInt(`${Math.random() * Math.pow(10, `${unixTime}`.length)}`, 10);
  }

  protected static DB: FirebaseFirestore.Firestore = firestore;
  protected static COLLECTION_NAME: string;
}

export default Model;
