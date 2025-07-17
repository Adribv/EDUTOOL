# 🚀 EDULIVES Parent Portal Setup Guide

## 📋 Prerequisites

### Option 1: Local MongoDB (Recommended for Development)

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Download the latest version for Windows
   - Install with default settings

2. **Start MongoDB Service**
   ```powershell
   # Start MongoDB service
   net start MongoDB
   
   # Or if installed as a service
   Get-Service -Name MongoDB | Start-Service
   ```

### Option 2: MongoDB Atlas (Cloud - Free)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/atlas
   - Sign up for free account
   - Create a new cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Environment**
   - Create `.env` file in `backend` folder
   - Add: `MONGO_URI=your_atlas_connection_string`

## 🔧 Backend Setup

1. **Navigate to Backend Directory**
   ```powershell
   cd EDUTOOL/backend
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Create Environment File**
   Create `.env` file in `backend` folder:
   ```
   MONGO_URI=mongodb://localhost:27017/EDULIVES
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   PORT=5000
   FRONTEND_URL=https://edulives.com
   ```

4. **Start Backend Server**
   ```powershell
   npm start
   ```

## 🎨 Frontend Setup

1. **Navigate to Frontend Directory**
   ```powershell
   cd EDUTOOL/frontend
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Start Frontend Server**
   ```powershell
   npm run dev
   ```

## 🧪 Create Test Data

1. **Run Test Script**
   ```powershell
   cd EDUTOOL/backend
   node test-backend.js
   ```

2. **Test Credentials Created**
   - **Parent Email**: parent@test.com
   - **Parent Password**: password123
   - **Student Roll Numbers**: TEST001, TEST002

## 🔗 Access the Application

1. **Frontend**: https://edulives.com
2. **Parent Login**: https://edulives.com/parent/login
3. **Backend API**: http://localhost:5000

## 📱 Using the Parent Portal

### 1. **Login as Parent**
- Go to: https://edulives.com/parent/login
- Use credentials: parent@test.com / password123

### 2. **Link Students**
- If no children are shown, click "Link Student"
- Enter student roll number (e.g., TEST001)
- Student will be linked to your account

### 3. **View Child Information**
- Dashboard shows overview of all children
- Click on child cards to view details
- Access progress, assignments, fees, etc.

## 🛠️ Troubleshooting

### MongoDB Connection Issues
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Port Already in Use
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend Build Issues
```powershell
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Schema

### Parent Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  childRollNumbers: [String],
  contactNumber: String,
  address: String
}
```

### Student Collection
```javascript
{
  _id: ObjectId,
  name: String,
  rollNumber: String,
  class: String,
  section: String,
  parentId: ObjectId,
  admissionNumber: String,
  gender: String,
  dateOfBirth: Date,
  parentInfo: {
    fatherName: String,
    motherName: String,
    contactNumber: String,
    email: String,
    address: String
  }
}
```

## 🔐 Security Notes

1. **Change Default Passwords** in production
2. **Use Strong JWT Secret** in production
3. **Enable HTTPS** in production
4. **Set up Proper CORS** for production domains

## 📞 Support

If you encounter issues:
1. Check MongoDB is running
2. Verify all dependencies are installed
3. Check console for error messages
4. Ensure ports 3000 and 5000 are available

---

**🎉 Your Parent Portal is now ready to use!** 