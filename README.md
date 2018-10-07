<h1 align="center"><strong>MobilePayment</strong></h1>

[![Build Status](https://travis-ci.org/Hooked74/MobilePayment.svg?branch=master)](https://travis-ci.org/Hooked74/MobilePayment)

<br />

![](https://i.imgur.com/XqMhdg8.png)

<br />

[Demo](https://mysterious-peak-44366.herokuapp.com/)

## Quickstart

### Application start

Install all packages `$ yarn install`. You can build the developement version of the application using `$ yarn dev`. For the production version use:
```
$ yarn build
$ yarn start-pm2
```
and `$ yarn stop-pm2` to stop **pm2** processes.

### Create user

Using the command `$ yarn create-user` you can create a new user. This command also accepts custom email and password arguments:

```
$ yarn create-user -e myemail@mail.com -p secretpassword
```

## Refactoring result

```js
const highestLastIndex = (s, a, b) => Math.max(s.lastIndexOf(a), s.lastIndexOf(b));
```
