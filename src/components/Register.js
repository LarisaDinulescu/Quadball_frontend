import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
// Import new Shadcn Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    birthDate: '',
    email: '',
    password: '',
    role: 'Spectator'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Specific function for Shadcn Select component
  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('user', JSON.stringify(formData));
    onRegisterSuccess(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-10 px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tighter text-blue-600">
            REGISTER
          </CardTitle>
          <CardDescription className="text-center">
            Create your Quadballholic profile
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" placeholder="John" onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Surname</label>
                <Input name="surname" placeholder="Doe" onChange={handleChange} required />
              </div>
            </div>

           <div className="space-y-2">
              <Label htmlFor="birthDate">Date of Birth</Label>
              <Input 
                id="birthDate" 
                type="date" 
                required 
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="john.doe@example.com" onChange={handleChange} required />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" onChange={handleChange} required />
            </div>

           
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Done
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-sm font-semibold text-slate-600"
              onClick={onSwitchToLogin}
            >
              Do you already have an account? Log In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
