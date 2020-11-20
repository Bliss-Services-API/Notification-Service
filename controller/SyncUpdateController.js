'use strict';

module.exports = (S3Client) => {

    const chalk = require('../chalk.console');

    const blissClientSyncBucket = process.env.BLISS_CLIENT_SYNC_BUCKET;
    const blissCelebSyncBucket = process.env.BLISS_CELEB_SYNC_BUCKET;

    const updateClientSync = async (clientId, data, blissResponseId) => {
        try {
            const responseTime = (blissResponseId + 880831800) * 1000;

            const syncParam = { 
                Bucket: blissClientSyncBucket,
                Key: `${responseTime}.bliss`,
                Prefix: `${clientId}/`,
                Body: data,
                ContentType: 'text/plain'
            };
    
            const s3UploadPromise = S3Client.upload(syncParam).promise();
            return s3UploadPromise.then(() => { return true });

        } catch(err) {
            console.error(chalk.error(`ERR: ${err.message}`));
            return false;
        }
    };

    const updateCelebSync = async (celebName, data, blissRequestId) => {
        try {
            const requestTime = (blissRequestId + 880831800) * 1000;

            const syncParam = { 
                Bucket: blissCelebSyncBucket,
                Key: `${requestTime}.bliss`,
                Prefix: `${celebName}/`,
                Body: data,
                ContentType: 'text/plain'
            };
    
            const s3UploadPromise = S3Client.upload(syncParam).promise();
            return s3UploadPromise.then(() => { return true });

        } catch(err) {
            console.error(chalk.error(`ERR: ${err.message}`));
            return false;
        }
    };

    return {
        updateClientSync,
        updateCelebSync
    };
}