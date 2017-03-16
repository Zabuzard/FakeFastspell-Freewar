// ==UserScript==
// @name        FakeFastspell - Freewar
// @namespace   Zabuza
// @description Enables the use of fastspells 5 to 9 when the user is no sponsor.
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
 * Processes a given fastspell and exchanges the link with the given data.
 * @param fastspellId The id of the fastspell to exchange
 * @param itemId The id of the item to activate with this fastspell
 * @param itemName The name of the item to activate with this fastspell
 */
function processFastspell(fastspellId, itemId, itemName) {
	var anchor = $('a#accessfast' + fastspellId);
	var fastItemAmount = $(anchor).next('span.fastitemamount');
	
	// Abort if element is not present, for example if inventory is opened
	if ($(anchor).length <= 0) {
		return;
	}
	
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
}

/*
 * Routine function of the script.
 */
function routine() {
	// Abort if user is sponsor
	if (isSponsor()) {
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