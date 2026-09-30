const Banner = require("../models/banner.model");

// CREATE
const createBanner = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      buttonText,
      buttonAction,
      startDate,
      endDate,
      isActive,
      sortOrder
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: "Title and image are required"
      });
    }

    const banner = await Banner.create({
      title,
      description,
      image,
      buttonText,
      buttonAction,
      startDate,
      endDate,
      isActive,
      sortOrder,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create banner",
      error: error.message
    });
  }
};

// GET ADMIN BANNERS
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate("createdBy", "name email");

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners"
    });
  }
};

// GET ACTIVE BANNERS FOR FARMER
const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    }).sort({
      sortOrder: 1,
      createdAt: -1
    });

    res.json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch active banners"
    });
  }
};

// GET SINGLE
const getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch banner"
    });
  }
};

// UPDATE
const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      message: "Banner updated successfully",
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update banner"
    });
  }
};

// STATUS
const toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    banner.isActive = !banner.isActive;

    await banner.save();

    res.json({
      success: true,
      message: `Banner ${
        banner.isActive ? "activated" : "deactivated"
      } successfully`,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to change banner status"
    });
  }
};

// DELETE
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(
      req.params.id
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found"
      });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete banner"
    });
  }
};

module.exports = {
  createBanner,
  getBanners,
  getActiveBanners,
  getBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner
};