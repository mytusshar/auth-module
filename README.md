
# Independent Authentication Module (IAM)

Nowadays, security of any application has become very important role in developing 
application and more than it maintaining users in the application is critical. 

So instead of creating new users in your application and maintaining its security, 
this library helps you to authenticate users from their existing Google/Facebook/Amazon
accounts and gives you authenticated user directly.

## Features provided by IAM Module
* Provides authenticated users from:

    1. Google

    2. Facebook

    3. Amazon

    In future we will add more.

* Easily configurable.

* Registration feature using provided authentication providers.

    You can add desired registration fields in client application, IAM Module will dynamicaly handles it for you.

* You can configure whether your application wants unique username in your system for each user or not.

* Refreshing session credentials if expired.

* Returns access credentials which can be used to access rest of the Amazon Web Services like DynamoDB, EC2, RDS etc.


## Follow below steps to use IAM module in your existing project.

####  1. Clone this repository on your system

####  2. Check for the config.json file in server

Add following details in it.

- "regFields": If you want registration flow then add registration fields in this array. 
Please make sure to pass all registration fields during registration request.

- "uniqueUsername": If you want unique username for each user in your system,  set this field to "true", 
or else set this field to false. 
Once this field is set to "true" you will have to create index on the "username" column in DynamoDB table in which user data is stored.
If it is set to "false" then username will not have any contraints for its uniqueness in system.

- "serverAddress": When deploying this module on AWS EC2 or Beanstalk, you will have to add IP address of that instance.

- "aws": This field contains all the Amazon Web server details.
    add your AWS "accountId", "awsRegion", "cognitoIdentityPoolId", "iamRoleArn" created for authenticated users.


- Now you have to provide which third party identity providers that you want in your application to support.

    Presently this module supports for:
    * Google
    * Facebook
    * Amazon

    You have to create developer account for those providers on their provided sites, and there you will get 
    "clientID", "clientSecret".
    You have to provide "callback URL" on which third party authentication provider will redirect after successfull authentication.
    You can provide which profile fields you want to read from users's third party account.

- Your IAM Module is ready to use.


####  3. Running Server

* Open project folder in terminal and change to server directory using below command 

    $ cd glm/server

* Install dependencies by executing command 

    $ npm install

* Run server with following command 

    $ node server.js

## We have provided sample client application which demonstrate how to use IAM Module in your application. 

#### Running Client 

* Open project folder in terminal and change to client directory using below command 

    $ cd glm/client

* Open client.html inside your browser 

* You are good to go.


#### Runnig Client application using Tomcat server [ OPTIONAL ]

* Install Tomcat using following link.

    [Tomcat installation]
    
* Then go to /opt/tomcat/webapps folder and paste your client application folder in it.
  Make sure that index.html page should remain in your client application folder.
    You can refer this link for deploying web app in Tomcat server.
    
    [deploying web app on tomcat]

* The open http://localhost:8080/client in your browser.

* You are good to go.


## STATUS CODES Returned by IAM-Module

When any kind of request is sent to IAM-Module then it responds client application with following STUTUS CODES.
These STATUS_CODES can be used in client application.

#### STATUS CODES

* LOGIN_FAILURE = 0:-  Incase of login failure. Very rare response in case of server internal errors. 
Solution: Try logging in again or create an Issue regarding error.

* LOGIN_SUCCESS = 1:-  On successfull login, client will receive this status along with all user data.


* ALREADY_REGISTERED = 2:-  This response encounteres if you are registering with same account again.


* NOT_REGISTERED = 3:  This response encounters if you are logging with non registered account.


* REGISTER_FAILURE = 4:- Incase of register failure. Very rare response in case of server internal errors. 
Solution: Try registering again or create an Issue regarding error.


* NOT_UNIQUE_USERNAME = 5:- This response encounters if your application needs UNIQUE_USERNAME in the system
and client application trying to register with existing username.


* INVALID_USERNAME = 6:-  This response encounters if your application needs UNIQUE_USERNAME in the system.
Invalid userame response occures in case if client is logging in with non-existing username 
or username and identity provider account mismatch.



[Tomcat installation]: https://devops.profitbricks.com/tutorials/how-to-install-and-configure-tomcat-8-on-ubuntu-1604/
[deploying web app on tomcat]: https://stackoverflow.com/questions/3954621/deploying-just-html-css-webpage-to-tomcat
