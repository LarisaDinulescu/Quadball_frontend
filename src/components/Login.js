import React, { useState } from 'react';
import axios from 'axios'; 
// Import Shadcn components
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Try to get real test user from backend
      // Changed "ORGANIZATION_MANAGER" to "ROLE_ORGANIZATION_MANAGER" to match Java Enum
      const roleParam = "ROLE_ORGANIZATION_MANAGER";
      const response = await axios.post(`http://localhost:8080/api/test-user?role=${roleParam}`);
      
      const data = response.data;
      const userData = {
        email: data.email,
        role: data.roles[0], 
        token: data.accessToken,
        id: data.id,
        name: 'Test', 
        surname: 'Manager'
      };

      localStorage.setItem('user', JSON.stringify(userData));
      onLoginSuccess(userData);

    } catch (err) {
      console.error("Backend login failed, using fallback mock user:", err);
      
      // 2. FALLBACK: Create a local mock user so you can continue working
      const fallbackUser = {
        email: email || "test@quadballholic.com",
        name: 'Test',
        surname: 'Organizer',
        role: 'ROLE_ORGANIZATION_MANAGER', 
        id: 999
      };

      localStorage.setItem('user', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tighter text-blue-600">
            QUADBALLHOLIC LOGIN
          </CardTitle>
          <CardDescription className="text-center">
            <span className="text-slate-500 italic text-xs block">
              Test Mode: Backend connection optional
            </span>
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Log In (Auto-Access)
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-sm font-semibold text-slate-600"
              type="button"
              onClick={onSwitchToRegister}
            >
              Are you here for the first time? Sign up
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;