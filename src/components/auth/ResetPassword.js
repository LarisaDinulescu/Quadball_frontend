import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Lock, ShieldCheck, Loader2, AlertCircle } from "lucide-react"; 
import { resetPassword } from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.password !== passwords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (passwords.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      // Aligned with your Java ResetPasswordRequest DTO
      await resetPassword({
        token: token,
        newPassword: passwords.password,
        newPasswordConfirmation: passwords.confirmPassword
      });

      setSuccess(true);
      // Automatically redirect to login after 3 seconds
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "The reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-xl text-center p-8 border-t-4 border-t-green-500 bg-white">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <ShieldCheck size={40} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Password Reset Successful!</CardTitle>
          <p className="text-slate-600 mt-4 font-medium">
            Your account is now secure. You will be redirected to the login page shortly.
          </p>
          <Button 
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/login')}
          >
            Go to Login now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-blue-600 bg-white">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-blue-50 p-3 text-blue-600">
              <Lock size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight uppercase italic text-slate-800">
            Set New Password
          </CardTitle>
          <CardDescription className="text-slate-500">
            Please enter and confirm your new password to finalize the process.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
            
            {!token && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="font-semibold">
                  Missing security token. Please check your email and use the provided link.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password text-xs font-bold uppercase text-slate-500">New Password</Label>
              <Input 
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={passwords.password}
                onChange={handleChange}
                disabled={!token || loading}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword text-xs font-bold uppercase text-slate-500">Confirm Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={passwords.confirmPassword}
                onChange={handleChange}
                disabled={!token || loading}
                className="h-11"
              />
            </div>
          </CardContent>
          
          <CardFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg transition-all"
              disabled={loading || !token}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;