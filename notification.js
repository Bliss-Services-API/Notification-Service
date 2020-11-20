'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const subscribeSNSTopics = require('./subscribeSnsTopics');
const unsubscribeSNSTopics = require('./unsubscribeSnsTopic');
const notificationRoutes = require('./routes/routes');
const AWS = require('aws-sdk');
const chalk = require('./chalk.console');
const firebaseAdminClient = require("firebase-admin");
const serviceAccount = require("./config/firebase.json");
const postgresConnection = require('./connections/PostgresConnection');

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

if(ENV === 'development') {
    console.log(chalk.info(`##### SERVER RUNNING IN DEVELOPMENT MODE #####`));
} else if(ENV === 'production') {
    console.log(chalk.info(`##### SERVER RUNNING IN PRODUCTION MODE #####`));
} else {
    console.error(chalk.error(`NO ENV PROVIDED`));
    process.exit(1);
}

const postgresClient = postgresConnection(ENV);

firebaseAdminClient.initializeApp({
    credential: firebaseAdminClient.credential.cert(serviceAccount),
    databaseURL: "https://bliss-cloud.firebaseio.com"
});

AWS.config.update({region: 'us-east-2'});

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const S3Client = new AWS.S3({apiVersion: '2006-03-01'});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

postgresClient.authenticate()
    .then(() => console.log(chalk.success(`Postgres Connection Established Successfully`)))
    .then(() => app.use('/notification', notificationRoutes(postgresClient, firebaseAdminClient, dynamoDBClient, S3Client)))
    .then(() => console.log(chalk.success(`Routes Established Successfully`)))
    .then(async () => await subscribeSNSTopics(AWS))
    .catch((err) => console.error(chalk.error(`ERR: ${err.message}`)));

process.on('exit', () => unsubscribeSNSTopics(AWS));

app.listen(PORT, () => console.log(chalk.success(`Server is running on port ${PORT}`)));