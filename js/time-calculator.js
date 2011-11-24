/**
 * Time Calculator Javascript
 * Copyright © 2011 Chris Riley
 * 
 * Source code released under the MIT licence.
 * http://www.opensource.org/licenses/mit-license.php
 */

// Object to hold all the values
var timeStorage = {};

// How many time edit rows to be displayed
var numOfTimeEntries = 7;
	
/**
 * Page load initialisation
 */
$(document).ready(function()
{
	// Check the browser is supported or show an error message
	if (checkBrowserSupported() === false)
	{
		$('#browserSupportError').show();
	}

	// Generate the form & loads the previously submitted entries
	generateForm(numOfTimeEntries);				
	loadPreviousEntriesFromStorage(numOfTimeEntries);				

	// When the calculate button is clicked it calculates the time for all rows
	$('#btnCalculateTotalTime').click(function()
	{
		calculateTotalTime(numOfTimeEntries);
	});	

	// When the clear button is clears the local storage and entries
	$('#btnClear').click(function()
	{
		clearStorageAndForm(numOfTimeEntries);
	});

	// Datepicker
	$('#displayDate').datepicker(
	{
		selectWeek : true,
		closeOnSelect : false,
		dateFormat : 'D d M yy',		// Wed 17 Aug 2011 (For text box display)
		altField: '#backendDate',
		altFormat: 'yy-mm-dd-DD'		// 17-8-2011-Wednesday (For file saving)
	});

	// Update the title of the page on change
	$('#displayDate').change(function()
	{
		var date = $('#backendDate').val();					
		$('title').text(date + '-Timesheet');
	});
	
	// Download the JSON data to a file
	$('#btnBackupData').click(function()
	{
		download();
	});
		
	// Uploads a JSON file to the page
	$('#restoreFile').change(function()
	{
		$('#uploadProgress').show();
		$('#uploadForm').submit();
	});
});

/**
 * Gets the JSON data from the file upload and saves it to the DOM and local storage
 */
function getContentsFromFileUpload()
{
	// Get the data from the iframe which was put in there by the upload
	var file = $('#uploadTarget').contents().find('#uploadedJsonData').html();
	
	// Store the contents into the localStorage then load it
	timeStorage = JSON.parse(file);
	localStorage.setObject('timeStorage', timeStorage);
	loadPreviousEntriesFromStorage();
	
	$('#uploadProgress').hide();
}

/**
 * Backs up / saves the file
 */
function download()
{
	// Save the form data first
	calculateTotalTime();
	
	// Set the filename and content of the file
	var date = $('#backendDate').val();
	var filename = date + '-Timesheet.json';
	var content = JSON.stringify(timeStorage);
	
	// Put the content into the page so the form will POST it to the PHP page
	$('#filename').val(filename);
	$('#content').val(content);
	
	// Submit the form via POST which will popup the save dialogue box with the file information
	$('#downloadForm').submit();
}

/**
 * Clear data from HTML5 local storage and reset form
 */
function clearStorageAndForm()
{
	// Remove saved values
	localStorage.removeItem('timeStorage');
	
	// Clear each row
	for (var i=0; i < numOfTimeEntries; i++)
	{
		// Clear fields on the page to default values
		$('#startHour' + i).val('').removeClass('timeError');
		$('#startMin' + i).val('').removeClass('timeError');
		$('#endHour' + i).val('').removeClass('timeError');
		$('#endMin' + i).val('').removeClass('timeError');
		$('#warningIcon' + i).hide();
		$('#task' + i).val('');
		$('#subTotal' + i).prop('checked', false);
		$('#totalTimeRow' + i).html(0);		
		$('#totalTimeRowHoursMins' + i).html('');
		
	}
	
	// Clear date fields and overall totals
	$('#displayDate').val('');
	$('#backendDate').val('');
	$('#restoreFile').val('');
	$('#overallSubtotalTime').text(0);
	$('#overallSubtotalTimeHoursMins').text('');
	$('#overallTotalTime').html(0);
	$('#overallTotalTimeHoursMins').html('');
	
	// Clear save data from iframe
	var ifrm = document.getElementById('backupData');
	ifrm.src = '';
}

/**
 * Load previously entered data from HTML5 local storage
 */
