const wordPairs = [
    // Food & Drink
    { regular: "Pizza", spy: "Pasta" },
    { regular: "Coffee", spy: "Tea" },
    { regular: "Burger", spy: "Sandwich" },
    { regular: "Chocolate", spy: "Candy" },
    { regular: "Apple", spy: "Orange" },
    { regular: "Rice", spy: "Wheat" },
    { regular: "Curry", spy: "Stew" },
    { regular: "Chapati", spy: "Naan" },
    { regular: "Lassi", spy: "Buttermilk" },
    { regular: "Biryani", spy: "Pulao" },
    
    // Sports
    { regular: "Football", spy: "Soccer" },
    { regular: "Basketball", spy: "Volleyball" },
    { regular: "Tennis", spy: "Badminton" },
    { regular: "Swimming", spy: "Diving" },
    { regular: "Running", spy: "Jogging" },
    { regular: "Cricket", spy: "Baseball" },
    { regular: "Kabaddi", spy: "Wrestling" },
    { regular: "Hockey", spy: "Field Hockey" },
    
    // Animals
    { regular: "Dog", spy: "Wolf" },
    { regular: "Cat", spy: "Lion" },
    { regular: "Elephant", spy: "Mammoth" },
    { regular: "Dolphin", spy: "Whale" },
    { regular: "Eagle", spy: "Hawk" },
    { regular: "Cow", spy: "Buffalo" },
    { regular: "Monkey", spy: "Ape" },
    { regular: "Peacock", spy: "Parrot" },
    
    // Technology
    { regular: "Computer", spy: "Laptop" },
    { regular: "Smartphone", spy: "Tablet" },
    { regular: "Camera", spy: "Video" },
    { regular: "Internet", spy: "Network" },
    { regular: "Email", spy: "Message" },
    { regular: "WhatsApp", spy: "Telegram" },
    { regular: "Paytm", spy: "Google Pay" },
    { regular: "Jio", spy: "Airtel" },
    
    // Transportation
    { regular: "Car", spy: "Truck" },
    { regular: "Bicycle", spy: "Motorcycle" },
    { regular: "Airplane", spy: "Helicopter" },
    { regular: "Train", spy: "Subway" },
    { regular: "Boat", spy: "Ship" },
    { regular: "Rickshaw", spy: "Auto" },
    { regular: "Metro", spy: "Subway" },
    { regular: "Cycle", spy: "Bike" },
    
    // Weather
    { regular: "Rain", spy: "Storm" },
    { regular: "Snow", spy: "Ice" },
    { regular: "Sun", spy: "Star" },
    { regular: "Wind", spy: "Breeze" },
    { regular: "Cloud", spy: "Fog" },
    { regular: "Monsoon", spy: "Rainy Season" },
    { regular: "Summer", spy: "Hot Season" },
    { regular: "Winter", spy: "Cold Season" },
    
    // Music
    { regular: "Guitar", spy: "Violin" },
    { regular: "Piano", spy: "Keyboard" },
    { regular: "Drum", spy: "Tambourine" },
    { regular: "Song", spy: "Melody" },
    { regular: "Concert", spy: "Show" },
    { regular: "Sitar", spy: "Veena" },
    { regular: "Tabla", spy: "Dhol" },
    { regular: "Bollywood Song", spy: "Movie Song" },
    
    // Clothing
    { regular: "Shirt", spy: "T-shirt" },
    { regular: "Pants", spy: "Jeans" },
    { regular: "Shoes", spy: "Sneakers" },
    { regular: "Hat", spy: "Cap" },
    { regular: "Dress", spy: "Skirt" },
    { regular: "Sari", spy: "Dress" },
    { regular: "Kurta", spy: "Shirt" },
    { regular: "Dhoti", spy: "Lungi" },
    
    // Nature
    { regular: "Tree", spy: "Plant" },
    { regular: "River", spy: "Stream" },
    { regular: "Mountain", spy: "Hill" },
    { regular: "Ocean", spy: "Sea" },
    { regular: "Forest", spy: "Jungle" },
    { regular: "Banyan", spy: "Oak" },
    { regular: "Mango", spy: "Apple" },
    { regular: "Lotus", spy: "Rose" },
    
    // Time
    { regular: "Morning", spy: "Dawn" },
    { regular: "Night", spy: "Evening" },
    { regular: "Week", spy: "Month" },
    { regular: "Year", spy: "Decade" },
    { regular: "Hour", spy: "Minute" },
    { regular: "Diwali", spy: "Festival" },
    { regular: "Ramadan", spy: "Eid" },
    { regular: "Pongal", spy: "Harvest Festival" },
    
    // Festivals
    { regular: "Holi", spy: "Color Festival" },
    { regular: "Eid", spy: "Ramadan" },
    { regular: "Christmas", spy: "Xmas" },
    { regular: "Navratri", spy: "Dussehra" },
    { regular: "Ganesh Chaturthi", spy: "Vinayaka Chaturthi" },
    
    // Languages
    { regular: "Hindi", spy: "Urdu" },
    { regular: "Tamil", spy: "Telugu" },
    { regular: "Bengali", spy: "Oriya" },
    { regular: "Gujarati", spy: "Marathi" },
    { regular: "Punjabi", spy: "Sindhi" },
    
    // Bollywood
    { regular: "Actor", spy: "Hero" },
    { regular: "Actress", spy: "Heroine" },
    { regular: "Movie", spy: "Film" },
    { regular: "Director", spy: "Filmmaker" },
    { regular: "Song", spy: "Music" },
    
    // Additional Pairs
    { regular: "Mumbai", spy: "Bombay" },
    { regular: "Delhi", spy: "New Delhi" },
    { regular: "Chennai", spy: "Madras" },
    { regular: "Kolkata", spy: "Calcutta" },
    { regular: "Bangalore", spy: "Bengaluru" },
    { regular: "Yoga", spy: "Meditation" },
    { regular: "Rupee", spy: "Dollar" },
    { regular: "Spice", spy: "Masala" }
];

// Function to get a random word pair
function getRandomWordPair() {
    const randomIndex = Math.floor(Math.random() * wordPairs.length);
    return wordPairs[randomIndex];
}

// Function to get all word pairs
function getAllWordPairs() {
    return wordPairs;
}

module.exports = {
    getRandomWordPair,
    getAllWordPairs
};