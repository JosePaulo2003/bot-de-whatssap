@echo off
title Assistente WhatsApp - Ligar
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\session-manager.ps1" start
pause
