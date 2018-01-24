
# Generalized Login Module #

Nowadays, security of any application has become very important role in developing 
application and more than it maintaining users in the application is critical. 

So instead of creating new users in your application and maintaining its security, 
this library helps you to authenticate users from their existing Google/Facebook/Amazon
accounts and gives you authenticated user directly.
    

## Follow below steps to run the project on your system ##

### 1. Clone this repository on your system ###

### 2. Running Server ###

    a) Open project folder in terminal and change to server directory using below command 

        `$ cd glm/server`

    b) Install dependencies by executing command 

        `$ npm install` 

    c) Run server with following command 

        `$ node server.js` 

### 3. Running Client ###

    a) Open project folder in terminal and change to client directory using below command 

        `$ cd glm/client` 

    b) Open client.html inside your browser 

    c) Click on "Login with Facebook" button and enter your login details on the facebook login page 
       that will popup. The "Result Text" below login button will be replaced by your UserName, Email and 
       Facebook_Token on successful login.