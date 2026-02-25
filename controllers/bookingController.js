const Booking = require('../models/Booking');
const ClothingItem = require('../models/ClothingItem');
const User = require('../models/User');

const GST_RATE = parseFloat(process.env.GST_RATE) || 0.18;
const CGST_RATE = GST_RATE / 2;
const SGST_RATE = GST_RATE / 2;

// Generate invoice number
const generateInvoiceNumber = (bookingId) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const id = String(bookingId).slice(-5).padStart(5, '0');
  return `SL-${year}${month}-${id}`;
};

// Get service price
const getServicePrice = (item, serviceType) => {
  switch (serviceType) {
    case 'wash': return item.washPrice || 0;
    case 'iron': return item.ironPrice || 0;
    case 'dry_clean': return item.dryCleanPrice || 0;
    case 'wash_iron': return (item.washPrice || 0) + (item.ironPrice || 0);
    default: return 0;
  }
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { items, pickupDate, pickupTime, address } = req.body;
    const userId = req.user.id;

    console.log('📦 CREATE BOOKING REQUEST:');
    console.log('User ID:', userId);
    console.log('Items received:', JSON.stringify(items, null, 2));
    console.log('Pickup Date:', pickupDate);

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'No items provided'
      });
    }

    if (!pickupDate) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date is required'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('👤 User found:', user.name, user.userType);

    // Calculate totals
    let totalAmount = 0;
    const bookingItems = [];

    // Get all clothing items once
    const allClothingItems = await ClothingItem.find({ isActive: true });
    console.log(`📋 Found ${allClothingItems.length} active clothing items`);
    
    for (const orderItem of items) {
      console.log(`\n🔍 Processing item:`, orderItem);
      
      // Find item by numericId
      const item = allClothingItems.find(i => i.numericId === parseInt(orderItem.id));
      
      if (!item) {
        console.log(`❌ Item not found for ID: ${orderItem.id}`);
        continue;
      }
      
      console.log(`✅ Found item:`, item.name);

      const basePrice = getServicePrice(item, orderItem.serviceType);
      const quantity = parseInt(orderItem.quantity) || 1;
      const lineTotal = basePrice * quantity;

      console.log(`💰 ${item.name} - ${orderItem.serviceType}: ₹${basePrice} × ${quantity} = ₹${lineTotal}`);

      totalAmount += lineTotal;
      bookingItems.push({
        itemId: item._id,
        itemName: item.name,
        itemIcon: item.icon,
        serviceType: orderItem.serviceType,
        quantity,
        unitPrice: basePrice,
        totalPrice: lineTotal
      });
    }

    console.log(`\n💵 Total Amount: ₹${totalAmount}`);
    console.log(`📦 Booking Items: ${bookingItems.length} items`);

    if (bookingItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid items in cart'
      });
    }

    // Apply student discount
    const isVerifiedStudent = user.userType === 'student' && user.studentVerified;
    let discountAmount = 0;

    if (isVerifiedStudent && bookingItems.length > 0) {
      const discountPct = 20; // default student discount
      discountAmount = totalAmount * (discountPct / 100);
    }

    // GST calculation
    const finalAmount = totalAmount - discountAmount;
    const cgstAmount = finalAmount * CGST_RATE;
    const sgstAmount = finalAmount * SGST_RATE;
    const gstAmount = cgstAmount + sgstAmount;
    const grandTotal = finalAmount + gstAmount;

    // Create booking
    const booking = await Booking.create({
      user: userId,
      pickupDate,
      pickupTime: pickupTime || '10:00',
      pickupAddress: address || '',
      items: bookingItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
      gstRate: GST_RATE,
      cgstAmount: parseFloat(cgstAmount.toFixed(2)),
      sgstAmount: parseFloat(sgstAmount.toFixed(2)),
      gstAmount: parseFloat(gstAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      userTypeAtBooking: user.userType,
      status: 'pending'
    });

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber(booking._id);
    booking.invoiceNumber = invoiceNumber;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! 🎉',
      data: {
        booking: {
          id: booking._id,
          user_id: booking.user,
          pickup_date: booking.pickupDate,
          pickup_time: booking.pickupTime,
          pickup_address: booking.pickupAddress,
          total_amount: booking.totalAmount,
          discount_amount: booking.discountAmount,
          final_amount: booking.finalAmount,
          gst_rate: booking.gstRate,
          cgst_amount: booking.cgstAmount,
          sgst_amount: booking.sgstAmount,
          gst_amount: booking.gstAmount,
          grand_total: booking.grandTotal,
          invoice_number: booking.invoiceNumber,
          status: booking.status,
          items: bookingItems,
          user_type_at_booking: booking.userTypeAtBooking
        }
      }
    });

  } catch (error) {
    console.error('CreateBooking error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Booking failed. Please try again.'
    });
  }
};

// GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedBookings = bookings.map(b => ({
      id: b._id,
      user_id: b.user,
      pickup_date: b.pickupDate,
      pickup_time: b.pickupTime,
      pickup_address: b.pickupAddress,
      total_amount: b.totalAmount,
      discount_amount: b.discountAmount,
      final_amount: b.finalAmount,
      gst_rate: b.gstRate,
      cgst_amount: b.cgstAmount,
      sgst_amount: b.sgstAmount,
      gst_amount: b.gstAmount,
      grand_total: b.grandTotal,
      invoice_number: b.invoiceNumber,
      status: b.status,
      user_type_at_booking: b.userTypeAtBooking,
      created_at: b.createdAt,
      items: b.items.map(i => ({
        id: i._id,
        name: i.itemName,
        icon: i.itemIcon,
        service_type: i.serviceType,
        quantity: i.quantity,
        price: i.unitPrice,
        total: i.totalPrice
      }))
    }));

    res.json({
      success: true,
      data: { bookings: formattedBookings }
    });

  } catch (error) {
    console.error('GetMyBookings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
};

// GET ALL BOOKINGS (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    let bookings = await Booking.find(query)
      .populate('user', 'name email phone userType')
      .sort({ createdAt: -1 })
      .lean();

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      bookings = bookings.filter(b =>
        b.user?.name?.toLowerCase().includes(searchLower) ||
        b.user?.email?.toLowerCase().includes(searchLower)
      );
    }

    const formattedBookings = bookings.map(b => ({
      id: b._id,
      user_id: b.user?._id,
      user_name: b.user?.name,
      user_email: b.user?.email,
      user_phone: b.user?.phone,
      user_type: b.user?.userType,
      pickup_date: b.pickupDate,
      pickup_time: b.pickupTime,
      pickup_address: b.pickupAddress,
      total_amount: b.totalAmount,
      discount_amount: b.discountAmount,
      final_amount: b.finalAmount,
      gst_amount: b.gstAmount,
      grand_total: b.grandTotal,
      invoice_number: b.invoiceNumber,
      status: b.status,
      user_type_at_booking: b.userTypeAtBooking,
      created_at: b.createdAt,
      items: b.items.map(i => ({
        id: i._id,
        name: i.itemName,
        icon: i.itemIcon,
        service_type: i.serviceType,
        quantity: i.quantity,
        price: i.unitPrice,
        total: i.totalPrice
      }))
    }));

    res.json({
      success: true,
      data: { bookings: formattedBookings }
    });

  } catch (error) {
    console.error('GetAllBookings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings'
    });
  }
};

// GET STATS (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const processingBookings = await Booking.countDocuments({ status: 'processing' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const revenueData = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalRevenueWithGst: { $sum: '$grandTotal' },
          totalGstCollected: { $sum: '$gstAmount' },
          totalDiscountsGiven: { $sum: '$discountAmount' }
        }
      }
    ]);

    const studentBookings = await Booking.countDocuments({ userTypeAtBooking: 'student' });

    const stats = revenueData.length > 0 ? revenueData[0] : {
      totalRevenue: 0,
      totalRevenueWithGst: 0,
      totalGstCollected: 0,
      totalDiscountsGiven: 0
    };

    res.json({
      success: true,
      data: {
        statistics: {
          total_bookings: totalBookings,
          pending_bookings: pendingBookings,
          processing_bookings: processingBookings,
          completed_bookings: completedBookings,
          total_revenue: stats.totalRevenue || 0,
          total_revenue_with_gst: stats.totalRevenueWithGst || 0,
          total_gst_collected: stats.totalGstCollected || 0,
          total_discounts_given: stats.totalDiscountsGiven || 0,
          student_bookings: studentBookings
        }
      }
    });

  } catch (error) {
    console.error('GetStats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
};

// UPDATE STATUS (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: { id: booking._id, status: booking.status }
    });

  } catch (error) {
    console.error('UpdateStatus error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// DELETE BOOKING (Admin)
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    console.error('DeleteBooking error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking'
    });
  }
};
