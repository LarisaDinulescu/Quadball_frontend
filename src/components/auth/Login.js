import React, { useState } from 'react';
// Importa il servizio che abbiamo creato
import { login } from '../../services/authService'; 
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Usiamo il servizio reale
      const data = await login(email, password);
      
      // Il servizio salva già l'utente nel localStorage
      // Passiamo i dati al componente genitore
      onLoginSuccess(data);

    } catch (err) {
      console.error("Login failed:", err);
      // Gestione errori più precisa
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
               <Button 
                variant="link" 
                className="text-xs text-slate-500"
                type="button"
                onClick={() => {/* logica forget password */}}
              >
                Forgot your password?
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full text-sm font-semibold text-slate-600 underline"
                type="button"
                onClick={onSwitchToRegister}
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