# Independent Authentication Module (I-Auth)

Nowadays, security of any application has become very important role in developing 
application and more than it maintaining users in the application is critical. 

So instead of creating new users in your application and maintaining its security, 
this library helps you to authenticate users from their existing Google/Facebook/Amazon
accounts and gives you authenticated user directly.

## Features provided by I-Auth Module
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
   In this use-case devloper can directly use I-Auth module to Login users 
      into devloper's project. 
      It does not require registration flow. It internally handles it.

   ##### 2. Registration-Login feature without Unique Username in the System:    
   In this use-case developer can provide set of registration fields 
      during registration. 
      I-Auth module will not check for uniqueness of Username in this use- 
      case.
      User need to be registered before logging in. 
      During login user does not have to provide usename.

   ##### 3. Registration-Login feature with Unique Username in the System:   
     In this use-case developer can provide set of registration fields during 
     registration. 
     I-Auth module will explicitly check for uniqueness of Username in this 
     use-case.
     User need to be registered before logging in. 
     Username is mandatory during login.

- #### Returns access credentials which can be used to access rest of the Amazon Web Services like DynamoDB, EC2, RDS etc.


## Follow below steps to use I-Auth module in your existing project.

#### 1. Clone this repository on your system

#### 2. Check for the `config.json` file in I-Auth

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
      Presently I-Auth module supports for:
      * Google
      * Facebook
      * Amazon

       You have to create developer account for those providers on their provided sites, and there you will get 
    `clientID`, `clientSecret`.
    You have to provide `callback URL` on which third party authentication provider will redirect after successfull authentication.
    You can provide which profile fields you want to read from users's third party account. By default I-Auth fetches `username, name, email` information.


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
   * ##### Your I-Auth Module is ready to use.


#### 3. Running Server

* #### Open project folder in terminal and change to server directory using following command 

    `$ cd glm/server`

* #### Install dependencies by executing command 

    `$ npm install`

* #### Run server with following command 

    `$ node server.js`

## We have provided sample client application which demonstrates how to use I-Auth Module in your application. 

### Running Client 

* #### Open project folder in terminal and change to client directory using below command 

    `$ cd glm/client`

* #### Open `client.html` inside your browser 

* #### You are good to go.


### Runnig Client application using Tomcat server [ OPTIONAL ]

* #### Install Tomcat using following link.

    [Tomcat installation]
    
* #### Then go to /opt/tomcat/webapps folder and paste your client application folder in it.
  Make sure that index.html page should remain in your client application folder.
    You can refer this link for deploying web app in Tomcat server.
    
    [deploying web app on tomcat]

* #### Then open [client application] in your browser.

* #### You are good to go.


## STATUS CODES Returned by I-Auth Module

When any kind of request is sent to I-Auth Module then it responds client application with following `STATUS_CODES`.
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




# Login-register with unique Username in the system.

   If your requirement is Registration-login flow along with unique username for each user
   then you will have to do the following steps to configure I-Auth module.

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

### 1. Creating Amazon Web Services account.
  Sign up on aws console, and do the following.

* #### Selecting appropriate Region.
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
  ![picture](https://drive.google.com/open?id=197GqoxDsxqexWBgT-5IeBW1CWRSeFGaL)
   

* #### Getting `aws account ID`:
  - Click on `Support` and select `Support Center`.
  - Then on next page you will see `account number` that is your `aws account ID`.

    Paste `aws account ID` in `accountId` field in `config.json` file

   ````
   "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
    },
   ````
* #### Creating Table in DynamoDB:
  - Search for DynamoDB on AWS console and open it.
  - On next page click `create table` button.
  - Enter `TableName` and `PrimaryKey` and take a note both fields. You will need them in 
    future. After that click `create` button. Your table will be created. 
  - On next page, you can see `Overview` and your table content in `Items`.
  
* #### Creating Index on Table:
  - Select `Index` from the navigation pane.
  - On next page click `Create index` button.
  - Enter `Primary Key` as `username` and `Index Name` will be automatically created.
  - Click `Create Index` button, it will take some time to finish creating.

  Update the following fields in `config.json` file for `table name`, `table key`, `index name` and `index key` that you obtained in above steps.

   ````
     "tableName": "table name",
     "tableKey": "table key",
     "indexName": "index name",
     "indexKey": "username" 
   ````

* #### Creating Cognito Identity Pool:
  - Search for `Cognito` in AWS console and click on it. 
  - On next screen select `Manage Federated Identities`.
  - The click on `Create new identity pool`.
  - On next page enter `Identity pool name`.
  - You can optionally allow unauthenticated users to use your application. For that check the 
    `Enable access to unauthenticated identities` box (Or leave it unchecked).
  - Click on `Authentication Providers` and enter the `Client-Id/App-Id` that you got while 
    creating Amazon, Google, Facebook developer application in.
  - After that click on `Create Pool` button.
  - On next page click on `Allow` button.
  - Cognito identity pool is created now. Click on `edit identity pool`.
  - On next page copy the `Identity pool ID` and paste it into the following 
    `cognitoIdentityPoolId` field.

  ````
   "aws": {
        "accountId": "AWS-ACCOUNT-ID,
        "awsRegion":  "AWS-REGION",
        "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
        "iamRoleArn": "IAM-ROLE-ARN"
    },
  ````

