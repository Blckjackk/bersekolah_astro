@echo off
setlocal enabledelayedexpansion

rem List of files to update
set "files=src\pages\dashboard\seleksi.astro src\pages\dashboard\periode-beasiswa.astro src\pages\dashboard\pengaturan.astro src\pages\dashboard\konten\create.astro src\pages\dashboard\manage-admin.astro src\pages\dashboard\dokumen\wajib.astro src\pages\dashboard\dokumen\sosmed.astro src\pages\dashboard\kelola-artikel.astro src\pages\dashboard\index.astro src\pages\dashboard\faq.astro src\pages\dashboard\export-data.astro src\pages\dashboard\donasi.astro src\pages\dashboard\faq\create.astro src\pages\dashboard\data-mentor.astro"

for %%f in (%files%) do (
    if exist "%%f" (
        echo Updating %%f...
        powershell -Command "(Get-Content '%%f' -Raw) -replace 'import DashboardAdmin from \"(.*)admin-layout\.astro\";', 'import AdminLayout from \"$1AdminLayout.astro\";' -replace '<DashboardAdmin', '<AdminLayout' -replace '</DashboardAdmin>', '</AdminLayout>' | Set-Content '%%f' -NoNewline"
    ) else (
        echo File not found: %%f
    )
)

echo All files updated!
pause
