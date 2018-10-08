// tslint:disable:max-classes-per-file
import Model from "./model";

export interface ISafeEventData {
  operationId: string;
  operatorId: string;
  userId: string;
  amount: number;
  phoneNumber?: string;
}

export interface IEvent extends ISafeEventData {
  id?: string;
  createAt?: string;
}

export interface IOperatorBalances {
  [key: string]: number;
}

export class EventException extends Error {}

export default class Event extends Model {
  public static async findAll(userId: string): Promise<IEvent[]> {
    const querySnapshot: FirebaseFirestore.QuerySnapshot = await Model.DB.collection(
      Event.COLLECTION_NAME
    )
      .where("userId", "==", userId)
      .get();
    return querySnapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data() as IEvent
    );
  }

  public static async getOperatorBalances(userId: string): Promise<IOperatorBalances> {
    const events: IEvent[] = await Event.findAll(userId);

    return events.reduce((accum, event: IEvent) => {
      if (accum[event.operatorId]) {
        accum[event.operatorId] += parseInt(event.amount as any, 10);
      } else {
        accum[event.operatorId] = parseInt(event.amount as any, 10);
      }
      return accum;
    }, {});
  }

  public static async getOperatorBalance(userId: string, operatorId: string): Promise<number> {
    const snapshot: FirebaseFirestore.QuerySnapshot = await Model.DB.collection(
      Event.COLLECTION_NAME
    )
      .where("userId", "==", userId)
      .where("operatorId", "==", operatorId)
      .get();

    const events: IEvent[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data() as IEvent
    );

    return events.reduce((accum, event: IEvent) => (accum += parseInt(event.amount as any, 10)), 0);
  }

  protected static COLLECTION_NAME: string = "events";

  private data: IEvent;

  public constructor(event: IEvent) {
    super();
    this.data = event;
  }

  public getSafeData(data = this.data): ISafeEventData {
    const { operationId, operatorId, userId, amount, phoneNumber } = data;
    return { operationId, operatorId, userId, amount, phoneNumber };
  }

  public async save(): Promise<void> {
    const documentRef: FirebaseFirestore.DocumentReference = await Model.DB.collection(
      Event.COLLECTION_NAME
    ).add({
      ...this.getSafeData(),
      id: `${Model.uniq()}`,
      createAt: new Date().toISOString()
    });
    if (!documentRef.id) throw new EventException("Failed to save record");
  }
}
