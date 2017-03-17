// ==UserScript==
// @name        FakeFastspell - Freewar
// @namespace   Zabuza
// @description Enables the full potential of fastspells when the user is no sponsor, that is fastspells 5 to 9 and fastspell sets 2 to 5. Further the script allows the user to extend the fastspells by infinitely many.
// @include     *.freewar.de/freewar/internal/item.php*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       none
// ==/UserScript==

/*
 * Gets the content of the cookie with the given name
 * @param c_name The name of the cookie to get
 * @returns The content of the given cookie
 */
function getCookie(c_name) {
	var i, x, y, ARRcookies = document.cookie.split(';');
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
		x = x.replace(/^\s+|\s+$/g,'');
		if (x == c_name) {
			return unescape(y);
		}
	}
}

/*
 * Creates a cookie with the given data. If the cookie already exists, it is overriden.
 * @param name The name of the cookie to create
 * @param value The value of the cookie to create
 * @param days The amount of days the cookie should exist until it expires
 */
function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
	} else {
		var expires = '';
	}
	document.cookie = name + '=' + value + expires + '; path=/';
}

/*
 * Checks whether the user is sponsor or not.
 * @returns True if the user is sponsor, false if not
 */
function isSponsor() {
	return $('p.listcaption img[src*="sponsor3.gif"]').length > 0;
}

/*
 * Checks whether the fastspell menu is present or not. For example it is not
 * present if the inventory is opened.
 * @returns True if the fastspell menu is present, false if not
 */
function isFastspellMenuPresent() {
	return $('table#fastspell').length > 0;
}

/*
 * Gets the number of the current used fastspell set. The number is saved as cookie.
 * If the cookie is not present it will be created and the set with number 1 is used.
 * @returns The number of the current used fastspell set
 */
function getCurrentFastspellSetNumber() {
	var value = getCookie('freewarFakeFastspellSetNumber');
	var valueAsNumber = parseInt(value);
	
	// If the cookie does not exist or contains invalid data, create it with the default set
	if (value == null || value == '' || valueAsNumber < 1 || valueAsNumber > 5) {
		createCookie('freewarFakeFastspellSetNumber', '1', 365);
		return 1;
	} else {
		return valueAsNumber;
	}
}

/*
 * Processes a given fastspell and exchanges the link with the given data or
 * builds an entry for the fastspell if not present.
 * @param fastspellId The id of the fastspell to exchange
 * @param itemId The id of the item to activate with this fastspell
 * @param itemName The name of the item to activate with this fastspell
 */
function processFastspell(fastspellId, itemId, itemName) {
	// Abort if fastspell id is not valid
	if (fastspellId <= 0) {
		return;
	}
	
	var anchor = $('a#accessfast' + fastspellId);
	
	// If fastspell has an entry, exchange the link
	if ($(anchor).length > 0) {
		var fastItemAmount = $(anchor).next('span.fastitemamount');
		
		// Remove the fast item amount if present
		if ($(fastItemAmount).length > 0) {
			$(fastItemAmount).remove();
		}
	
		// Exchange link
		$(anchor).attr('href', 'item.php?action=activate&act_item_id=' + itemId);
		$(anchor).attr('onclick', 'this.href += \'&yscroll=\' + window.pageYOffset;');
		$(anchor).text(itemName);
	
		// Remove the id to prevent an easy detection of the script
		$(anchor).removeAttr('id');
	} else {
		// If fastspell has no entry, build it
		
		// Fetch an anchor point where to append the new entry
		var anchorPoint;
		if (fastspellId > 1) {
			// Use the previous spell as anchor point
			anchorPoint = $('table#fastspell' + (fastspellId - 1));
		} else {
			// Use the menu header as anchor point
			anchorPoint = $('table#fastspell');
		}
		
		// If anchor is not present, abort
		if ($(anchorPoint).length <= 0) {
			return;
		}
		
		var contentToAdd = '\
			<table id="fastspell' + fastspellId + '" width="100%" cellspacing="0" cellpadding="0">\
				<tbody>\
					<tr>\
						<td width="95%">\
							Nr. <b>' + fastspellId + '</b>: <a href="item.php?action=activate&act_item_id=' + itemId
								+ '" onclick="this.href += \'&yscroll=\' + window.pageYOffset;">' + itemName + '</a>\
						</td>\
						<td valign="top">\
							<img src="../images/close.gif" border="0">\
						</td>\
					</tr>\
				</tbody>\
			</table>';
		
		$(anchorPoint).after(contentToAdd);
	}
}

