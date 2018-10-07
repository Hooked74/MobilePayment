require("classlist-polyfill");
require("url-polyfill");
require("core-js");

if (process.env.NODE_ENV === "test") {
  require("raf").polyfill(global);
}
