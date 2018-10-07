declare namespace MobilePayment {
  interface IncomingHttpHeaders {
    [header: string]: string;
  }

  interface ICookieParseResult {
    [key: string]: string;
  }

  interface IApolloInitOptions {
    getToken(): string;
  }
}
