<h1 align="center"><strong>MobilePayment</strong></h1>

[![Build Status](https://travis-ci.org/Hooked74/MobilePayment.svg?branch=master)](https://travis-ci.org/Hooked74/MobilePayment)

<br />

![](https://i.imgur.com/XqMhdg8.png)

<br />

[Demo](https://mobilepayment.now.sh)

## Quickstart

### Application start

Install all packages `$ npm install`. You can build the developement version of the application using `$ npm run dev`. For the production version use:
```
$ npm run build
$ npm run start-pm2
```
and `$ npm run stop-pm2` to stop **pm2** processes.

### Create user

Using the command `$ npm run create-user` you can create a new user. This command also accepts custom email and password arguments:

```
$ npm run create-user -- -e myemail@mail.com -p secretpassword
```
