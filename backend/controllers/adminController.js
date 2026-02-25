const User = require('../models/User');
const Vendor = require('../models/VendorNew');
const VendorInquiry = require('../models/VendorInquiry');
const ContactInquiry = require('../models/ContactInquiry');
const Inquiry = require('../models/Inquiry');
const VendorReview = require('../models/VendorReview');
const VendorMedia = require('../models/VendorMedia');
const VendorBlog = require('../models/VendorBlog');

/**
 * Get Admin Dashboard Statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    console.log('\n📊 Fetching admin dashboard statistics...');

    // Get counts with fallback to 0 on error
    let counts = {
      totalUsers: 0,
      totalVendors: 0,
      verifiedVendors: 0,
      totalVendorInquiries: 0,
      totalContactInquiries: 0,
      pendingVendorInquiries: 0,
      pendingContactInquiries: 0,
      pendingApprovalInquiries: 0,
      approvedInquiries: 0,
      rejectedInquiries: 0
    };

    try {
      const [
        totalUsers,
        totalVendors,
        verifiedVendors,
        totalVendorInquiries,
        totalContactInquiries,
        pendingVendorInquiries,
        pendingContactInquiries,
        pendingApprovalInquiries,
        approvedInquiries,
        rejectedInquiries
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }).catch(() => 0),
        Vendor.countDocuments().catch(() => 0),
        Vendor.countDocuments({ verified: true }).catch(() => 0),
        VendorInquiry.countDocuments().catch(() => 0),
        ContactInquiry.countDocuments().catch(() => 0),
        VendorInquiry.countDocuments({ status: 'pending' }).catch(() => 0),
        ContactInquiry.countDocuments({ status: 'pending' }).catch(() => 0),
        VendorInquiry.countDocuments({ approvalStatus: 'pending' }).catch(() => 0),
        VendorInquiry.countDocuments({ approvalStatus: 'approved' }).catch(() => 0),
        VendorInquiry.countDocuments({ approvalStatus: 'rejected' }).catch(() => 0)
      ]);
      
      counts = {
        totalUsers,
        totalVendors,
        verifiedVendors,
        totalVendorInquiries,
        totalContactInquiries,
        pendingVendorInquiries,
        pendingContactInquiries,
        pendingApprovalInquiries,
        approvedInquiries,
        rejectedInquiries
      };
    } catch (countError) {
      console.warn('⚠️  Error fetching counts, using defaults:', countError.message);
    }

    // Get recent inquiries with error handling
    let recentVendorInquiries = [];
    let recentContactInquiries = [];
    
    try {
      recentVendorInquiries = await VendorInquiry.find()
        .populate({ path: 'vendorId', select: 'name businessName', strictPopulate: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []);
    } catch (err) {
      console.warn('⚠️  Error fetching recent vendor inquiries:', err.message);
    }

    try {
      recentContactInquiries = await ContactInquiry.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .catch(() => []);
    } catch (err) {
      console.warn('⚠️  Error fetching recent contact inquiries:', err.message);
    }

    // Get inquiry trends (last 7 days) with error handling
    let inquiryTrends = [];
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      inquiryTrends = await VendorInquiry.aggregate([
        {
          $match: { createdAt: { $gte: sevenDaysAgo } }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).catch(() => []);
    } catch (err) {
      console.warn('⚠️  Error fetching inquiry trends:', err.message);
    }

    // Get vendor distribution by service type with error handling
    let vendorsByService = [];
    try {
      vendorsByService = await Vendor.aggregate([
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).catch(() => []);
    } catch (err) {
      console.warn('⚠️  Error fetching vendors by service:', err.message);
    }

    console.log('✅ Dashboard stats fetched successfully');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: counts.totalUsers,
          totalVendors: counts.totalVendors,
          verifiedVendors: counts.verifiedVendors,
          totalInquiries: counts.totalVendorInquiries + counts.totalContactInquiries,
          vendorInquiries: counts.totalVendorInquiries,
          contactInquiries: counts.totalContactInquiries,
          pendingInquiries: counts.pendingVendorInquiries + counts.pendingContactInquiries,
          pendingVendorInquiries: counts.pendingVendorInquiries,
          pendingContactInquiries: counts.pendingContactInquiries,
          // Approval statistics
          pendingApproval: counts.pendingApprovalInquiries,
          approvedInquiries: counts.approvedInquiries,
          rejectedInquiries: counts.rejectedInquiries
        },
        recentActivity: {
          vendorInquiries: recentVendorInquiries,
          contactInquiries: recentContactInquiries
        },
        trends: {
          inquiryTrends,
          vendorsByService
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    // Return empty data instead of failing completely
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: 0,
          totalVendors: 0,
          verifiedVendors: 0,
          totalInquiries: 0,
          vendorInquiries: 0,
          contactInquiries: 0,
          pendingInquiries: 0,
          pendingVendorInquiries: 0,
          pendingContactInquiries: 0,
          pendingApproval: 0,
          approvedInquiries: 0,
          rejectedInquiries: 0
        },
        recentActivity: {
          vendorInquiries: [],
          contactInquiries: []
        },
        trends: {
          inquiryTrends: [],
          vendorsByService: []
        }
      }
    });
  }
};

/**
 * Get All Users
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
};

/**
 * Update User Status
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;
    if (role && ['user', 'admin'].includes(role)) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    console.log(`✅ User ${user.email} updated:`, updateData);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

/**
 * Get All Vendors (Admin)
 */
