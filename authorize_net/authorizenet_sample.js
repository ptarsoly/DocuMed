'use strict';

var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var utils = require('../utils.js');
var constants = require('../constants.js');


function authorizeCreditCard(info, callback) {
	var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
	merchantAuthenticationType.setName(constants.apiLoginKey);
	merchantAuthenticationType.setTransactionKey(constants.transactionKey);

    var creditCard = new ApiContracts.CreditCardType();
    //TODO
	creditCard.setCardNumber(info.CardNum);
	creditCard.setExpirationDate(info.ExprDate);
	creditCard.setCardCode(info.Code);

	var paymentType = new ApiContracts.PaymentType();
	paymentType.setCreditCard(creditCard);

    var orderDetails = new ApiContracts.OrderType();
    // TODO: increment the invoice number
	orderDetails.setInvoiceNumber('INV-12345');
	orderDetails.setDescription('Medication');

	var billTo = new ApiContracts.CustomerAddressType();
	billTo.setFirstName(info.FirstName);
	billTo.setLastName(info.LastName);
	billTo.setAddress(info.Address);
	billTo.setCity(info.City);
	billTo.setState(info.State);
	billTo.setZip(info.ZipCode);
	billTo.setCountry(info.Country);

	// var lineItem_id1 = new ApiContracts.LineItemType();
	// lineItem_id1.setItemId('1');
	// lineItem_id1.setName('vase');
	// lineItem_id1.setDescription('cannes logo');
	// lineItem_id1.setQuantity('18');
	// lineItem_id1.setUnitPrice(45.00);

	// var lineItemList = [];
	// lineItemList.push(lineItem_id1);

	// var lineItems = new ApiContracts.ArrayOfLineItem();
	// lineItems.setLineItem(lineItemList);

	var transactionRequestType = new ApiContracts.TransactionRequestType();
	transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHONLYTRANSACTION);
	transactionRequestType.setPayment(paymentType);
	transactionRequestType.setAmount(utils.getRandomAmount()); //TODO: fix this
	transactionRequestType.setOrder(orderDetails);
	transactionRequestType.setBillTo(billTo);

	var createRequest = new ApiContracts.CreateTransactionRequest();
	createRequest.setMerchantAuthentication(merchantAuthenticationType);
	createRequest.setTransactionRequest(transactionRequestType);

	//pretty print request
	console.log(JSON.stringify(createRequest.getJSON(), null, 2));
		
	var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

	ctrl.execute(function(){

		var apiResponse = ctrl.getResponse();

		var response = new ApiContracts.CreateTransactionResponse(apiResponse);

		//pretty print response
		console.log(JSON.stringify(response, null, 2));

		if(response != null){
			if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
				if(response.getTransactionResponse().getMessages() != null){
					console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
					console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
					console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
					console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
				}
				else {
					console.log('Failed Transaction.');
					if(response.getTransactionResponse().getErrors() != null){
						console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
						console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
					}
				}
			}
			else {
				console.log('Failed Transaction.');
				if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
				
					console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
					console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
				}
				else {
					console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
					console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
				}
			}
		}
		else {
			console.log('Null Response.');
		}

		callback(response);
	});
}

if (require.main === module) {
	authorizeCreditCard(function(){
		console.log('authorizeCreditCard call complete.');
	});
}

module.exports.authorizeCreditCard = authorizeCreditCard;