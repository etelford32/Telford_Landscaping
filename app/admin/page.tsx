"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  Users,
  TrendingUp,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle2,
  Crown,
  Mail,
  Calendar,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  subscription: "free" | "pro";
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    newUsersThisMonth: 0,
  });

  useEffect(() => {
    // TODO: In production, add admin role check here
    // For now, just check if authenticated
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Fetch users and stats
    // TODO: Replace with actual API call
    const mockUsers: UserData[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        subscription: "pro",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        subscription: "free",
        createdAt: new Date().toISOString(),
      },
    ];

    setUsers(mockUsers);
    setStats({
      totalUsers: mockUsers.length,
      proUsers: mockUsers.filter(u => u.subscription === "pro").length,
      freeUsers: mockUsers.filter(u => u.subscription === "free").length,
      newUsersThisMonth: mockUsers.length,
    });
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Telford Landscaping Management</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900">Development Mode</h3>
              <p className="text-sm text-yellow-800">
                This admin dashboard is currently in development. In production, role-based access control should be implemented.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalUsers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <p className="text-xs text-gray-500 mt-1">All registered accounts</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Crown className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.proUsers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">PRO Subscribers</h3>
            <p className="text-xs text-gray-500 mt-1">${stats.proUsers * 15}/month revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.freeUsers}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Free Users</h3>
            <p className="text-xs text-gray-500 mt-1">Potential conversions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">New This Month</h3>
            <p className="text-xs text-gray-500 mt-1">Growth tracking</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">View and manage registered users</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((userData) => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary-100 p-2 rounded-full">
                            <Users className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="font-medium text-gray-900">{userData.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{userData.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            userData.subscription === "pro"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {userData.subscription === "pro" && <Crown className="w-3 h-3" />}
                          {userData.subscription.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date(userData.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No users yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
            <div className="bg-primary-100 p-3 rounded-lg w-fit mb-4">
              <Settings className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Site Settings</h3>
            <p className="text-sm text-gray-600">Configure application settings and preferences</p>
          </button>

          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Email Campaigns</h3>
            <p className="text-sm text-gray-600">Manage user communications and newsletters</p>
          </button>

          <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">View detailed analytics and reports</p>
          </button>
        </div>
      </main>
    </div>
  );
}
