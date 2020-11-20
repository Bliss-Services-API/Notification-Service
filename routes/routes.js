'use strict';

module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient, S3Client) => {
    const express = require('express');
    const router = express.Router();
    const controller = require('../controller');
    const chalk = require('../chalk.console');

    const Controller = controller(postgresClient, firebaseAdminClient, dynamoDBClient, S3Client);

    const pushNotificationController = Controller.pushNotificationController;
    const syncUpdateController = Controller.syncUpdateController;

    router.get('/ping', (req, res) => {
        res.send('OK');
    });

    //Notification Routes for Bliss Requests
    router.post('/bliss/request', async (req, res) => {
        try {
            const message = JSON.parse(req.body.Message);

            const blissRequestId = message.BLISS_REQUEST_ID;
            const celebName = message.CELEB_NAME;
            const clientName = message.CLIENT_NAME;

            //Send Push Notification
            const celebFCMToken = await pushNotificationController.getCelebFCMRegistrationToken(celebName);
            await pushNotificationController.pushBlissRequestNotification(celebFCMToken, blissRequestId, clientName);

            //Upload Message in S3
            await syncUpdateController.updateCelebSync(celebName, messageHandledOnClient, blissRequestId);
        }
        catch(err) {
            const error = {
                ERR: err.message,
                RESPONSE: 'Sending Push Notification Failed',
                CODE: 'PUSH_NOTIFICATION_FAILED'
            };

            console.error(chalk.error(`ERR: ${JSON.stringify(error)}`));
        }
        finally {
            res.send();
        }
    });
    //
    router.post('/bliss/response', async (req, res) => {
        try {
            const message = JSON.parse(req.body.Message);

            const blissResponseId = message.BLISS_RESPONSE_ID;
            const clientId = message.CLIENT_ID;
            const celebName = message.CELEB_NAME;
            const blissRequestDate = message.BLISS_REQUEST_DATE;
            const blissRequestTime = message.BLISS_REQUEST_TIME;

            //Send Push Notification
            const clientFCMToken = await pushNotificationController.getClientFCMRegistrationToken(clientId);
            const messageHandledOnClient = await pushNotificationController.pushBlissResponseNotification(clientFCMToken, blissResponseId, celebName, blissRequestDate, blissRequestTime);
            
            await syncUpdateController.updateClientSync(clientId, messageHandledOnClient, blissResponseId);
        }
        catch(err) {
            const error = {
                ERR: err.message,
                RESPONSE: 'Sending Push Notification Failed',
                CODE: 'PUSH_NOTIFICATION_FAILED'
            };

            console.error(chalk.error(`ERR: ${error}`));
        }
        finally {
            res.send();
        }
    })
    //
    router.post('/podcast/episode', async (req, res) => {
        try {
            const message = JSON.parse(req.body.Message);

            const podcastTitle = message.podcastTitle;
            const episodeTitle = message.episodeTitle;
            const episodeNumber = message.episodeNumber;

            //Upload Message in S3

            //Send Push Notification
            await pushNotificationController.pushPodcastEpisodeUpdateNotification(podcastTitle, episodeTitle, episodeNumber);
        }
        catch(err) {
            const error = {
                ERR: err.message,
                RESPONSE: 'Sending Push Notification Failed',
                CODE: 'PUSH_NOTIFICATION_FAILED'
            };

            console.error(chalk.error(`ERR: ${error}`));
        }
        finally {
            res.send();
        }
    })

    router.post('/bliss/request/cancel', async (req, res) => {
        try {
            const message = JSON.parse(req.body.Message);

            const blissResponseId = message.BLISS_RESPONSE_ID;
            const clientId = message.CLIENT_ID;
            const celebName = message.CELEB_NAME;
            const blissRequestDate = message.BLISS_REQUEST_DATE;
            const blissRequestTime = message.BLISS_REQUEST_TIME;

            //Send Push Notification
            const clientFCMToken = await pushNotificationController.getClientFCMRegistrationToken(clientId);
            const messageHandledOnClient = await pushNotificationController.pushBlissResponseNotification(clientFCMToken, celebName, blissRequestDate, blissRequestTime);
            
            await syncUpdateController.updateClientSync(clientId, messageHandledOnClient, blissResponseId);
        }
        catch(err) {
            const error = {
                ERR: err.message,
                RESPONSE: 'Sending Push Notification Failed',
                CODE: 'PUSH_NOTIFICATION_FAILED'
            };

            console.error(chalk.error(`ERR: ${JSON.stringify(error)}`));
        }
        finally {
            res.send('OK');
        }
    });

    return router;
}