module.exports = (postgresClient) => {
    const podcastSubscriberModel = require('./PodcastSubscriberModel')(postgresClient);

    return {
      podcastSubscriberModel
    };
}