exports.getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, verified, serviceType } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (typeof verified !== 'undefined') {
      query.verified = verified === 'true';
    }

    if (serviceType) {
      query.serviceType = serviceType;
    }

    const skip = (page - 1) * limit;

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      data: {
        vendors,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching vendors:', error);
    next(error);
  }
};

/**
 * Get Single Vendor by ID (Admin - includes inactive vendors)
 */
exports.getVendorById = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findById(vendorId).lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    res.json({
      success: true,
      data: vendor
    });

  } catch (error) {
    console.error('Error fetching vendor:', error);
    next(error);
  }
};

/**
 * Verify/Unverify Vendor
 */
exports.toggleVendorVerification = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { verified } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { verified },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    console.log(`✅ Vendor ${vendor.businessName} ${verified ? 'verified' : 'unverified'}`);

    res.json({
      success: true,
      message: `Vendor ${verified ? 'verified' : 'unverified'} successfully`,
      data: vendor
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    next(error);
  }
};

/**
 * Get All Inquiries (Both Collections)
 */
exports.getAllInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, approvalStatus } = req.query;

    const query = {};
    if (status) query.status = status;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const skip = (page - 1) * limit;

    let vendorInquiries = [];
    let contactInquiries = [];
    let vendorTotal = 0;
    let contactTotal = 0;

    if (!type || type === 'vendor') {
      try {
        vendorInquiries = await VendorInquiry.find(query)
          .populate({
            path: 'vendorId',
            select: 'name businessName serviceType',
            options: { strictPopulate: false }
          })
          .populate({
            path: 'approvedBy',
            select: 'name email',
            options: { strictPopulate: false }
          })
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .lean()
          .catch(err => {
            console.error('❌ Error fetching vendor inquiries:', err.message);
            return [];
          });
        vendorTotal = await VendorInquiry.countDocuments(query).catch(() => 0);
      } catch (err) {
        console.error('❌ Error in vendor inquiries block:', err);
        vendorInquiries = [];
        vendorTotal = 0;
      }
    }

    if (!type || type === 'contact') {
      try {
        contactInquiries = await ContactInquiry.find(query)
          .sort({ createdAt: -1 })
          .limit(parseInt(limit))
          .lean()
          .catch(err => {
            console.error('❌ Error fetching contact inquiries:', err.message);
            return [];
          });
        contactTotal = await ContactInquiry.countDocuments(query).catch(() => 0);
      } catch (err) {
        console.error('❌ Error in contact inquiries block:', err);
        contactInquiries = [];
        contactTotal = 0;
      }
    }

    const vendorInqsWithType = vendorInquiries.map(inq => ({
      ...inq,
      inquiryType: 'vendor_inquiry'
    }));

    const contactInqsWithType = contactInquiries.map(inq => ({
      ...inq,
      inquiryType: 'contact_inquiry'
    }));

    const allInquiries = [...vendorInqsWithType, ...contactInqsWithType]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(skip, skip + parseInt(limit));

    const total = vendorTotal + contactTotal;

    res.json({
      success: true,
      data: {
        inquiries: allInquiries,
        total,
        vendorInquiriesCount: vendorTotal,
        contactInquiriesCount: contactTotal,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    // Return empty data instead of crashing
    res.json({
      success: true,
      data: {
        inquiries: [],
        total: 0,
        vendorInquiriesCount: 0,
        contactInquiriesCount: 0,
        page: parseInt(page),
        totalPages: 0
      }
    });
  }
};

/**
 * Update Inquiry Status
 */
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { status, notes, type } = req.body;

    let inquiry;

    if (type === 'vendor') {
      inquiry = await VendorInquiry.findByIdAndUpdate(
        inquiryId,
        { status },
        { new: true }
      ).populate('vendorId');
    } else if (type === 'contact') {
      const updateData = { status };
      if (notes) updateData.adminNotes = notes;
      
      inquiry = await ContactInquiry.findByIdAndUpdate(
        inquiryId,
        updateData,
        { new: true }
      );
    }

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inquiry not found' }
      });
    }

    console.log(`✅ Inquiry ${inquiryId} status updated to: ${status}`);

    res.json({
      success: true,
      message: 'Inquiry updated successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('Error updating inquiry:', error);
    next(error);
  }
};

