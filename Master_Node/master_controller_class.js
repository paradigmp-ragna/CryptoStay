class Location {
    constructor(city, state, country, zipCode) {
      this.city = city;
      this.state = state;
      this.country = country;
      this.zipCode = zipCode;
    }
  }
  
  class Contact {
    constructor(email, phone) {
      this.email = email;
      this.phone = phone;
    }
  }
  
  class RoomType {
    constructor(type, capacity, costPerNight) {
      this.type = type;
      this.capacity = capacity;
      this.costPerNight = costPerNight;
    }
  }
  
  class Service {
    constructor(name, description, cost) {
      this.name = name;
      this.description = description;
      this.cost = cost;
    }
  }
  
  class Policies {
    constructor(checkInTime, checkOutTime, cancellationPolicy) {
      this.checkInTime = checkInTime;
      this.checkOutTime = checkOutTime;
      this.cancellationPolicy = cancellationPolicy;
    }
  }
  
  class HotelRegistration {
    constructor(hotelName, location, contact, roomTypes, services, amenities, policies, images) {
      this.hotelName = hotelName;
      this.location = location;
      this.contact = contact;
      this.roomTypes = roomTypes;
      this.services = services;
      this.amenities = amenities;
      this.policies = policies;
      this.images = images || []; // Default to an empty array if not provided
    }
  }
  
  // Usage example:
  const location = new Location("City", "State", "Country", "12345");
  const contact = new Contact("hotel@example.com", "+1234567890");
  const roomTypes = [new RoomType("Single", 1, 100), new RoomType("Double", 2, 150)];
  const services = [new Service("WiFi", "High-speed internet", 10), new Service("Parking", "Secure parking space", 15)];
  const amenities = ["Swimming pool", "Gym", "Spa"];
  const policies = new Policies("2:00 PM", "12:00 PM", "Flexible cancellation policy");
  const images = ["path/to/image1.jpg", "path/to/image2.jpg"];
  
  const hotelRegistration = new HotelRegistration("Awesome Hotel", location, contact, roomTypes, services, amenities, policies, images);
  
  console.log(hotelRegistration);
  
module.exports = { Location, Contact, RoomType, Service, Policies, HotelRegistration };