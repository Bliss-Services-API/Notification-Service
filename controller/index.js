const { S3 } = require('aws-sdk');

module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient, S3Client) => {
    const pushNotificationController = require('./PushNotification')(postgresClient, firebaseAdminClient, dynamoDBClient);
    const syncUpdateController = require('./SyncUpdateController')(S3Client);

    return {
        pushNotificationController,
        syncUpdateController
    };
}