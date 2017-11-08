'use strict';

var URLS = {
    decreaseVolume: Router.action('Home', 'DecreaseVolume'),
    stream: Router.action('Home', 'Stream'),
    streamer: Router.action('Home', 'Streamer'),
    flashSWF: "../Assets/bundles/images/soundmanager2.swf",
    flashJS: "../Assets/bundles/js/soundmanager2.js",
    particleBase: "../Assets/bundles/images/particle_"
};

var MESSAGES = {
    alreadyMuted: "Device is already muted",
    noDeviceFound: "No devices found to record",
    uncaughtError: "Oops, an error has occured. Please try again later.."
};