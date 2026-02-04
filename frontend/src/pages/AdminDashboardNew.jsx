import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Mail,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  BarChart3,
  Shield,
  Activity
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ModalDialog from '../components/ModalDialog';

const AdminDashboardNew = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, vendors, inquiries, users
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Vendors state
  const [vendors, setVendors] = useState([]);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorsTotalPages, setVendorsTotalPages] = useState(1);

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesPage, setInquiriesPage] = useState(1);
  const [inquiriesTotalPages, setInquiriesTotalPages] = useState(1);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      console.log('Stats API Response:', data);
      
      if (data.success) {
        setStats(data.data);
        console.log('Stats set successfully:', data.data);
      } else {
        console.error('Failed to fetch stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vendors
  const fetchVendors = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/admin/vendors?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      console.log('Vendors API Response:', data);
      
      if (data.success) {
        setVendors(data.data.vendors);
        setVendorsTotalPages(data.data.totalPages);
        console.log('Vendors loaded:', data.data.vendors.length);
      } else {
        console.error('Failed to fetch vendors:', data.error);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  // Fetch inquiries
  const fetchInquiries = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/admin/inquiries?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      console.log('Inquiries API Response:', data);
      
      if (data.success) {
        setInquiries(data.data.inquiries);
        setInquiriesTotalPages(data.data.totalPages);
        console.log('Inquiries loaded:', data.data.inquiries.length);
      } else {
        console.error('Failed to fetch inquiries:', data.error);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await fetch(
        `http://localhost:5000/api/admin/users?page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.users);
        setUsersTotalPages(data.data.totalPages);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'vendors') {
      fetchVendors(vendorsPage);
    } else if (activeTab === 'inquiries') {
      fetchInquiries(inquiriesPage);
    } else if (activeTab === 'users') {
      fetchUsers(usersPage);
    }
  }, [activeTab, vendorsPage, inquiriesPage, usersPage]);

  // Vendor columns
  const vendorColumns = [
    {
      key: 'businessName',
      label: 'Business Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value || row.name}</div>
          <div className="text-sm text-gray-500">{row.contact?.email}</div>
        </div>
      )
    },
    {
      key: 'serviceType',
      label: 'Service',
      sortable: true,
      render: (value) => (
        <span className="capitalize text-gray-700">{value}</span>
      )
    },
    {
      key: 'city',
      label: 'City',
      sortable: true
    },
    {
      key: 'verified',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'verified' : 'unverified'} size="sm" />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelectedItem(row);
            setShowModal(true);
          }}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Inquiry columns
  const inquiryColumns = [
    {
      key: '_id',
      label: 'ID',
      render: (value) => (
        <span className="font-mono text-xs text-gray-600">{value?.substring(0, 12)}...</span>
      )
    },
    {
      key: 'userName',
      label: 'Customer',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value || row.name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{row.userEmail || row.email || row.userPhone || row.phone || ''}</div>
        </div>
      )
    },
    {
      key: 'inquiryType',
      label: 'Type',
      render: (value) => (
        <span className={`
          px-2 py-1 text-xs rounded-full
          ${value === 'vendor_inquiry' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'}
        `}>
          {value === 'vendor_inquiry' ? 'Vendor' : 'Contact'}
        </span>
      )
    },
    {
      key: 'vendorId',
      label: 'Vendor',
      render: (value, row) => {
        if (row.inquiryType === 'vendor_inquiry' && value) {
          return <span className="text-gray-700">{value.businessName || value.name || 'Unknown'}</span>;
        }
        return <span className="text-gray-400">-</span>;
      }
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // User columns
  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value || '-'
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value ? 'active' : 'inactive'} size="sm" />
      )
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your platform efficiently
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {activeTab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Users"
                value={stats.overview.totalUsers}
                icon={Users}
                color="blue"
                onClick={() => setActiveTab('users')}
              />
              <StatsCard
                title="Total Vendors"
                value={stats.overview.totalVendors}
                icon={Building2}
                color="purple"
                description={`${stats.overview.verifiedVendors} verified`}
                onClick={() => setActiveTab('vendors')}
              />
              <StatsCard
                title="Total Inquiries"
                value={stats.overview.totalInquiries}
                icon={Mail}
                color="green"
                description={`${stats.overview.vendorInquiries} vendor, ${stats.overview.contactInquiries} contact`}
                onClick={() => setActiveTab('inquiries')}
              />
              <StatsCard
                title="Pending Inquiries"
                value={stats.overview.pendingInquiries}
                icon={Clock}
                color="orange"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Vendor Inquiries */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Vendor Inquiries
                </h3>
                <div className="space-y-3">
                  {stats.recentActivity.vendorInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{inquiry.userName}</p>
                        <p className="text-xs text-gray-500">
                          {inquiry.vendorId?.businessName || inquiry.vendorId?.name}
                        </p>
                      </div>
                      <StatusBadge status={inquiry.status} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Contact Inquiries */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Contact Inquiries
                </h3>
                <div className="space-y-3">
                  {stats.recentActivity.contactInquiries.map((inquiry) => (
                    <div key={inquiry._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{inquiry.userName}</p>
                        <p className="text-xs text-gray-500">{inquiry.eventType}</p>
                      </div>
                      <StatusBadge status={inquiry.status} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'vendors', label: 'Vendors', icon: Building2 },
                { id: 'inquiries', label: 'Inquiries', icon: Mail },
                { id: 'users', label: 'Users', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Vendors Tab */}
            {activeTab === 'vendors' && (
              <DataTable
                columns={vendorColumns}
                data={vendors}
                currentPage={vendorsPage}
                totalPages={vendorsTotalPages}
                onPageChange={setVendorsPage}
                emptyMessage="No vendors found"
                onRowClick={(vendor) => {
                  setSelectedItem(vendor);
                  setShowModal(true);
                }}
              />
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <DataTable
                columns={inquiryColumns}
                data={inquiries}
                currentPage={inquiriesPage}
                totalPages={inquiriesTotalPages}
                onPageChange={setInquiriesPage}
                emptyMessage="No inquiries found"
              />
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <DataTable
                columns={userColumns}
                data={users}
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={setUsersPage}
                emptyMessage="No users found"
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ModalDialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Details"
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-4">
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(selectedItem, null, 2)}
            </pre>
          </div>
        )}
      </ModalDialog>
    </div>
  );
};

export default AdminDashboardNew;