function loadPreviousEntriesFromStorage()
{
	// Get the data back from local storage
	timeStorage = localStorage.getObject('timeStorage');
	
	if (timeStorage != null)
	{
		// Update the fields on the page
		for (var i=0; i < numOfTimeEntries; i++)
		{
			// Get items from HTML 5 storage
			var startHour = timeStorage[i].startHour;
			var startMin = timeStorage[i].startMin;
			var endHour = timeStorage[i].endHour;
			var endMin = timeStorage[i].endMin;
			var task = timeStorage[i].task;
			var subTotal = timeStorage[i].subTotal;
			var totalTimeRow = timeStorage[i].totalTimeRow;		
			var totalTimeRowHoursMins = timeStorage[i].totalTimeRowHoursMins;

			// Unencode html coded ampersands
			task = task.replace(/&amp;/g, '&');

			// Set to fields on the page
			$('#startHour' + i).val(startHour);
			$('#startMin' + i).val(startMin);
			$('#endHour' + i).val(endHour);
			$('#endMin' + i).val(endMin);
			$('#task' + i).val(task);

			// Check or uncheck the check boxes
			if (subTotal == true)
			{
				$('#subTotal' + i).attr('checked', 'checked');
			}
			else {
				$('#subTotal' + i).removeAttr('checked');
			}

			// Set the total time for each row
			if (totalTimeRow != null)
			{
				$('#totalTimeRow' + i).html(totalTimeRow);
				$('#totalTimeRowHoursMins' + i).html(totalTimeRowHoursMins);
			}
		}

		// Set the date and title values
		var displayDate = timeStorage['displayDate'];
		var backendDate = timeStorage['backendDate'];
		$('#displayDate').val(displayDate);
		$('#backendDate').val(backendDate);
		$('title').text(backendDate + ' Timesheet');

		// Set the overall subtotal and total time
		var overallTotalTime = timeStorage['overallTotalTime'];
		var overallTotalTimeHoursMins = timeStorage['overallTotalTimeHoursMins'];
		var overallSubtotal = timeStorage['overallSubtotalTime'];
		var overallSubtotalHoursMins = timeStorage['overallSubtotalTimeHoursMins'];

		if (overallSubtotal != null)
		{
			$('#overallSubtotalTime').html(overallSubtotal);
			$('#overallSubtotalTimeHoursMins').html(overallSubtotalHoursMins);
		}

		if (overallTotalTime != null)
		{
			$('#overallTotalTime').html(overallTotalTime);
			$('#overallTotalTimeHoursMins').html(overallTotalTimeHoursMins);
		}
	}
	else {
		// Set back to empty object
		timeStorage = {};
	}
}

/**
 * Calculates the subtotal for checked rows (ie to subtotal times for various projects)
 */
function calculateSubTotal()
{
	var overallSubtotalTime = 0;
	var overallSubtotalTimeHoursMins = 0;
	
	for (var i=0; i < numOfTimeEntries; i++)
	{
		// See if the checkbox on each row is checked or not
		var subTotalRowChecked = $('#subTotal' + i).is(':checked');
		
		if (subTotalRowChecked)
		{
			// Get the values from the form
			var startHour = $('#startHour' + i).val();
			var startMin = $('#startMin' + i).val();
			var endHour = $('#endHour' + i).val();
			var endMin = $('#endMin' + i).val();			
			var timeDifference = 0;
			
			// Make sure all fields are filled out for that row then work out time difference and add to sub total
			if ((startHour != '') && (startMin != '') && (endHour != '') && (endMin != ''))
			{
				timeDifference = calculateTimeDifference(startHour, startMin, endHour, endMin);	
			}
			
			// Update subtotal
			overallSubtotalTime += timeDifference;			
		}		
	}
	
	// Round to 2dp and format wording
	overallSubtotalTime = roundNumber(overallSubtotalTime, 2);
	overallSubtotalTime = overallSubtotalTime;
	overallSubtotalTimeHoursMins = formatToHoursMins(overallSubtotalTime);
	
	// Update overall sub total time on page and object
	$('#overallSubtotalTime').text(overallSubtotalTime);	
	$('#overallSubtotalTimeHoursMins').text(overallSubtotalTimeHoursMins);	
	timeStorage['overallSubtotalTime'] = overallSubtotalTime;
	timeStorage['overallSubtotalTimeHoursMins'] = overallSubtotalTimeHoursMins;
}