/**
 * Approve Vendor Inquiry (NEW)
 * Only admin can approve inquiries - once approved, vendor can see them
 */
exports.approveInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const adminId = req.user._id; // From auth middleware

    console.log(`\n✅ Admin ${req.user.email} approving inquiry ${inquiryId}...`);

    const inquiry = await VendorInquiry.findByIdAndUpdate(
      inquiryId,
      {
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('vendorId', 'name businessName contact.email')
     .populate('approvedBy', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { 
          code: 'INQUIRY_NOT_FOUND',
          message: 'Inquiry not found' 
        }
      });
    }

    console.log(`✅ Inquiry approved! Vendor ${inquiry.vendorDetails?.businessName} can now see this inquiry`);

    res.json({
      success: true,
      message: 'Inquiry approved successfully. Vendor can now see this inquiry.',
      data: inquiry
    });

  } catch (error) {
    console.error('❌ Error approving inquiry:', error);
    next(error);
  }
};

/**
 * Reject Vendor Inquiry (NEW)
 * Admin can reject inquiries with a reason
 */
exports.rejectInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { reason } = req.body;
    const adminId = req.user._id;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REASON_REQUIRED',
          message: 'Please provide a reason for rejection'
        }
      });
    }

    console.log(`\n❌ Admin ${req.user.email} rejecting inquiry ${inquiryId}...`);

    const inquiry = await VendorInquiry.findByIdAndUpdate(
      inquiryId,
      {
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason.trim()
      },
      { new: true }
    ).populate('vendorId', 'name businessName')
     .populate('approvedBy', 'name email');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { 
          code: 'INQUIRY_NOT_FOUND',
          message: 'Inquiry not found' 
        }
      });
    }

    console.log(`❌ Inquiry rejected. Vendor will NOT see this inquiry. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Inquiry rejected successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('❌ Error rejecting inquiry:', error);
    next(error);
  }
};

/**
 * Get Pending Inquiries for Admin Review (NEW)
 */
exports.getPendingInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    console.log('\n📋 Fetching pending inquiries for admin review...');

    const skip = (page - 1) * limit;

    const inquiries = await VendorInquiry.find({ approvalStatus: 'pending' })
      .populate('vendorId', 'name businessName serviceType contact.email contact.phone city verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await VendorInquiry.countDocuments({ approvalStatus: 'pending' });

    console.log(`✅ Found ${total} pending inquiries awaiting approval`);

    res.json({
      success: true,
      data: {
        inquiries,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      },
      message: `${total} inquiries pending approval`
    });

  } catch (error) {
    console.error('❌ Error fetching pending inquiries:', error);
    next(error);
  }
};

/**
 * Get Inquiry Approval Statistics (NEW)
 */
exports.getInquiryApprovalStats = async (req, res, next) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      VendorInquiry.countDocuments({ approvalStatus: 'pending' }),
      VendorInquiry.countDocuments({ approvalStatus: 'approved' }),
      VendorInquiry.countDocuments({ approvalStatus: 'rejected' }),
      VendorInquiry.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        pending,
        approved,
        rejected,
        total,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
        rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching approval stats:', error);
    next(error);
  }
};

/**
 * Toggle Vendor Active Status (Hide/Show)
 */
exports.toggleVendorStatus = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { isActive } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isActive },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    console.log(`✅ Vendor ${vendor.businessName} ${isActive ? 'activated' : 'deactivated'}`);

    res.json({
      success: true,
      message: `Vendor ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: vendor
    });

  } catch (error) {
    console.error('Error toggling vendor status:', error);
    next(error);
  }
};

