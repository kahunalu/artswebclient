'use strict';

angular.module('moodfeedappApp')
    .factory('utilsFactory', function($http, $q) {
        var factory = {};

        factory.getRequest = function(url) {
            var deferred = $q.defer();

            $http.get(url).success(function(data) {
                deferred.resolve(data);
            }).error(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        factory.postRequest = function(url, body) {
            var deferred = $q.defer();

            $http.post(url, body).success(function(data) {
                deferred.resolve(data);
            }).error(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        factory.putRequest = function(url, body) {
            var deferred = $q.defer();

            $http.put(url, body).success(function(data) {
                deferred.resolve(data);
            }).error(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        factory.deleteRequest = function(url) {
            var deferred = $q.defer();

            $http.delete(url).success(function(data) {
                deferred.resolve(data);
            }).error(function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };

        factory.addParams = function(url, params) {
            var first = url.indexOf('?') === -1;
            angular.forEach(params, function(value, key) {
                if(value !== undefined && value !== null) {
                    if(first) {
                        url += '?';
                    } else {
                        url += '&';
                    }
                    if(typeof key === 'boolean') {
                        url += encodeURIComponent(key) + '=' + (key ? 'True' : 'False');
                    } else {
                        url += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                    }
                    first = false;
                }
            });
            return url;
        };

        factory.paginateUrl = function(url, page, results) {
            var params = {'page': page,
                          'page_size': results};
            return factory.addParams(url, params);
        };

        return factory;
    });