/**
 * Work out the time difference between two dates and return the difference in hours to 2dp
 */
function calculateTimeDifference(startHour, startMin, endHour, endMin)
{
	// Work out the time difference in hours and round to 2dp
	var startDate = new Date('July 27, 2011 ' + startHour + ':' + startMin + ':' + '00');
	var endDate = new Date('July 27, 2011 ' + endHour + ':' + endMin + ':' + '00');				
	var timeDifference = (endDate - startDate)/1000;
	var timeDifferenceInHours = (timeDifference/60/60);
	
	return roundNumber(timeDifferenceInHours, 2);
}

/**
 * Format the time from 12.50 to (12hrs 30mins)
 */
function formatToHoursMins(time)
{
	// Peform conversion
	time = Math.abs(time);						// Change to positive number	
	var hours = Math.floor(time);				// Get the hours portion
	var minsDecimal = time - Math.floor(time);	// Get the decimal portion
	var mins = (minsDecimal * 60);				// Convert to minutes
	mins = Math.round(mins);					// Round minutes to integer
	
	// Wording
	var hourWording = (hours > 1) ? ' hours ' : ' hour ';
	var minuteWording = (mins > 1) ? ' mins' : ' min';
	
	// Only add to string if there is an hour or minute portion
	time = '';
	if (hours != 0)
	{
		time += hours + hourWording;
	}
	if (mins != 0)
	{
		time += mins + minuteWording;
	}
	if ((mins == 0) && (hours != 0))
	{
		// No point only showing just hrs as it's already shown as 0.5 hours on page
		time = '';
	}
	
	// Final formatting
	return (time == '') ? '' : '(' + time + ')';
}

/**
 * Calculate the total time for each row and also the final total
 */
function calculateTotalTime()
{
	var overallTotalTime = 0;
	var overallTotalTimeHoursMins = 0;

	for (var i=0; i < numOfTimeEntries; i++)
	{
		// Get the values from the form
		var startHour = $('#startHour' + i).val();
		var startMin = $('#startMin' + i).val();
		var endHour = $('#endHour' + i).val();
		var endMin = $('#endMin' + i).val();
		var task = $('#task' + i).val();
		var subTotal = $('#subTotal' + i).is(':checked');
		
		// Store in an object
		var rowStorage = {
			'rowKey': i,
			'startHour': startHour,
			'startMin': startMin,
			'endHour': endHour,
			'endMin': endMin,
			'task': task,
			'subTotal': subTotal			
		};

		// Make sure all fields are filled out for that row
		if ((startHour != '') && (startMin != '') && (endHour != '') && (endMin != ''))
		{
			// Work out the time difference in hours and round to 2dp
			var timeDifferenceInHours = calculateTimeDifference(startHour, startMin, endHour, endMin);
			var timeDifferenceInHoursMins = formatToHoursMins(timeDifferenceInHours);

			// Update the total time field on each row
			$('#totalTimeRow' + i).html(timeDifferenceInHours);
			$('#totalTimeRowHoursMins' + i).html(timeDifferenceInHoursMins);
			rowStorage['totalTimeRow'] = timeDifferenceInHours;
			rowStorage['totalTimeRowHoursMins'] = timeDifferenceInHoursMins;
			
			// Update overall total time running total
			overallTotalTime = (overallTotalTime + timeDifferenceInHours);			
		}
		else {
			// Otherwise set the time calc to 0 if not filled out properly
			$('#totalTimeRow' + i).html(0);
			$('#totalTimeRowHoursMins' + i).html('');
			rowStorage['totalTimeRow'] = 0;	
			rowStorage['totalTimeRowHoursMins'] = '';	
		}
		
		// Put row object & values into the main object
		timeStorage[i] = rowStorage;	
	}
	
	// Store date values
	var displayDate = $('#displayDate').val();
	var backendDate = $('#backendDate').val();	
	timeStorage['displayDate'] = displayDate;
	timeStorage['backendDate'] = backendDate;
	
	// Calculate overall sub total
	calculateSubTotal(numOfTimeEntries);
	
	// Round total time to 2dp (fixes bug when adding two floats together it doesn't add properly)
	overallTotalTime = roundNumber(overallTotalTime, 2);
	overallTotalTime = overallTotalTime;
	overallTotalTimeHoursMins = formatToHoursMins(overallTotalTime);	

	// Update overall total time on page
	$('#overallTotalTime').html(overallTotalTime);
	$('#overallTotalTimeHoursMins').html(overallTotalTimeHoursMins);
	timeStorage['overallTotalTime'] = overallTotalTime;
	timeStorage['overallTotalTimeHoursMins'] = overallTotalTimeHoursMins;
	
	// Store everything into HTML local storage
	localStorage.setObject('timeStorage', timeStorage);
}

