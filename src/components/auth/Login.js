import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importa useNavigate
import { login } from '../../services/authService'; 
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 
  
  const navigate = useNavigate(); // 2. Inizializza navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      onLoginSuccess(data);
      navigate('/tournaments'); // 3. Dopo il login, vai alla lista tornei
    } catch (err) {
      console.error("Login failed:", err);
      const message = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center tracking-tighter text-blue-600">
            QUADBALLHOLIC
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your credentials to manage your tournaments
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Log In"}
            </Button>
            
            <div className="flex flex-col items-center gap-2">
              {/* 4. Collegamento a Forgot Password */}
              <Button 
                variant="link" 
                className="text-xs text-slate-500"
                type="button"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot your password?
              </Button>
              
              {/* 5. Collegamento a Register */}
              <Button 
                variant="ghost" 
                className="w-full text-sm font-semibold text-slate-600 underline"
                type="button"
                onClick={() => navigate('/register')}
              >
                New here? Create an account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;