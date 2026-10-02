!macro customInstall

ExecWait '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" install'

Sleep 1000

ExecWait '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" start'

!macroend


!macro customUnInstall

ExecWait '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" stop'

Sleep 2000

ExecWait '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" uninstall'

Sleep 1000

!macroend
