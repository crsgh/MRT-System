'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, MapPin, Users, TrendingUp, Shield } from 'lucide-react';

interface User {
  role: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface DashboardStats {
  totalStations: number;
  activeUsers: number;
  todayTrips: number;
  recentTrips: any[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      let isAuthenticated = false;
      try {
        // 1. Fetch User
        const userRes = await fetch('/api/auth/me');
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        isAuthenticated = true;
        const userData = await userRes.json();
        setUser(userData.user);

        // 2. Fetch Stats (only if authenticated)
        const [stationsRes, tripsRes, usersRes] = await Promise.all([
          fetch('/api/stations'),
          fetch('/api/trips'),
          fetch('/api/passengers')
        ]);

        const stationsData = stationsRes.ok ? await stationsRes.json() : { stations: [] };
        const tripsData = tripsRes.ok ? await tripsRes.json() : { trips: [] };
        const usersData = usersRes.ok ? await usersRes.json() : { passengers: [] };

        // Calculate today's trips
        const today = new Date().toDateString();
        const todayTrips = tripsData.trips.filter((trip: any) => {
          const tripDate = new Date(trip.createdAt || trip.tapInTime).toDateString();
          return tripDate === today;
        });

        setStats({
          totalStations: stationsData.stations.length,
          activeUsers: usersData.passengers.length,
          todayTrips: todayTrips.length,
          recentTrips: tripsData.trips.slice(0, 5) // Get latest 5 trips
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      } finally {
        // Only stop loading if we are authenticated to avoid flash of access denied during redirect
        if (isAuthenticated) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <Shield className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }
  type Stat = {
    title: string;
    value: string;
    icon: any;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    description: string;
  };

  const dashboardStats: Stat[] = [
    {
      title: 'Total Stations',
      value: stats?.totalStations?.toString() || '--',
      icon: MapPin,
      change: '+0%',
      changeType: 'neutral',
      description: 'Active stations in system'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers?.toString() || '--',
      icon: Users,
      change: '+0%',
      changeType: 'positive',
      description: 'Users currently in system'
    },
    {
      title: "Today's Trips",
      value: stats?.todayTrips?.toString() || '--',
      icon: TrendingUp,
      change: '+0%',
      changeType: 'neutral',
      description: 'Completed journeys today'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-black to-gray-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName} {user.lastName}
        </h1>
        <p className="text-gray-200">
          {user.role === 'super_admin' 
            ? 'You have full administrative access to the MRT system.' 
            : 'You have administrative access to view system information.'
          }
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card hover:shadow-md transition-shadow duration-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="text-gray-700" size={24} />
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'text-green-700 bg-green-100' :
                    stat.changeType === 'negative' ? 'text-red-700 bg-red-100' :
                    'text-gray-700 bg-gray-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Activity className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">System Online</span>
                </div>
                <span className="text-xs text-green-600">All systems operational</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">Database Connected</span>
                </div>
                <span className="text-xs text-gray-600">Connection stable</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">Maintenance Due</span>
                </div>
                <span className="text-xs text-yellow-600">Scheduled for next week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-3">
              <a
                href="/admin/stations/new"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-black text-white rounded-lg group-hover:bg-gray-800 transition-colors">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Add New Station</h4>
                    <p className="text-sm text-gray-600">Create a new MRT station</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
              
              <a
                href="/admin/stations"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Activity size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Stations</h4>
                    <p className="text-sm text-gray-600">View and edit existing stations</p>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>


            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="card-body">
          {!stats?.recentTrips || stats.recentTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="mx-auto mb-3 text-gray-400" size={48} />
              <h3 className="font-medium text-gray-900 mb-1">No recent activity</h3>
              <p className="text-sm">System activity will appear here once trips are made</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentTrips.map((trip, index) => (
                <div key={trip.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      trip.status === 'completed' ? 'bg-green-500' : 
                      trip.status === 'active' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.passengerCode} • {trip.startStation || 'Unknown'} 
                        {trip.endStation ? ` → ${trip.endStation}` : ' (in progress)'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.tapInTime ? new Date(trip.tapInTime).toLocaleString() : 'Time unknown'}
                        {trip.fare && ` • ₱${trip.fare}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                    trip.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}