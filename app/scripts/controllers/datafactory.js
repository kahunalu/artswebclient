'use strict';
/*
	Datafactory will be a wrapper which handles data requests

	Use the utils functionality to make the request calls
*/
angular.module('artswebclientMasterApp')
    .factory('dataFactory', function($q, $http, utilsFactory) {
        var factory = {};

        factory.postQrCodeData = function(url, body, formdata) {

            return utilsFactory.postRequest(url, body, formdata);
        };

        return factory;
    });
