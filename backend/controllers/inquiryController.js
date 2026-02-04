const Inquiry = require('../models/Inquiry'); // Legacy - kept for backward compatibility
const VendorInquiry = require('../models/VendorInquiry');
const ContactInquiry = require('../models/ContactInquiry');
const Vendor = require('../models/VendorNew');

/**
 * Create a new inquiry (Vendor-specific or General)
 */
exports.createInquiry = async (req, res, next) => {
  try {
    const {
      userName,
      userEmail,
      userContact,
      eventType,
      eventDate,
      budget,
      location,
      city,
      vendorId,
      message,
      inquiryType = 'vendor_inquiry',
      source = 'website'
    } = req.body;

    // ========== DETAILED LOGGING FOR INQUIRY TYPE ==========
    console.log('\n' + '='.repeat(60));
    console.log('📥 NEW INQUIRY RECEIVED');
    console.log('='.repeat(60));
    console.log('📋 Inquiry Type:', inquiryType);
    console.log('👤 Customer:', userName);
    console.log('📞 Contact:', userContact);
    console.log('🎉 Event Type:', eventType);
    console.log('💰 Budget:', budget);
    
    if (inquiryType === 'vendor_inquiry' && vendorId) {
      console.log('\n🏪 VENDOR-SPECIFIC INQUIRY');
      console.log('🆔 Vendor ID:', vendorId);
    } else if (inquiryType === 'contact_inquiry') {
      console.log('\n📧 CONTACT FORM INQUIRY (General)');
      console.log('✉️  This is a general contact inquiry, no vendor specified');
    } else {
      console.log('\n📝 GENERAL INQUIRY');
    }
    
    console.log('📨 Message:', message ? message.substring(0, 100) : 'No message');
    console.log('='.repeat(60) + '\n');

    // Validation
    // For vendor inquiries we require budget; for general/contact inquiries budget is optional
    const budgetRequired = inquiryType === 'vendor_inquiry' && vendorId;
    const budgetValue = budget ? parseInt(budget) : 0;
    
    if (!userName || !userContact || !eventType || (budgetRequired && budgetValue <= 0)) {
      console.log('❌ Validation failed:', { userName, userContact, eventType, budget: budgetValue, budgetRequired });
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: budgetRequired
            ? 'Name, contact, event type, and budget are required'
            : 'Name, contact, and event type are required'
        }
      });
    }

    // Validate vendor exists if vendor inquiry
    let vendorSnapshot = null;
    if (inquiryType === 'vendor_inquiry' && vendorId) {
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) {
        console.log('❌ ERROR: Vendor not found for ID:', vendorId);
        return res.status(404).json({
          success: false,
          error: {
            code: 'VENDOR_NOT_FOUND',
            message: 'Vendor not found'
          }
        });
      }
      
      // Create vendor details snapshot
      vendorSnapshot = {
        name: vendor.name,
        businessName: vendor.businessName,
        serviceType: vendor.serviceType,
        contact: {
          email: vendor.contact?.email,
          phone: vendor.contact?.phone,
          whatsapp: vendor.contact?.whatsapp
        },
        address: {
          street: vendor.address?.street,
          area: vendor.address?.area,
          city: vendor.address?.city || vendor.city,
          state: vendor.address?.state,
          pincode: vendor.address?.pincode
        },
        city: vendor.city,
        rating: vendor.rating,
        reviewCount: vendor.reviews?.length || 0,
        verified: vendor.verified,
        responseTime: vendor.responseTime,
        profileImage: vendor.profileImage,
        coverImage: vendor.coverImage
      };
      
      // Log vendor details
      console.log('\n✅ VENDOR FOUND:');
      console.log('   Name:', vendor.name || vendor.businessName);
      console.log('   Business:', vendor.businessName);
      console.log('   Service Type:', vendor.serviceType);
      console.log('   Email:', vendor.contact?.email);
      console.log('   Phone:', vendor.contact?.phone);
      console.log('   City:', vendor.city);
      console.log('   📸 Vendor snapshot created for inquiry');
    }

    // Create inquiry in appropriate collection based on type
    let inquiry;
    
    if (inquiryType === 'vendor_inquiry' && vendorId) {
      // Save to VendorInquiry collection (vendorinquiries)
      console.log('💾 Saving to VENDOR INQUIRY collection...');
      inquiry = await VendorInquiry.create({
        userName,
        userEmail,
        userContact,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        budget: budgetValue,
        location: location || { type: 'Point', coordinates: [0, 0] },
        city,
        vendorId,
        vendorDetails: vendorSnapshot, // Embedded vendor snapshot
        message,
        source,
        status: 'pending'
      });
      
      // Populate vendor reference for response
      await inquiry.populate('vendorId', 'name businessName contact.email contact.phone serviceType city');
      
    } else if (inquiryType === 'contact_inquiry') {
      // Save to ContactInquiry collection (contactinquiries)
      console.log('💾 Saving to CONTACT INQUIRY collection...');
      inquiry = await ContactInquiry.create({
        userName,
        userEmail,
        userContact,
        eventType,
        message,
        budget: budgetValue,
        source,
        status: 'pending',
        category: 'general'
      });
      
    } else {
      // Fallback to general Inquiry collection
      console.log('💾 Saving to GENERAL INQUIRY collection...');
      inquiry = await Inquiry.create({
        userName,
        userEmail,
        userContact,
        eventType,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        budget: budgetValue,
        location: location || { type: 'Point', coordinates: [0, 0] },
        city,
        vendorId: vendorId || undefined,
        message,
        inquiryType,
        source,
        status: 'pending'
      });
    }

    // Log success with inquiry details and collection info
    console.log('\n✅ INQUIRY SAVED SUCCESSFULLY');
    console.log('🆔 Inquiry ID:', inquiry.inquiryId);
    
    if (inquiryType === 'vendor_inquiry' && vendorId) {
      console.log('📂 Collection: vendorinquiries');
      console.log('\n📦 VENDOR DETAILS STORED IN INQUIRY:');
      console.log('   🏪 Vendor Name:', inquiry.vendorDetails?.name || inquiry.vendorDetails?.businessName);
      console.log('   🏢 Business:', inquiry.vendorDetails?.businessName);
      console.log('   🎯 Service:', inquiry.vendorDetails?.serviceType);
      console.log('   📧 Email:', inquiry.vendorDetails?.contact?.email);
      console.log('   📞 Phone:', inquiry.vendorDetails?.contact?.phone);
      console.log('   📍 City:', inquiry.vendorDetails?.city);
      console.log('   ⭐ Rating:', inquiry.vendorDetails?.rating);
      console.log('   ✅ Verified:', inquiry.vendorDetails?.verified ? 'Yes' : 'No');
      console.log('\n   💡 Vendor details are now embedded in the inquiry document!');
    } else if (inquiryType === 'contact_inquiry') {
      console.log('📂 Collection: contactinquiries');
      console.log('📝 Category: General Contact');
    } else {
      console.log('📂 Collection: inquiries (general)');
    }
    
    console.log('📅 Created:', inquiry.createdAt);
    console.log('='.repeat(60) + '\n');

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    });

  } catch (error) {
    console.error('Error creating inquiry:', error);
    next(error);
  }
};

