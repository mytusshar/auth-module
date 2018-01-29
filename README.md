
# Generalized Login Module #

Nowadays, security of any application has become very important role in developing 
application and more than it maintaining users in the application is critical. 

So instead of creating new users in your application and maintaining its security, 
this library helps you to authenticate users from their existing Google/Facebook/Amazon
accounts and gives you authenticated user directly.
    

## Follow below steps to run the project on your system ##

###1. Clone this repository on your system ###

###2. Running Server ###

* Open project folder in terminal and change to server directory using below command 

    $ cd glm/server

* Install dependencies by executing command 

    $ npm install

* Run server with following command 

    $ node server.js

###3. Running Client ###

* Open project folder in terminal and change to client directory using below command 

    $ cd glm/client

* Open client.html inside your browser 

* Click on "Login with Facebook" button and enter your login details on the facebook login page 
  that will popup. The "Result Text" below login button will be replaced by your UserName, Email and 
  Facebook_Token on successful login.


###4. Runnig Client application using Tomcat server [OPTIONAl] ###

* Install Tomcat using following link.

    https://devops.profitbricks.com/tutorials/how-to-install-and-configure-tomcat-8-on-ubuntu-1604/

* Then go to /opt/tomcat/webapps folder and paste your client application folder in it.
  Make sure that index.html page should remain in your client application folder.

  You can refer this link for deploying web app in Tomcat server.
  https://stackoverflow.com/questions/3954621/deploying-just-html-css-webpage-to-tomcat

* The open http://localhost:8080/client in your browser.

* The click on "Login with Facebook" button and enter your login details on the facebook login page 
  that will popup. The "Result Text" below login button will be replaced by your UserName, Email and 
  Facebook_Token on successful login.