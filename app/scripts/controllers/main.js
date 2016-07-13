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
    $scope.contentState	= false;
    $scope.confirmState	= false;

    $scope.switchState = function(){
    	if($scope.createState){

 			$scope.createState	= false;
 			$scope.contentState	= true;

    	} else if($scope.contentState){

 			$scope.contentState	= false;
			$scope.confirmState	= true;

    	} else if($scope.confirmState){

    		$scope.confirmState	= false;
 			$scope.createState	= true;
    	}
    };
});

artsWebApp.controller('contentState', ['$scope', 'FileUploader', function($scope, FileUploader) {
    $scope.incomplete       = true;
    $scope.imageSelected    = true;
    $scope.textSelected     = false;
    $scope.imageUploaded    = false;
    $scope.contentSize      = null;
    $scope.textValue        = null;

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
        alpha:  true,
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

    $scope.uploader = new FileUploader({
        queueLimit: 1
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function(item) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onWhenAddingFileFailed = function() {
        console.log('UPLOAD FAILURE');
    };

    $scope.uploader.onAfterAddingFile = function(item) {
        $scope.incomplete = false;
        $scope.imageUploaded = true;
        $scope.$parent.imageContent = item;
        $scope.$parent.textContent = null;
        $scope.$parent.contentSize = $scope.contentSize;
        
        // Create file reader and get base64 encoding
        var reader = new FileReader();
        reader.readAsDataURL(item._file);

        // When reader is done reading the file, add contents to DOM
        reader.onloadend = function(event){
            var previweImage = document.getElementById('imagePreviewElement'),
            imageContent = event.target.result;
            previweImage.src = imageContent;
            previweImage.style.maxHeight = getImageHeight();
            $scope.$parent.imageContent = imageContent;
        };
    };

    $scope.setImageHeight = function(){
        var imagePreviewElement = document.getElementById('imagePreviewElement');
        imagePreviewElement.style.maxHeight = getImageHeight();
        $scope.$parent.contentSize = $scope.contentSize;
    };

    function getImageHeight(){
        if($scope.contentSize === "1"){         // Small Image Case
            return "200px";
        }
        else if($scope.contentSize === "4"){    // Large Image Case
            return "600px";
        }
        else{                                   // Medium / Default Image Case
            return "400px";
        }
    };

    $scope.setText = function(text){
        $scope.incomplete           = false;
        $scope.$parent.imageContent = null;
        $scope.$parent.textContent  = text;
        $scope.$parent.contentSize  = $scope.contentSize;
        $scope.imageUploaded        = false;
        $scope.uploader.clearQueue();
        $scope.drawCanvas();
    };

    $scope.drawCanvas = function(){
        var textCanvasObj = document.getElementById('textCanvas').getContext('2d'),
        text = $scope.$parent.textContent,
        textContentLines,
        textLineLength = 0,
        maxLineLength = 0,
        fontStyle = getFontHeight() + "px Arial",
        i = 0,
        y = 0;

        // Set font before measureText to get accurate spacing, then get line length for canvas
        textCanvasObj.font = fontStyle;
        textLineLength = textCanvasObj.measureText(text).width;
        maxLineLength = (textLineLength > 600) ? 600 : textLineLength; 

        // Lines split so they dont go over the maxLine length, canavas height and width are set
        textContentLines = getLines(textCanvasObj, text, maxLineLength, fontStyle);
        textCanvasObj.canvas.height = 50 + (textContentLines.length * getFontHeight());
        textCanvasObj.canvas.width = 50 + maxLineLength;
            
        // Add colors from color picker to canvas and align text 
        textCanvasObj.fillStyle = $scope.imageColor;      
        textCanvasObj.fillRect(0,0, maxLineLength + 50, 50 + (textContentLines.length * getFontHeight()));
        textCanvasObj.textBaseline = 'hanging';
        textCanvasObj.fillStyle = $scope.textColor;
        textCanvasObj.font = fontStyle; 

        // Make single/multiple lines in canvas
        for(i = 0; i < textContentLines.length; i++){
            textCanvasObj.fillText(textContentLines[i], 25, 25 + y + (i * getFontHeight()));
        }
        $scope.$parent.textImage = textCanvasObj.canvas.toDataURL();
    }; 

    function getFontHeight(){
        if($scope.contentSize === "1"){         // Small Text Case
            return 12;
        }
        else if($scope.contentSize === "4"){    // Large Text Case
            return 50;
        }
        else{                                   // Medium / Default Text Case
            return 25;
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
        $scope.uploader.clearQueue();
    };
}]);

artsWebApp.controller('createState', function ($scope) {});

artsWebApp.controller('confirmState', function ($scope, $location, dataFactory){

    // Initialize everything to null
    $scope.key          = null;
    $scope.contentData  = null;
    $scope.contentType  = null;
 
     // Hacky way of restarting the flow, works but better way would be to clear everything 
     // and start in image/text upload state 
    $scope.restartFlow = function(){
        $location.url('artag.xyz');
    };

    function getImageHeight(){
        if($scope.$parent.contentSize === "1"){         // Small Image Case
            return "200px";
        }
        else if($scope.$parent.contentSize === "4"){    // Large Image Case
            return "600px";
        }
        else{                                           // Medium / Default Image Case
            return "400px";
        }
    };

    $scope.sendRequest = function(){
        
        // Create body & url for post request
        var url = 'http://artsserver.herokuapp.com/content/setContent',      
        body = {
            'contentType': 'image',
            'contentData': $scope.contentData,
            'contentSize': $scope.$parent.contentSize,
        };

        // Make post request and set key as response.
        dataFactory.postQrCodeData(url, body).then(function(key){
            $scope.key = key;
        }, function(error){
            console.log(error);
        });
    };


    // Watch for the confirm state to become true
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
                // Get the current qrImage data
                qrImage.src = downloadlink.getAttribute('href');

                // Check if the qrimage has null in it and return if so
                var patt = /null/g;
                if(patt.test(qrImage.src)){
                    return;
                }

                // If the qrimage is not null clear interval check and process image
                clearInterval(checkIntervalId);

                // Increase Previous Canvas size to accomodate new anchor tag 
                canvas.width += 50;
                canvas.height += 375;

                // Create a background, and border
                context.fillStyle = '#FFFFFF';
                context.fillRect(0,0,350,675);
                context.lineWidth = 5;
                context.strokeStyle='#000000';
                context.strokeRect(0, 0, 350, 675);

                // Draw the qrImage first then the anchorImage
                context.drawImage(qrImage, 25, 25);
                context.drawImage(anchorImage, 25, 350);
                
                // Create elements on the DOM for the preview and link
                var link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'anchorTag.png';

                var preview = document.createElement('img');
                preview.src = canvas.toDataURL('image/png');
                preview.className = 'qr-preview-image';
                
                var anchortaglink = document.getElementById('anchorTagLink');
                
                link.appendChild(preview);
                anchortaglink.appendChild(link);
                
                // Turn off the loading flag
                $scope.$apply(function(){
                    $scope.loading = false;
                });
            };

            // Execute the createAnchorTag function every .5s, if tag is generated stop
            var checkIntervalId = setInterval(createAnchorTag, 500),
            imageSrc = "";

            // If the content is from the canvas
            if($scope.$parent.textContent !== null ){
                $scope.contentData  = $scope.$parent.textImage.split(/,(.+)/)[1];
                imageSrc = $scope.$parent.textImage;
            // If the content is an image
            }else{
                $scope.contentData  = $scope.$parent.imageContent.split(/,(.+)/)[1];
                imageSrc = $scope.$parent.imageContent;
            }

            // Set src and style of final image element
            var finalImage = document.getElementById('imageFinalElement');
            finalImage.style.maxHeight = getImageHeight();
            finalImage.src = imageSrc;

            // Finish setting scope parameters and send request
            $scope.contentType  = 'image';
            $scope.sendRequest();
        }
    });
});
