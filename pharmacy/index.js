const config = require('../configRedis.json');
var HIDStream = require('node-hid-stream').KeyboardLines;
var bodyParser = require('body-parser')
let device;
try {
    device = new HIDStream({ vendorId: 49686, productId: 384}); // magtek reader
} catch (error) {
    console.log(error);
    return;
}

var express = require('express');

var redis = require("redis"),
    pub = redis.createClient(config),
    sub = redis.createClient(config);

    const AUTH_INFO_CHANNEL = "pennapps.authorize.info";

var cors = require('cors');
var app = express();

var signed = false;

app.use(cors())

app.use(bodyParser.json())

app.listen(3000);






app.post('/signed', (req, res) => {
  console.log(req.body);
  signed = true;

  res.sendStatus(200);
});

device.on('data', (data) => {
  //console.log(data);
  if(!data) return;
    if (data.includes('E?')) {
        return console.log('card swipe error');
    }
    const cardNumber = data.substring(1, 17); // 16 digit card number
    const id = data.substring(7, 16); // 9 digit student id
    const cardIndex = data.substring(16, 17); // This number is incremented each time a physical card is reprinted/magnitized.
    console.log(id);

    if(signed) {
      pub.publish(AUTH_INFO_CHANNEL, JSON.stringify({
        CardNum: id.toString()+'1111111',
        ExprDate: '0822',
        Code: '999',
        FirstName: 'Ellen',
        LastName: 'Johnson',
        Address: '14 Main Street',
        City: 'Pecan Springs',
        State: 'TX',
        ZipCode: '44628',
        Country: 'USA'
    }));
    }
    

    signed = false;

    // log(cardNumber, id, cardIndex);
});
