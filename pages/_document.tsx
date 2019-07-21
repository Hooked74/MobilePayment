// tslint:disable:max-classes-per-file
import Document, {
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
  Head,
  Main,
  NextScript
} from "next/document";
import { Component } from "react";

declare class NextDocumentComponent<P = {}> extends Component<
  P & DocumentInitialProps & DocumentProps
> {
  public static getInitialProps(context: DocumentContext): Promise<DocumentInitialProps>;
}

const NextDocument: typeof NextDocumentComponent = Document as any;

export default class PaymentDocument extends NextDocument {
  public static async getInitialProps(ctx: DocumentContext): Promise<any> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  public render() {
    return (
      <html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
