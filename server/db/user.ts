// tslint:disable:max-classes-per-file
import * as crypto from "crypto";
import Model from "./model";

export interface ICredentials {
  accessToken: string;
  refreshToken: string;
}

export interface ISafeUserData {
  id?: string;
  name?: string;
  email?: string;
  provider?: "local" | "facebook" | "google";
}

export interface IUserData extends ISafeUserData {
  createAt?: string;
  lastLoginAt?: string;
}

export interface ILocalUserData extends IUserData, FirebaseFirestore.DocumentData {
  password?: string;
  passwordHash: Buffer;
  salt: string;
}

export interface ISocialUserData extends IUserData, FirebaseFirestore.DocumentData {
  refreshToken?: string;
  accessToken?: string;
}

export type TUserData = ILocalUserData | ISocialUserData;

export class UserException extends Error {
  public user: ISafeUserData;

  constructor(user: ISafeUserData, message: string = "Incorrect user data") {
    super(message);
    this.user = user;
  }
}

export default class User extends Model {
  public static readonly LOCAL_PROVIDER = "local";
  public static readonly FACEBOOK_PROVIDER = "facebook";
  public static readonly GOOGLE_PROVIDER = "google";

  protected collectionName: string = "users";
  protected data: TUserData;

  constructor(data: TUserData) {
    super();
    this.data = data;
  }

  public getSafeData(data = this.data): ISafeUserData {
    const { id, name, email, provider } = data;
    return { id, name, email, provider };
  }

  public async find(): Promise<FirebaseFirestore.QueryDocumentSnapshot> {
    const collection: FirebaseFirestore.CollectionReference = this.db.collection(
      this.collectionName
    );

    const query: FirebaseFirestore.Query = this.data.id
      ? collection.where("id", "==", this.data.id)
      : collection.where("email", "==", this.data.email);

    const snapshot: FirebaseFirestore.QuerySnapshot = await query
      .where("provider", "==", this.data.provider)
      .limit(1)
      .get();

    return snapshot.docs[0];
  }

  public async sync(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Promise<void> {
    if (!snapshot) snapshot = await this.find();
    Object.assign(this.data, snapshot.data());
  }

  public async login(credentials?: ICredentials): Promise<ISafeUserData> {
    const snapshot: FirebaseFirestore.QueryDocumentSnapshot = await this.find();

    switch (this.data.provider) {
      case User.LOCAL_PROVIDER:
        await this.localLogin(snapshot);
        return this.getSafeData();
      case User.FACEBOOK_PROVIDER:
      case User.GOOGLE_PROVIDER:
        await (snapshot ? this.updateLastAt(snapshot.id) : this.createSocialUser(credentials));
        await this.sync(snapshot);
        return this.getSafeData();
      default:
        throw new UserException(this.data);
    }
  }

  private async localLogin(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Promise<void> {
    if (!snapshot) throw new UserException(this.data);

    const data: ILocalUserData = snapshot.data() as ILocalUserData;
    if (!data) throw new UserException(this.data);

    // prettier-ignore
    const passwordHash: Buffer = crypto.pbkdf2Sync((this.data as ILocalUserData).password, data.salt, 1, 128, "sha1");
    if (passwordHash.toString("base64") !== data.passwordHash.toString("base64"))
      throw new UserException(this.data);

    await this.sync(snapshot);
  }

  private createSocialUser(
    credentials: ICredentials
  ): Promise<FirebaseFirestore.DocumentReference> {
    const date: string = new Date().toISOString();

    return this.db.collection(this.collectionName).add({
      ...this.data,
      ...credentials,
      createAt: date,
      lastLoginAt: date
    });
  }

  private updateLastAt(id: string): Promise<FirebaseFirestore.WriteResult> {
    return this.db
      .collection(this.collectionName)
      .doc(id)
      .update({
        lastLoginAt: new Date().toISOString()
      });
  }
}
