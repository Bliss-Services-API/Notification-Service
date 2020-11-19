'use strict';

module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient) => {

    const models = require('../models');

    const Models = models(postgresClient);
    const podcastSubscriberModel = Models.podcastSubscriberModel;

    const celebFCMRegistrationTokenTable = process.env.CELEB_FCM_REGISTRATION_TOKEN_TABLE;
    const clientFCMRegistrationTokenTable = process.env.CLIENT_FCM_REGISTRATION_TOKEN_TABLE;

    const pushBlissRequestNotification = async (registrationToken, blissRequestId) => {
        const message = {
            notification: {
                title: 'Bliss Request Received',
                body: `You've Received A New Bliss Request!`
            },
            android: {
                notification: {
                    color: `#9c27b0`
                }
            },
            data: {
                BLISS_REQUEST_ID: blissRequestId
            },
            token: registrationToken
        };

        const messageId = await firebaseAdminClient.messaging().send(message);
        return messageId;
    };

    const pushBlissResponseNotification = async (registrationToken, blissRequestId) => {
        const message = {
            notification: {
                title: 'Bliss Response Received',
                body: `You've Received A Bliss!`
            },
            android: {
                notification: {
                    color: `#9c27b0`
                }
            },
            data: {
                BLISS_REQUEST_ID: blissRequestId
            },
            token: registrationToken
        };

        const messageId = await firebaseAdminClient.messaging().send(message);
        return messageId;
    };

    const getCelebFCMRegistrationToken = async (celebName) => {
        return new Promise((resolve, reject) => {
            try {
                var celebToken = {
                    TableName: celebFCMRegistrationTokenTable,
                    Key: {
                        'CELEB_NAME': { S: celebName }
                    },
                    ProjectionExpression: 'FCM_TOKEN'
                };

                dynamoDBClient.getItem(celebToken, function(err, token) {
                    if (err)
                        return reject(err);
                    else {
                        return resolve(token);
                    }
                });
            }
            catch(err) {
                return reject(err);
            }
        });
    };

    const getClientFCMRegistrationToken = async (clientId) => {
        return new Promise((resolve, reject) => {
            try {
                var clientToken = {
                    TableName: clientFCMRegistrationTokenTable,
                    Key: {
                        'CLIENT_ID': { S: clientId }
                    },
                    ProjectionExpression: 'FCM_TOKEN'
                };

                dynamoDBClient.getItem(clientToken, function(err, token) {
                    if (err)
                        return reject(err);
                    else {
                        return resolve(token);
                    }
                });
            }
            catch(err) {
                return reject(err);
            }
        });
    };

    const getPodcastSubscribers = async (podcastTitle) => {
        const subscribers = [];
        const subscribersDatabaseResponse = await podcastSubscriberModel.findAll({
            where: {
                podcast_subscribed: podcastTitle
            }
        });

        subscribersDatabaseResponse.forEach(subscriber => subscribers.push(subscriber['dataValues']));

        return subscribers;
    }

    const pushPodcastEpisodeUpdateNotification = async (podcastTitle, episodeNumber, episodeTitle) => {
        const subscribers = getPodcastSubscribers(podcastTitle);
        const subscribersToken = [];

        subscribers.forEach(async subscriber => {
            const subscriberToken = await getClientFCMRegistrationToken(subscriber['client_id']);
            subscribersToken.push(subscriberToken);
        });
        
        const message = {
            notification: {
                title: `Bliss Podcast Update`,
                body: `New Episode Uploaded in the Podcast ${podcastTitle}`
            },
            android: {
                notification: {
                    color: `#9c27b0`
                }
            },
            data: {
                PODCAST_TITLE: podcastTitle,
                EPISODE_NUMBER: episodeNumber,
                EPISODE_TITLE: episodeTitle
            },
            tokens: subscribersToken
        };

        await firebaseAdminClient.messaging().send(message);
    }

    return {
        pushBlissRequestNotification,
        getCelebFCMRegistrationToken,
        getClientFCMRegistrationToken,
        pushBlissResponseNotification,
        pushPodcastEpisodeUpdateNotification
    };
}