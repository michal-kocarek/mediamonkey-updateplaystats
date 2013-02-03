/**
 * This script is used to pack all plugin files into MMIP package.
 * 
 * Script is developed for Windows Script Host and 7-zip is used for packing.
 * To run, do this from command-line:
 * <code>%WINDIR%\system32\cscript.exe build.js /H:CScript /Nologo</code>
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

(function() {
	
	function log(message, newline) {
		WScript.StdOut.Write(message);
		if (newline) {
			WScript.StdOut.WriteLine('');
		}
	}
	
	var PACKAGE_FILENAME = 'UpdatePlayStats.mmip';
	var PACKED_ITEMS = {
		'Source\\Install.ini': 'Install.ini',
		'Source\\Uninstall.ini': 'Uninstall.ini',
		'Source\\Install.vbs': 'Install.vbs',
		'Source\\Uninstall.vbs': 'Uninstall.vbs',
		'Source\\App.ico': 'App.ico',
		'Source\\license.txt': 'license.txt',
		'Source\\UpdatePlayStats.js' : 'UpdatePlayStats.js'
	};
	
	var E_SUCCESS = 0;
	
	log('Initializing build script...');
	
	var dirpath = (''+WScript.ScriptFullName).replace(/\\[^\\]+$/, '')+'\\..';
	
	var Fso = WScript.CreateObject('Scripting.FileSystemObject');
	var WshShell = WScript.CreateObject('WScript.Shell');
	
	var sevenzip_path = dirpath+'\\Build\\7za.exe';
	
	if (!Fso.FileExists(sevenzip_path)) {
		throw new Error('7-zip command line was not found.');
	}

	log('OK', true);
	
	log('Preparing package contents...');

	var temp_basepath = Fso.GetSpecialFolder(2 /* TemporaryFolder */)+'\\'+Fso.GetTempName();
	Fso.CreateFolder(temp_basepath);
	
	for(var src_filename in PACKED_ITEMS) {
		var src_filepath = dirpath+'\\'+src_filename,
			dst_filepath = temp_basepath+'\\'+PACKED_ITEMS[src_filename];
		
		Fso.CopyFile(src_filepath, dst_filepath);
	}
	
	log('OK', true);

	log('Packing MMIP file... ');
	
	var sevenzip_commandline = '"'+sevenzip_path+'" a -tzip -mx=9'
		+' "'+temp_basepath+'\\'+PACKAGE_FILENAME+'"'
		+' "'+temp_basepath+'\\*"';
	
	var sevenzip_exec = WshShell.Exec(sevenzip_commandline);
	while(sevenzip_exec.Status == 0 /* WshRunning */) {
		WScript.Sleep(100);
	}
	
	if (sevenzip_exec.ExitCode != 0) {
		throw new Error('7-zip not finished correctly!');
	}
	
	log('OK', true);
	
	var package_filepath =dirpath+'\\'+PACKAGE_FILENAME;
	if (Fso.FileExists(package_filepath)) {
		log('Deleting old MMIP file in target directory...');
		
		Fso.DeleteFile(package_filepath);
		
		log('OK', true);
	}
	
	log('Moving MMIP file to target directory...');
	
	Fso.MoveFile(temp_basepath+'\\'+PACKAGE_FILENAME, package_filepath);
	
	log('OK', true);
	
	log('MMIP is located in "'+package_filepath+'"', true);
	WScript.Quit(E_SUCCESS);
	
})();
