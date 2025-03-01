module.exports = async (AWS) => {
    const chalk = require('./chalk.console');
    console.log(chalk.info(`##### UNSUBSCRIBING SNS TOPICS #####`));
    
    const blissRequest = new AWS.SNS({apiVersion: '2010-03-31'}).unsubscribe({SubscriptionArn: process.env.BLISS_REQUEST_SNS_ARN})
    const blissResponse = new AWS.SNS({apiVersion: '2010-03-31'}).unsubscribe({SubscriptionArn: process.env.BLISS_RESPONSE_SNS_ARN})
    const blissRequestCancel = new AWS.SNS({apiVersion: '2010-03-31'}).unsubscribe({SubscriptionArn: process.env.BLISS_REQUEST_CANCEL_SNS_ARN}).promise();
    
    await blissRequest;
    await blissResponse;
    await blissRequestCancel;

    console.log(chalk.success(`##### UNSUBSCRIBED SNS TOPICS #####`));
};