* #### Creating IAM Role:
  - Click on `services` and search for `iam`. Click on it.
  - Click on `Roles`.
  - You will see `Cognito_[Your Cognito Pool Name]_Auth_Role` under `Role name` column.
    Click on it.
  - Then click on `Add inline policy` button.
  - Then click on JSON button and modify the JSON as shown in the picture.
    To get the fields in `Resource`, go to DYnamoDB as shown below and copy the `Amazon 
    Resource Name (ARN)` and paste it. Also, copy the index name and modify the second field 
    in `Resource`.
  - Then click on `Review Policy`. 
  - On next page enter the name of the policy and then click `Create Policy`.
  - On next screen copy the `Role ARN` and paste it in `iamRoleArn` field in `config.json` 
    file.
                                                                                                                                                  
   ````
      "aws": {
          "accountId": "AWS-ACCOUNT-ID,
          "awsRegion":  "AWS-REGION",
          "cognitoIdentityPoolId": "COGNITO-IDENTITY-POOL-ID",
          "iamRoleArn": "IAM-ROLE-ARN"
       },
   ````


### 2. Creating AWS Elastic Beanstalk instance:
  - Search for `Elastic Beanstalk` and select it.
  - On next page, click on `Create New Application`.
  - Then, enter the `application name` and its `description`. And click `Next` button.
  - on next screen click on `Create Web Server` button.
  - Then select platform as `NodeJS` and `Environment type` as `Load balancing,
     auto-scaling`. Then click 'Next'.
  - On next page leave the fields as it is for now and click 'Next'.
  - On next page change the `description` if you want and click 'Next'.
  - On next page leave it unchanged and click `next`.
  - On next screen, you can change the fields that you want or leave it unchanged and click 
    'Next'.
  - On next screen leave the fields unchanged and click `Next`.
  - On the next screen click `Next`.
  - On the next screen click `Launch`.
  - It will take some time to complete creation of the instance.
  - Once completed copy `URL` of this instance for future process and paste it in `config.json` file as shown below. 

  ````
     "serverAddress": "http://[ Paste URL Here ]",
  ````


### 3. Creating Facebook application.
  - Go to this URL;
     https://developers.facebook.com/
  - Then log in with your credentials.
  - After that click on `My Apps` and then select `Add New App`.
  - Then enter `Display name`, email and then click on `Create APp Id` button. 
  - Then click on `settings` and choose `basic`.
  - On next page copy the `App Id` and `Client Secret` and add them to `config.json`` file as 
    shown below.
  - Also, add the `Elastic Beanstalk` URL at the mentioned place below. 
 
  ````
    "facebook": {
        "clientID" : "App ID",
        "clientSecret" : "client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL ]/auth/facebook/callback",
        "profileFields" : ["displayName", "email", "id"]
    },
  ````
  - Then click on `Add Platform` and select `Website`.
  - Enter your website url in `app domains` field and `site url` field and click 
   `save changes`.
  - Then click `Products` and click `set Up` button in `Facebook Login` product.
  - Then choose `settings`.
  - Then copy the callbackURL from above facebook `callbackURL` field and paste it in 
    `Valid OAuth Redirect URIs`. And click `Save changes` button.
  - Click following button to let users use your application.



### 4. Creating Google application.
- Paste the `Elastic Beanstalk URL` in `callbackURL`. 
    ````
     "google": {
        "clientID" : "Google Client ID",
        "clientSecret" : "Google Client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL]/auth/google/callback",
        "profileFields" : ["displayName", "email", "id"]
    },
   ````
- Go to this URL;
    https://console.developers.google.com/projectselector/apis/dashboard
- Then log in with your credentials.
- Then click on `Create`.
- Enter `Project name` and then click `Create`.
- Then click on `Credentials`.
- Then click `Create Credentials` and select `OAuth Client Id`.
- On next screen click on `COnfigure Consent Screen`.
- Then on next page enter `Product name` and other fields if you want. And then click on 
     `Save` button.
- Then select `Web Application` and enter the `Name`.
- In `Authorized JavaScript origins` paste the `Elastic Beanstalk URL`.
- In `Authorized redirect URIs` paste the callback URL obtained for google after adding 
     `Elastic Beanstalk URL` in it.
- Then click `Create`.
- You will see a dialogue with Client ID and `Client Secret`. Copy them and paste them in 
     `config.json` file for google.


### 5. Creating Amazon application.
 - Goto https://developer.amazon.com/
 - Click on `Developer Console` and then enter your credentials and log in.
 - Then select `Apps and Services`.
 - Then select `Security Profiles`.
 - On next page click on `Create a New Security Profile`.
 - On next page enter `Security Profile Name` and `Security Profile Description` and click 
   `Save` button.
 - on next screen, copy the `Client ID` and `Client Secret` and paste it in `config.json` file 
   as shown below.
 - Also paste the `Elastic Beanstalk URL` in `callbackURL` in following shown code.
 
````
   "amazon": {
        "clientID" : "client ID",
        "clientSecret" : "client Secret",
        "callbackURL" : "http://[ Elastic Beanstalk URL]/auth/amazon/callback",
        "profileFields" : ["displayName", "email", "id"]
    }
 ```` 

 - Click on `web settings`.
 - Click on `Edit`.
 - Enter `Elastic Beanstalk URL` in `Allowed Origins` and above modified `callbackURL` for 
   amazon in `Allowed Return URLs`.
 - Then click on `Save`.


### 6. Deploying configured I-Auth module on AWS Beanstalk.
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
  - Click on Upload and Deploy.
  - Select the ZIP file created and add label version.
  - Then click on `Deploy`. It will take some time.
  - If you see the following screen then your deployment is successful.

  

### 7. Accessing I-Auth Module from the client application.

