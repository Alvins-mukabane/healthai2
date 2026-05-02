'use client';

import { login } from '../actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { HeartPulse, Loader2 } from 'lucide-react';
import { useState, Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200">
      <form className="space-y-6" action={async (formData) => {
        setIsPending(true);
        await login(formData);
        setIsPending(false);
      }}>
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">New to HealthAI?</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/register"
            className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <HeartPulse className="text-rose-500 w-12 h-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to HealthAI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Your secure health copilot
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={
          <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

