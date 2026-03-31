# Login & Register Guide

This guide explains how to use the login and register functionality in the Flutter app.

## ✅ Features Implemented

### 1. **User Registration**
- **Screen**: `SignUpScreen` (`/sign_up`)
- **Form Fields**:
  - Full Name (required)
  - Phone Number (required)
  - Email (required, validated)
  - Password (required, minimum 8 characters)
  - Confirm Password (must match password)
- **Validation**: Client-side validation before submission
- **API Endpoint**: `POST /api/auth/register`
- **Flow**: 
  1. User fills registration form
  2. Form validates input
  3. API call to register endpoint
  4. On success: Navigate to OTP verification screen
  5. On error: Show user-friendly error message

### 2. **User Login**
- **Screen**: `SignInScreen` (`/sign_in`)
- **Form Fields**:
  - Email (required, validated)
  - Password (required, minimum 8 characters)
  - Remember Me checkbox
- **Validation**: Client-side validation before submission
- **API Endpoint**: `POST /api/auth/login`
- **Flow**:
  1. User enters email and password
  2. Form validates input
  3. API call to login endpoint
  4. On success: 
     - Show success message
     - Navigate to Login Success screen
     - Auto-redirect to home after 1 second
  5. On error: Show user-friendly error message

### 3. **OTP Verification**
- **Screen**: `OtpScreen` (`/otp`)
- **Purpose**: Verify email/phone after registration
- **Features**:
  - 4-digit OTP input
  - Auto-focus between fields
  - Resend OTP functionality
  - 30-second countdown timer
- **API Endpoint**: `POST /api/auth/verify-otp`
- **Flow**:
  1. User receives OTP via email/phone
  2. User enters OTP code
  3. API call to verify OTP
  4. On success: Navigate to home screen
  5. On error: Show error message

## 🔧 How It Works

### Authentication Flow

```
Splash Screen
    ↓
Sign In Screen / Sign Up Screen
    ↓
[Sign Up] → OTP Verification → Login Success → Home
[Sign In] → Login Success → Home
```

### Error Handling

The app provides user-friendly error messages for common scenarios:

1. **Invalid Credentials**: "Invalid email or password. Please check your credentials."
2. **User Already Exists**: "An account with this email or phone already exists. Please use a different email/phone or try logging in."
3. **Validation Error**: "Please check your input. All fields are required."
4. **Network Error**: "Network error. Please check your internet connection."

### Token Management

- **Access Token**: Stored securely using `SharedPreferences`
- **Refresh Token**: Automatically refreshed when access token expires
- **Auto-login**: If valid token exists, user is automatically logged in on app start

## 📱 Usage Instructions

### To Register a New User:

1. Open the app (starts at Splash Screen)
2. Tap "Continue" to go to Sign In screen
3. Tap "Sign Up" at the bottom of the Sign In screen
4. Fill in all required fields:
   - Full Name
   - Phone Number
   - Email
   - Password (minimum 8 characters)
   - Confirm Password (must match)
5. Tap "Continue"
6. If successful, you'll be redirected to OTP verification screen
7. Enter the 4-digit OTP code sent to your email/phone
8. Tap "Continue" to verify
9. After verification, you'll be automatically redirected to the home screen

### To Login:

1. Open the app (starts at Splash Screen)
2. Tap "Continue" to go to Sign In screen
3. Enter your email and password
4. Optionally check "Remember me"
5. Tap "Continue"
6. If successful, you'll see a success screen and be redirected to home
7. If there's an error, a message will be displayed

### To Access the App After Login:

- If you're already logged in, the app will automatically load your profile on startup
- You can access your profile from the bottom navigation bar
- Your cart and wishlist are synced with your account

## 🔐 Security Features

1. **Secure Token Storage**: Tokens are stored using Flutter's `SharedPreferences`
2. **Automatic Token Refresh**: Access tokens are automatically refreshed when expired
3. **Password Validation**: Minimum 8 characters required
4. **Email Validation**: Proper email format validation
5. **OTP Verification**: Two-factor authentication via OTP

## 🌐 API Configuration

### Base URL
- **Development (iOS Simulator)**: `http://localhost:5000/api`
- **Development (Android Emulator)**: `http://10.0.2.2:5000/api`
- **Production**: Set via `API_BASE_URL` environment variable

### Required Endpoints
1. `POST /api/auth/register` - User registration
2. `POST /api/auth/login` - User login
3. `POST /api/auth/send-otp` - Send OTP
4. `POST /api/auth/verify-otp` - Verify OTP
5. `GET /api/users/profile` - Get user profile (authenticated)

## 🐛 Troubleshooting

### "Network error" message:
- Ensure your backend server is running on `http://localhost:5000`
- Check your internet connection
- For Android emulator, ensure you're using `10.0.2.2` instead of `localhost`

### "Invalid credentials" message:
- Verify your email and password are correct
- Ensure you've registered an account first
- Check if the account is verified (completed OTP verification)

### Login not persisting:
- Check if tokens are being saved correctly
- Verify backend is returning tokens in the response
- Check app permissions for storage

### OTP not received:
- Check spam folder for email
- Verify phone number format is correct
- Use "Resend OTP" if needed
- Ensure backend email/SMS service is configured

## 📝 Notes

- The app requires backend server to be running
- All API calls require proper backend configuration
- Token expiration is handled automatically
- User profile is loaded after successful authentication
- Cart and wishlist data is synced with user account

## 🔗 Related Files

- **Sign In Form**: `lib/screens/sign_in/components/sign_form.dart`
- **Sign Up Form**: `lib/screens/sign_up/components/sign_up_form.dart`
- **OTP Form**: `lib/screens/otp/components/otp_form.dart`
- **Auth Provider**: `lib/providers/auth_provider.dart`
- **API Client**: `lib/services/api_client.dart`
- **Auth Storage**: `lib/services/auth_storage.dart`