/**
 * Generate the HTML
 */
function generateForm()
{
	var timeRowHtml = '';
	var startHourPlaceholder = 13;
	var startMinPlaceholder = 00;
	var endHourPlaceholder = 15;
	var endMinPlaceholder = 55;
	var taskPlaceholder = 'Project XYZ. Fixed rendering bug.';
	
	// Tab index 1 is the date picker. For each row, the tab will move from startHour to StartMin, then endHour to endMin, then to task
	var tabIndex = 2;

	for (var i=0; i < numOfTimeEntries; i++)
	{
		if (i != 0)
		{
			startHourPlaceholder = '';
			startMinPlaceholder = '';
			endHourPlaceholder = '';
			endMinPlaceholder = '';
			taskPlaceholder = '';
		}
		
		// Build the time entry rows
		timeRowHtml += '<tr>'
					+		'<td>&nbsp;</td>'								// Warning icon column
					+		'<td>&nbsp;</td>'								// Clock icon column
					+		'<td>&nbsp;</td>'								// Start & End column
					+		'<td class="rowHeading">Hour</td>'
					+		'<td class="rowHeading">Min</td>'
					+		'<td class="rowHeading">Task description</td>'
					+		'<td class="rowHeading" style="width: 110px;">Subtotal</td>'
					+		'<td class="rowHeading">Total</td>'
					+	'</tr>'
					+	'<tr>'
					+		'<td rowspan="2"><img id="warningIcon' + i + '" class="hidden" src="img/warning-icon.png" title="Error on row: Either the start time is after the end time, the time fields are not completed or the time fields contain invalid characters"></td>'
					+		'<td>'
					+			'<a title="Use current time" href="#" onclick="getCurrentTimeInHoursMins(\'startHour' + i + '\', \'startMin' + i + '\')">'
					+				'<img src="img/clock.png" alt="Current time">'
					+			'</a>'
					+		'</td>'
					+		'<td class="startEndTimeLegend">Start</td>'
					+		'<td><input type="text" tabindex="' + tabIndex + '" onchange="validateField(' + i + ')" onkeyup="moveCursorOnMaxLength(\'startHour' + i + '\', \'startMin' + i + '\')" id="startHour' + i + '" maxlength="2" placeholder="' + startHourPlaceholder + '" style="width:30px;"></td>'	
					+		'<td><input type="text" tabindex="' + (tabIndex + 1) + '" onchange="validateField(' + i + ')" onkeyup="moveCursorOnMaxLength(\'startMin' + i + '\', \'endHour' + i + '\')" id="startMin' + i + '" maxlength="2" placeholder="' + startMinPlaceholder + '" style="width:30px;"></td>'
					+		'<td rowspan="2"><textarea tabindex="' + (tabIndex + 4) + '" rows="2" id="task' + i + '" maxlength="200" placeholder="' + taskPlaceholder + '" style="width:300px; height: 44px;"></textarea></td>'
					+		'<td rowspan="2" class="alignCenter" style="width:90px;">'
					+			'<label for="subTotal' + i + '">'
					+				'<div class="checkboxLabel">'
					+					'<input type="checkbox" id="subTotal' + i + '">'
					+				'</div>'
					+			'</label>'
					+		'</td>'
					+		'<td rowspan="2" class="alignCenter">'
					+			'<span id="totalTimeRow' + i + '">0</span> hours<br>'
					+			'<span id="totalTimeRowHoursMins' + i + '" class="totalHoursMins"></span>'
					+		'</td>'
					+	'</tr>'
					+	'<tr>'
					+		'<td>'
					+			'<a title="Use current time" href="#" onclick="getCurrentTimeInHoursMins(\'endHour' + i + '\', \'endMin' + i + '\')">'
					+				'<img src="img/clock.png" alt="Current time">'
					+			'</a>'
					+		'</td>'
					+		'<td class="startEndTimeLegend">End</td>'
					+		'<td><input type="text" tabindex="' + (tabIndex + 2) + '" onchange="validateField(' + i + ')" onkeyup="moveCursorOnMaxLength(\'endHour' + i + '\', \'endMin' + i + '\')" id="endHour' + i + '" maxlength="2" placeholder="' + endHourPlaceholder + '" style="width:30px;"></td>'
					+		'<td><input type="text" tabindex="' + (tabIndex + 3) + '" onchange="validateField(' + i + ')" onkeyup="moveCursorOnMaxLength(\'endMin' + i + '\', \'task' + i + '\')" id="endMin' + i + '" maxlength="2" placeholder="' + endMinPlaceholder + '" style="width:30px;"></td>'
					+	'</tr>';
		
		// If this is not the last row, add a spacer row
		if (i != (numOfTimeEntries - 1))
		{
			timeRowHtml += '<tr><td colspan="8" style="line-height: 5px;">&nbsp;</td></tr>';
		}
		
		// Reset tab index for next row
		tabIndex += 5;
	}

	// Build final overall total rows
	timeRowHtml += '<tr>'
				+		'<td colspan="6">&nbsp;</td>'
				+		'<td class="totalLegend">Subtotal</td>'
				+		'<td class="totalLegend">Overall Total</td>'
				+  '</tr>'
				+  '<tr>'
				+		'<td colspan="6">&nbsp;</td>'
				+		'<td style="text-align: center;">'
				+			'<span id="overallSubtotalTime">0</span> hours<br>'
				+			'<span id="overallSubtotalTimeHoursMins" class="totalHoursMins"></span>'
				+		'</td>'
				+		'<td style="text-align: center;">'
				+			'<span id="overallTotalTime">0</span> hours<br>'
				+			'<span id="overallTotalTimeHoursMins" class="totalHoursMins"></span>'
				+		'</td>'
				+  '</tr>';

	// Update the form with new table data
	$('#timeRows').html(timeRowHtml);
}

