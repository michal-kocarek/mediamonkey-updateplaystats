' MMIP uninstall script
'
' Script is executed as part of the uninstall procedure
'
' Copyright © 2013 Michal Kočárek.
'
' Licensed under the Apache License, Version 2.0 (the "License");
' you may not use this file except in compliance with the License.
' You may obtain a copy of the License at
'
' http://www.apache.org/licenses/LICENSE-2.0
'
' Unless required by applicable law or agreed to in writing, software
' distributed under the License is distributed on an "AS IS" BASIS,
' WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
' See the License for the specific language governing permissions and
' limitations under the License.

Option Explicit

Sub Main
	
	Dim section : section = "UpdatePlayStats"
	Dim inip : inip = SDB.CurrentAddonInstallRoot & "\Scripts\Scripts.ini"
	Dim inif : Set inif = SDB.Tools.IniFileByPath(inip)
	
	inif.DeleteSection(section)
	
	inif.Flush
	Set inif = Nothing
	
	SDB.RefreshScriptItems
	
End Sub
