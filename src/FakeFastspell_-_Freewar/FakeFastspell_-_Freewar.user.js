// ==UserScript==
// @name        FakeFastspell - Freewar
// @namespace   Zabuza
// @description Enables the use of fastspells 5 to 9 when the user is no sponsor. Further the script allows the user to extend the fastspells by infinitely many.
// @include     *.freewar.de/freewar/internal/item.php*
// @version     1
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant       none
// ==/UserScript==

/*
 * Checks whether the user is sponsor or not.
 * @returns True if the user is sponsor, false if not
 */
function isSponsor() {
	return $('p.listcaption img[src*="sponsor3.gif"]').length > 0;
}

/*
 * Checks whether the fastspell menu is present or not. For example it is not present if the inventory is opened.
 * @returns True if the fastspell menu is present, false if not
 */
function isFastspellMenuPresent() {
	return $('table#fastspell').length > 0;
}

/*
 * Processes a given fastspell and exchanges the link with the given data or builds an entry for the fastspell if not present.
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
 * Routine function of the script.
 */
function routine() {
	// Abort if user is sponsor or fastspell menu is not present, for example if inventory is opened
	if (isSponsor() || (!isFastspellMenuPresent())) {
		return;
	}
	
	// Iterate all fastspell elements
	for (var id in fastspellData) {
		processFastspell(id, fastspellData[id][0], fastspellData[id][1]);
	}
}

// Data to use, format: Fastspell-number, Item-ID, Item-name
var fastspellData = new Object();

// ENTER YOUR DATA HERE
fastspellData['5'] = [247183411, 'Portalmaschine'];
fastspellData['6'] = [247183543, 'Barubeutel'];
fastspellData['7'] = [247183757, 'Schriftrolle der Börse'];
fastspellData['8'] = [247183437, 'Fels der Phasenselbstheilung'];
fastspellData['9'] = [247183417, 'Deku-Blatt'];

// Start the routine function
routine();
