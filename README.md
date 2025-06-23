# 🎓 EduRays - School Management System

A comprehensive school management system with role-based access for administrators, teachers, students, and parents.

## 🚀 Quick Start - Parent Portal

### Prerequisites

**MongoDB is required for full functionality. Choose one option:**

#### Option 1: Install MongoDB Locally (Recommended)
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```

#### Option 2: Use MongoDB Atlas (Cloud - Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Create `.env` file in `backend` folder with: `MONGO_URI=your_connection_string`

### Setup Instructions

1. **Clone and Navigate**
   ```powershell
   cd EDUTOOL
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   npm install
   ```

3. **Create Environment File**
   Create `.env` file in `backend` folder:
   ```
   MONGO_URI=mongodb://localhost:27017/edurays
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Create Test Data**
   ```powershell
   node setup-mongo.js
   ```

5. **Start Backend**
   ```powershell
   npm start
   ```

6. **Frontend Setup** (New Terminal)
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

### 🧪 Test Credentials

After running `setup-mongo.js`, you can use:

- **Parent Login**: http://localhost:3000/parent/login
- **Email**: parent@test.com
- **Password**: password123
- **Student Roll Numbers**: TEST001, TEST002

### 📱 Using the Parent Portal

1. **Login** with test credentials
2. **Link Students** using roll numbers (TEST001, TEST002)
3. **View Dashboard** with child information
4. **Access Features** like assignments, fees, attendance, etc.

## 🏗️ Project Structure

```
EDUTOOL/
├── backend/                 # Node.js API server
│   ├── controllers/         # Route handlers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middlewares/        # Authentication & validation
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API services
│   │   └── routes/         # Route definitions
│   └── package.json
└── README.md
```

## 🔐 Role-Based Access

- **Admin**: Full system access
- **Principal**: Academic oversight
- **HOD**: Department management
- **Teacher**: Class and student management
- **Parent**: Child monitoring and communication
- **Student**: Academic activities and resources

## 🛠️ Features

### Parent Portal
- ✅ Child profile access
- ✅ Academic monitoring
- ✅ Attendance tracking
- ✅ Fee management
- ✅ Communication tools
- ✅ Assignment tracking
- ✅ Exam results
- ✅ Transport tracking
- ✅ Health information
- ✅ Document center

### Admin Features
- ✅ Student management
- ✅ Staff administration
- ✅ Fee configuration
- ✅ Inventory control
- ✅ Transport management
- ✅ Event coordination
- ✅ Communication system
- ✅ Reporting and analytics

## 🚨 Troubleshooting

### MongoDB Issues
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Port Conflicts
```powershell
# Check port usage
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend Issues
```powershell
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

If you encounter issues:
1. Check MongoDB is running
2. Verify all dependencies are installed
3. Check console for error messages
4. Ensure ports 3000 and 5000 are available

## 📄 License

This project is for educational purposes.

---

**🎉 Happy Learning with EduRays!** 