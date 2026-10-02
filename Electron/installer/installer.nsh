!macro customInstall

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" install'

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" start'

!macroend


!macro customUnInstall

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" stop'

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventoryService.exe" uninstall'

!macroend