/**
 * Gets the current time in hours and minutes and puts it into the form 
 * corresponding to the row of the clock icon clicked on
 */
function getCurrentTimeInHoursMins(hourField, minField)
{
	var currentDate = new Date();
	var currentHour = padNumber(currentDate.getHours());
	var currentMin = padNumber(currentDate.getMinutes());
	
	$('#' + hourField).val(currentHour);
	$('#' + minField).val(currentMin);
}

/**
 * Validate fields ie hour should be 00-24 range, min should be 0-59 or highlight text box red
 * @param int rowNum The row to be checked
 */
function validateField(rowNum)
{
	// Get values from the form
	var startHour = $('#startHour' + rowNum);
	var startMin = $('#startMin' + rowNum);
	var endHour = $('#endHour' + rowNum);
	var endMin = $('#endMin' + rowNum);
	
	// Check time fields to make sure they are correct
	checkHourInRange(startHour);
	checkMinuteInRange(startMin);	
	checkHourInRange(endHour);
	checkMinuteInRange(endMin);
	
	// Make sure time difference is correct
	checkTimeDifference(startHour, startMin, endHour, endMin, rowNum);
}

/**
 * Make sure the hour value is in the range of 0 and 24 or highlight the textfield red
 * @param textfield hourField The text field selected by jQuery
 */
function checkHourInRange(hourField)
{
	var hourValue = hourField.val();
	
	if ((hourValue >= 0) && (hourValue <= 24))
	{
		hourField.removeClass('timeError');
	}
	else {
		hourField.addClass('timeError');
	}
}

/**
 * Make sure the minute value is in the range of 0 and 59 or highlight the textfield red
 * @param textfield minuteField The text field selected by jQuery
 */
function checkMinuteInRange(minuteField)
{
	var minuteValue = minuteField.val();
	
	if ((minuteValue >= 0) && (minuteValue <= 59))
	{
		minuteField.removeClass('timeError');
	}
	else {
		minuteField.addClass('timeError');
	}
}

/**
 * Make sure the time difference is not negative, completely filled out and they haven't entered invalid characters into the time fields
 * Shows a warning icon for that row if there is a problem
 */
