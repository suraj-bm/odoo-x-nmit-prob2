# 🔐 Google OAuth Setup Guide

## ✅ What's Already Configured

The frontend is now set up with **dual authentication**:
- **Credentials Authentication** - Username/password (admin/admin123)
- **Google OAuth** - Google account login

## 🚀 How to Set Up Google OAuth

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "Shiv Accounts E-commerce"
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "Shiv Accounts Frontend"

5. **Configure Authorized Redirect URIs**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```

6. **Copy Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

### Step 2: Update Environment Variables

Update your `.env.local` file with your Google credentials:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Step 3: Test the Authentication

1. **Start the servers:**
   ```bash
   # Backend (Terminal 1)
   cd backend_new
   python manage.py runserver

   # Frontend (Terminal 2)
   cd frontend/accountrix
   npm run dev
   ```

2. **Test both authentication methods:**
   - **Credentials**: Use admin/admin123
   - **Google OAuth**: Click "Sign in with Google"

## 🎯 Features Available

### ✅ Login Options
- **Username/Password Form** - Traditional login
- **Google OAuth Button** - One-click Google login
- **Automatic Redirect** - Redirects to dashboard after login

### ✅ UI Components
- **Login Form** - Professional login interface
- **Google Button** - Styled Google OAuth button
- **Header Navigation** - Login options in header
- **Sidebar** - Login options in sidebar

### ✅ Backend Integration
- **Dual Authentication** - Both methods work
- **Session Management** - Proper session handling
- **User Data** - Google user info integrated

## 🔧 Configuration Details

### NextAuth Configuration
```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  CredentialsProvider({
    // ... existing credentials config
  })
]
```

### Environment Variables
```env
# Required for Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Required for backend integration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚨 Important Notes

1. **Development vs Production**
   - Use `http://localhost:3000` for development
   - Use your actual domain for production

2. **Security**
   - Never commit `.env.local` to version control
   - Use strong, unique secrets
   - Rotate credentials regularly

3. **Testing**
   - Test both authentication methods
   - Verify redirect URLs work
   - Check user data is properly stored

## 🎉 Ready to Use!

Once you've added your Google OAuth credentials to `.env.local`, both authentication methods will work:

- **Credentials**: admin/admin123
- **Google OAuth**: Your Google account

The frontend will automatically handle the authentication flow and redirect users to the dashboard upon successful login!
