import { useEffect, useState } from "react";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css"; 
import "./App.css"; 

function App() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [editingCarId, setEditingCarId] = useState(null);
  const [bookingCar, setBookingCar] = useState(null);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    color: "",
    year: "",
    pricePerDay: "",
    location: "",
    type: "",
    transmission: "",
    fuelType: "",
    seats: "",
    description: "",
    isAvailable: "",
    images: [],
  });

  const [bookingData, setBookingData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    pickupDate: "",
    returnDate: "",
  });

  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [accountType, setAccountType] = useState("customer");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [myCars, setMyCars] = useState([]);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    fetch("https://car-rental-online-ashen.vercel.app/api/cars")
      .then((response) => response.json())
      .then((data) => {
        setCars(data.cars);
      })
      .catch((error) => {
        console.log(error);
        setMessage("Could not load cars");
        alert("Could not load cars");
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }; 

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      setFormData((previousData) => ({
        ...previousData,
        images: [],
      }));
      return;
    }

    const readers = files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((images) => {
        setFormData((previousData) => ({
          ...previousData,
          images,
        }));
      })
      .catch((error) => {
        console.log(error);
        setMessage("Could not read the selected image(s)");
        alert("Could not read the selected image(s)");
      });
  };

  const handleBookingChange = (event) => {
    const { name, value } = event.target;

    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };

  const handleOwnerChange = (event) => {
    const { name, value } = event.target;

    setOwnerData({
      ...ownerData,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (formData.images.length === 0) {
      setMessage("Please upload at least one car image.");
      alert("Please upload at least one car image.");
      return;
    }

    try {
      const carData = {
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        year: Number(formData.year),
        pricePerDay: Number(formData.pricePerDay),
        location: formData.location,
        type: formData.type,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        seats: Number(formData.seats),
        description: formData.description,
        isAvailable: formData.isAvailable === "true",
        images: formData.images,
      };

      const url = editingCarId
        ? `https://car-rental-online-ashen.vercel.app/api/cars/${editingCarId}`
        : "https://car-rental-online-ashen.vercel.app/api/cars";

      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method: editingCarId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify(carData),
      });

      const data = await response.json();

      if (data.success) {
        if (editingCarId) {
          setCars((previousCars) =>
            previousCars.map((car) =>
              car._id === editingCarId ? data.car : car
            )
          );

          setMessage("Car updated successfully!");
                  } else {
          setCars((previousCars) => [...previousCars, data.car]);

          setMessage("Car added successfully!");
                  }

        setEditingCarId(null);

        setFormData({
          brand: "",
          model: "",
          color: "",
          year: "",
          pricePerDay: "",
          location: "",
          type: "",
          transmission: "",
          fuelType: "",
          seats: "",
          description: "",
          isAvailable: "",
          images: [],
        });
      } else {
        setMessage(data.error || data.message || "Operation failed");
        alert(data.error || data.message || "Operation failed");
      }
    } catch (error) {
      console.log("Error:", error);
      setMessage("Could not connect to backend");
      alert("Could not connect to backend");
    }
  }; 

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://car-rental-online-ashen.vercel.app/api/cars/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCars((previousCars) =>
          previousCars.filter((car) => car._id !== id)
        );

        setMessage("Car deleted successfully!");
              } else {
        setMessage(
          data.error ||
            data.message ||
            "Failed to delete car"
        );
        alert(data.error || data.message || "Failed to delete car");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not delete car");
      alert("Could not delete car");
    }
  };

  const handleEdit = (car) => {
    setEditingCarId(car._id);

    setFormData({
      brand: car.brand,
      model: car.model,
      color: car.color || "",
      year: car.year,
      pricePerDay: car.pricePerDay,
      location: car.location,
      type: car.type,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      description: car.description || "",
      isAvailable: car.isAvailable ? "true" : "false",
      images: car.images || [],
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingCarId(null);

    setFormData({
      brand: "",
      model: "",
      color: "",
      year: "",
      pricePerDay: "",
      location: "",
      type: "",
      transmission: "",
      fuelType: "",
      seats: "",
      description: "",
      isAvailable: "",
      images: [],
    });

    setMessage("");
  };

  const handleRent = (car) => {
    setBookingCar(car);

    setBookingData({
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      pickupDate: "",
      returnDate: "",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }; 

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const calculateTotalDays = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) {
      return 0;
    }

    const pickup = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);

    const difference = returnDate - pickup;

    return Math.max(
      1,
      Math.ceil(difference / (1000 * 60 * 60 * 24))
    );
  };

  const totalDays = calculateTotalDays();

  const totalPrice =
    bookingCar && totalDays > 0
      ? totalDays * bookingCar.pricePerDay
      : 0;

  const formatDateForBooking = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!bookingCar) {
      return;
    }

    if (!bookingData.pickupDate || !bookingData.returnDate) {
      setMessage("Please select both pickup and return dates.");
      alert("Please select both pickup and return dates.");
      return;
    }

    if (bookingData.pickupDate < todayDate) {
      setMessage("Pickup date cannot be in the past.");
      alert("Pickup date cannot be in the past.");
      return;
    }

    if (bookingData.returnDate < bookingData.pickupDate) {
      setMessage("Return date cannot be before pickup date.");
      alert("Return date cannot be before pickup date.");
      return;
    } 

    try {
      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            car: bookingCar._id,
            user: loggedInUser._id,
            pickupDate: bookingData.pickupDate,
            returnDate: bookingData.returnDate,
            totalDays: totalDays,
            totalPrice: totalPrice,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Booking created successfully!");
        
        setBookingCar(null);

        setBookingData({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerAddress: "",
          pickupDate: "",
          returnDate: "",
        });

        loadBookings();

        const carsResponse = await fetch(
          "https://car-rental-online-ashen.vercel.app/api/cars"
        );

        const carsData = await carsResponse.json();

        if (carsData.success) {
          setCars(carsData.cars);
        }
      } else {
        setMessage(
          data.error || data.message || "Booking failed"
        );
        alert(data.error || data.message || "Booking failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to booking API");
      alert("Could not connect to booking API");
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/bookings"
      );

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        setMessage(
          data.error ||
            data.message ||
            "Could not load bookings"
        );
        alert(data.error || data.message || "Could not load bookings");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not load bookings");
      alert("Could not load bookings");
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      const response = await fetch(
        `https://car-rental-online-ashen.vercel.app/api/bookings/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setBookings((previousBookings) =>
          previousBookings.filter(
            (booking) => booking._id !== id
          )
        );

        setMessage("Booking cancelled successfully!");
        
        const carsResponse = await fetch(
          "https://car-rental-online-ashen.vercel.app/api/cars"
        );

        const carsData = await carsResponse.json();

        if (carsData.success) {
          setCars(carsData.cars);
        }
      } else {
        setMessage(
          data.error ||
            data.message ||
            "Failed to cancel booking"
        );
        alert(data.error || data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not cancel booking");
    }
  };

  const handleOwnerSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: ownerData.name,
            email: ownerData.email,
            phone: ownerData.phone,
            address: ownerData.address,
            password: ownerData.password,
            role: accountType,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Account created successfully!");
        alert("Account created successfully!");
        setAccountType("customer");

        setOwnerData({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "",
        });
      } else {
        setMessage(
          data.error ||
            data.message ||
            "Failed to create owner account"
        );
        alert(data.error || data.message || "Failed to create owner account");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to user API");
      alert("Could not connect to user API");
    }
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setLoggedInUser(data.user);

        localStorage.setItem("token", data.token);

        await fetchAllCars();

        if (data.user.role === "owner") {
          await fetchMyCars();
        }

        setMessage("Login successful!");
        
        setLoginData({
          email: "",
          password: "",
        });
      } else {
        setMessage(
          data.error ||
            data.message ||
            "Login failed"
        );
        alert(data.error || data.message || "Login failed");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not connect to login API");
      alert("Could not connect to login API");
    }
  };

  const fetchAllCars = async () => {
    try {
      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/cars"
      );

      const data = await response.json();

      if (data.success) {
        setCars(data.cars);
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not load cars");
        alert("Could not load cars");
    }
  };

  const fetchMyCars = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        "https://car-rental-online-ashen.vercel.app/api/cars/my-cars",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMyCars(data.cars);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://car-rental-online-ashen.vercel.app/api/users/${loggedInUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem("token");
        setLoggedInUser(null);
        setMyCars([]);
        setBookingCar(null);
        setEditingCarId(null);
        setShowRegister(false);
        setMessage("Account deleted successfully!");
        alert("Account deleted successfully!");
        fetchAllCars();
      } else {
        setMessage(
          data.error ||
            data.message ||
            "Failed to delete account"
        );
        alert(data.error || data.message || "Failed to delete account");
      }
    } catch (error) {
      console.log(error);
      setMessage("Could not delete account");
      alert("Could not delete account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setMyCars([]);
    setEditingCarId(null);
    setBookingCar(null);
    setMessage("Logged out successfully!");
        fetchAllCars();
  };

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <h1>Car Rental</h1>
          <p className="site-tagline">
            Online car rental website for simple and convenient car rentals for your next journey.
          </p>
        </div>

        {!loggedInUser && !showRegister && (
          <div className="login-top">
            <div className="section-heading">
              <h2>Login</h2>

              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMessage("");
                  setShowRegister(true);
                }}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />

              <button type="submit">Login</button>
            </form>

            <p className="help-text">
              Forgot your password? Contact the administrator at{" "}
              <strong>18319-87789</strong> or{" "}
              <strong>support@carrental.com</strong>. The administrator
              can reset your password.
            </p>
          </div>
        )}
      </header>

      {message && <p className="message">{message}</p>}

      {showRegister && !loggedInUser ? null : (
        <>
          <section className="intro-section">
            <h2>Find Your Ride</h2>
            <p>
              Browse available cars, compare their details, and book a
              vehicle that suits your trip. Owners can list and manage
              their own cars.
            </p>
          </section>

          {loggedInUser?.role === "owner" && !bookingCar && (
            <>
              <h2>{editingCarId ? "Edit Car" : "Add a Car"}</h2>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="brand"
                  placeholder="Brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="model"
                  placeholder="Model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="year"
                  placeholder="Year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="pricePerDay"
                  placeholder="$ Price per day (USD)"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="location"
                  placeholder="Location (City, Country)"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Subcompact Sedan">
                    Subcompact Sedan
                  </option>
                  <option value="Compact Sedan">
                    Compact Sedan
                  </option>
                  <option value="Mid-size Sedan">
                    Mid-size Sedan
                  </option>
                  <option value="Full-size Sedan">
                    Full-size Sedan
                  </option>
                  <option value="Mini Hatchback">
                    Mini Hatchback
                  </option>
                  <option value="Full-size Hatchback">
                    Full-size Hatchback
                  </option>
                  <option value="Compact Crossover">
                    Compact Crossover
                  </option>
                  <option value="Midsize Crossover">
                    Midsize Crossover
                  </option>
                  <option value="Midsize SUV">
                    Midsize SUV
                  </option>
                  <option value="Full-size SUV">
                    Full-size SUV
                  </option>
                  <option value="Luxury Executive">
                    Luxury Executive
                  </option>
                  <option value="Sports Car">
                    Sports Car
                  </option>
                  <option value="Station Wagon">
                    Station Wagon
                  </option>
                  <option value="Pickup Truck">
                    Pickup Truck
                  </option>
                  <option value="MPV">MPV</option>
                  <option value="Four Wheel Drive">
                    Four Wheel Drive
                  </option>
                </select>

                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>

                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>

                <input
                  type="number"
                  name="seats"
                  placeholder="Seats"
                  value={formData.seats}
                  onChange={handleChange}
                  required
                />

                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                />

                <select
                  name="isAvailable"
                  value={formData.isAvailable}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select availability</option>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </select>

                <label htmlFor="car-images">
                  <b>Add Car Image</b> (Up to 50MB)
                </label>

                <input
                  id="car-images"
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  required={!editingCarId}
                />

                {formData.images.length > 0 && (
                  <div className="image-preview-container">
                    {formData.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Car preview ${index + 1}`}
                        className="car-image-preview"
                      />
                    ))}
                  </div>
                )}

                <button type="submit">
                  {editingCarId ? "Update Car" : "Add Car"}
                </button>

                {editingCarId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </>
          )}

          {bookingCar && loggedInUser?.role === "customer" && (
            <>
              <h2>
                Rent {bookingCar.brand} {bookingCar.model}
              </h2>

              <p>
                <strong>${bookingCar.pricePerDay}</strong> per day
              </p>

              <form onSubmit={handleBookingSubmit}>
                <input
                  type="text"
                  name="customerName"
                  placeholder="Your Name"
                  value={bookingData.customerName}
                  onChange={handleBookingChange}
                  required
                />

                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Email"
                  value={bookingData.customerEmail}
                  onChange={handleBookingChange}
                  required
                />

                <input
                  type="tel"
                  name="customerPhone"
                  placeholder="Phone"
                  value={bookingData.customerPhone}
                  onChange={handleBookingChange}
                  required
                />

                <textarea
                  name="customerAddress"
                  placeholder="Address"
                  value={bookingData.customerAddress}
                  onChange={handleBookingChange}
                  required
                />

                <div className="date-field">
                  <label>Pickup Date</label>

                  <DatePicker
                    selected={
                      bookingData.pickupDate
                        ? new Date(
                            `${bookingData.pickupDate}T00:00:00`
                          )
                        : null
                    }
                    onChange={(date) =>
                      setBookingData({
                        ...bookingData,
                        pickupDate:
                          formatDateForBooking(date),
                      })
                    }
                    minDate={
                      new Date(`${todayDate}T00:00:00`)
                    }
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select pickup date"
                    className="date-picker-input"
                    required
                  />
                </div>

                <div className="date-field">
                  <label>Return Date</label>

                  <DatePicker
                    selected={
                      bookingData.returnDate
                        ? new Date(
                            `${bookingData.returnDate}T00:00:00`
                          )
                        : null
                    }
                    onChange={(date) =>
                      setBookingData({
                        ...bookingData,
                        returnDate:
                          formatDateForBooking(date),
                      })
                    }
                    minDate={
                      bookingData.pickupDate
                        ? new Date(
                            `${bookingData.pickupDate}T00:00:00`
                          )
                        : new Date(
                            `${todayDate}T00:00:00`
                          )
                    }
                    dateFormat="dd/MM/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select return date"
                    className="date-picker-input"
                    required
                  />
                </div>

                {totalDays > 0 && (
                  <>
                    <p>Total Days: {totalDays}</p>
                    <p>Total Price: ${totalPrice}</p>
                  </>
                )}

                <button type="submit">
                  Confirm Booking
                </button>

                <button
                  type="button"
                  onClick={() => setBookingCar(null)}
                >
                  Cancel
                </button>
              </form>
            </>
          )}

          <h2>Available Cars</h2>

          <div className="car-container">
            {cars.map((car) => (
              <div className="car-card" key={car._id}>
                {car.images && car.images.length > 0 && (
                  <img
                    src={car.images[0]}
                    alt={`${car.brand} ${car.model}`}
                    className="car-image"
                  />
                )}

                <h2>
                  {car.brand} {car.model}
                </h2>

                <p>Year: {car.year}</p>
                <p>Color: {car.color}</p>
                <p>${car.pricePerDay} per day</p>
                <p>Location: {car.location}</p>
                <p>Type: {car.type}</p>
                <p>Transmission: {car.transmission}</p>
                <p>Fuel: {car.fuelType}</p>
                <p>Seats: {car.seats}</p>

                <p
                  className={
                    car.isAvailable
                      ? "available"
                      : "unavailable"
                  }
                >
                  {car.isAvailable
                    ? "Available"
                    : "Not Available"}
                </p>

                <p>{car.description}</p>

                {loggedInUser?.role === "customer" &&
                  car.isAvailable && (
                    <button
                      onClick={() => handleRent(car)}
                    >
                      Rent This Car
                    </button>
                  )}

                {loggedInUser?.role === "owner" &&
                  car.owner &&
                  car.owner._id === loggedInUser._id && (
                    <>
                      <button
                        onClick={() => handleEdit(car)}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(car._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
              </div>
            ))}
          </div>
        </>
      )}

      {!loggedInUser && showRegister && (
        <section className="auth-page">
          <button
            type="button"
            className="text-button"
            onClick={() => setShowRegister(false)}
          >
            ← Back to Home
          </button>

          <h2>Create Account</h2>

          <form onSubmit={handleOwnerSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={ownerData.name}
              onChange={handleOwnerChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={ownerData.email}
              onChange={handleOwnerChange}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={ownerData.phone}
              onChange={handleOwnerChange}
              required
            />

            <textarea
              name="address"
              placeholder="Address"
              value={ownerData.address}
              onChange={handleOwnerChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={ownerData.password}
              onChange={handleOwnerChange}
              required
            />

            <select
              value={accountType}
              onChange={(event) =>
                setAccountType(event.target.value)
              }
              required
            >
              <option value="customer">
                Customer
              </option>
              <option value="owner">Owner</option>
            </select>

            <button type="submit">
              Create Account
            </button>
          </form>
        </section>
      )}

      {loggedInUser && (
        <div className="profile-panel">
          <div>
            <span className="profile-label">
              My Profile
            </span>

            <h3>
              Welcome, {loggedInUser.name}!
            </h3>
          </div>

          <div className="profile-details">
            <p>
              <strong>Email:</strong>{" "}
              {loggedInUser.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {loggedInUser.phone}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {loggedInUser.address}
            </p>

            <p>
              <strong>Account:</strong>{" "}
              {loggedInUser.role}
            </p>
          </div>

          <button onClick={handleLogout}>
            Logout
          </button>

          <button
            className="delete-account-button"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      )}

      {loggedInUser?.role === "owner" && (
        <>
          <h2>My Cars ({myCars.length})</h2>

          <div className="car-container">
            {myCars.map((car) => (
              <div className="car-card" key={car._id}>
                <h3>
                  {car.brand} {car.model}
                </h3>

                <p>${car.pricePerDay} per day</p>
                <p>Location: {car.location}</p>
                <p>
                  {car.isAvailable
                    ? "Available"
                    : "Not Available"}
                </p>

                <button
                  onClick={() => handleEdit(car)}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(car._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {loggedInUser && (
        <>
          <h2>Bookings</h2>

          <button onClick={loadBookings}>
            Load Bookings
          </button>

          <div className="booking-container">
            {bookings.map((booking) => (
              <div
                className="booking-card"
                key={booking._id}
              >
                <h3>
                  {booking.car?.brand}{" "}
                  {booking.car?.model}
                </h3>

                <p>
                  Customer: {booking.user?.name}
                </p>

                <p>
                  Email: {booking.user?.email}
                </p>

                <p>
                  Phone: {booking.user?.phone}
                </p>

                <p>
                  Pickup:{" "}
                  {new Date(
                    booking.pickupDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  Return:{" "}
                  {new Date(
                    booking.returnDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  Total Days: {booking.totalDays}
                </p>

                <p>
                  Total Price: ${booking.totalPrice}
                </p>

                <p>
                  Status: {booking.status}
                </p>

                <button
                  onClick={() =>
                    handleCancelBooking(
                      booking._id
                    )
                  }
                >
                  Cancel Booking
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <footer className="site-footer">
        <p>
          © 2026 Car Rental. All rights reserved.
        </p>

        <div>
          <span>Terms & Conditions</span> ·{" "}
          <span>Privacy Policy</span> ·{" "}
          <span>
            Contact: support@carrental.com
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;