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
      pendingContactInquiries
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ verified: true }),
      VendorInquiry.countDocuments(),
      ContactInquiry.countDocuments(),
      VendorInquiry.countDocuments({ status: 'pending' }),
      ContactInquiry.countDocuments({ status: 'pending' })
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
          pendingContactInquiries
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
    const { page = 1, limit = 20, type, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    let vendorInquiries = [];
    let contactInquiries = [];
    let vendorTotal = 0;
    let contactTotal = 0;

    if (!type || type === 'vendor') {
      vendorInquiries = await VendorInquiry.find(query)
        .populate('vendorId', 'name businessName serviceType')
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
