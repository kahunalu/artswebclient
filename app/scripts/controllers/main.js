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

    $scope.textContent = null;
    $scope.imageContent = null;

    $scope.createState	= true;
    $scope.contextState	= false;
    $scope.contentState	= false;
    $scope.adjustState	= false;
    $scope.confirmState	= false;

    $scope.switchState = function(){
    	if($scope.createState){

 			$scope.createState	= false;
 			$scope.contentState	= true;

    	} else if($scope.contextState){

 			$scope.contextState	= false;
    		$scope.contentState	= true;

    	} else if($scope.contentState){

 			$scope.contentState	= false;
			$scope.confirmState	= true;

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

artsWebApp.controller('contentState', ['$scope', 'FileUploader', function($scope, FileUploader) {
    $scope.incomplete       = true;
    $scope.imageSelected    = true;
    $scope.textSelected     = false;
    $scope.imageUploaded    = false;

    $scope.textValue = null;

    $scope.switchSelected   = function(){
        if($scope.imageSelected){
            $scope.imageSelected    = false;
            $scope.textSelected     = true;
        }else{
            $scope.imageSelected    = true;
            $scope.textSelected     = false;
        }
    };

    var uploader = $scope.uploader = new FileUploader({
        url: '<REPLACE WITH SERVER ENDPOINT>',
        queueLimit: 1
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onWhenAddingFileFailed = function() {
        console.log('UPLOAD FAILURE');
    };

    uploader.onAfterAddingFile = function(item) {
        $scope.incomplete = false;
        $scope.imageUploaded = true;
        $scope.$parent.imageContent = item;
        $scope.$parent.textContent = null;

        var reader = new FileReader();

        reader.onload = (function(theFile) {
            return function(e) {
                var span = document.createElement('span');
                span.innerHTML = ['<img class="image-preview" src="', e.target.result,
                            '" title="', escape(theFile.name), '"/>'].join('');
            document.getElementById('imagePreview').insertBefore(span, null);
            };
        })(item._file);

      reader.readAsDataURL(item._file);
    };

    $scope.setText = function(text){
        $scope.incomplete = false;
        $scope.$parent.imageContent = null;
        $scope.$parent.textContent = text;
        $scope.imageUploaded = false;
        uploader.clearQueue();
    };

    $scope.resetValues = function(){
        $scope.incomplete       = true;
        $scope.imageSelected    = true;
        $scope.textSelected     = false;
        $scope.imageUploaded    = false;

        $scope.textValue = null;
        uploader.clearQueue();
    };

}]);

artsWebApp.controller('adjustState', function ($scope) {
    $scope.test = 'test string in adjustState';
});

artsWebApp.controller('confirmState', function ($scope) {
    $scope.printQR = function(){
        $('#QRCode').get(0).contentWindow.print();
    };
});
