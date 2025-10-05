# Google OAuth Redirect URI Fix

## 🚨 **Error: redirect_uri_mismatch**

This error occurs when the redirect URI in your Google Cloud Console doesn't match what NextAuth.js is expecting.

## 🔧 **Solution Steps**

### **1. Update Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. In the **Authorized redirect URIs** section, add these URIs:

```
http://localhost:3000/api/auth/callback/google
https://localhost:3000/api/auth/callback/google
```

### **2. Current Configuration**

- **Client ID**: `YOUR_GOOGLE_CLIENT_ID`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`
- **Redirect URI**: `http://localhost:3000/api/auth/callback/google`

### **3. Environment Variables**

Make sure your `.env.local` file contains:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### **4. Test the Fix**

1. Save the changes in Google Cloud Console
2. Wait 1-2 minutes for changes to propagate
3. Restart your Next.js development server
4. Try logging in with Google again

## 🔍 **Troubleshooting**

### **If still getting errors:**

1. **Check the exact redirect URI** - it must match exactly
2. **Clear browser cache** - sometimes cached redirects cause issues
3. **Check console logs** - look for any additional error details
4. **Verify environment variables** - make sure they're loaded correctly

### **Common Redirect URIs for Development:**

```
http://localhost:3000/api/auth/callback/google
https://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
https://127.0.0.1:3000/api/auth/callback/google
```

### **For Production:**

```
https://yourdomain.com/api/auth/callback/google
```

## ✅ **Expected Result**

After fixing the redirect URI, you should be able to:
1. Click "Sign in with Google"
2. Be redirected to Google's OAuth consent screen
3. Grant permissions
4. Be redirected back to your app
5. See your Google account logged in

## 🆘 **Still Having Issues?**

If you're still experiencing problems:
1. Double-check the redirect URI in Google Cloud Console
2. Ensure your Next.js server is running on port 3000
3. Check that the environment variables are properly loaded
4. Try using an incognito/private browser window
