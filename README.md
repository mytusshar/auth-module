# Independent Authentication Module (IAM-Auth)

Nowadays, security of any application has become very important role in developing 
application and more than it maintaining users in the application is critical. 

So instead of creating new users in your application and maintaining its security, 
this library helps you to authenticate users from their existing Google/Facebook/Amazon
accounts and gives you authenticated user directly.

## Features provided by IAM-Auth Module
- #### Provides authenticated users from:

   ##### 1. Google

   ##### 2. Facebook

   ##### 3. Amazon

   In future we will add more.

- #### Easily configurable.

- #### Support for Web applications and Mobile applications.

- #### It handles three project use-cases:
  Developer can choose any one use-case according to project requirement.

   ##### 1. Only Login feature:    
   In this use-case devloper can directly use IAM-Auth module to Login users 
      into devloper's project. 
      It does not require registration flow. It internally handles it.

   ##### 2. Registration-Login feature without Unique Username in the System:    
   In this use-case developer can provide set of registration fields 
      during registration. 
      IAM-Auth module will not check for uniqueness of Username in this use- 
      case.
      User need to be registered before logging in. 
      During login user does not have to provide usename.

   ##### 3. Registration-Login feature with Unique Username in the System:   
     In this use-case developer can provide set of registration fields during 
     registration. 
     IAM-Auth module will explicitly check for uniqueness of Username in this 
     use-case.
     User need to be registered before logging in. 
     Username is mandatory during login.

- #### Returns access credentials which can be used to access rest of the Amazon Web Services like DynamoDB, EC2, RDS etc.




## Follow below steps to use IAM-Auth module in your existing project.

#### 1. Clone this repository on your system

#### 2. Check for the `config.json` file in IAM-Auth

   ##### Based on devloper's requirement, choose one of the use-cases and add the following details in it.

  * ##### "regFields":    
                                                                      
       Only if you want Registration-Login flow then add registration fields 
       in this array. 
       Please make sure to pass all registration fields during registration 
       request.

  * ##### "uniqueUsername":
       If you want Registration-Login feature with Unique Username in the 
       System, set this field to `true`, 
       or remove it if not needed.
       Once this field is set to `true` you will have to create index on the 
       `username` column in DynamoDB table in which user data is stored.
       If it is set to `false` then username will not have any contraints for 
       its uniqueness in system.

  * ##### "serverAddress": 
       When deploying this module on AWS EC2 or Beanstalk, you will have to 
       add IP address of that instance.

  * ##### "aws":
       This field contains all the Amazon Web server details.
       add your AWS `accountId`, `awsRegion`, `cognitoIdentityPoolId`, 
       `iamRoleArn` created for authenticated users.

  * ##### "tableName":
       Enter the name of the table creating in DynamoDB.

  * ##### "tableKey":
       Enter name of the partition key provided while creating above table.

  * ##### "indexName":
       Enter the name of the index created in DynamoDB on above table (This is in case of Unique username requirement).
       
  * ##### "indexKey":
       Enter name of the index key provided while creating above table (This is in case of Unique username requirement).
       Make sure that partition key column should be present in table.

  * ##### Now you have to provide which third party identity providers that you want in your application to support.
      Presently IAM-Auth module supports for:
      * Google
      * Facebook
      * Amazon

       You have to create developer account for those providers on their provided sites, and there you will get 
    `clientID`, `clientSecret`.
    You have to provide `callback URL` on which third party authentication provider will redirect after successfull authentication.
    You can provide which profile fields you want to read from users's third party account. By default IAM-Auth fetches `username, name, email` information.


