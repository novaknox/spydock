// Built by Knox
const wordPairs = [
    // Food & Drink
    { regular: "Pizza", spy: "Pasta" },
    { regular: "Coffee", spy: "Tea" },
    { regular: "Burger", spy: "Sandwich" },
    { regular: "Chocolate", spy: "Candy" },
    { regular: "Apple", spy: "Orange" },
    
    // Sports
    { regular: "Football", spy: "Soccer" },
    { regular: "Basketball", spy: "Volleyball" },
    { regular: "Tennis", spy: "Badminton" },
    { regular: "Swimming", spy: "Diving" },
    { regular: "Running", spy: "Jogging" },
    
    // Animals
    { regular: "Dog", spy: "Wolf" },
    { regular: "Cat", spy: "Lion" },
    { regular: "Elephant", spy: "Mammoth" },
    { regular: "Dolphin", spy: "Whale" },
    { regular: "Eagle", spy: "Hawk" },
    
    // Technology
    { regular: "Computer", spy: "Laptop" },
    { regular: "Smartphone", spy: "Tablet" },
    { regular: "Camera", spy: "Video" },
    { regular: "Internet", spy: "Network" },
    { regular: "Email", spy: "Message" },
    
    // Transportation
    { regular: "Car", spy: "Truck" },
    { regular: "Bicycle", spy: "Motorcycle" },
    { regular: "Airplane", spy: "Helicopter" },
    { regular: "Train", spy: "Subway" },
    { regular: "Boat", spy: "Ship" },
    
    // Weather
    { regular: "Rain", spy: "Storm" },
    { regular: "Snow", spy: "Ice" },
    { regular: "Sun", spy: "Star" },
    { regular: "Wind", spy: "Breeze" },
    { regular: "Cloud", spy: "Fog" },
    
    // Music
    { regular: "Guitar", spy: "Violin" },
    { regular: "Piano", spy: "Keyboard" },
    { regular: "Drum", spy: "Tambourine" },
    { regular: "Song", spy: "Melody" },
    { regular: "Concert", spy: "Show" },
    
    // Clothing
    { regular: "Shirt", spy: "T-shirt" },
    { regular: "Pants", spy: "Jeans" },
    { regular: "Shoes", spy: "Sneakers" },
    { regular: "Hat", spy: "Cap" },
    { regular: "Dress", spy: "Skirt" },
    
    // Nature
    { regular: "Tree", spy: "Plant" },
    { regular: "River", spy: "Stream" },
    { regular: "Mountain", spy: "Hill" },
    { regular: "Ocean", spy: "Sea" },
    { regular: "Forest", spy: "Jungle" },
    
    // Time
    { regular: "Morning", spy: "Dawn" },
    { regular: "Night", spy: "Evening" },
    { regular: "Week", spy: "Month" },
    { regular: "Year", spy: "Decade" },
    { regular: "Hour", spy: "Minute" }
];

// Built by Knox
// Function to get a random word pair
function getRandomWordPair() {
    const randomIndex = Math.floor(Math.random() * wordPairs.length);
    return wordPairs[randomIndex];
}

// Built by Knox
// Function to get all word pairs
function getAllWordPairs() {
    return wordPairs;
}

module.exports = {
    getRandomWordPair,
    getAllWordPairs
}; 