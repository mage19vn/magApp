@echo off
echo Đang tải lên Github...

set /p msg="Nhập nội dung commit (hoặc nhấn Enter để dùng mặc định 'Update'): "
if "%msg%"=="" set msg=Update

git add .
git commit -m "%msg%"
git push

echo.
echo Hoàn tất tải lên Github!
pause
