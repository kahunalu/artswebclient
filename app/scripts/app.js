'use strict';

/**
 * @ngdoc overview
 * @name artswebclientMasterApp
 * @description
 * # artswebclientMasterApp
 *
 * Main module of the application.
 */
angular
  .module('artswebclientMasterApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularFileUpload'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
