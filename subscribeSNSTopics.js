module.exports = (AWS) => {  
    const chalk = require('./chalk.console');
    console.log(chalk.info(`##### SUBSCRIBING SNS TOPICS #####`));
    
    const blissRequestSNSSubscriptionParam = {
        Protocol: 'application',
        TopicArn: process.env.BLISS_REQUEST_SNS_ARN,
        Endpoint: process.env.BLISS_REQUEST_SNS_ENDPOINT
    };

    const blissResponseSNSSubscriptionParam = {
        Protocol: 'application',
        TopicArn: process.env.BLISS_RESPONSE_SNS_ARN,
        Endpoint: process.env.BLISS_RESPONSE_SNS_ENDPOINT
    };

    const blissRequestCancelSNSSubscriptionParam = {
        Protocol: 'application',
        TopicArn: process.env.BLISS_REQUEST_CANCEL_SNS_ARN,
        Endpoint: process.env.BLISS_REQUEST_CANCEL_SNS_ENDPOINT
    };

    return new Promise(async (resolve, reject) => {
        try {
            const blissRequest = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(blissRequestSNSSubscriptionParam).promise();
            const blissResponse = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(blissResponseSNSSubscriptionParam).promise();
            const blissRequestCancel = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(blissRequestCancelSNSSubscriptionParam).promise();
            
            await blissRequest;
            await blissResponse;
            await blissRequestCancel;

            console.log(chalk.success(`##### SUBSCRIBED SNS TOPICS #####`));
            return resolve(true);
        }
        catch(err) {
            return reject(err);
        }
    })
};