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

    $scope.textContent  = null;
    $scope.imageContent = null;
    $scope.key          = null;

    $scope.reader       = null;

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

        $scope.$parent.reader = new FileReader();

        $scope.$parent.reader.onload = (function(theFile) {
            return function(e) {
                var span = ['<span>','<img class="image-preview" src="', e.target.result,
                                    '" title="', escape(theFile.name), '"/>','</span>'].join('');
                document.getElementById('imagePreview').innerHTML = span;
            };
        })($scope.$parent.imageContent._file);

        $scope.$parent.reader.readAsDataURL($scope.$parent.imageContent._file);
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

artsWebApp.controller('confirmState', function ($scope, dataFactory){

    /*
        Initialize everything to null
    */
    $scope.key          = null;
    $scope.contentData  = null;
    $scope.contentType  = null;

    $scope.sendRequest = function(){
        /*
            Create body & url for post request
        */
        var url = 'http://artsserver.herokuapp.com/content/setContent';
        
        var body = {
            'contentType': $scope.contentType,
            'contentData': $scope.contentData,
        };

        /*
            Make post request and set key as response.
        */
        dataFactory.postQrCodeData(url, body).then(function(key){
            $scope.key = key;
        }, function(error){
            console.log(error);
        });
    };


    /*
        Watch for the confirm state to become true
    */
    $scope.$watch('confirmState', function(){
        if($scope.$parent.confirmState){
            
            /*
                If the content is text
            */
            if($scope.$parent.textContent !== null ){
                $scope.contentData  = $scope.$parent.textContent;
                $scope.contentType  = 'text';
                $scope.sendRequest();
            /*
                If the content is an image
            */
            }else{
                /*
                    Display image preview on page
                */
                $scope.$parent.reader = new FileReader();

                $scope.$parent.reader.onload = (function(theFile) {
                    return function(e) {
                        $scope.contentType  = 'image';
                        $scope.contentData  = $scope.$parent.reader.result;
                        $scope.sendRequest();
                        var span = ['<span>','<img class="image-preview" src="', e.target.result,
                                            '" title="', escape(theFile.name), '"/>','</span>'].join('');
                        document.getElementById('imageFinal').innerHTML = span;
                    };
                })($scope.$parent.imageContent._file);

                $scope.$parent.reader.readAsDataURL($scope.$parent.imageContent._file);
            }
        }
    });
});
