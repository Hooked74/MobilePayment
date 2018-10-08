declare namespace MobilePayment.schemes.queries {
  interface IMe {
    id?: int;
    name?: string;
  }

  interface IGetMeQuery {
    me?: IMe;
  }

  interface IOperator {
    id?: string;
    name?: string;
    image?: string;
    balance?: number;
  }

  interface IGetOperatorsQuery {
    operators?: IOperator[];
  }

  interface IGetOperatorByIdQuery {
    operator?: IOperator;
  }
}

declare namespace MobilePayment.schemes.mutations {
  interface IPaymentResponse {
    success?: boolean;
    operatorId?: string;
    balance?: number;
  }

  interface IPaymentArguments {
    variables: { operatorId: string; phoneNumber: string; amount: number };
  }

  interface IPaymentMutation {
    pay?(arguments: IPaymentArguments): any;
  }
}
