@echo off
title Assistente WhatsApp - Gerenciar Sessoes
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\session-manager.ps1" menu
