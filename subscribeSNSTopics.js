module.exports = async (AWS) => {  
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

    const blissRequest = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(blissRequestSNSSubscriptionParam).promise();
    const blissResponse = new AWS.SNS({apiVersion: '2010-03-31'}).subscribe(blissResponseSNSSubscriptionParam).promise();
    
    await blissRequest;
    await blissResponse;

    console.log(chalk.success(`##### SUBSCRIBED SNS TOPICS #####`));
};