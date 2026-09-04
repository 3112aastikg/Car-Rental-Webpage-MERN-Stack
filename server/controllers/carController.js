const Car = require("../models/Cars");


const getCars = async (req, res) => {
  try {
    const cars = await Car.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cars",
      error: error.message,
    });
  }
};


const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate(
      "owner",
      "name email phone"
    );

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    res.status(200).json({
      success: true,
      car,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch car",
      error: error.message,
    });
  }
};


const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({
      owner: req.user.userId,
    })
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cars.length,
      cars,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your cars",
      error: error.message,
    });
  }
};


const createCar = async (req, res) => {
  try {
    const car = await Car.create({
      ...req.body,
      owner: req.user.userId,
    });

    const populatedCar = await Car.findById(car._id).populate(
      "owner",
      "name email phone"
    );

    res.status(201).json({
      success: true,
      message: "Car created successfully",
      car: populatedCar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create car",
      error: error.message,
    });
  }
};


const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

 
    if (
      car.owner.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own cars",
      });
    }

    const updates = { ...req.body };

   
    delete updates.owner;

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("owner", "name email phone");

    res.status(200).json({
      success: true,
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update car",
      error: error.message,
    });
  }
};


const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

 
    if (
      car.owner.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own cars",
      });
    }

    await Car.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Car deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete car",
      error: error.message,
    });
  }
};

module.exports = {
  getCars,
  getCarById,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
};