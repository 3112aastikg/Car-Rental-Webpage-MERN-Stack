const Booking = require("../models/booking");
const Car = require("../models/Cars");
const User = require("../models/User");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("car")
      .populate("user", "name email phone");

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("car")
      .populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      car,
      user,
      pickupDate,
      returnDate,
      totalPrice,
      status,
    } = req.body;

    if (!car || !user || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: "Car, user, pickup date and return date are required",
      });
    }

    const carDetails = await Car.findById(car);

    if (!carDetails) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    if (!carDetails.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This car is currently unavailable",
      });
    }

    const pickup = new Date(pickupDate);
    const returnDateValue = new Date(returnDate);

    if (returnDateValue < pickup) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before pickup date",
      });
    }

    const overlappingBookings = await Booking.find({
      car,
      status: {
        $in: ["Pending", "Confirmed"],
      },
      pickupDate: {
        $lt: returnDateValue,
      },
      returnDate: {
        $gt: pickup,
      },
    });

    const sameDayBooking = await Booking.findOne({
      car,
      status: {
        $in: ["Pending", "Confirmed"],
      },
      pickupDate: {
        $lte: pickup,
      },
      returnDate: {
        $gte: pickup,
      },
    });

    if (overlappingBookings.length > 0 || sameDayBooking) {
      return res.status(400).json({
        success: false,
        message: "This car is already booked for the selected dates",
      });
    }

    const totalDays = Math.max(
      1,
      Math.ceil(
        (returnDateValue - pickup) /
          (1000 * 60 * 60 * 24)
      )
    );

    const calculatedTotalPrice =
      carDetails.pricePerDay * totalDays;

    const booking = await Booking.create({
      car,
      user,
      pickupDate: pickup,
      returnDate: returnDateValue,
      totalDays,
      totalPrice: calculatedTotalPrice,
      status: status || "Pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("car")
      .populate("user", "name email phone");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const {
      car,
      user,
      pickupDate,
      returnDate,
      status,
    } = req.body;

    const carId = car || booking.car;

    const carDetails = await Car.findById(carId);

    if (!carDetails) {
      return res.status(404).json({
        success: false,
        message: "Car not found",
      });
    }

    const pickup = new Date(
      pickupDate || booking.pickupDate
    );

    const returnDateValue = new Date(
      returnDate || booking.returnDate
    );

    if (returnDateValue < pickup) {
      return res.status(400).json({
        success: false,
        message: "Return date cannot be before pickup date",
      });
    }

    const overlappingBookings = await Booking.find({
      _id: {
        $ne: booking._id,
      },
      car: carId,
      status: {
        $in: ["Pending", "Confirmed"],
      },
      pickupDate: {
        $lt: returnDateValue,
      },
      returnDate: {
        $gt: pickup,
      },
    });

    const sameDayBooking = await Booking.findOne({
      _id: {
        $ne: booking._id,
      },
      car: carId,
      status: {
        $in: ["Pending", "Confirmed"],
      },
      pickupDate: {
        $lte: pickup,
      },
      returnDate: {
        $gte: pickup,
      },
    });

    if (overlappingBookings.length > 0 || sameDayBooking) {
      return res.status(400).json({
        success: false,
        message: "This car is already booked for the selected dates",
      });
    }

    const totalDays = Math.max(
      1,
      Math.ceil(
        (returnDateValue - pickup) /
          (1000 * 60 * 60 * 24)
      )
    );

    const calculatedTotalPrice =
      carDetails.pricePerDay * totalDays;

    booking.car = carId;
    booking.user = user || booking.user;
    booking.pickupDate = pickup;
    booking.returnDate = returnDateValue;
    booking.totalDays = totalDays;
    booking.totalPrice = calculatedTotalPrice;

    if (status) {
      booking.status = status;
    }

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("car")
      .populate("user", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = "Cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};