declare namespace MobilePayment.schemes.queries {
  interface IMe {
    id: int;
    name: string;
  }

  interface IGetMeQuery {
    me?: IMe;
  }
}
