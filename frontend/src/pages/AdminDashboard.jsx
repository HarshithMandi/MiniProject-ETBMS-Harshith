import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { adminApi } from '../api/endpoints.js';
import { Loader, ErrorMessage } from '../components/Loader.jsx';
import { Table } from '../components/Table.jsx';
import { formatDate, formatCurrency } from '../utils/helpers.js';

export const AdminDashboard = () => {
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('reports'); // 'reports' or 'users'

  const { data: reports, loading: reportsLoading } = useFetch(
    () => adminApi.getReports(),
    []
  );

  const { data: users, loading: usersLoading } = useFetch(
    () => adminApi.getUsers(),
    [tab]
  );

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      setMessage('User deleted successfully');
      // Refresh users
      window.location.reload();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const reportColumns = [
    { key: '_id', label: 'Booking ID' },
    { key: 'event_title', label: 'Event' },
    { key: 'user_email', label: 'Customer' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => formatCurrency(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            val === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {val?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'payment_time',
      label: 'Date',
      render: (val) => formatDate(val),
    },
  ];

  const userColumns = [
    { key: '_id', label: 'ID' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (val) => (
        <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">
          {val?.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-red-100 mt-2">System analytics and management</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {message && (
          <div className={`mb-6 p-4 rounded border ${message.includes('success') ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'}`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setTab('reports')}
            className={`px-6 py-3 font-bold border-b-2 transition ${
              tab === 'reports'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Revenue Reports
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-6 py-3 font-bold border-b-2 transition ${
              tab === 'users'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Users Management
          </button>
        </div>

        {/* Revenue Reports */}
        {tab === 'reports' && (
          <div className="space-y-6">
            {reportsLoading ? (
              <Loader message="Loading reports..." />
            ) : reports && reports.length > 0 ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 text-sm mb-2">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        reports.reduce((sum, r) => sum + (r.amount || 0), 0)
                      )}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reports.length}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 text-sm mb-2">Successful Payments</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reports.filter((r) => r.status === 'success').length}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <p className="text-gray-600 text-sm mb-2">Failed Payments</p>
                    <p className="text-2xl font-bold text-red-600">
                      {reports.filter((r) => r.status === 'failed').length}
                    </p>
                  </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Table
                    columns={reportColumns}
                    data={reports}
                    isLoading={reportsLoading}
                  />
                </div>
              </>
            ) : (
              <ErrorMessage message="No payment reports available" />
            )}
          </div>
        )}

        {/* Users Management */}
        {tab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {usersLoading ? (
              <Loader message="Loading users..." />
            ) : users && users.length > 0 ? (
              <Table
                columns={userColumns}
                data={users}
                actions={[
                  {
                    label: 'Delete',
                    className:
                      'bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700',
                    onClick: (user) => handleDeleteUser(user._id),
                  },
                ]}
                isLoading={usersLoading}
              />
            ) : (
              <ErrorMessage message="No users found" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