function checkTimeDifference(startHour, startMin, endHour, endMin, rowNum)
{
	var timeDifference = calculateTimeDifference(startHour.val(), startMin.val(), endHour.val(), endMin.val());
	
	// If the timeDifference isn't a number or negative then show the warning icon
	if ((isNaN(timeDifference)) || (timeDifference <= 0))
	{
		// If the time fields are just empty then don't show error
		if ((startHour.val() == '') && (startMin.val() == '') && (endHour.val() == '') && (endMin.val() == ''))
		{
			$('#warningIcon' + rowNum).hide();
		}
		else {
			// Otherwise show the warning icon
			$('#warningIcon' + rowNum).show();
		}		
	}
	else {
		$('#warningIcon' + rowNum).hide();
	}
}

/**
 * Move the cursor to the next field when the field is complete (no more text can be entered)
 * Otherwise if not quite complete and time entered in hours col is 0, 1 or 2, wait for more input, 
 * if it is 3,4,5,6,7,8,9 then immediately move to minute col
 */
function moveCursorOnMaxLength(fieldId, nextFieldId)
{
	var field = $('#' + fieldId);
	var fieldVal = field.val();						// String
	var nextField = $('#' + nextFieldId);
		
	// If the length of the entered text is greater than the maxlength of the field, move cursor to the next input field
	if (fieldVal.length >= field.attr('maxlength'))
	{
		nextField.focus();
	}
	else {
		// If this is startHour or endHour text field
		if (fieldId.indexOf('Hour') != -1)
		{
			// If time entered is in array then move to minute col
			var hours = [3, 4, 5, 6, 7, 8, 9];
			fieldVal = parseInt(fieldVal);				// Convert to int for check
			
			if ($.inArray(fieldVal, hours) !== -1)
			{
				// Put a zero in front and put it back in the text field
				fieldVal = padNumber(fieldVal);
				field.val(fieldVal);
				nextField.focus();
			}			
		};
	}
}

/**
 * Round a number to specified decimal places
 */
function roundNumber(number, decimals)
{
	var newnumber = new Number(number + '').toFixed(parseInt(decimals));
	return parseFloat(newnumber);
}

/**
 * Pads a number with leading 0 so dates and times look consistent
 */
function padNumber(num)
{
	return (num < 10 ? '0' : '') + num;
}

/**
 * Convert a string to boolean. Used for bringing back variables from local storage which stores as a string
 */
function stringToBoolean(string)
{
	switch (string)
	{
		case "true": case "yes": case "1":return true;
		case "false": case "no": case "0": case null:return false;
		default:return Boolean(string);
	}
}

/**
 * Converts a UTF-8 string to BASE-64
 */
function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

/**
 * Decodes a BASE-64 string to UTF-8
 */
function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

/**
 * Make sure HTML5 storage is supported
 */
function checkSupportForHtml5Storage()
{
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	}
	catch (e)
	{
		return false;
	}
}

/**
 * Check if the browser is supported
 * Internet Explorer 8 and below are not supported
 */
function checkBrowserSupported()
{
	// Get the browser details
	var userAgent = navigator.userAgent.toLowerCase();
    var browser = {
        version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
        webkit: /webkit/.test( userAgent ),
        opera: /opera/.test( userAgent ),
        msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
        mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
    };
	
	// If the browser is webkit opera or mozilla it's probably fine'
	if ((browser.webkit === true) || (browser.opera === true) || (browser.mozilla === true))
	{
		// Make sure HTML 5 storage support is available
		if (checkSupportForHtml5Storage() === false)
		{
			$('#browserSupportError').html('HTML5 local storage support is not available');
			return false;
		}
		else {
			return true;
		}
	}
	else if ((browser.msie === true) && (browser.version > 8.0))
	{
		// IE 9 onwards is ok
		return true;
	}
	else {
		return false;
	}
}

/**
 * Sets ability to store & retrieve an object into the HTML5 storage
 * Turns the object to a JSON string to be stored and converts back to JS object for retrieval
 */
Storage.prototype.setObject = function(key, value)
{
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key)
{	
	var storageItem = this.getItem(key);
	
	// If it doesn't exist return null
	if (storageItem == 'undefined')
	{
		return null;
	}
	else {
		// Otherwise unencode the JSON and return as an object
		return storageItem && JSON.parse(storageItem);
	}
}