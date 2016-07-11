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
    $scope.contentSize  = null;


        /**
         * Divide an entire phrase in an array of phrases, all with the max pixel length given.
         * The words are initially separated by the space char.
         * @param phrase
         * @param length
         * @return
         */
    function getLines(ctx, phrase, maxPxLength, textStyle) {
        var wa=phrase.split(" "),
            phraseArray=[],
            lastPhrase=wa[0],
            measure=0,
            splitChar=" ";
        if (wa.length <= 1) {
            return wa
        }

        ctx.font = textStyle;
        for (var i=1;i<wa.length;i++) {
            var w=wa[i];
            measure=ctx.measureText(lastPhrase+splitChar+w).width;
            if (measure<maxPxLength) {
                lastPhrase+=(splitChar+w);
            } else {
                phraseArray.push(lastPhrase);
                lastPhrase=w;
            }
            if (i===wa.length-1) {
                phraseArray.push(lastPhrase);
                break;
            }
        }
        return phraseArray;
    }

    $scope.sendRequest = function(){
        /*
            Create body & url for post request
        */
        var url = 'http://127.0.0.1:5000/content/setContent',
        body;

        if($scope.contentType === 'text'){
            var textCanvasObj = document.getElementById('textCanvas').getContext('2d'),
            imageElem = document.getElementById('image'),
            textContentLines,
            textLineLength = 0,
            maxLineLength = 0,
            i = 0,
            y = 0;

            textCanvasObj.font = "50px Arial";                          // Set font before measureText to get accurate spacing
            textLineLength = textCanvasObj.measureText($scope.contentData).width;
            maxLineLength = (textLineLength > 700) ? 700 : textLineLength; 

            textContentLines = getLines(textCanvasObj, $scope.contentData, maxLineLength, "50px Arial");
            textCanvasObj.canvas.height = textContentLines.length*50;   // Set canvas height
            textCanvasObj.canvas.width = maxLineLength;                 // Set canvas width
            textCanvasObj.font = "50px Arial";                          // Need to reset font for some reason
            textCanvasObj.textBaseline = "hanging";                     // Align text at very top of canvas
            
            for(i = 0; i < textContentLines.length; i++){               // Make single/multiple lines in canvas
                textCanvasObj.fillText(textContentLines[i], 0, y + (i*50));
            }

            imageElem.src = textCanvasObj.canvas.toDataURL();           // Show image on confirm page
            
            body = {
                'contentSize': $scope.contentSize,
                'contentType': 'image',
                'contentData': textCanvasObj.canvas.toDataURL().split(/,(.+)/)[1],
            };
        
        }else{
            body = {
                'contentSize': $scope.contentSize,
                'contentType': 'image',
                'contentData': $scope.contentData,
            };
        }

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

            $scope.loading = true;

            var downloadlink = document.getElementsByClassName('qrcode-link')[0];

            var canvas = document.getElementsByClassName('qrcode')[0],
            context = canvas.getContext('2d');
        
            var anchorImage = new Image();
            var qrImage = new Image();
            anchorImage.src = 'images/anchortag.png';

            setTimeout(function(){

                qrImage.src = downloadlink.getAttribute("href");
                canvas.width += 50;
                canvas.height += 375;

                context.fillStyle = "#FFFFFF";
                context.fillRect(0,0,350,675);
                context.lineWidth = 5;
                context.strokeStyle="#000000";
                context.strokeRect(0, 0, 350, 675);
                context.drawImage(qrImage, 25, 25);
                context.drawImage(anchorImage, 25, 350);
                
                var link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "anchorTag.png";

                var preview = document.createElement("img");
                preview.src = canvas.toDataURL("image/png");
                preview.className = "qr-preview-image";
                
                var anchortaglink = document.getElementById("anchorTagLink");
                
                link.appendChild(preview);
                anchortaglink.appendChild(link);
                
                $scope.$apply(function(){
                    $scope.loading = false;
                });
            },2000);

            /*
                If the content is text
            */
            if($scope.$parent.textContent !== null ){
                $scope.contentType  = 'text';
                $scope.contentData  = $scope.$parent.textContent;
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
                    return function(e){
                        $scope.contentType = 'image';

                        //remove meta-data up to the first comma.
                        $scope.contentData  = $scope.$parent.reader.result.split(/,(.+)/)[1];

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
