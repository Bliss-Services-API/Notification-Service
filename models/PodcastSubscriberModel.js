  
'use strict';

/**
 * 
 * Model of the client-credentials Table in the Database credentials;
 * 
 * @param {Sequelize Object} postgresClient Sequelize Object
 * 
 */
module.exports = (postgresClient) => {
    const Sequelize = require('sequelize');
    
    const ClientPodcastSubscriptionModel = postgresClient.define('client_podcast_subscription', {
        client_id:           { type: Sequelize.STRING, primaryKey: true },
        podcast_subscribed:  { type: Sequelize.STRING, primaryKey: true }
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'subscription_date'
    });

    return ClientPodcastSubscriptionModel;
}