'use strict';

module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient) => {

    const models = require('../models');

    const Models = models(postgresClient);
    const podcastSubscriberModel = Models.podcastSubscriberModel;

    const celebFCMRegistrationTokenTable = process.env.CELEB_FCM_REGISTRATION_TOKEN_TABLE;
    const clientFCMRegistrationTokenTable = process.env.CLIENT_FCM_REGISTRATION_TOKEN_TABLE;

    const pushBlissRequestNotification = async (clientFCMToken, blissRequestId, clientName) => {
        const messageHandledOnClient = {
            MESSAGE: `${clientName} has sent you a bliss Request!`,
            BLISS_REQUEST_ID: blissRequestId
        };

        const message = {
            notification: {
                title: 'Bliss Request Received',
                body: `${clientName} has sent you a bliss request!`
            },
            android: {
                notification: {
                    color: `#9c27b0`
                }
            },
            data: messageHandledOnClient,
            token: clientFCMToken
        };

        await firebaseAdminClient.messaging().send(message);
        return messageHandledOnClient;
    };

    const pushBlissResponseNotification = async (clientFCMToken, celebName, blissRequestDate, blissRequestTime) => {
        const messageHandledOnClient = {
            MESSAGE: `${celebName} has created a bliss for you. You requested for bliss on ${blissRequestDate} at ${blissRequestTime}`,
            BLISS_RESPONSE_ID: blissResponseId
        };

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
            data: messageHandledOnClient,
            token: clientFCMToken
        };

        await firebaseAdminClient.messaging().send(message);
        return messageHandledOnClient;
    };

    const pushBlissCancelNotification = async (clientFCMToken, celebName, blissRequestDate, blissRequestTime) => {
        const messageHandledOnClient = {
            MESSAGE: `${celebName} has declined your bliss request. You requested for bliss on ${blissRequestDate} at ${blissRequestTime}`,
        };

        const message = {
            notification: {
                title: 'Bliss Request Denied',
                body: `Your Bliss Request from ${celebName} is canceled!`
            },
            android: {
                notification: {
                    color: `#9c27b0`
                }
            },
            data: messageHandledOnClient,
            token: clientFCMToken
        };

        await firebaseAdminClient.messaging().send(message);
        return messageHandledOnClient;
    };

    const getCelebFCMRegistrationToken = (celebName) => {
        return new Promise((resolve, reject) => {
            try {
                const celebToken = {
                    TableName: celebFCMRegistrationTokenTable,
                    Key: {
                        'CELEB_NAME': { S: celebName }
                    },
                    ProjectionExpression: 'CELEB_FCM_TOKEN'
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

    const getClientFCMRegistrationToken = (clientId) => {
        return new Promise((resolve, reject) => {
            try {
                const clientToken = {
                    TableName: clientFCMRegistrationTokenTable,
                    Key: {
                        'CLIENT_ID': { S: clientId }
                    },
                    ProjectionExpression: 'CLIENT_FCM_TOKEN'
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
    };

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
                MESSAGE: `A new episode '${episodeTitle}' has been uploaded in the podcast ${podcastTitle}!`,
                PODCAST_TITLE: podcastTitle,
                EPISODE_NUMBER: episodeNumber,
                EPISODE_TITLE: episodeTitle
            },
            tokens: subscribersToken
        };

        await firebaseAdminClient.messaging().send(message);
    };

    return {
        pushBlissRequestNotification,
        pushBlissCancelNotification,
        getCelebFCMRegistrationToken,
        getClientFCMRegistrationToken,
        pushBlissResponseNotification,
        pushPodcastEpisodeUpdateNotification
    };
}