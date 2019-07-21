import cookie from "cookie";
import { DocumentContext } from "next/document";
import Router from "next/router";

export const redirect = (target: string, context?: DocumentContext) => {
  if (context && context.res) {
    // server
    // 303: "See other"
    context.res.writeHead(303, { Location: target });
    context.res.end();
  } else {
    // In the browser, we just pretend like this never even happened ;)
    Router.replace(target);
  }
};

export const parseCookies = (
  context?: DocumentContext,
  options: cookie.CookieParseOptions = {}
): MobilePayment.ICookieParseResult =>
  cookie.parse(
    (context && context.req
      ? context.req.headers.cookie
        ? context.req.headers.cookie
        : ""
      : document.cookie) as string,
    options
  );

export const safe = <T extends object>(
  obj: T,
  fields: string[],
  aliases: { [key: string]: string } = {}
): { [key: string]: any } =>
  fields.reduce((accum, field) => {
    if (field in obj) accum[aliases[field] || field] = obj[field];
    return accum;
  }, {});
