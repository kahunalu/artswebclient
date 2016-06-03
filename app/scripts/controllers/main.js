'use strict';

/**
 * @ngdoc function
 * @name artswebclientMasterApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the artswebclientMasterApp
 */
angular.module('artswebclientMasterApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.createState	= true;
    $scope.contextState	= false;
    $scope.contentState	= false;
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
