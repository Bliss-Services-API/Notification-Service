'use strict';

module.exports = (postgresClient, firebaseAdminClient, dynamoDBClient, S3Client) => {
    const express = require('express');
    const router = express.Router();
    const controller = require('../controller');
    const chalk = require('../chalk.console');

    const Controller = controller(postgresClient, firebaseAdminClient, dynamoDBClient, S3Client);

    const pushNotificationController = Controller.pushNotificationController;

    router.get('/ping', (req, res) => {
        res.send('OK');
    });

    //Notification Routes for Bliss Requests
    router.post('/bliss/request', async (req, res) => {
        try {
            const message = JSON.parse(req.body.Message);

            const blissRequestId = message.BlissId;
            const blissRequestResponder = message.blissResponder;

            //Send Push Notification
            const celebFCMToken = await pushNotificationController.getCelebFCMRegistrationToken(blissRequestResponder);
            await pushNotificationController.pushBlissRequestNotification(celebFCMToken, blissRequestId);

            //Upload Message in S3

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

            const blissResponseId = message.BLISS_ID;
            const blissResponseRequester = message.BLISS_REQUESTER;

            //Upload Message in S3

            //Send Push Notification
            const clientFCMToken = await pushNotificationController.getClientFCMRegistrationToken(blissResponseRequester);
            const messageId = await pushNotificationController.pushBlissResponseNotification(celebFCMToken, blissResponseId);
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


    return router;
}