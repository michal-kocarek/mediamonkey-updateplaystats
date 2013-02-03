/**
 * MediaMonkey script for updating Play Statistics.
 *
 * Script has to be registered in "Scripts.ini" file. This is usually done automatically,
 * when installing script through MediaMonkey install routine.
 *
 * Entry point: <code>main()</code>
 *
 * @author Michal Kočárek (code@brainbox.cz)
 * @copyright Copyright © 2013 Michal Kočárek
 * @license Apache License, Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var main, form, cbCount_onClick, cbDate_onClick;

(function () {

	var DATETIME_FORMAT = '{Y}-{m}-{d} {H}:{i}';

	function DateTimeFormat(format) {
		this._format = format;
		this._formatDetails = this._parseFormatDetails();
		this._formatMatcher = this._getFormatMatcher();
	}

	DateTimeFormat.FORMAT_INFO = {
		'Y': {
			'length': 4,
			'getter': function (d) {
				return d.getFullYear();
			},
			'setter': function (d, v) {
				d.setFullYear(v);
			}
		},
		'm': {
			'length': 2,
			'getter': function (d) {
				return d.getMonth() + 1;
			},
			'setter': function (d, v) {
				d.setMonth(v - 1);
			}
		},
		'd': {
			'length': 2,
			'getter': function (d) {
				return d.getDate();
			},
			'setter': function (d, v) {
				d.setDate(v);
			}
		},
		'H': {
			'length': 2,
			'getter': function (d) {
				return d.getHours();
			},
			'setter': function (d, v) {
				d.setHours(v);
			}
		},
		'i': {
			'length': 2,
			'getter': function (d) {
				return d.getMinutes();
			},
			'setter': function (d, v) {
				d.setMinutes(v);
			}
		},
		's': {
			'length': 2,
			'getter': function (d) {
				return d.getSeconds();
			},
			'setter': function (d, v) {
				d.setSeconds(v);
			}
		}
	};

	DateTimeFormat.prototype._format = null;

	DateTimeFormat.prototype._formatDetails = null;

	DateTimeFormat.prototype._formatMatcher = null;

	DateTimeFormat.prototype.parseText = function (text) {
		text = '' + text;

		var text_parts;

		if (!(text_parts = text.match(this._formatMatcher))) {
			return null;
		}

		var d = new Date(0);

		for (var i = 0; i < this._formatDetails.length; ++i) {
			var detail = this._formatDetails[i];
			var value = +this._ltrim(text_parts[i + 1], '0'); // convert to number

			var format_info = DateTimeFormat.FORMAT_INFO[detail];
			format_info.setter(d, value);
		}

		return d;

	};

	DateTimeFormat.prototype.formatDate = function (date) {
		var result = this._format;

		for (var i = 0; i < this._formatDetails.length; ++i) {
			var detail = this._formatDetails[i];
			var format_info = DateTimeFormat.FORMAT_INFO[detail];

			result = result.replace(new RegExp('\{' + detail + '\}', 'g'),
				this._lpad(format_info.getter(date), '0', format_info.length));
		}
		return result;
	};

	DateTimeFormat.prototype._getFormatMatcher = function () {
		var re_match = '^' + this._format.replace(/\{[^}]+\}/g, '(\\d+)') + '$';
		return new RegExp(re_match);
	};

	DateTimeFormat.prototype._parseFormatDetails = function () {

		var parts = this._format.match(/\{[^}]+\}/g);

		var details = [];

		for (var i = 0; i < parts.length; ++i) {
			var part_info = parts[i].match(/^\{([^}]+)\}$/);
			details.push(part_info[1]);
		}

		return details;
	};

	DateTimeFormat.prototype._ltrim = function (text, chars) {
		chars = '' + (chars ? chars : " \t\r\n");
		return ('' + text).replace(new RegExp('/^[' + chars + ']/', 'ig'), '');
	};

	DateTimeFormat.prototype._lpad = function (text, pad, length) {
		text = '' + text;
		while (text.length < length) {
			text = pad + text;
		}
		return text;
	};

	/**
	 * Return VBSafeArray containing items from JScript array.
	 */
	function array_to_vbarray(array) {
		var dict = new ActiveXObject('Scripting.Dictionary');
		for (var i = 0, len = array.length; i < len; i++) {
			dict.add(i, array[i]);
		}
		return dict.Items();
	}

	function create_form(datetimeformat) {
		var form = SDB.UI.NewForm;
		form.Common.Width = 300;
		form.Common.Height = 220;
		form.Caption = 'Update play statistics';
		form.FormPosition = 4; // poScreenCenter

		var cb_count = SDB.UI.NewCheckBox(form);
		cb_count.Common.ControlName = 'cb_count';
		cb_count.Common.Left = 10;
		cb_count.Common.Top = 10;
		cb_count.Common.Width = 200;
		cb_count.Caption = 'Adjust play count';

		Script.RegisterEvent(cb_count.Common, 'OnClick', 'cbCount_onClick');

		var lbl_count = SDB.UI.NewLabel(form);
		lbl_count.Common.ControlName = 'lbl_count';
		lbl_count.Caption = 'Adjust by:';
		lbl_count.Common.Left = 70;
		lbl_count.Common.Top = 10 + 25;

		var play_count = SDB.UI.NewSpinEdit(form);
		play_count.Common.ControlName = 'play_count';
		play_count.Common.Left = 125;
		play_count.Common.Top = 10 + 22;
		play_count.Common.Width = 50;
		play_count.MinValue = -100;
		play_count.MaxValue = 100;

		var cb_date = SDB.UI.NewCheckBox(form);
		cb_date.Common.ControlName = 'cb_date';
		cb_date.Common.Left = 10;
		cb_date.Common.Top = 60;
		cb_date.Common.Width = 200;
		cb_date.Caption = 'Update play date (only if earlier)';

		Script.RegisterEvent(cb_date.Common, 'OnClick', 'cbDate_onClick');

		var lbl_date = SDB.UI.NewLabel(form);
		lbl_date.Caption = 'New date:';
		lbl_date.Common.Left = 69;
		lbl_date.Common.Top = 60 + 25;

		var play_date = SDB.UI.NewEdit(form);
		play_date.Common.ControlName = 'play_date';
		play_date.Common.Left = 125;
		play_date.Common.Top = 60 + 22;
		play_date.Common.Width = 120;

		var btn_ok = SDB.UI.NewButton(form);
		btn_ok.Default = true;
		btn_ok.Caption = 'OK';
		btn_ok.Common.Top = 140;
		btn_ok.Common.Left = 100;
		btn_ok.Common.Width = 80;
		btn_ok.ModalResult = 1;

		var btn_cancel = SDB.UI.NewButton(form);
		btn_cancel.Common.ControlName = 'btn_cancel';
		btn_cancel.Cancel = true;
		btn_cancel.Caption = 'Cancel';
		btn_cancel.Common.Top = 140;
		btn_cancel.Common.Left = 100 + 80 + 10;
		btn_cancel.Common.Width = 80;
		btn_cancel.ModalResult = 2;

		form.Common.ChildControl('cb_count').Checked = true;
		form.Common.ChildControl('play_count').Value = 1;
		form.Common.ChildControl('cb_date').Checked = true;
		form.Common.ChildControl('play_date').Text = datetimeformat.formatDate(new Date());

		return form;
	}
	
	main = function () {

		var songs = SDB.SelectedSongList;

		if (!songs.Count) {
			SDB.MessageBox("Oops! No track is selected in main window." +
				"\r\n\r\nSelect one or more tracks to be adjusted and then repeat the action.", 0 /* mtWarning */, array_to_vbarray([4 /* mbOk */]));
			return;
		}

		var df = new DateTimeFormat(DATETIME_FORMAT);

		form = create_form(df);

		do {
			SDB.Objects('UpdatePlayStats-form') = form;

			// Show the form
			var status_code = form.ShowModal();
			
			// We can't really set here NULL, so I had to create this work-around.
			// Setting any object from JavaScript works, scalar variables fail. 
			SDB.Objects('UpdatePlayStats-form') = { '__empty': true };

			if (status_code != 1) {
				return;
			}

			var play_count_adjustment = form.Common.ChildControl('cb_count').Checked
				? +form.Common.ChildControl('play_count').Value
				: null;

			var play_date = form.Common.ChildControl('cb_date').Checked
				? (df.parseText(form.Common.ChildControl('play_date').Text) || false)
				: null;

			if (play_date === false) {
				SDB.MessageBox("Oops! There is error in Play date." +
					"\r\n\r\nDate has to be in exact format: "+(df.formatDate(new Date())), 0 /* mtWarning */, array_to_vbarray([4 /* mbOk */]));
				continue;
			}

			if (!play_count_adjustment && !play_date) {
				return;
			}

			break;
		} while (true);

		var dtf_iso = new DateTimeFormat('{Y}-{m}-{d} {H}:{i}:{s}');

		var progress = SDB.Progress;
		progress.MaxValue = songs.Count;

		for (var i = 0, length = songs.Count; i < length; ++i) {
			progress.Text = 'Updating play statistics (' + ( i + 1 ) + ' of ' + songs.Count + ')...';
			if (progress.Terminate) {
				break;
			}

			var song = songs.Item(i);

			if (play_count_adjustment) {
				song.PlayCounter = Math.max(0, song.PlayCounter + play_count_adjustment);
			}
			
			// Adjust LastPlayed date only when there is at least one play count.
			if (play_date && song.LastPlayed < play_date && song.PlayCounter > 0) {
				song.LastPlayed = dtf_iso.formatDate(play_date);
			}

			progress.Increase();
		}

		progress = null;
		CollectGarbage(); // This forces MM to delete reference to progress bar

		songs.UpdateAll();
	};

	cbCount_onClick = function () {
		var form = SDB.Objects('UpdatePlayStats-form');
		if (!form || (form && !!form.__empty)) {
			return;
		}

		var cb_count = form.Common.ChildControl('cb_count');
		form.Common.ChildControl('play_count').Common.Enabled = cb_count.Checked;
	};

	cbDate_onClick = function () {
		var form = SDB.Objects('UpdatePlayStats-form');
		if (!form || (form && !!form.__empty)) {
			return;
		}

		var cb_date = form.Common.ChildControl('cb_date');
		form.Common.ChildControl('play_date').Common.Enabled = cb_date.Checked;
	};

})();
