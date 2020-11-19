module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient, S3Client) => {
    const pushNotificationController = require('./PushNotification')(postgresClient, firebaseAdminClient, dynamoDBClient);

    return {
        pushNotificationController
    };
}