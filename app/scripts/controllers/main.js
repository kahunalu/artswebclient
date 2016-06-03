'use strict';

/**
 * @ngdoc function
 * @name artswebclientMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the artswebclientMasterApp
 */
var artsWebApp = angular.module('artswebclientMasterApp');

artsWebApp.controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
    ];
    $scope.createState	= false;
    $scope.contextState	= false;
    $scope.contentState	= true;
    $scope.adjustState	= false;
    $scope.confirmState	= false;


    $scope.switchState = function(){
    	if($scope.createState){
 			
 			$scope.createState	= false;
 			$scope.contextState	= true;

    	} else if($scope.contextState){
    		
 			$scope.contextState	= false;
    		$scope.contentState	= true;
    	
    	} else if($scope.contentState){
 			
 			$scope.contentState	= false;
			$scope.adjustState	= true;
    	
    	} else if($scope.adjustState){
    		
    		$scope.adjustState	= false;
 			$scope.confirmState	= true;
    	
    	} else if($scope.confirmState){
    		
    		$scope.confirmState	= false;
 			$scope.createState	= true;
    	}
    };
});

artsWebApp.controller('createState', function ($scope) {
    $scope.test = 'test string in createState';
});

artsWebApp.controller('contextState', function ($scope) {
    $scope.test = 'test string in contextState';
});

artsWebApp.controller('contentState', function ($scope) {
    $scope.imageSelected    = true;
    $scope.textSelected     = false;
    $scope.incomplete       = true;
});

artsWebApp.controller('adjustState', function ($scope) {
    $scope.test = 'test string in adjustState';
});

artsWebApp.controller('confirmState', function ($scope) {
    $scope.test = 'test string in confirmState';
});

