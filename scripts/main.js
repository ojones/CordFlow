$(function () {
	"use strict";
	var startX,
		startY,
		captureActive,
		selectedBoxes = [],
		metaArray = [],
		activePosition,
		$selectionMarquee = $('#selectionMarquee'),
		$metaBox = $('#meta'),
		$metaBoxInput = $('#meta'),
		$allCords = $('#all-cords'),
		positionBox = function ($box, coordinates) {
			$box.css('top', coordinates.top).css('left', coordinates.left)
				.css('height', coordinates.bottom - coordinates.top)
				.css('width', coordinates.right - coordinates.left);
		},

		setBox = function ($box, coordinates) {
			$box.css('top', coordinates.bottom).css('left', coordinates.right);
		},

		compareNumbers = function (a, b) {
			return a - b;
		},
		getBoxCoordinates = function (startX, startY, endX, endY) {
			var x = [startX, endX].sort(compareNumbers),
				y = [startY, endY].sort(compareNumbers);

			return {
				top: y[0],
				left: x[0],
				right: x[1],
				bottom: y[1]
			};
		},
		trackMouse = function (event) {
			var position = getBoxCoordinates(startX, startY, event.pageX, event.pageY);
			console.log(position);
			positionBox($selectionMarquee, position);
		},
		displayCoordinates = function () {
			var msg = 'Boxes so far:\n';

			metaArray.forEach(function (meta) {
			    var box_left        = meta.position.left - $('#docImage').offset().left
			        , box_top       = meta.position.top - $('#docImage').offset().top
			        , box_right     = meta.position.right - $('#docImage').offset().left 
			        , box_bottom    = meta.position.bottom - $('#docImage').offset().top
		
				msg += '<li>['+ meta.value +'] (' + box_left + ', ' + box_top + ') - (' + (box_left + box_right) + ', ' + (box_top + box_bottom) + ')</li>';
			});
			$allCords.html(msg);
		},
		displayMetaBox = function (position){
			$metaBox.show()
			$metaBox.find('input').focus()
			setBox($metaBox, position);
		}
		, //display functions
		buildFillableForm = function() {
			var inputFields = ""
			metaArray.forEach(function (meta) {
				inputFields += '<div><span>' + meta.value + '</span><input name="' + meta.id + '"/></div>'
			});
			return inputFields;
		};

	//capture events
	$('#doneCapture').on("click", function (event) {
		$('#capture').hide()
		$(".selected-box").hide()
		$('#fill').show()
		$('#fill').prepend(buildFillableForm())
	})

	$metaBox.find('input').on("blur", function(event) {
		var meta = {
			//name: this.name,
			id: activePosition.top +"-"+ activePosition.right +"-"+ activePosition.bottom +"-"+ activePosition.left,
			value: this.value,
			position: activePosition
		}
		metaArray.push(meta)	
		displayCoordinates();
		this.value = ""
		$metaBox.hide()
	})

	$('#docImage').on("mouseenter", function (event) {
		captureActive = true;
	})

	$('#docImage').on("mouseleave", function (event) {
		if($(event.relatedTarget).attr('id') == "capture" || $(event.toElement).attr('id') == "capture")
			captureActive = false;	
	})

	$(document).on('mousedown', function (event) {
		
		if(!captureActive)
			return
		startX = event.pageX
		startY = event.pageY
		positionBox($selectionMarquee, getBoxCoordinates(startX, startY, startX, startY));
		$selectionMarquee.show();
		$(this).on('mousemove', trackMouse);
	})

	$(document).on('mouseup', function (event) {
		if(!captureActive)
			return
		var position
		, $selectedBox
		, endX = event.pageX
		, endY = event.pageY

		$selectionMarquee.hide();
		position = getBoxCoordinates(startX, startY, endX, endY);
		activePosition = getBoxCoordinates(startX  - $('#docImage').offset().left, startY - $('#docImage').offset().top, endX - $('#docImage').offset().left, endY - $('#docImage').offset().top);

		if (position.left !== position.right && position.top !== position.bottom) {
			$selectedBox = $('<div class="selected-box"></div>');
			$selectedBox.hide();
			$('body').append($selectedBox);

			positionBox($selectedBox, position);

			$selectedBox.show();
			selectedBoxes.push(activePosition);
			
			displayMetaBox(position);
			$(this).off('mousemove', trackMouse);
		}
	})

	//fill events	
	$('#doneFill').on("click", function (event) {
		$('#fill').hide()
		$('#fill div :input').serializeArray()
		$('#view').show()

		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");
		var imageObj = new Image();
		imageObj.onload = function(){

			canvas.height = imageObj.height
			canvas.width = imageObj.width
			context.drawImage(imageObj, 0, 0);
			context.font = "20pt Calibri";
			context.fillStyle = "blue"
			
			metaArray.forEach(function (meta) {
				//context.fillText("My TEXT!", 120, 120);
				//canvas is full size so we need to factor ratio
				var x = (canvas.width/canvas.offsetWidth)*meta.position.left
				var y = (canvas.height/canvas.offsetHeight)*meta.position.bottom
				context.fillText(meta.value, x, y);
			});


			// save canvas image as data url (png format by default)
			//var dataURL = canvas.toDataURL();

			// set canvasImg image src to dataURL
			// so it can be saved as an image
			//document.getElementById('canvasImg').src = dataURL;

		};
		imageObj.src = "http://img.docstoccdn.com/thumb/orig/40282709.png"; 

	})
});