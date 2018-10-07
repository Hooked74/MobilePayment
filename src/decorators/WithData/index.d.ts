declare namespace MobilePayment.decorators.WithData {
  interface IProps<T> {
    serverState: T;
  }
  interface IState {}

  interface IURLProps {
    query: any;
    pathname: string;
  }
}
