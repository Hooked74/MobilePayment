// tslint:disable:max-classes-per-file
import Model from "./model";

export interface IOperator {
  id: string;
  name: string;
  image: string;
}

export class OperatorException extends Error {}

export default class Operator extends Model {
  public static async findAll(): Promise<IOperator[]> {
    const querySnapshot: FirebaseFirestore.QuerySnapshot = await Model.DB.collection(
      Operator.COLLECTION_NAME
    ).get();
    return querySnapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data() as IOperator
    );
  }

  public static async findById(id: string): Promise<IOperator> {
    const querySnapshot: FirebaseFirestore.QuerySnapshot = await Model.DB.collection(
      Operator.COLLECTION_NAME
    )
      .where("id", "==", id)
      .get();

    if (!querySnapshot.docs[0]) throw new OperatorException("Not found");
    return querySnapshot.docs[0].data() as IOperator;
  }

  protected static COLLECTION_NAME: string = "operators";
}
