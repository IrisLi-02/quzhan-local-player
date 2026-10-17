!include "MUI2.nsh"
!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER
  Var DesktopShortcutCheckbox
  Var DesktopShortcutState
  Var DesktopShortcutWanted
  Var DefaultPlayerCheckbox
  Var DefaultPlayerState
  Var DefaultPlayerWanted
!endif

!macro customInit
  StrCpy $DesktopShortcutWanted "0"
  StrCpy $DefaultPlayerWanted "0"
!macroend

!ifndef BUILD_UNINSTALLER
  !macro customPageAfterChangeDir
    Page custom DesktopShortcutPageCreate DesktopShortcutPageLeave
  !macroend

  Function DesktopShortcutPageCreate
    !insertmacro MUI_HEADER_TEXT "快捷方式与文件关联" "选择安装完成后需要的 Windows 集成选项。"

    nsDialogs::Create 1018
    Pop $0
    ${If} $0 == error
      Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 0 100% 34u "以下选项默认均不勾选。开始菜单快捷方式会正常创建。"
    Pop $0

    ${NSD_CreateCheckbox} 0 42u 100% 20u "在桌面创建“聆音”快捷方式"
    Pop $DesktopShortcutCheckbox
    ${If} $DesktopShortcutWanted == "1"
      ${NSD_Check} $DesktopShortcutCheckbox
    ${EndIf}

    ${NSD_CreateCheckbox} 0 68u 100% 20u "将聆音设为默认音频播放器（安装后打开 Windows 确认页）"
    Pop $DefaultPlayerCheckbox
    ${If} $DefaultPlayerWanted == "1"
      ${NSD_Check} $DefaultPlayerCheckbox
    ${EndIf}

    ${NSD_CreateLabel} 0 101u 100% 42u "Windows 10/11 要求默认应用必须由用户本人在系统设置中确认。升级安装会沿用原安装位置并覆盖旧版本，不会额外安装一份。"
    Pop $0

    nsDialogs::Show
  FunctionEnd

  Function DesktopShortcutPageLeave
    ${NSD_GetState} $DesktopShortcutCheckbox $DesktopShortcutState
    ${If} $DesktopShortcutState == ${BST_CHECKED}
      StrCpy $DesktopShortcutWanted "1"
    ${Else}
      StrCpy $DesktopShortcutWanted "0"
    ${EndIf}
    ${NSD_GetState} $DefaultPlayerCheckbox $DefaultPlayerState
    ${If} $DefaultPlayerState == ${BST_CHECKED}
      StrCpy $DefaultPlayerWanted "1"
    ${Else}
      StrCpy $DefaultPlayerWanted "0"
    ${EndIf}
  FunctionEnd
!endif

!macro customInstall
  ${If} $DesktopShortcutWanted == "1"
    CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 0 "" "" "${APP_DESCRIPTION}"
    ClearErrors
    WinShell::SetLnkAUMI "$DESKTOP\${SHORTCUT_NAME}.lnk" "${APP_ID}"
  ${EndIf}
  ${If} $DefaultPlayerWanted == "1"
    ExecShell "open" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" "--open-default-apps"
  ${EndIf}
!macroend

!macro customUnInstall
  ${IfNot} ${isUpdated}
    Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"
    DeleteRegValue HKCU "Software\RegisteredApplications" "Lingyin"
    DeleteRegKey HKCU "Software\Lingyin\Capabilities"
    DeleteRegKey HKCU "Software\Classes\Lingyin.Audio"
    DeleteRegKey HKCU "Software\Classes\Applications\聆音.exe"
    DeleteRegValue HKCU "Software\Classes\.mp3\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.flac\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.m4a\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.aac\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.wav\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.ogg\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.oga\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.opus\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.webm\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.aiff\OpenWithProgids" "Lingyin.Audio"
    DeleteRegValue HKCU "Software\Classes\.aif\OpenWithProgids" "Lingyin.Audio"
  ${EndIf}
!macroend
