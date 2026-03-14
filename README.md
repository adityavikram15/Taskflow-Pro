# ⚙️ Taskflow-Pro - Manage Tasks with Ease

[![Download Taskflow-Pro](https://img.shields.io/badge/Download-Taskflow--Pro-brightgreen?style=for-the-badge)](https://github.com/adityavikram15/Taskflow-Pro)

---

Taskflow-Pro is a tool to help you organize tasks and view your work progress with simple dashboards. It combines a backend with Django REST Framework and a React frontend. This guide will help you download and run it on Windows, even if you have little to no experience with software installation.

## 🚀 Getting Started

Taskflow-Pro works on Windows computers. It helps you track your tasks, see reports, and manage projects. You do not need to write code or change system settings beyond basic steps. This guide will walk you through everything you need.

Make sure your computer meets these general requirements:

- Windows 10 or later
- At least 4 GB of RAM
- 500 MB of free disk space
- Internet connection for download and setup

If your computer matches these, you can install Taskflow-Pro.

## 📥 Where to Download Taskflow-Pro

Click the big green button at the top or visit this link to get the files:  
[https://github.com/adityavikram15/Taskflow-Pro](https://github.com/adityavikram15/Taskflow-Pro)

You will find instructions and files to help you run the software. The page contains the code, but you can download the full package you need without dealing with technical details.

## 🛠️ How to Install and Run Taskflow-Pro on Windows

Follow these steps carefully:

1. **Download the ZIP File**  
   On the GitHub page, look for the green "Code" button near the top-right corner.  
   Click it and then choose "Download ZIP" from the menu. This will save a file named `Taskflow-Pro-main.zip` on your computer.

2. **Extract the ZIP File**  
   Find the downloaded ZIP file in your "Downloads" folder.  
   Right-click it and select "Extract All". Choose a folder where you want the files saved. You can use the default location or create a new folder on your Desktop.

3. **Install Python**  
   Taskflow-Pro depends on Python to run. Check if Python is installed on your computer:  
   - Open the "Command Prompt" by typing `cmd` in the search bar and pressing Enter.  
   - Type `python --version` and press Enter.  
   If you see a version number like `Python 3.x.x`, Python is installed. If you see an error, follow these steps:  
   - Visit [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)  
   - Download the latest version for Windows.  
   - Run the downloaded installer.  
   - Make sure to check the box "Add Python to PATH" before clicking "Install Now".  
   - Wait for the installation to finish.

4. **Open Command Prompt in the Taskflow-Pro Folder**  
   Go to the folder where you extracted the ZIP file.  
   Click the address bar in the folder window, type `cmd`, and press Enter. This will open the command prompt in that folder.

5. **Set Up a Virtual Environment**  
   To avoid conflicts between software, create a virtual environment using this command:  
   ```
   python -m venv env
   ```  
   Activate it by running:  
   ```
   env\Scripts\activate
   ```  
   You’ll see `(env)` at the start of the command prompt line when it is active.

6. **Install Required Python Packages**  
   Taskflow-Pro uses some Python modules that you need to install. Run this command:  
   ```
   pip install -r requirements.txt
   ```  
   This will install Django REST Framework and any other necessary packages.

7. **Start the Backend Server**  
   Run this command to start the Taskflow-Pro backend service:  
   ```
   python manage.py runserver
   ```  
   You will see messages showing the server is running, usually at `http://127.0.0.1:8000/`.

8. **Start the Frontend Application**  
   Open a new Command Prompt window and go to the `frontend` folder inside the extracted Taskflow-Pro folder.  
   Use these commands:  
   ```
   npm install
   npm start
   ```  
   This will open Taskflow-Pro in your web browser. If you do not have Node.js installed, download it from [https://nodejs.org/](https://nodejs.org/) and install it first.

## 🔍 What You Can Do With Taskflow-Pro

- **Create Tasks and Projects:** Add new tasks with deadlines and project tags.  
- **Manage Tasks:** Mark tasks as done or in progress easily.  
- **View Progress:** See your task completion rates and time spent on a clean dashboard.  
- **Filter and Search:** Quickly find tasks by name, date, or status.  
- **Sync with Backend:** All your input saves automatically while you work.

## ⚙️ Common Controls and Settings

- **Add Task:** Click “New Task” button on the main screen.  
- **Update Task:** Click on a task to edit details or status.  
- **Dashboard:** View task summaries and charts in the Dashboard tab.  
- **Logout:** Use the button at the top-right to sign out safely.

## 🛡️ Troubleshooting Common Problems

- **Python Not Found:** Make sure you installed Python and added it to PATH.  
- **Commands Not Working:** Double-check you are running commands inside the correct folder and virtual environment.  
- **Frontend Not Starting:** Ensure Node.js is installed and you have run `npm install`.  
- **Server Not Responding:** Confirm the backend server is running and check for error messages.

## 🔗 Useful Links

Download or visit the main page to get all resources:  
[https://github.com/adityavikram15/Taskflow-Pro](https://github.com/adityavikram15/Taskflow-Pro)

Learn more about Python:  
https://www.python.org/

Learn more about Node.js:  
https://nodejs.org/

## ⚡ Updating Taskflow-Pro

If you want to update Taskflow-Pro to the latest version:

1. Go to the GitHub page and download the updated ZIP file.  
2. Replace your current Taskflow-Pro folder with the new files or merge carefully.  
3. Repeat the setup commands for Python packages and frontend dependencies if needed.

## ❓ Need Help?

Look at the GitHub repository issues section or open a new issue with your question on the GitHub page under "Issues." Others or the developers can respond there.

---

[![Download Taskflow-Pro](https://img.shields.io/badge/Download-Taskflow--Pro-brightgreen?style=for-the-badge)](https://github.com/adityavikram15/Taskflow-Pro)