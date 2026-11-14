export interface StateOption {
  value: string;
  label: string;
  cities: string[];
}

export const INDIAN_STATES: StateOption[] = [
  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
    cities: ["Port Blair", "Diglipur", "Mayabunder", "Rangat"],
  },
  {
    value: "Andhra Pradesh",
    label: "Andhra Pradesh",
    cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada"],
  },
  {
    value: "Arunachal Pradesh",
    label: "Arunachal Pradesh",
    cities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  },
  {
    value: "Assam",
    label: "Assam",
    cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tezpur"],
  },
  {
    value: "Bihar",
    label: "Bihar",
    cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif"],
  },
  {
    value: "Chandigarh",
    label: "Chandigarh",
    cities: ["Chandigarh"],
  },
  {
    value: "Chhattisgarh",
    label: "Chhattisgarh",
    cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon"],
  },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
    cities: ["Daman", "Diu", "Silvassa"],
  },
  {
    value: "Delhi",
    label: "Delhi",
    cities: ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Dwarka", "Rohini"],
  },
  {
    value: "Goa",
    label: "Goa",
    cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  },
  {
    value: "Gujarat",
    label: "Gujarat",
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  },
  {
    value: "Haryana",
    label: "Haryana",
    cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
  },
  {
    value: "Himachal Pradesh",
    label: "Himachal Pradesh",
    cities: ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu", "Manali"],
  },
  {
    value: "Jammu and Kashmir",
    label: "Jammu and Kashmir",
    cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  },
  {
    value: "Jharkhand",
    label: "Jharkhand",
    cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh"],
  },
  {
    value: "Karnataka",
    label: "Karnataka",
    cities: ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere"],
  },
  {
    value: "Kerala",
    label: "Kerala",
    cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Kannur"],
  },
  {
    value: "Ladakh",
    label: "Ladakh",
    cities: ["Leh", "Kargil"],
  },
  {
    value: "Lakshadweep",
    label: "Lakshadweep",
    cities: ["Kavaratti", "Agatti", "Andrott", "Amini"],
  },
  {
    value: "Madhya Pradesh",
    label: "Madhya Pradesh",
    cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas"],
  },
  {
    value: "Maharashtra",
    label: "Maharashtra",
    cities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur"],
  },
  {
    value: "Manipur",
    label: "Manipur",
    cities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
  },
  {
    value: "Meghalaya",
    label: "Meghalaya",
    cities: ["Shillong", "Tura", "Jowai", "Nongpoh"],
  },
  {
    value: "Mizoram",
    label: "Mizoram",
    cities: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  },
  {
    value: "Nagaland",
    label: "Nagaland",
    cities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang"],
  },
  {
    value: "Odisha",
    label: "Odisha",
    cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
  },
  {
    value: "Puducherry",
    label: "Puducherry",
    cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  },
  {
    value: "Punjab",
    label: "Punjab",
    cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
  },
  {
    value: "Rajasthan",
    label: "Rajasthan",
    cities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar"],
  },
  {
    value: "Sikkim",
    label: "Sikkim",
    cities: ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  },
  {
    value: "Tamil Nadu",
    label: "Tamil Nadu",
    cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode"],
  },
  {
    value: "Telangana",
    label: "Telangana",
    cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam"],
  },
  {
    value: "Tripura",
    label: "Tripura",
    cities: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
  },
  {
    value: "Uttar Pradesh",
    label: "Uttar Pradesh",
    cities: ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur"],
  },
  {
    value: "Uttarakhand",
    label: "Uttarakhand",
    cities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh", "Nainital"],
  },
  {
    value: "West Bengal",
    label: "West Bengal",
    cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Kharagpur"],
  },
];

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const ITEM_CATEGORIES: CategoryItem[] = [
  {
    id: "Electronics",
    name: "Electronics",
    icon: "Smartphone",
    subcategories: [
      "Smartphones & Mobile Phones",
      "Laptops & Notebooks",
      "Tablets & iPads",
      "Smartwatches & Fitness Trackers",
      "Headphones & Earbuds",
      "Cameras & Lenses",
      "Power Banks & Chargers",
      "Other Electronics",
    ],
  },
  {
    id: "Wallets",
    name: "Wallets & Purses",
    icon: "Wallet",
    subcategories: ["Men's Wallet", "Women's Purse", "Card Holder", "Coin Pouch", "Money Clip"],
  },
  {
    id: "Documents",
    name: "Documents & Cards",
    icon: "FileText",
    subcategories: [
      "Aadhaar Card",
      "PAN Card",
      "Driving License",
      "Passport",
      "Voter ID",
      "Bank Passbook / Cheque Book",
      "Credit / Debit Card",
      "Educational Certificates",
      "Other Government ID",
    ],
  },
  {
    id: "Keys",
    name: "Keys & Keychains",
    icon: "Key",
    subcategories: ["Car Keys", "Bike / Motorcycle Keys", "House Keys", "Office Keys", "Key Bunch / Rings"],
  },
  {
    id: "Bags",
    name: "Bags & Luggage",
    icon: "Briefcase",
    subcategories: ["Backpack", "Handbag", "Suitcase / Trolley", "Laptop Bag", "Duffel Bag", "Shopping Bag"],
  },
  {
    id: "Jewelry",
    name: "Jewelry & Watches",
    icon: "Watch",
    subcategories: ["Wrist Watch", "Ring", "Chain / Necklace", "Bracelet / Bangle", "Earrings", "Anklet"],
  },
  {
    id: "Clothing",
    name: "Clothing & Footwear",
    icon: "Shirt",
    subcategories: ["Jacket / Coat", "Cap / Hat", "Shoes / Footwear", "Traditional Wear", "Scarf / Shawl"],
  },
  {
    id: "Accessories",
    name: "Personal Accessories",
    icon: "Glasses",
    subcategories: ["Eyeglasses / Sunglasses", "Belt", "Umbrella", "Water Bottle", "Helmet"],
  },
  {
    id: "Vehicles",
    name: "Vehicles & Cycles",
    icon: "Bike",
    subcategories: ["Bicycle", "Motorcycle / Scooter", "Car", "Vehicle Accessories"],
  },
  {
    id: "Books",
    name: "Books & Stationery",
    icon: "BookOpen",
    subcategories: ["Notebook / Diary", "Textbook", "Novel / Book", "Pen / Stationery Kit"],
  },
  {
    id: "Pets",
    name: "Pets & Animals",
    icon: "Dog",
    subcategories: ["Dog", "Cat", "Bird", "Other Pet"],
  },
  {
    id: "Musical Instruments",
    name: "Musical Instruments",
    icon: "Music",
    subcategories: ["Guitar", "Keyboard", "Violin", "Flute", "Percussion", "Other Instrument"],
  },
  {
    id: "Medical Equipment",
    name: "Medical Items & Equipment",
    icon: "Activity",
    subcategories: ["Prescription Glasses", "Hearing Aid", "Walking Stick", "Inhaler / Medicine Kit", "Medical Device"],
  },
  {
    id: "Sports",
    name: "Sports & Fitness",
    icon: "Trophy",
    subcategories: ["Cricket Kit", "Badminton Racket", "Football / Basketball", "Gym Bag & Gear"],
  },
  {
    id: "Toys",
    name: "Toys & Baby Items",
    icon: "Smile",
    subcategories: ["Soft Toy / Doll", "Baby Stroller", "Action Figure", "Electronic Toy"],
  },
  {
    id: "Other",
    name: "Other Items",
    icon: "HelpCircle",
    subcategories: ["Miscellaneous", "Custom Item"],
  },
];

export const MATCH_WEIGHTS = {
  text: 0.35,
  attribute: 0.20,
  image: 0.20,
  location: 0.15,
  date: 0.10,
};

export const COLOR_OPTIONS = [
  { label: "Black", value: "Black", hex: "#000000" },
  { label: "White", value: "White", hex: "#FFFFFF" },
  { label: "Silver / Grey", value: "Silver", hex: "#9CA3AF" },
  { label: "Blue", value: "Blue", hex: "#2563EB" },
  { label: "Red", value: "Red", hex: "#DC2626" },
  { label: "Green", value: "Green", hex: "#16A34A" },
  { label: "Yellow / Gold", value: "Gold", hex: "#EAB308" },
  { label: "Brown", value: "Brown", hex: "#854D0E" },
  { label: "Orange", value: "Orange", hex: "#EA580C" },
  { label: "Purple / Violet", value: "Purple", hex: "#9333EA" },
  { label: "Pink", value: "Pink", hex: "#EC4899" },
  { label: "Multicolor", value: "Multicolor", hex: "linear-gradient(45deg, red, blue, green)" },
];

export const STATUS_COLORS = {
  active: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  recovered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  closed: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  approved: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
  rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  under_review: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
};
