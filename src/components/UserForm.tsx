'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Crown, Shield, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '@/types/auth';

interface UserFormData {
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

interface UserFormProps {
  initialData?: UserFormData & { _id?: string };
  isEditing?: boolean;
}

export default function UserForm({ initialData, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: UserRole.PASSENGER,
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username,
        email: initialData.email || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        password: '', // Never populate password field
        role: initialData.role,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isEditing && !formData.password) {
      setError('Password is required for new users');
      setLoading(false);
      return;
    }

    try {
      const url = isEditing ? `/api/users/${initialData?._id}` : '/api/users';
      const method = isEditing ? 'PUT' : 'POST';
      const body = { ...formData };
      
      // Don't send password if it's empty during edit
      if (isEditing && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/users');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Crown className="text-yellow-600" size={16} />;
      case UserRole.ADMIN:
        return <Shield className="text-blue-600" size={16} />;
      case UserRole.PASSENGER:
        return <UserIcon className="text-gray-600" size={16} />;
      default:
        return <UserIcon className="text-gray-600" size={16} />;
    }
  };

  const getRoleDescription = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Full administrative access including user and station management';
      case UserRole.ADMIN:
        return 'Administrative access with read-only permissions for users and stations';
      case UserRole.PASSENGER:
        return 'Standard passenger access for using the MRT system';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit User' : 'Create New User'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            <p className="text-sm text-gray-600">Basic user details and contact information</p>
          </div>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter unique username"
                required
                disabled={isEditing} // Username shouldn't be editable
              />
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed after creation</p>
              )}
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Leave password empty to keep current password' : 'Set login credentials'}
            </p>
          </div>
          <div className="card-body">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password {!isEditing && '*'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder={isEditing ? 'Leave empty to keep current password' : 'Enter secure password'}
                  required={!isEditing}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && !validatePassword(formData.password) && (
                <p className="text-red-600 text-sm mt-1">Password must be at least 6 characters long</p>
              )}
              {!isEditing && (
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
              )}
            </div>
          </div>
        </div>

        {/* Role & Permissions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Role & Permissions</h3>
            <p className="text-sm text-gray-600">Set user access level and account status</p>
          </div>
          <div className="card-body space-y-6">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                User Role *
              </label>
              <div className="space-y-3">
                {[UserRole.PASSENGER, UserRole.ADMIN, UserRole.SUPER_ADMIN].map((role) => (
                  <label key={role} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getRoleIcon(role)}
                        <span className="font-medium text-gray-900">
                          {role.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription(role)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Active Account</span>
                  <p className="text-sm text-gray-600">User can log in and access the system</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary px-6 py-3"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (!!formData.password && !validatePassword(formData.password))}
            className="btn-primary px-8 py-3 flex items-center space-x-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{loading ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}