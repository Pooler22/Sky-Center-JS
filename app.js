"use strict";
var fs = require('fs');
var path = require('path');
var skyweb_1 = require('skyweb');

var user = jsonFile('config.json');

function jsonFile(relPath) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, relPath)));
}

var skyweb = new skyweb_1();

skyweb.login(user.user, user.password).then(function(skypeAccount) {
    console.log('Skype is initialized now');
    console.log('Here is some info about you:' + JSON.stringify(skyweb.skypeAccount.selfInfo, null, 2));
    console.log('Your contacts : ' + JSON.stringify(skyweb.contactsService.contacts, null, 2));
    console.log('Going Online.');
    skyweb.setStatus('Online');
});

skyweb.authRequestCallback = function(requests) {
    requests.forEach(function(request) {
        skyweb.acceptAuthRequest(request.sender);
        skyweb.sendMessage("8:" + request.sender, "I accepted you!");
    });
};

skyweb.messagesCallback = function(messages) {
    messages.forEach(function(message) {
        if (message.resource.from.indexOf(user.user) === -1 && message.resource.messagetype !== 'Control/Typing' && message.resource.messagetype !== 'Control/ClearTyping') {
            var conversationLink = message.resource.conversationLink;
            var conversationId = conversationLink.substring(conversationLink.lastIndexOf('/') + 1);
            skyweb.sendMessage(conversationId, message.resource.content + '. Cats will rule the World');
        }
    });
};
