/* node */
var fs = require('fs');
var path = require('path');
var skyweb_1 = require('skyweb');
var ActivitiAPI = require('activiti-api').ActivitiAPI;

function jsonFile(relPath) {
    return JSON.parse(fs.readFileSync(path.join(__dirname, relPath)));
}

var user = jsonFile('config.json');
//var activitiAPI = new ActivitiAPI("ja", user.user, user.password);
//console.log(activitiAPI.getInfo());

var message1 = "Witaj w callcenter\nWybierz 1,2 lub 3\n1- Logowanie\n2- Połączenie z konsultantem\n3- Powtórz powitanie\n";

var skyweb = new skyweb_1();
var selected;

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


            skyweb.sendMessage(conversationId, start(conversationId, message.resource.content));
            //            skyweb.sendMessage(conversationId, message1);
            console.log(message.resource.content);
            selected = message.resource.content;
        }
    });
};

var queueStart = [];
var queueMed = [];
var queueLog = [];
var queueKon = [];
var queueLoged = [];
var message2 = "Wybrałeś 1";
var message3 = "Wybrałeś 2";
var message4 = "Wybrałeś 3";
var message5 = "Wybrałeś coś złego";
var logowanie = "Podaj login i hasło (oddzielone spacją)";
var konsultant = "polaczono z konsultantem";

function start(conversationId, text) {
    if (!contains(queueStart, conversationId)) {
        queueStart.push(conversationId);
        return message1;
    } else {
        if (!contains(queueMed, conversationId)) {
            queueMed.push(conversationId);
            if (text === "1") {
                queueLog.push(conversationId);
                return message2 + "\n" + logowanie;
            } else if (text === "2") {
                queueKon.push(conversationId);
                return message3 + "\n" + konultant;
            } else if (text === "3") {
                queueMed.remove(conversationId);
                return message4 + "\n" + message1;
            } else {
                queueMed.remove(conversationId);
                return message5 + "\n" + message1;
            }
        } else {
            if (contains(queueLog, conversationId)) {
                return checkPassword(text,conversationId);
            } else if (contains(queueKon, conversationId)) {
                queueStart.push(conversationId);
                return message1;
            }
        }
    }
}

function checkPassword(text,conversationId) {
    if (text === "login hasło") {
        queueLoged.push(conversationId);
        return "Zalogowano";
    } else {
        return "Wprowadzone dane są nieprawidłowe";
    }
}

function contains(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
