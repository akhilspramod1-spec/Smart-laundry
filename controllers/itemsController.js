const ClothingItem = require('../models/ClothingItem');

exports.getAllItems = async (req, res) => {
  try {
    const items = await ClothingItem.find({ isActive: true }).sort({ _id: 1 });

    const formattedItems = items.map(item => ({
      id: item.numericId, // Use numeric ID for frontend compatibility
      name: item.name,
      icon: item.icon,
      category: item.category,
      wash_price: item.washPrice,
      iron_price: item.ironPrice,
      dry_clean_price: item.dryCleanPrice,
      has_wash: item.hasWash,
      has_iron: item.hasIron,
      has_dry_clean: item.hasDryClean,
      has_wash_iron: item.hasWashIron,
      student_discount_percent: item.studentDiscountPercent
    }));

    res.json({
      success: true,
      data: { items: formattedItems }
    });

  } catch (error) {
    console.error('GetAllItems error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get items'
    });
  }
};