``` 
{
    "fields": ["provider", "request", "authId", "cognitoId", "accessKey", "secretKey", "sessionToken"],

    "regFields": ["username", "name", "city", "email"],

    "uniqueUsername": true,       //true or false
    
    "serverAddress": "http://localhost:8081",

    "tableName": "users",

    "tableKey": "cognito_id",

    "indexName": "username-index",

    "indexKey": "username",

    "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
    },

    "facebook": {
        "clientID" : "FACEBOOK CLIENT ID",
        "clientSecret" : "FACEBOOK CLIENT SECRET",
        "callbackURL" : "http://localhost:8081/auth/facebook/callback",     // server-address + /auth/facebook/callback
        "profileFields" : ["displayName", "email", "id"]
    },
    
    "google": {
        "clientID" : "GOOGLE CLIENT ID",
        "clientSecret" : "GOOGLE CLIENT SECRET",
        "callbackURL" : "http://localhost:8081/auth/google/callback",     // server-address + /auth/google/callback
        "profileFields" : ["displayName", "email", "id"]
    },

    "amazon": {
        "clientID" : "AMAZON CLIENT ID",
        "clientSecret" : "AMAZON CLIENT SECRET",
        "callbackURL" : "http://localhost:8081/auth/amazon/callback",     // server-address + /auth/amazon/callback
        "profileFields" : ["displayName", "email", "id"]
    }
}

````
   * ##### Your IAM-Auth Module is ready to use.


#### 3. Running Server

* #### Open project folder in terminal and change to server directory using following command 

    `$ cd glm/server`

* #### Install dependencies by executing command 

    `$ npm install`

* #### Run server with following command 

    `$ node server.js`

## We have provided sample client application which demonstrates how to use IAM-Auth Module in your application. 

### Runnig Client application using Tomcat server [ OPTIONAL ]

* #### Install Tomcat using following link.

    [Tomcat installation]
    
* #### Then go to /opt/tomcat/webapps folder and paste your client application folder in it.
  Make sure that index.html page should remain in your client application folder.
    You can refer this link for deploying web app in Tomcat server.
    
    [deploying web app on tomcat]

* #### Then open [client application] in your browser.

* #### You are good to go.


## Routes provided by IAM-Auth Module
 Following are the routes that are provided by IAM-Auth module which client application should use to get required response.

### 1. "Server_address"/auth:
   Whenever the user wants to login/register then request should be made to this route.

   * #### During login request client should send `provider-name` and `request-type` (it will be "login" in this case) as URL parameter.
       
     #### Example Login Request:
     #### 1. Unique Username case: 

         http://localhost:8081/auth?provider=facebook&request=login&username=myusername

     #### 2. Not Unique Username case: 

         http://localhost:8081/auth?provider=facebook&request=login

* #### During registration request client should send `provider-name` and `request-type` (it will be "register" in this case) and all the registration fields that are required as URL parameter.
       
     #### Example Registration Request:
     #### 1. Unique Username case: 

         http://localhost:8081/auth?provider=facebook&request=register&username=myusername&name=your-name&city=city-name

     #### 2. Not Unique Username case: 

         http://localhost:8081/auth?provider=facebook&request=register&name=your-name&city=city-name


### 2. "Server_address"/refresh:
  When client session will expire, then to get the new session tokens this URL should be requested with `provider-name`, `access-token` and `refresh-token` as HTTP request body parameter. This is POST request.

   #### Example:
   ````
    {
        provider: 'google'
        accessToken: 'google access token',
        refreshToken: 'google refresh token'
    }
   ```` 




## STATUS CODES Returned by IAM-Auth Module

When any kind of request is sent to IAM-Auth Module then it responds client application with following `STATUS_CODES`.
These `STATUS_CODES` can be used in client application.

#### `[STATUS CODES]`

* ##### LOGIN_FAILURE = 0 :             
   Incase of login failure. Very rare response in case of server internal errors. 

   ###### Solution: Try logging in again or create an Issue regarding error.

* ##### LOGIN_SUCCESS = 1 :
  On successfull login, client will receive this status along with all user data.


* ##### ALREADY_REGISTERED = 2 :
  This response encounteres if you are registering with same account again.


* ##### NOT_REGISTERED = 3:
   This response encounters if you are logging with non registered account.


* ##### REGISTER_FAILURE = 4:   
   Incase of register failure. Very rare response in case of server internal errors. 
 
   ###### Solution: Try registering again or create an Issue regarding error.


* ##### NOT_UNIQUE_USERNAME = 5 :
   This response encounters if your application needs `UNIQUE_USERNAME` in the system
and client application trying to register with existing username.


* ##### INVALID_USERNAME = 6 :
    This response encounters if your application needs `UNIQUE_USERNAME` in the system.
Invalid userame response occures in case if client is logging in with non-existing username 
or username and identity provider account mismatch.



[Tomcat installation]: https://devops.profitbricks.com/tutorials/how-to-install-and-configure-tomcat-8-on-ubuntu-1604/
[deploying web app on tomcat]: https://stackoverflow.com/questions/3954621/deploying-just-html-css-webpage-to-tomcat
[client application]: http://localhost:8080/client




# CASE-1: Login-register with unique Username in the system.

   If your requirement is Registration-login flow along with unique username for each user
   then you will have to do the following steps to configure IAM-Auth module.

   - First, modify `config.json` file as shown below for your requirement.
     You can add any registration fields that you want. 
   - Don't change the `username` field. 
   
   - During login, you should send `username` to the server.

   - During registration, you will have to provide all the registration fields that you 
     mentioned in the following file.
 
   ````
   "regFields": ["username", "name", "city", "email"],
   "uniqueUsername": true,      
   ````

## 1. Creating Amazon Web Services account.
  Sign up on aws console, and do the following.

* ### Selecting appropriate Region.
   Select the region as per your convenience. And make sure that during following steps you 
   should select the same region.

   You can get the region name from the following URL. Copy and paste the URL of the homepage 
   of AWS console. The last field in the following URL is `region name`
   
     ex: https://console.aws.amazon.com/console/home?region=`us-east-1`
   
   Paste region name in `awsRegion` field in `config.json` file

   ````
   "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
    },
   ````
  ![1-select region](https://user-images.githubusercontent.com/18484641/40612109-c78f78fc-6296-11e8-8f0d-4d17a0f541b1.jpg)



* ### Getting `aws account ID`:
  - #### Click on `Support` and select `Support Center`.

    ![1- account id](https://user-images.githubusercontent.com/18484641/40612162-050b5ab6-6297-11e8-9b97-6bdd27a44611.jpg)

  - #### Then on next page you will see `account number` that is your `aws account ID`.

    ![2-aws_acc_id](https://user-images.githubusercontent.com/18484641/40612167-0ae0a64e-6297-11e8-9ce8-21c5d91b008a.jpg)

     #### Paste `aws account ID` in `accountId` field in `config.json` file

      ````
       "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
        },
      ````



* ### Creating Table in DynamoDB:
  - #### Search for DynamoDB on AWS console and open it.

    ![01-edit](https://user-images.githubusercontent.com/18484641/38244299-d4bef77e-3757-11e8-83ac-d7b899fd0fd8.png)

  - #### On next page click `create table` button.

    ![02-edit](https://user-images.githubusercontent.com/18484641/38244396-25bfadf8-3758-11e8-9b5a-d18db8fa13e1.png)

  - #### Enter `TableName` and `PrimaryKey` and take a note of both the fields. You will need them in future. After that click `create` button. Your table will be created. 

    ![03-edit](https://user-images.githubusercontent.com/18484641/38244481-74706352-3758-11e8-9b8d-e7732dfcd063.png)

  - #### On next page, you can see `Overview` and your table content in `Items`.

    ![04-edit](https://user-images.githubusercontent.com/18484641/40612437-1c17f9e8-6298-11e8-947b-c8ca3d6fff83.jpg)
  


* ### Creating Index on Table:
  - #### Select `Index` from the navigation pane.

     ![01-edit](https://user-images.githubusercontent.com/18484641/38244853-8f5024a4-3759-11e8-8e4d-37e22ac331b1.png)

  - #### On next page click `Create index` button.
     ![02-edit](https://user-images.githubusercontent.com/18484641/38244942-e8f064b0-3759-11e8-9ac6-ed863dcb024d.png)

  - #### Enter `Primary Key` as `username` and `Index Name` will be automatically created.
  
     ![03-edit](https://user-images.githubusercontent.com/18484641/38245024-2b33f0a8-375a-11e8-89c7-5a2881aa1cff.png)
  
  - #### Click `Create Index` button, it will take some time to finish creating.

  #### Update the following fields in `config.json` file for `table name`, `table key`, `index name` and `index key` that you obtained in above steps.

   ````
     "tableName": "table name",
     "tableKey": "table key",
     "indexName": "index name",
     "indexKey": "username" 
   ````


* ### Creating Cognito Identity Pool:
  - #### Search for `Cognito` in AWS console and click on it.

    ![01-edit](https://user-images.githubusercontent.com/18484641/38246652-1e279b16-3760-11e8-9179-01649aaaa2c4.png)

  - #### On next screen select `Manage Federated Identities`.

    ![02-edit](https://user-images.githubusercontent.com/18484641/38246654-1ed85866-3760-11e8-91ef-40f79543853c.png)

  - #### The click on `Create new identity pool`.

    ![03-edit](https://user-images.githubusercontent.com/18484641/38246655-2029364a-3760-11e8-9f06-6a2ef91bb389.png)

  - #### On next page enter `Identity pool name`.
  - #### You can optionally allow unauthenticated users to use your application. For that check the `Enable access to unauthenticated identities` box (Or leave it unchecked).
  - #### Click on `Authentication Providers` and enter the `Client-Id/App-Id` that you got while creating Amazon, Google, Facebook developer application in.
  - #### After that click on `Create Pool` button.
  
    ![04-edit](https://user-images.githubusercontent.com/18484641/38246657-21adc8fa-3760-11e8-87e1-67b2b0f54ebd.png)

  - #### On next page click on `Allow` button.
    
    ![05-edit](https://user-images.githubusercontent.com/18484641/40612486-639e9af6-6298-11e8-92a2-c0ba08ef97d7.jpg)

  - #### Cognito identity pool is created now. Click on `edit identity pool`.
    
    ![06-edit](https://user-images.githubusercontent.com/18484641/40612538-9fd3a700-6298-11e8-8f04-e7a59f8779f7.jpg)

  - #### On next page copy the `Identity pool ID` and paste it into the following `cognitoIdentityPoolId` field.

  ````
   "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
    },
  ````
    
    ![07-edit](https://user-images.githubusercontent.com/18484641/40612599-d6bc6d38-6298-11e8-9488-dca16c5d5f96.jpg)



* ### Creating IAM Role:
  - #### Click on `services` and search for `iam`. Click on it.

    ![01-edit](https://user-images.githubusercontent.com/18484641/38247806-1df4cdae-3764-11e8-9a44-130e9c1344d4.png)

  - #### Click on `Roles`.

    ![02-edit](https://user-images.githubusercontent.com/18484641/40612640-12481122-6299-11e8-90fe-bb8f2e8e4ef7.jpg)

  - #### You will see `Cognito_[Your Cognito Pool Name]_Auth_Role` under `Role name` column.   Click on it.
  
     ![03-edit](https://user-images.githubusercontent.com/18484641/38247809-2095874c-3764-11e8-813e-c9277fbf738b.png)

  - #### Then click on `Add inline policy` button.

     ![04-edit](https://user-images.githubusercontent.com/18484641/38247812-226b9124-3764-11e8-8751-16650b1d4333.png)

  - #### Then click on JSON button and modify the JSON as shown in the picture.

     ![05-edit](https://user-images.githubusercontent.com/18484641/40614552-e0370730-62a0-11e8-8234-44564d86d38a.jpg)

  - #### To get the fields in `Resource`, go to DynamoDB as shown below and copy the `Amazon Resource Name (ARN)` and paste it. Also, copy the index name and modify the second field in `Resource`.
  
     ![06-edit](https://user-images.githubusercontent.com/18484641/40612743-63697820-6299-11e8-8879-965422a53378.jpg)

  - #### Then click on `Review Policy`. 

  - #### On next page enter the name of the policy and then click `Create Policy`.

      ![07-edit](https://user-images.githubusercontent.com/18484641/38247829-2d038c04-3764-11e8-9fdb-e9584bc68c56.png)

  - #### On next screen copy the `Role ARN` and paste it in `iamRoleArn` field in `config.json` file.
                                                                                                                                                  
   ````
      "aws": {
          "accountId": "AWS-ACCOUNT-ID,
          "awsRegion":  "AWS-REGION",
          "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
          "iamRoleArn": "IAM-ROLE-ARN"
       },
   ````

     ![08-edit](https://user-images.githubusercontent.com/18484641/40612797-96240a00-6299-11e8-936d-a85a45f7ad54.jpg)



## 2. Creating AWS Elastic Beanstalk instance:
  - #### Search for `Elastic Beanstalk` and select it.

     ![01-edit](https://user-images.githubusercontent.com/18484641/38290403-b57ab2b2-37f8-11e8-9bba-ded448b18781.png)

  - #### On next page, click on `Create New Application`.

     ![02-edit](https://user-images.githubusercontent.com/18484641/40612850-c5469136-6299-11e8-93cb-138008f4a4a9.jpg)

  - #### Then, enter the `application name` and its `description`. And click `Next` button.

     ![03-edit](https://user-images.githubusercontent.com/18484641/38290401-b519dcbc-37f8-11e8-8b0f-cbd54d063e32.png)

  - #### on next screen click on `Create Web Server` button.

     ![4-edit](https://user-images.githubusercontent.com/18484641/38290400-b4e70526-37f8-11e8-8a7e-0dcd7c5b05ae.png)

  - #### Then select platform as `NodeJS` and `Environment type` as `Load balancing, auto-scaling`. Then click 'Next'.
  
     ![06-edit](https://user-images.githubusercontent.com/18484641/38290398-b4817cd8-37f8-11e8-9974-386a1b41ad6b.png)

  - #### On next page leave the fields as it is for now and click 'Next'.

     ![07-edit](https://user-images.githubusercontent.com/18484641/38290397-b44e3d28-37f8-11e8-8bb5-f6427e70ea19.png)

  - #### On next page change the `description` if you want and click 'Next'.

     ![08-edit](https://user-images.githubusercontent.com/18484641/38290394-b41d799a-37f8-11e8-8d9b-93e98024dfda.png)

  - #### On next page leave it unchanged and click `next`.

     ![09-edit](https://user-images.githubusercontent.com/18484641/38290392-b3e2888a-37f8-11e8-8e7d-7394f6f56094.png)

  - #### On next screen, you can change the fields that you want or leave it unchanged and click 'Next'.

     ![10-edit](https://user-images.githubusercontent.com/18484641/38290390-b3affcf8-37f8-11e8-884e-a424c690acbb.png)

  - #### On next screen leave the fields unchanged and click `Next`.
  
     ![11-edit](https://user-images.githubusercontent.com/18484641/38290389-b37cc5c2-37f8-11e8-901e-22ecc9bf947b.png)

  - #### On the next screen click `Next`.
  
     ![12-edit](https://user-images.githubusercontent.com/18484641/38290388-b3483e42-37f8-11e8-90c6-ba45be648afe.png)

  - #### On the next screen click `Launch`.
  
     ![13-edit](https://user-images.githubusercontent.com/18484641/40612919-0c5e8150-629a-11e8-8bb6-6e73f4554ad0.jpg)

  - #### It will take some time to complete creation of the instance.
  - #### Once completed copy `URL` of this instance for future process and paste it in `config.json` file as shown below. 

  ````
     "serverAddress": "http://[ Paste URL Here ]",
  ````
  
   ![14-edit](https://user-images.githubusercontent.com/18484641/40612920-0c8e958e-629a-11e8-8641-cf72f69a3125.jpg)



## 3. Creating Facebook application.
  - #### Go to this URL;
     https://developers.facebook.com/
  - #### Then log in with your credentials.

      ![01](https://user-images.githubusercontent.com/18484641/38290947-2e6f0f2c-37fb-11e8-8bde-a846a625596b.png)

  - #### After that click on `My Apps` and then select `Add New App`.
      ![02](https://user-images.githubusercontent.com/18484641/40613008-6ad11b4e-629a-11e8-8984-d752c8ee054a.jpg)

  - #### Then enter `Display name`, email and then click on `Create APp Id` button. 

      ![03](https://user-images.githubusercontent.com/18484641/38290998-66bcf1aa-37fb-11e8-8f02-d21a6420b7b4.png)

  - #### Then click on `settings` and choose `basic`. On next page copy the `App Id` and `Client Secret` and add them to `config.json` file as shown below.
  
      ![04](https://user-images.githubusercontent.com/18484641/40613010-6b318088-629a-11e8-844e-21ca6143f026.jpg)

  - #### Also, add the `Elastic Beanstalk` URL at the mentioned place below. 
 
   ````
     "facebook": {
        "clientID" : "App ID",
        "clientSecret" : "client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL ]/auth/facebook/callback",
        "profileFields" : ["displayName", "email", "id"]
     },
   ````
  - #### Then click on `Add Platform` and select `Website`.
  
     ![05](https://user-images.githubusercontent.com/18484641/38291020-7c8ea3de-37fb-11e8-8e21-a885c3e21b51.png)

  - ####  Enter your website url in `app domains` field and `site url` field and click `save changes`.
  
    ![06](https://user-images.githubusercontent.com/18484641/40613014-6bc6c7ce-629a-11e8-869e-d10facb9829a.jpg)

  - #### Then click `Products` and click `set Up` button in `Facebook Login` product.
  
     ![004](https://user-images.githubusercontent.com/18484641/40613012-6b65b380-629a-11e8-8ed7-da887c5d067d.jpg)

  - #### Then choose `settings` in `products` -> `Facebook Login` (NOt one shown below the `dashboard`).
  
     ![07](https://user-images.githubusercontent.com/18484641/40613015-6bf7a538-629a-11e8-8ff6-ee18567a66df.jpg)

  - #### Then copy the callbackURL from above facebook `callbackURL` field and paste it in `Valid OAuth Redirect URIs`. And click `Save changes` button.
  
     ![09](https://user-images.githubusercontent.com/18484641/40613018-6c5dcc96-629a-11e8-96cb-da8e9c0c3843.jpg)

  - #### Click following `off` button beside the `status` to let users use your application.
  
    ![09](https://user-images.githubusercontent.com/18484641/40613018-6c5dcc96-629a-11e8-96cb-da8e9c0c3843.jpg)



## 4. Creating Google application.
- #### Paste the `Elastic Beanstalk URL` in `callbackURL`. 
    ````
     "google": {
        "clientID" : "Google Client ID",
        "clientSecret" : "Google Client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL]/auth/google/callback",
        "profileFields" : ["displayName", "email", "id"]
    },
   ````
- #### Go to this URL;
    https://console.developers.google.com/projectselector/apis/dashboard
- #### Then log in with your credentials.
- #### Then click on `Create`.

  ![01-edit](https://user-images.githubusercontent.com/18484641/38291786-e4a41316-37fe-11e8-84df-1ed7b46dcb9b.png)

- #### Enter `Project name` and then click `Create`.

  ![02-edit](https://user-images.githubusercontent.com/18484641/40613281-91c816c0-629b-11e8-8bfc-03adb30c70d9.jpg)

- #### Then click on `Credentials`.

  ![03-edit](https://user-images.githubusercontent.com/18484641/40613282-91f6c042-629b-11e8-9033-d824a6a0675a.jpg)

- #### Then click `Create Credentials` and select `OAuth Client Id`.

  ![04-edit](https://user-images.githubusercontent.com/18484641/40613283-922b13d8-629b-11e8-8a94-4dde5336afae.jpg)

- #### On next screen click on `COnfigure Consent Screen`.

  ![05-edit](https://user-images.githubusercontent.com/18484641/38291780-e3cd2540-37fe-11e8-8d3c-c0350abd3d63.png)

- #### Then on next page enter `Product name` and other fields if you want. And then click on `Save` button.

  ![06-edit](https://user-images.githubusercontent.com/18484641/40613285-928d7956-629b-11e8-9445-b53fb7b1c332.jpg)

- #### Then select `Web Application` and enter the `Name`.

  ![07-edit](https://user-images.githubusercontent.com/18484641/40613286-92ce56a6-629b-11e8-89c9-f058a36dbe52.jpg)

- #### In `Authorized JavaScript origins` paste the `Elastic Beanstalk URL`.
- #### In `Authorized redirect URIs` paste the callback URL obtained for google after adding `Elastic Beanstalk URL` in it.
- #### Then click `Create`.

  ![08-edit](https://user-images.githubusercontent.com/18484641/40613287-930ee400-629b-11e8-8703-b7bd9dffd087.jpg)

- #### You will see a dialogue with Client ID and `Client Secret`. Copy them and paste them in `config.json` file for google.

  ![09-edit](https://user-images.githubusercontent.com/18484641/40613288-9341935a-629b-11e8-9be6-215a54a4e114.jpg)



## 5. Creating Amazon application.
 - #### Goto https://developer.amazon.com/
 - #### Click on `Developer Console`.
 
   ![01](https://user-images.githubusercontent.com/18484641/38292201-7aeaf140-3800-11e8-80c2-e2984af7e1cf.png)

 - #### Then enter your credentials and log in.
   
   ![02](https://user-images.githubusercontent.com/18484641/40613494-5d1fb684-629c-11e8-84c9-f0bb53239d9d.jpg)

 - #### Then select `Apps and Services`.
 
   ![03](https://user-images.githubusercontent.com/18484641/40613495-5d576732-629c-11e8-8ce9-ed7b7cfbd9a7.jpg)

 - #### Then select `Security Profiles`.
 
   ![04](https://user-images.githubusercontent.com/18484641/40613497-5d896570-629c-11e8-8d2e-217e622368d5.jpg)

 - #### On next page click on `Create a New Security Profile`.

   ![05](https://user-images.githubusercontent.com/18484641/40613625-ea504f78-629c-11e8-8029-e68307f44224.jpg)

 - #### On next page enter `Security Profile Name` and `Security Profile Description` and click `Save` button.

   ![06](https://user-images.githubusercontent.com/18484641/40613499-5def7324-629c-11e8-9f62-f4aaddbc8172.jpg)

 - #### on next screen, copy the `Client ID` and `Client Secret` and paste it in `config.json` file as shown below.
 
   ![07](https://user-images.githubusercontent.com/18484641/40613500-5e34232a-629c-11e8-9398-774631b8e003.jpg)

 - #### Also paste the `Elastic Beanstalk URL` in `callbackURL` as shown below in `config.json`.
 
````
   "amazon": {
        "clientID" : "client ID",
        "clientSecret" : "client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL]/auth/amazon/callback",
        "profileFields" : ["displayName", "email", "id"]
    }
 ```` 

 - #### Click on `web settings` and click on `Edit`.
 
   ![08](https://user-images.githubusercontent.com/18484641/38292194-79b68532-3800-11e8-87f4-8448fcb71ae2.png)

 - #### Enter `Elastic Beanstalk URL` in `Allowed Origins` and above modified `callbackURL` for amazon in `Allowed Return URLs`.
 - #### Then click on `Save`.
 
   ![09](https://user-images.githubusercontent.com/18484641/38292193-7986d490-3800-11e8-9d14-3cde17e354ce.png)



## 6. Deploying configured IAM-Auth module on AWS Beanstalk.
  - GO to `i-auth` folder on your computer.
  - You will see following directories/files in it.
     * modules
     * node_modules
     * package.json
     * package-lock.json
     * server.js
  - Select them all and make a ZIP of it.
  - Now, open `Elastic Beanstalk` from AWS console.
  - You will see your previously created instance. Click on it.

    ![01-edit](https://user-images.githubusercontent.com/18484641/40613717-52f411c2-629d-11e8-92a6-e5e0979fb168.jpg)

  - Click on Upload and Deploy.

    ![02-edit](https://user-images.githubusercontent.com/18484641/40613718-532c297c-629d-11e8-927a-5f9c62d711e3.jpg)

  - Select the ZIP file created and add label version. Then click on `Deploy`. It will take some time.

    ![03-edit](https://user-images.githubusercontent.com/18484641/38293402-f922507c-3804-11e8-9246-1c45d22e20b7.png)

  - If you see the following screen then your deployment is successful.

    ![04-edit](https://user-images.githubusercontent.com/18484641/40613721-5396f108-629d-11e8-93ea-ce83e18ef21b.jpg)

# Accessing IAM-Auth Module from the client application.
You can refer sample client application that we have provided.
In client application we have provided some functions that you can directly use in your application.
In this client appplication we have created functions for:
* Log in or register user.
* Refreshing user session (user session ends after every one hour.).
* Accessing DynamoDB from client application using AWS Cognito AccessKey and SecretKey and SessionKey.


### To use the client application, perform following steps:
* In client application,  go to `js` directory and open `constants.js` file.
    ````
      const CLIENT_REDIRECT_URL = "http://localhost:8080/client/index.html";

      const AWS_REGION = "us-east-1";
      const AWS_ENDPOINT = "http://dynamodb.us-east-1.amazonaws.com";
      const TABLE_NAME = "users";

      const SERVER_ADDRESS = "http://localhost:8081";
      const URL_AUTHENTICATION = SERVER_ADDRESS + "/auth";
      const REFRESH_URL = SERVER_ADDRESS + "/refresh";

      const REQUIRE_LOGIN_NAME = true;

      const SESSION_EXPIRE_TIME = 0;
      const SESSION_REFRESH_TIME = 5;
      const SESSION_TIME = 60;
  ````
* Change `CLIENT_REDIRECT_URL` to your tomcat server address.
* Change `AWS_REGION` to the region that you have selected on aws account.
* Change `AWS_ENDPOINT` to http://dynamodb.`[AWS_REGION]`.amazonaws.com. Replace AWS_REGION with your aws region.
* Change`TABLE_NAME` to table name in DynamoDB.
* Chnage `SERVER_ADDRESS` to `AWS Beanstalk URL` that we used before.
* `URL_AUTHENTICATION`, this is the URL on which login/register request will be processed.
* `REFRESH_URL, on this URL; session refresh request will be processed.
* Rest of the code ypour can refer and understand.

* To run the client application deploy it on Tomcat server. I have provided how to install and deploy web app on Tomcat Server above.


## CASE-2: Login-register without unique Username in the system.

In this case you have to follow all above steps that are needed to complete for `CASE-1: Login-register with unique Username in the system`.
Only you don't have to create index on table.

## CASE-3: Only Login without unique Username in the system.

In this case you have to follow all above steps that are needed to complete for `CASE-1: Login-register with unique Username in the system`.
Only you don't have to create index on table.