/**
 * Delete Vendor (Permanent)
 */
exports.deleteVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndDelete(vendorId);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    // Also delete associated inquiries
    await VendorInquiry.deleteMany({ vendorId });

    console.log(`🗑️ Vendor ${vendor.businessName} permanently deleted`);

    res.json({
      success: true,
      message: 'Vendor deleted permanently'
    });

  } catch (error) {
    console.error('Error deleting vendor:', error);
    next(error);
  }
};

/**
 * Get Recent Activity (For Dashboard)
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const [recentVendors, recentInquiries, recentUsers] = await Promise.all([
      Vendor.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('name businessName serviceType city verified createdAt')
        .lean()
        .catch(err => {
          console.warn('Error fetching recent vendors:', err.message);
          return [];
        }),
      
      VendorInquiry.find()
        .populate({ path: 'vendorId', select: 'name businessName', strictPopulate: false })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean()
        .catch(err => {
          console.warn('Error fetching recent inquiries:', err.message);
          return [];
        }),
      
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('name email createdAt')
        .lean()
        .catch(err => {
          console.warn('Error fetching recent users:', err.message);
          return [];
        })
    ]);

    res.json({
      success: true,
      data: {
        recentVendors,
        recentInquiries,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return empty data instead of failing
    res.json({
      success: true,
      data: {
        recentVendors: [],
        recentInquiries: [],
        recentUsers: []
      }
    });
  }
};

/**
 * Forward Inquiry to Different Vendor
 */
exports.forwardInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { newVendorId, reason } = req.body;

    if (!newVendorId) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'VENDOR_REQUIRED',
          message: 'Please select a vendor to forward to' 
        }
      });
    }

    // Get the inquiry
    const inquiry = await VendorInquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inquiry not found' }
      });
    }

    // Get new vendor details
    const newVendor = await Vendor.findById(newVendorId);
    if (!newVendor) {
      return res.status(404).json({
        success: false,
        error: { message: 'Vendor not found' }
      });
    }

    // Store old vendor ID for reference
    const oldVendorId = inquiry.vendorId;

    // Update inquiry with new vendor
    inquiry.vendorId = newVendorId;
    
    // Update vendor details snapshot
    inquiry.vendorDetails = {
      name: newVendor.name,
      businessName: newVendor.businessName,
      serviceType: newVendor.serviceType,
      contact: {
        email: newVendor.contact?.email,
        phone: newVendor.contact?.phone,
        whatsapp: newVendor.contact?.whatsapp
      },
      address: {
        street: newVendor.address?.street,
        area: newVendor.address?.area,
        city: newVendor.address?.city || newVendor.city,
        state: newVendor.address?.state,
        pincode: newVendor.address?.pincode
      },
      city: newVendor.city,
      rating: newVendor.rating,
      verified: newVendor.verified
    };

    // Add forwarding note
    inquiry.adminNotes = (inquiry.adminNotes || '') + 
      `\n[${new Date().toLocaleString()}] Forwarded from vendor ${oldVendorId} to ${newVendorId}. Reason: ${reason || 'Not specified'}`;

    await inquiry.save();

    console.log(`📬 Inquiry ${inquiryId} forwarded to vendor ${newVendor.businessName}`);

    res.json({
      success: true,
      message: `Inquiry forwarded to ${newVendor.businessName} successfully`,
      data: inquiry
    });

  } catch (error) {
    console.error('Error forwarding inquiry:', error);
    next(error);
  }
};

/**
 * Mark Inquiry as Active/Inactive
 */
