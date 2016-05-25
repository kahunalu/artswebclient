'use strict';
/*
	Datafactory will be a wrapper which handles data requests 

	Use the utils functionality to make the request calls
*/
angular.module('artswebclientMasterApp')
    .factory('dataFactory', function($q, $http, utilsFactory) {
        var factory = {};

        factory.postQrCodeData = function(type, key) {
            var url = '<REPLACE WITH SERVER ENDPOINT>';

            var body = {
            	"type":type,
            	"key":key
            }

            return utilsFactory.postRequest(url, body);
        };

        return factory;
    });