/*
 * Enables the possibility to select between different fastspell sets.
 * @param currentSelectedSetNumber The number of the current selected set
 */
function enableFastspellSets(currentSelectedSetNumber) {
	// Iterate all fastspell sets
	for (var i = 1; i <= 5; i++) {
		// If the current element is the element that should be selected
		var isToBeSelected = currentSelectedSetNumber == i;
		var element = $('#fast_spell_set_' + i);
		
		// The element is pre-selected if it is of type 'span' and unselected for 'a' respectively
		if ($(element).is('a')) {
			if (isToBeSelected) {
				// The element is not selected but it should
				// Make the element a 'span' element
				$(element).replaceWith('<span id="fast_spell_set_' + i + '" class="fast_spell_set">' + i + '</span>');
			} else {
				// The element is not selected and it also should not
				// Remove the default attributes
				$(element).attr('href', 'javascript: void(0);');
				$(element).removeAttr('onclick');
				// Add a selection handler
				$(element).click({number: i}, selectFastspellSet);
			}
		} else if ($(element).is('span') && (!isToBeSelected)) {
			// The element is selected but it should not
			// Make the element an 'a' element
			$(element).replaceWith('<a id="fast_spell_set_' + i
				+ '" class="fast_spell_set" href="javascript: void(0);">' + i + '</a>');
			// Reselect the element and add a selection handler
			element = $('#fast_spell_set_' + i);
			$(element).click({number: i}, selectFastspellSet);
		}
	}
}

/*
 * Selects the fastspell set with the given number. The number is saved in a cookie,
 * the page is then refreshed.
 * @param event An event object with a parameter named 'data' holding a parameter 'number'
 *   which contains the number of the set to be selected
 */
function selectFastspellSet(event) {
	var setNumber = event.data.number;
	
	// Save the selection as cookie
	createCookie('freewarFakeFastspellSetNumber', setNumber + '', 365);
	
	// Refresh the page, it will render to the cookie data accordingly
	location.reload();
}

/*
 * Routine function of the script.
 */
function routine() {
	// Abort if user is sponsor or fastspell menu is not present, for example if inventory is opened
	if (isSponsor() || (!isFastspellMenuPresent())) {
		return;
	}
	
	// Get the number of the current used fastspell set and get the corresponding user data
	var currentSetNumber = getCurrentFastspellSetNumber();
	var fastspellDataCurSet = fastspellData[currentSetNumber];
	
	// Iterate all fastspell elements if the user has defined data for the current set
	if (typeof fastspellDataCurSet != 'undefined') {
		for (var id in fastspellDataCurSet) {
			processFastspell(id, fastspellDataCurSet[id][0], fastspellDataCurSet[id][1]);
		}
	}
	
	// Enable the fastspell set menu
	enableFastspellSets(currentSetNumber);
}

// Data to use, format: Fastspell-set-number, Fastspell-number, Item-ID, Item-name
var fastspellData = new Object();

// ENTER YOUR DATA HERE
// Set 1
fastspellData['1'] = new Object();
fastspellData['1']['5'] = [247183411, 'Portalmaschine'];
fastspellData['1']['6'] = [247183409, 'Stab der Magie'];
fastspellData['1']['7'] = [247183757, 'Schriftrolle der Börse'];
fastspellData['1']['8'] = [247183437, 'Fels der Phasenselbstheilung'];
fastspellData['1']['9'] = [247183417, 'Deku-Blatt'];

// Set 2
fastspellData['2'] = new Object();
fastspellData['2']['1'] = [247183791, 'Stab des Handels'];
fastspellData['2']['2'] = [247183543, 'Barubeutel'];
fastspellData['2']['3'] = [247183574, 'Zauberkugel-Klebemaschine'];
fastspellData['2']['4'] = [247183515, 'eisiger Teleporter'];
fastspellData['2']['5'] = [247183431, 'Schriftrolle der Lebenden'];
fastspellData['2']['6'] = [247183539, 'Stab des Wissens'];
fastspellData['2']['7'] = [247183458, 'Korallen-Seelen-Misch-O-Mat'];
fastspellData['2']['8'] = [247183405, 'Makibishi'];

// Start the routine function
routine();