exports.toggleInquiryActive = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { isActive } = req.body;

    // Update vendor inquiry
    let inquiry = await VendorInquiry.findByIdAndUpdate(
      inquiryId,
      { 
        isActive: isActive !== false,
        status: isActive !== false ? 'pending' : 'cancelled'
      },
      { new: true }
    ).populate('vendorId', 'name businessName');

    if (!inquiry) {
      // Try contact inquiry
      inquiry = await ContactInquiry.findByIdAndUpdate(
        inquiryId,
        { 
          isActive: isActive !== false,
          status: isActive !== false ? 'pending' : 'cancelled'
        },
        { new: true }
      );
    }

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Inquiry not found' }
      });
    }

    console.log(`✅ Inquiry ${inquiryId} marked as ${isActive !== false ? 'active' : 'inactive'}`);

    res.json({
      success: true,
      message: `Inquiry marked as ${isActive !== false ? 'active' : 'inactive'}`,
      data: inquiry
    });

  } catch (error) {
    console.error('Error toggling inquiry status:', error);
    next(error);
  }
};

/**
 * ==========================================
 * REVIEW MANAGEMENT
 * ==========================================
 */

/**
 * Get all reviews with filters
 * @route GET /api/admin/reviews
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const { status, vendorId, page = 1, limit = 20 } = req.query;

    console.log('\n📝 Fetching reviews for admin...');

    const query = {};
    
    if (status) {
      query.status = status;
    }

    if (vendorId) {
      const vendor = await Vendor.findOne({ vendorId });
      if (vendor) {
        query.vendorId = vendor._id;
      }
    }

    const reviews = await VendorReview.find(query)
      .populate('vendorId', 'businessName vendorId serviceType city')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalReviews = await VendorReview.countDocuments(query);

    console.log(`✅ Found ${reviews.length} reviews`);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalReviews,
          pages: Math.ceil(totalReviews / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    next(error);
  }
};

/**
 * Get pending reviews
 * @route GET /api/admin/reviews/pending
 */
exports.getPendingReviews = async (req, res, next) => {
  try {
    console.log('\n📝 Fetching pending reviews...');

    const reviews = await VendorReview.find({ status: 'pending' })
      .populate('vendorId', 'businessName vendorId serviceType city profileImage')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${reviews.length} pending reviews`);

    res.json({
      success: true,
      data: reviews
    });

  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    next(error);
  }
};

/**
 * Get review statistics
 * @route GET /api/admin/reviews/stats
 */
exports.getReviewStats = async (req, res, next) => {
  try {
    console.log('\n📊 Calculating review statistics...');

    const [totalReviews, pendingReviews, approvedReviews, rejectedReviews] = await Promise.all([
      VendorReview.countDocuments(),
      VendorReview.countDocuments({ status: 'pending' }),
      VendorReview.countDocuments({ status: 'approved' }),
      VendorReview.countDocuments({ status: 'rejected' })
    ]);

    const stats = {
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews
    };

    console.log('✅ Review stats calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error calculating review stats:', error);
    next(error);
  }
};

/**
 * Approve a review
 * @route POST /api/admin/reviews/:reviewId/approve
 */
exports.approveReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    console.log(`\n✅ Approving review ${reviewId}...`);

    const review = await VendorReview.findByIdAndUpdate(
      reviewId,
      { status: 'approved' },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId')
      .populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    console.log(`✅ Review ${reviewId} approved for vendor ${review.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });

  } catch (error) {
    console.error('Error approving review:', error);
    next(error);
  }
};

/**
 * Reject a review
 * @route POST /api/admin/reviews/:reviewId/reject
 */
