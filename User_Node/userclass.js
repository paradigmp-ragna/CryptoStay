class Transaction {
    constructor(sender, receiver, amount) {
      this.sender = sender;
      this.receiver = receiver;
      this.amount = amount;
    }
  }
  
  class Contract {
    constructor(hotelName, roomType, roomsBooked, services, totalCost, refundRatio) {
      this.hotelName = hotelName;
      this.roomType = roomType;
      this.roomsBooked = roomsBooked;
      this.services = services;
      this.totalCost = totalCost;
      this.refundRatio = refundRatio;
    }
  }
  
  class HotelBookingUser {
    constructor(username, email, password, name, phone, address) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.name = name;
      this.phone = phone;
      this.address = address;
      this.transactions = [];
      this.contracts = [];
      this.coinholding = 0;
    }
  
    addTransaction(sender, receiver, amount) {
      const transaction = new Transaction(sender, receiver, amount);
      this.transactions.push(transaction);
    }
  
    addContract(hotelName, roomType, roomsBooked, services, totalCost, refundRatio) {
      const contract = new Contract(hotelName, roomType, roomsBooked, services, totalCost, refundRatio);
      this.contracts.push(contract);
    }
  
    getTransactionCount() {
      return this.transactions.length;
    }
  
    getContractCount() {
      return this.contracts.length;
    }
  }
  
  // Example usage:
  const user = new HotelBookingUser(
    "john_doe",
    "john@example.com",
    "hashed_password",
    "John Doe",
    "+1234567890",
    "123 Main St"
  );
  
  // Adding transactions and contracts
  user.addTransaction("sender1", "receiver1", 1000);
  user.addTransaction("sender2", "receiver2", 1500);
  user.addContract("Hotel A", "Single", 2, ["WiFi", "Breakfast"], 300, 0.8);
  user.addContract("Hotel B", "Double", 1, ["Parking", "Gym"], 250, 0.9);
  
  // Retrieving counts
  console.log("Transaction Count:", user.getTransactionCount());
  console.log("Contract Count:", user.getContractCount());
  
  // Printing user information
  console.log(user);

module.exports = { Transaction, Contract, HotelBookingUser }