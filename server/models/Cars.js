const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "Subcompact Sedan",
        "Compact Sedan",
        "Mid-size Sedan",
        "Full-size Sedan",

        "Mini Hatchback",
        "Full-size Hatchback",

        "Compact Crossover",
        "Midsize Crossover",

        "Midsize SUV",
        "Full-size SUV",

        "Luxury Executive",
        "Sports Car",
        "Station Wagon",
        "Pickup Truck",
        "MPV",
        "Four Wheel Drive",
      ],
    },

    transmission: {
      type: String,
      required: true,
      enum: ["Automatic", "Manual"],
    },

    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one car image is required.",
      },
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cars", carSchema);