exports.rejectReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    console.log(`\n❌ Rejecting review ${reviewId}...`);

    const review = await VendorReview.findByIdAndUpdate(
      reviewId,
      { 
        status: 'rejected',
        rejectionReason: reason || 'Does not meet community guidelines'
      },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId')
      .populate('userId', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    console.log(`❌ Review ${reviewId} rejected for vendor ${review.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Review rejected successfully',
      data: review
    });

  } catch (error) {
    console.error('Error rejecting review:', error);
    next(error);
  }
};

/**
 * Delete a review
 * @route DELETE /api/admin/reviews/:reviewId
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    console.log(`\n🗑️ Deleting review ${reviewId}...`);

    const review = await VendorReview.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    console.log(`✅ Review ${reviewId} deleted`);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    next(error);
  }
};

// ===================================
// MEDIA MANAGEMENT FUNCTIONS
// ===================================

/**
 * Get all media with filters
 * @route GET /api/admin/media
 */
exports.getAllMedia = async (req, res, next) => {
  try {
    const { approvalStatus, vendorId, type, page = 1, limit = 20 } = req.query;

    console.log('\n📸 Fetching media for admin...');

    const query = {};
    
    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    if (vendorId) {
      const vendor = await Vendor.findOne({ vendorId });
      if (vendor) {
        query.vendorId = vendor._id;
      }
    }

    if (type) {
      query.type = type;
    }

    const media = await VendorMedia.find(query)
      .populate('vendorId', 'businessName vendorId serviceType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalMedia = await VendorMedia.countDocuments(query);

    console.log(`✅ Found ${media.length} media items`);

    res.json({
      success: true,
      data: {
        media,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMedia,
          pages: Math.ceil(totalMedia / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    next(error);
  }
};

/**
 * Get pending media
 * @route GET /api/admin/media/pending
 */
exports.getPendingMedia = async (req, res, next) => {
  try {
    console.log('\n📸 Fetching pending media...');

    const media = await VendorMedia.find({ approvalStatus: 'pending' })
      .populate('vendorId', 'businessName vendorId serviceType')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${media.length} pending media items`);

    res.json({
      success: true,
      data: media
    });

  } catch (error) {
    console.error('Error fetching pending media:', error);
    next(error);
  }
};

/**
 * Get media statistics
 * @route GET /api/admin/media/stats
 */
exports.getMediaStats = async (req, res, next) => {
  try {
    console.log('\n📊 Calculating media statistics...');

    const [totalMedia, pendingMedia, approvedMedia, rejectedMedia] = await Promise.all([
      VendorMedia.countDocuments(),
      VendorMedia.countDocuments({ approvalStatus: 'pending' }),
      VendorMedia.countDocuments({ approvalStatus: 'approved' }),
      VendorMedia.countDocuments({ approvalStatus: 'rejected' })
    ]);

    const stats = {
      totalMedia,
      pendingMedia,
      approvedMedia,
      rejectedMedia
    };

    console.log('✅ Media stats calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error calculating media stats:', error);
    next(error);
  }
};

/**
 * Approve media
 * @route POST /api/admin/media/:mediaId/approve
 */
exports.approveMedia = async (req, res, next) => {
  try {
    const { mediaId } = req.params;

    console.log(`\n✅ Approving media ${mediaId}...`);

    const media = await VendorMedia.findByIdAndUpdate(
      mediaId,
      { approvalStatus: 'approved' },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId');

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: 'Media not found' }
      });
    }

    console.log(`✅ Media ${mediaId} approved for vendor ${media.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Media approved successfully',
      data: media
    });

  } catch (error) {
    console.error('Error approving media:', error);
    next(error);
  }
};

/**
 * Reject media
 * @route POST /api/admin/media/:mediaId/reject
 */
exports.rejectMedia = async (req, res, next) => {
  try {
    const { mediaId } = req.params;
    const { reason } = req.body;

    console.log(`\n❌ Rejecting media ${mediaId}...`);

    const media = await VendorMedia.findByIdAndUpdate(
      mediaId,
      { 
        approvalStatus: 'rejected',
        rejectionReason: reason || 'Does not meet content guidelines'
      },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId');

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: 'Media not found' }
      });
    }

    console.log(`❌ Media ${mediaId} rejected for vendor ${media.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Media rejected successfully',
      data: media
    });

  } catch (error) {
    console.error('Error rejecting media:', error);
    next(error);
  }
};

/**
 * Delete media
 * @route DELETE /api/admin/media/:mediaId
 */
exports.deleteMedia = async (req, res, next) => {
  try {
    const { mediaId } = req.params;

    console.log(`\n🗑️ Deleting media ${mediaId}...`);

    const media = await VendorMedia.findByIdAndDelete(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        error: { message: 'Media not found' }
      });
    }

    console.log(`✅ Media ${mediaId} deleted`);

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    next(error);
  }
};

