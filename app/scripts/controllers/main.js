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
    $scope.contentSize  = null;
    $scope.imageColor   = '#00000000';
    $scope.textColor    = '#000000FF';

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
    $scope.contentSize      = null;

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

    $scope.colorPickerOptions = {
        format: 'HEX',
        alpha: true,
        swatch: true,
        swatchBootstrap: false,
        swatchOnly: true,
        pos: 'top left'
    };

    $scope.textColorPickerApi = {
        onChange: function(){
            $scope.drawCanvas();
        },
    }

    $scope.backgroundColorPickerApi = {
        onChange: function(){
            $scope.drawCanvas();
        },
    }

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
        $scope.$parent.contentSize = $scope.contentSize;

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
        $scope.incomplete           = false;
        $scope.$parent.imageContent = null;
        $scope.$parent.textContent  = text;
        $scope.$parent.contentSize  = $scope.contentSize;
        $scope.imageUploaded        = false;
        uploader.clearQueue();
        $scope.drawCanvas();
    };

    $scope.drawCanvas = function(){
        var textCanvasObj = document.getElementById('textCanvas').getContext('2d'),
        text = $scope.$parent.textContent,
        textContentLines,
        textLineLength = 0,
        maxLineLength = 0,
        fontStyle = getFontStyle(),
        i = 0,
        y = 0;

        textCanvasObj.font = fontStyle;                          // Set font before measureText to get accurate spacing
        textLineLength = textCanvasObj.measureText(text).width;
        maxLineLength = (textLineLength > 600) ? 600 : textLineLength; 


        textContentLines = getLines(textCanvasObj, text, maxLineLength, fontStyle);
        textCanvasObj.canvas.height = 50+(textContentLines.length*50); // Set canvas height
        textCanvasObj.canvas.width = 50+maxLineLength;                 // Set canvas width
            
        //This is the backgroud image color, null->clear
        textCanvasObj.fillStyle = $scope.imageColor;      
        textCanvasObj.fillRect(0,0, maxLineLength+50, 50+(textContentLines.length*50));                         // Need to reset font for some reason
        textCanvasObj.textBaseline = 'hanging';                     // Align text at very top of canvas
        textCanvasObj.fillStyle = $scope.textColor;         // Filling text color from picker
        textCanvasObj.font = fontStyle; 
        for(i = 0; i < textContentLines.length; i++){               // Make single/multiple lines in canvas
            textCanvasObj.fillText(textContentLines[i], 25, 25 + y + (i*50));
        }
        $scope.$parent.textImage = textCanvasObj.canvas.toDataURL();
    }; 

    function getFontStyle(){
        if($scope.contentSize === "1"){         // Small Text Case
            return "12px Arial";
        }
        else if($scope.contentSize === "3"){    // Large Text Case
            return "50px Arial";
        }
        else{                                   // Medium / Default Text Case
            return "25px Arial";
        }
    };

    /**
    * Divide an entire phrase in an array of phrases
    * @param ctx = canvas element
    * @param phrase = text that needs to be put into multi-lines
    * @param maxPxLength = max line length in px
    * @param textStyle = string representing the text's style 
    * @return array with the phrase split into lines
    */
    function getLines(ctx, phrase, maxPxLength, textStyle) {
        var wa=phrase.split(' '),
            phraseArray=[],
            lastPhrase=wa[0],
            measure=0,
            splitChar=' ';
        if (wa.length <= 1) {
            return wa;
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
    };

    $scope.resetValues = function(){
        $scope.incomplete       = true;
        $scope.imageSelected    = true;
        $scope.textSelected     = false;
        $scope.imageUploaded    = false;
        $scope.textValue        = null;
        uploader.clearQueue();
    };

}]);

artsWebApp.controller('adjustState', function ($scope) {
    $scope.test = 'test string in adjustState';
});

artsWebApp.controller('confirmState', function ($scope, $location, dataFactory){

    /*
        Initialize everything to null
    */
    $scope.key          = null;
    $scope.contentData  = null;
    $scope.contentType  = null;

    /* 
        hacky way of restarting the flow, 
        works but better way would be to clear everything 
        and start in image/text upload state 
    */
    $scope.restartFlow = function(){
        $location.url('artag.xyz');
    };

    $scope.sendRequest = function(){
        /*
            Create body & url for post request
        */
        var url = 'http://artsserver.herokuapp.com/content/setContent';
        
        var body = {
            'contentType': 'image',
            'contentData': $scope.contentData,
            'contentSize': $scope.$parent.contentSize,
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

            $scope.loading = true;

            var downloadlink = document.getElementsByClassName('qrcode-link')[0],
            canvas = document.getElementsByClassName('qrcode')[0],
            context = canvas.getContext('2d'),
            anchorImage = new Image(),
            qrImage = new Image();

            anchorImage.src = 'images/anchortag.png';

            var createAnchorTag = function(){
                /*Get the current qrImage data*/
                qrImage.src = downloadlink.getAttribute('href');

                /*Check if the qrimage has null in it and return if so*/
                var patt = /null/g;
                if(patt.test(qrImage.src)){
                    return;
                }

                /*If the qrimage is not null clear interval check and process image*/
                clearInterval(checkIntervalId);

                /* Increase Previous Canvas size to accomodate new anchor tag */
                canvas.width += 50;
                canvas.height += 375;

                /* Create a background, and border*/
                context.fillStyle = '#FFFFFF';
                context.fillRect(0,0,350,675);
                context.lineWidth = 5;
                context.strokeStyle='#000000';
                context.strokeRect(0, 0, 350, 675);

                /*Draw the qrImage first then the anchorImage*/
                context.drawImage(qrImage, 25, 25);
                context.drawImage(anchorImage, 25, 350);
                
                /*Create elements on the DOM for the preview and link*/
                var link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'anchorTag.png';

                var preview = document.createElement('img');
                preview.src = canvas.toDataURL('image/png');
                preview.className = 'qr-preview-image';
                
                var anchortaglink = document.getElementById('anchorTagLink');
                
                link.appendChild(preview);
                anchortaglink.appendChild(link);
                
                /*Turn off the loading flag*/
                $scope.$apply(function(){
                    $scope.loading = false;
                });
            };

            /*Execute the createAnchorTag function every .5s, if tag is generated stop*/
            var checkIntervalId = setInterval(createAnchorTag, 500),
            imageSrc = "";

            //If the content is from the canvas
            if($scope.$parent.textContent !== null ){
                $scope.contentData  = $scope.$parent.textImage.split(/,(.+)/)[1];
                imageSrc = $scope.$parent.textImage;
            // If the content is an image
            }else{
                $scope.contentData  = $scope.$parent.reader.result.split(/,(.+)/)[1];
                imageSrc = $scope.$parent.reader.result;
            }

            // Create new image and span elements
            var previweImage = new Image(),
            previewSpan = document.createElement('span');

            // Set attributes of span & image elements, then append to DOM
            previweImage.class = "image-preview";
            previweImage.src = imageSrc;
            previewSpan.appendChild(previweImage);
            document.getElementById('imageFinal').appendChild(previewSpan);

            // Finish setting scope parameters and send request
            $scope.contentType  = 'image';
            $scope.sendRequest();
        }
    });
});