/**
 * Get all inquiries (Admin/Dashboard)
 * Fetches from both VendorInquiry and ContactInquiry collections
 */
exports.getAllInquiries = async (req, res, next) => {
  try {
    const { 
      status, 
      inquiryType, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    let vendorInquiries = [];
    let contactInquiries = [];
    let vendorTotal = 0;
    let contactTotal = 0;

    // Fetch based on inquiryType filter
    if (!inquiryType || inquiryType === 'vendor_inquiry') {
      vendorInquiries = await VendorInquiry.find(query)
        .populate('vendorId', 'name businessName serviceType contact.email contact.phone city')
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit));
      vendorTotal = await VendorInquiry.countDocuments(query);
    }

    if (!inquiryType || inquiryType === 'contact_inquiry') {
      contactInquiries = await ContactInquiry.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(parseInt(limit));
      contactTotal = await ContactInquiry.countDocuments(query);
    }

    // Add type identifier to each inquiry
    const vendorInqsWithType = vendorInquiries.map(inq => ({
      ...inq.toObject(),
      inquiryType: 'vendor_inquiry',
      collection: 'vendorinquiries'
    }));

    const contactInqsWithType = contactInquiries.map(inq => ({
      ...inq.toObject(),
      inquiryType: 'contact_inquiry',
      collection: 'contactinquiries'
    }));

    // Combine and sort
    const allInquiries = [...vendorInqsWithType, ...contactInqsWithType]
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return sortOrder === -1 ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
      })
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
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    next(error);
  }
};

/**
 * Get inquiries for a specific vendor
 * Uses VendorInquiry collection only
 */
exports.getVendorInquiries = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { vendorId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const inquiries = await VendorInquiry.find(query)
      .populate('vendorId', 'name businessName serviceType contact.email contact.phone city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VendorInquiry.countDocuments(query);

    res.json({
      success: true,
      data: {
        inquiries,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching vendor inquiries:', error);
    next(error);
  }
};

/**
 * Get single inquiry by ID
 */
exports.getInquiryById = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findById(inquiryId)
      .populate('vendorId', 'name businessName serviceType contact city');

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Inquiry not found'
        }
      });
    }

    res.json({
      success: true,
      data: inquiry
    });

  } catch (error) {
    console.error('Error fetching inquiry:', error);
    next(error);
  }
};

/**
 * Update inquiry status
 */
exports.updateInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { status, vendorResponse } = req.body;

    const validStatuses = ['pending', 'contacted', 'responded', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        }
      });
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Inquiry not found'
        }
      });
    }

    inquiry.status = status;
    if (status === 'responded' && vendorResponse) {
      inquiry.vendorResponse = vendorResponse;
      inquiry.respondedAt = Date.now();
    }

    await inquiry.save();

    res.json({
      success: true,
      message: 'Inquiry status updated',
      data: inquiry
    });

  } catch (error) {
    console.error('Error updating inquiry:', error);
    next(error);
  }
};

/**
 * Delete inquiry
 */
exports.deleteInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findByIdAndDelete(inquiryId);
    
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INQUIRY_NOT_FOUND',
          message: 'Inquiry not found'
        }
      });
    }

    res.json({
      success: true,
      message: 'Inquiry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting inquiry:', error);
    next(error);
  }
};

/**
 * Get inquiry statistics (Admin Dashboard)
 */
exports.getInquiryStats = async (req, res, next) => {
  try {
    const total = await Inquiry.countDocuments();
    const pending = await Inquiry.countDocuments({ status: 'pending' });
    const responded = await Inquiry.countDocuments({ status: 'responded' });
    const closed = await Inquiry.countDocuments({ status: 'closed' });

    // Recent inquiries (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = await Inquiry.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // By inquiry type
    const byType = await Inquiry.aggregate([
      {
        $group: {
          _id: '$inquiryType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        responded,
        closed,
        recentCount,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching inquiry stats:', error);
    next(error);
  }
};
