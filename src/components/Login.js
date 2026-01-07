import React, { useState } from 'react';
// Import Shadcn components
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login by retrieving user data from localStorage for testing
    const savedUser = JSON.parse(localStorage.getItem('user'));
    
    if (savedUser && savedUser.email === email) {
      onLoginSuccess(savedUser);
    } else {
      // If no registered user is found, we create a mock test user
      const mockUser = { 
          email: email, 
          name: 'User', 
          surname: 'Test', 
          role: 'Organizer' 
      };
      onLoginSuccess(mockUser);
    }
  };

  return (
    // "min-h-screen" centers everything vertically on the page
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tighter text-blue-600">
            QUADBALLHOLIC LOGIN
          </CardTitle>
          <CardDescription className="text-center">
            Log in to manage your tournaments
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
              Log In
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full text-sm font-semibold text-slate-600"
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