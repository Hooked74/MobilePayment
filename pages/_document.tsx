// tslint:disable:max-classes-per-file
import Document, {
  DefaultDocumentIProps,
  DocumentProps,
  Head,
  Main,
  NextDocumentContext,
  NextScript
} from "next/document";
import { Component } from "react";

declare class NextDocumentComponent<P = {}> extends Component<
  P & DefaultDocumentIProps & DocumentProps
> {
  public static getInitialProps(context: NextDocumentContext): Promise<DefaultDocumentIProps>;
}

const NextDocument: typeof NextDocumentComponent = Document as any;

export default class PaymentDocument extends NextDocument {
  public static async getInitialProps(ctx: NextDocumentContext): Promise<any> {
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
