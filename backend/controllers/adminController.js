const User = require('../models/User');
const Vendor = require('../models/VendorNew');
const VendorInquiry = require('../models/VendorInquiry');
const ContactInquiry = require('../models/ContactInquiry');
const Inquiry = require('../models/Inquiry');

/**
 * Get Admin Dashboard Statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    console.log('\n📊 Fetching admin dashboard statistics...');

    // Get counts
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
      User.countDocuments({ role: 'user' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ verified: true }),
      VendorInquiry.countDocuments(),
      ContactInquiry.countDocuments(),
      VendorInquiry.countDocuments({ status: 'pending' }),
      ContactInquiry.countDocuments({ status: 'pending' }),
      VendorInquiry.countDocuments({ approvalStatus: 'pending' }),
      VendorInquiry.countDocuments({ approvalStatus: 'approved' }),
      VendorInquiry.countDocuments({ approvalStatus: 'rejected' })
    ]);

    // Get recent inquiries
    const recentVendorInquiries = await VendorInquiry.find()
      .populate('vendorId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentContactInquiries = await ContactInquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get inquiry trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inquiryTrends = await VendorInquiry.aggregate([
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
    ]);

    // Get vendor distribution by service type
    const vendorsByService = await Vendor.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('✅ Dashboard stats fetched successfully');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          verifiedVendors,
          totalInquiries: totalVendorInquiries + totalContactInquiries,
          vendorInquiries: totalVendorInquiries,
          contactInquiries: totalContactInquiries,
          pendingInquiries: pendingVendorInquiries + pendingContactInquiries,
          pendingVendorInquiries,
          pendingContactInquiries,
          // Approval statistics
          pendingApproval: pendingApprovalInquiries,
          approvedInquiries,
          rejectedInquiries
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
    next(error);
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
      vendorInquiries = await VendorInquiry.find(query)
        .populate('vendorId', 'name businessName serviceType')
        .populate('approvedBy', 'name email') // Include who approved/rejected
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();
      vendorTotal = await VendorInquiry.countDocuments(query);
    }

    if (!type || type === 'contact') {
      contactInquiries = await ContactInquiry.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean();
      contactTotal = await ContactInquiry.countDocuments(query);
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
    next(error);
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
        .lean(),
      
      VendorInquiry.find()
        .populate('vendorId', 'name businessName')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .lean(),
      
      User.find({ role: 'user' })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('name email createdAt')
        .lean()
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
    next(error);
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
