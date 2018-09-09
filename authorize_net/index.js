const config = require('../configRedis.json');
const authorize = require('./authorizenet_sample.js');

var redis = require("redis"),
    pub = redis.createClient(config),
    sub = redis.createClient(config);



const START_AUTH_CHANNEL = "pennapps.authorize.start";
const AUTH_INFO_CHANNEL = "pennapps.authorize.info";
const ALGOLIA_SEARCH_CHANNEL = "pennapps.algolia.search";




sub.on("subscribe", function (channel, count) {
    console.log("subscribed");
});

sub.on("message", (channel, message) => {

    if (channel == AUTH_INFO_CHANNEL) {
        var authInfo = JSON.parse(message);
        console.log(authInfo);
        authorize.authorizeCreditCard(authInfo, () => {

        });
    }


});





sub.subscribe(START_AUTH_CHANNEL, () => {
    sub.subscribe(AUTH_INFO_CHANNEL, () => {
        // NOTE: this publish should happen on the dispenser side.
        // I added this so I could run it on one machine for test
        // purposes.
        
    });
});

