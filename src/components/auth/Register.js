import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate import
import { signup } from '../../services/authService'; // use real service
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Java backend call: Long signUp(SignUpRequest signUpRequest);
      await signup(formData);
      setSuccess(true);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.response?.data?.message || "Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500 text-center p-6">
          <CardTitle className="text-2xl font-bold text-green-600">Registration Successful!</CardTitle>
          <p className="text-slate-600 mt-4">
            Please check your email to activate your account before logging in.
          </p>
          <Button className="w-full mt-6 bg-blue-600" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tighter text-blue-600 uppercase">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Join the Quadballholic community
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Name</Label>
                <Input name="name" placeholder="John" onChange={handleChange} required disabled={loading} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Surname</Label>
                <Input name="surname" placeholder="Doe" onChange={handleChange} required disabled={loading} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Email</Label>
              <Input name="email" type="email" placeholder="john.doe@example.com" onChange={handleChange} required disabled={loading} />
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium">Password</Label>
              <Input name="password" type="password" placeholder="••••••••" onChange={handleChange} required disabled={loading} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Sign Up"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-sm font-semibold text-slate-600"
              type="button"
              onClick={() => navigate('/login')} // Navigating to login
            >
              Already have an account? Log In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;