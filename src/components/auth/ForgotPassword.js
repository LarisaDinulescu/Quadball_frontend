import React, { useState } from 'react';
import { forgetPassword } from '../../services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Mail, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Java: void requestPasswordReset(String email);
      await forgetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Could not process request. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
        <Card className="w-full max-w-md text-center p-6 shadow-xl border-t-4 border-t-blue-600">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold mb-2">Check Your Email</CardTitle>
          <p className="text-slate-600 mb-6">If an account exists for {email}, you will receive a password reset link shortly.</p>
          <Button onClick={() => navigate('/login')} className="w-full bg-blue-600">Back to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader>
          <Button variant="ghost" onClick={() => navigate('/login')} className="w-fit p-0 h-auto text-slate-500 hover:text-blue-600 mb-2">
            <ChevronLeft size={16} /> Back to Login
          </Button>
          <CardTitle className="text-2xl font-bold tracking-tighter uppercase">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a secure reset link.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input 
                  id="email" type="email" placeholder="name@example.com" 
                  value={email} onChange={(e) => setEmail(e.target.value)} required 
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 font-bold" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Send Reset Link"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;