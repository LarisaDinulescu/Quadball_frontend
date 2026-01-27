import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { activateAccount } from '../../services/authService';
import { Button } from "../ui/button";
import { Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";

const ActivationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const performActivation = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing activation token. Please check your email link.');
        return;
      }

      try {
        // Java: void activateUser(String token);
        await activateAccount(token);
        setStatus('success');
        setMessage('Your QuadballHolic account has been successfully activated!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Activation failed. The token may be expired or already used.');
      }
    };

    performActivation();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-3 ${
              status === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <ShieldCheck size={32} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-tighter">
            Account Activation
          </CardTitle>
          <CardDescription>
            Finalizing your registration to the QuadballHolic platform.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center py-6 space-y-4">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">Verifying your security token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-center text-slate-700 font-semibold">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-red-600 font-semibold">{message}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {status === 'success' && (
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
              onClick={() => navigate('/login')}
            >
              Sign In Now
            </Button>
          )}

          {status === 'error' && (
            <Button 
              variant="outline"
              className="w-full border-slate-300 font-bold"
              onClick={() => navigate('/signup')}
            >
              Return to Sign Up
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ActivationPage;