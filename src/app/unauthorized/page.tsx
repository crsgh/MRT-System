import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <Shield className="text-red-600" size={40} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/admin"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Go Back to Dashboard</span>
          </Link>
          
          <div>
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign in with a different account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}