// ===================================
// BLOG MANAGEMENT FUNCTIONS
// ===================================

/**
 * Get all blogs with filters
 * @route GET /api/admin/blogs
 */
exports.getAllBlogs = async (req, res, next) => {
  try {
    const { approvalStatus, vendorId, status, page = 1, limit = 20 } = req.query;

    console.log('\n📝 Fetching blogs for admin...');

    const query = {};
    
    if (approvalStatus) {
      query.approvalStatus = approvalStatus;
    }

    if (vendorId) {
      const vendor = await Vendor.findOne({ vendorId });
      if (vendor) {
        query.vendorId = vendor._id;
      }
    }

    if (status) {
      query.status = status;
    }

    const blogs = await VendorBlog.find(query)
      .populate('vendorId', 'businessName vendorId serviceType')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalBlogs = await VendorBlog.countDocuments(query);

    console.log(`✅ Found ${blogs.length} blogs`);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalBlogs,
          pages: Math.ceil(totalBlogs / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    next(error);
  }
};

/**
 * Get pending blogs
 * @route GET /api/admin/blogs/pending
 */
exports.getPendingBlogs = async (req, res, next) => {
  try {
    console.log('\n📝 Fetching pending blogs...');

    const blogs = await VendorBlog.find({ approvalStatus: 'pending' })
      .populate('vendorId', 'businessName vendorId serviceType')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${blogs.length} pending blogs`);

    res.json({
      success: true,
      data: blogs
    });

  } catch (error) {
    console.error('Error fetching pending blogs:', error);
    next(error);
  }
};

/**
 * Get blog statistics
 * @route GET /api/admin/blogs/stats
 */
exports.getBlogStats = async (req, res, next) => {
  try {
    console.log('\n📊 Calculating blog statistics...');

    const [totalBlogs, pendingBlogs, approvedBlogs, rejectedBlogs] = await Promise.all([
      VendorBlog.countDocuments(),
      VendorBlog.countDocuments({ approvalStatus: 'pending' }),
      VendorBlog.countDocuments({ approvalStatus: 'approved' }),
      VendorBlog.countDocuments({ approvalStatus: 'rejected' })
    ]);

    const stats = {
      totalBlogs,
      pendingBlogs,
      approvedBlogs,
      rejectedBlogs
    };

    console.log('✅ Blog stats calculated:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error calculating blog stats:', error);
    next(error);
  }
};

/**
 * Approve blog
 * @route POST /api/admin/blogs/:blogId/approve
 */
exports.approveBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    console.log(`\n✅ Approving blog ${blogId}...`);

    const blog = await VendorBlog.findByIdAndUpdate(
      blogId,
      { approvalStatus: 'approved' },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: { message: 'Blog not found' }
      });
    }

    console.log(`✅ Blog ${blogId} approved for vendor ${blog.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Blog approved successfully',
      data: blog
    });

  } catch (error) {
    console.error('Error approving blog:', error);
    next(error);
  }
};

/**
 * Reject blog
 * @route POST /api/admin/blogs/:blogId/reject
 */
exports.rejectBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;
    const { reason } = req.body;

    console.log(`\n❌ Rejecting blog ${blogId}...`);

    const blog = await VendorBlog.findByIdAndUpdate(
      blogId,
      { 
        approvalStatus: 'rejected',
        rejectionReason: reason || 'Does not meet content guidelines'
      },
      { new: true }
    )
      .populate('vendorId', 'businessName vendorId');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: { message: 'Blog not found' }
      });
    }

    console.log(`❌ Blog ${blogId} rejected for vendor ${blog.vendorId?.businessName}`);

    res.json({
      success: true,
      message: 'Blog rejected successfully',
      data: blog
    });

  } catch (error) {
    console.error('Error rejecting blog:', error);
    next(error);
  }
};

/**
 * Delete blog
 * @route DELETE /api/admin/blogs/:blogId
 */
exports.deleteBlog = async (req, res, next) => {
  try {
    const { blogId } = req.params;

    console.log(`\n🗑️ Deleting blog ${blogId}...`);

    const blog = await VendorBlog.findByIdAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: { message: 'Blog not found' }
      });
    }

    console.log(`✅ Blog ${blogId} deleted`);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    next(error);
  }
};

