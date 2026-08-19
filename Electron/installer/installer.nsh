!macro customInstall

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventory.exe" install'

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventory.exe" start'

!macroend


!macro customUnInstall

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventory.exe" stop'

nsExec::Exec '"$INSTDIR\resources\Servicio_Recolector\HelpDeskInventory.exe" uninstall'

!macroend