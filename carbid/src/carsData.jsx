// Import predefined images 
import Audi1 from "../assets/images/Audi1.jpg";
import Ducati1 from '../assets/images/speed_triple.jpg';
import Z1000 from '../assets/images/z1000.jpg';
import Supra1 from '../assets/images/supra.jpg';
import F40 from '../assets/images/f40.jpg';
import F8 from '../assets/images/ferrari_f8.jpg';
import H2 from '../assets/images/H2.jpg';
import jeep1 from '../assets/images/jeep1.jpg';
import user from '../assets/images/user_avatar.jpg';
import Lamborghini from '../assets/images/Lambo1.jpg';
import Bentley1 from '../assets/images/bentley1.jpg';
import Rx7 from '../assets/images/rx7.jpg';
import Triumph from '../assets/images/Triumph.jpg';
import Range_Rover from '../assets/images/range_rover1.jpg';
import Vitpilen401 from '../assets/images/Vitpilen401.jpg';
import Duke390 from '../assets/images/Duke390.jpg';
import RC390 from '../assets/images/rc390.jpg';
import superduke1390 from '../assets/images/superduke1390.jpg';
import Husqvarna701 from '../assets/images/Husqvarna701.jpg';
import ZX10r from '../assets/images/zx10r.jpg';
import Z900 from '../assets/images/z900.jpg';
import w650 from '../assets/images/w650.jpg';
import G800 from '../assets/images/G800.jpg';
import G700 from '../assets/images/G700.jpg';
import G650 from '../assets/images/G650.jpg';
import Cirrus from '../assets/images/CirrusVision.jpg';
import Cobalt from '../assets/images/colbalt.jpg';

export const VehicleTypes = {
    FIXED: 'fixed',
    AUCTION: 'auction'
};

export const VehicleStatus = {
    AVAILABLE: 'available',
    SOLD: 'sold',
    PENDING: 'pending'
};

// Helper to format date strings
const formatDate = (date) => new Date(date).toISOString();

// Helper to create image arrays with variations
const createImageArray = (mainImage, count = 4) => {
    const additionalViews = ['front', 'side', 'rear', 'interior'];
    return Array(count).fill(mainImage).map((img, index) => ({
        url: img,
        position: index === 0 ? 'main' : additionalViews[index - 1]
    }));
};

// Create mapping for predefined images for easier reference
const predefinedImages = {
    'Audi1.jpg': Audi1,
    'speed_triple.jpg': Ducati1,
    'z1000.jpg': Z1000,
    'supra.jpg': Supra1,
    'f40.jpg': F40,
    'ferrari_f8.jpg': F8,
    'H2.jpg': H2,
    'jeep1.jpg': jeep1,
    'Lambo1.jpg': Lamborghini,
    'bentley1.jpg': Bentley1,
    'rx7.jpg': Rx7,
    'Triumph.jpg': Triumph,
    'range_rover1.jpg': Range_Rover,
    'Vitpilen401.jpg': Vitpilen401,
    'Duke390.jpg': Duke390,
    'rc390.jpg': RC390,
    'superduke1390.jpg': superduke1390,
    'Husqvarna701.jpg': Husqvarna701,
    'zx10r.jpg': ZX10r,
    'z900.jpg': Z900,
    'w650.jpg': w650,
    'G800.jpg': G800,
    'G700.jpg': G700,
    'G650.jpg': G650,
    'CirrusVision.jpg': Cirrus,
    'colbalt.jpg': Cobalt
};

const carsData = [
    {
        id: '1',
        name: "Audi R8 Green",
        title: "Audi R8 Green Premium Sport",
        style: 'Audi',
        type: 'Auto',
        color: 'Black',
        price: 285892,
        sale_type: 'fixed',  // 'fixed' or 'auction'
        isPredefined: true,  // Flag for predefined images
        image: 'Audi1.jpg',  // Reference to predefinedImages
        images: createImageArray('Audi1.jpg'),
        description: 'Pristine condition Audi R8 with premium features including advanced navigation system, premium leather interior, and sport performance package. Recent maintenance completed, all service records available.',
        specifications: {
            make: 'Audi',
            model: 'R8',
            year: 2023,
            mileage: 15000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller1',
            name: 'James Wilson',
            rating: 4.8,
            totalRatings: 156,
            joinDate: '2020',
            avatar: user
        },
        location: 'Munich, Germany',
        createdAt: formatDate('2024-03-15T10:00:00Z'),
        status: 'available'  // 'available', 'sold', 'pending'
    },
    // Similar structure for auction items
    {
        id: '2',
        name: "Ducati Speed Triple",
        title: "Ducati Speed Triple Racing Edition",
        style: 'Ducati',
        type: 'Motorcycle',
        color: 'Black',
        starting_bid: 250000,  // For auction items
        current_bid: 258000,
        sale_type: 'auction',
        auction_end_time: formatDate('2024-04-15T10:00:00Z'),
        isPredefined: true,
        image: 'speed_triple.jpg',
        images: createImageArray('speed_triple.jpg'),
        description: 'High-performance Ducati Speed Triple with racing modifications. Includes premium exhaust system, racing ECU, and professional maintenance history. Perfect for both track and street use.',
        specifications: {
            make: 'Ducati',
            model: 'Speed Triple',
            year: 2023,
            mileage: 8000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller2',
            name: 'Michael Ferrari',
            rating: 4.9,
            totalRatings: 203,
            joinDate: '2019',
            avatar: user
        },
        location: 'Bologna, Italy',
        createdAt: formatDate('2024-03-14T15:30:00Z'),
        status: 'available'
    },
    {
        id: '3',
        name: "Kawasaki Z1000",
        title: "Kawasaki Z1000 Street Fighter",
        style: 'Kawasaki',
        type: 'Motorcycle',
        color: 'Green',
        starting_bid: 300000,
        current_bid: 310000,
        sale_type: 'auction',
        auction_end_time: formatDate('2024-04-16T15:00:00Z'),
        isPredefined: true,
        image: 'z1000.jpg',
        images: createImageArray('z1000.jpg'),
        description: 'Powerful Kawasaki Z1000 in excellent condition. Features include ABS, traction control, and multiple riding modes. Complete service history available.',
        specifications: {
            make: 'Kawasaki',
            model: 'Z1000',
            year: 2023,
            mileage: 12000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller3',
            name: 'Takashi Yamamoto',
            rating: 4.7,
            totalRatings: 142,
            joinDate: '2021',
            avatar: user
        },
        location: 'Tokyo, Japan',
        createdAt: formatDate('2024-03-13T08:45:00Z'),
        status: 'available'
    },
    {
        id: '4',
        name: "Toyota Supra",
        title: "Toyota Supra GR Performance",
        style: 'Toyota',
        type: 'Sports Car',
        color: 'Orange',
        price: 358174,
        sale_type: 'fixed',
        isPredefined: true,
        image: 'supra.jpg',
        images: createImageArray('supra.jpg'),
        description: 'Iconic Toyota Supra GR with premium upgrades. Features include custom exhaust, performance tuning, and premium audio system.',
        specifications: {
            make: 'Toyota',
            model: 'Supra',
            year: 2023,
            mileage: 18000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller4',
            name: 'David Chen',
            rating: 4.6,
            totalRatings: 98,
            joinDate: '2022',
            avatar: user
        },
        location: 'Nagoya, Japan',
        createdAt: formatDate('2024-03-12T14:20:00Z'),
        status: 'available'
    },
    {
        id: '5',
        name: "Ferrari F40",
        title: "Ferrari F40 Classic Supercar",
        style: 'Ferrari',
        type: 'Supercar',
        color: 'Red',
        starting_bid: 1500000,
        current_bid: 1550000,
        sale_type: 'auction',
        auction_end_time: formatDate('2024-04-20T10:00:00Z'),
        isPredefined: true,
        image: 'f40.jpg',
        images: createImageArray('f40.jpg'),
        description: 'Legendary Ferrari F40 in pristine condition. Original paintwork, complete service history.',
        specifications: {
            make: 'Ferrari',
            model: 'F40',
            year: 1992,
            mileage: 25000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller5',
            name: 'Alessandro Romano',
            rating: 5.0,
            totalRatings: 87,
            joinDate: '2018',
            avatar: user
        },
        location: 'Maranello, Italy',
        createdAt: formatDate('2024-03-11T11:15:00Z'),
        status: 'available'
    },
    {
        id: '6',
        name: "Range Rover",
        title: "Range Rover Autobiography",
        style: 'Range Rover',
        type: 'SUV',
        color: 'Black',
        price: 358174,
        sale_type: 'fixed',
        isPredefined: true,
        image: 'range_rover1.jpg',
        images: createImageArray('range_rover1.jpg'),
        description: 'Luxurious Range Rover Autobiography with extended wheelbase. Premium entertainment system.',
        specifications: {
            make: 'Range Rover',
            model: 'Autobiography',
            year: 2023,
            mileage: 15000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller6',
            name: 'Charles Windsor',
            rating: 4.9,
            totalRatings: 189,
            joinDate: '2019',
            avatar: user
        },
        location: 'London, UK',
        createdAt: formatDate('2024-03-10T09:30:00Z'),
        status: 'available'
    },
    {
        id: '7',
        name: "KTM Duke 390",
        title: "KTM Duke 390 Street Fighter",
        style: 'KTM',
        type: 'Motorcycle',
        color: 'Orange',
        starting_bid: 45000,
        current_bid: 47000,
        sale_type: 'auction',
        auction_end_time: formatDate('2024-04-18T14:00:00Z'),
        isPredefined: true,
        image: 'Duke390.jpg',
        images: createImageArray('Duke390.jpg'),
        description: 'Agile and powerful KTM Duke 390. Perfect urban commuter with sporty character.',
        specifications: {
            make: 'KTM',
            model: 'Duke 390',
            year: 2023,
            mileage: 5000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller7',
            name: 'Stefan Mueller',
            rating: 4.8,
            totalRatings: 156,
            joinDate: '2020',
            avatar: user
        },
        location: 'Vienna, Austria',
        createdAt: formatDate('2024-03-09T16:20:00Z'),
        status: 'available'
    },
    {
        id: '8',
        name: "Gulfstream G800",
        title: "Gulfstream G800 Private Jet",
        style: 'Gulfstream',
        type: 'Aircraft',
        color: 'White',
        price: 71500000,
        sale_type: 'fixed',
        isPredefined: true,
        image: 'G800.jpg',
        images: createImageArray('G800.jpg'),
        description: 'Ultra-long-range business jet with exceptional comfort and performance.',
        specifications: {
            make: 'Gulfstream',
            model: 'G800',
            year: 2023,
            mileage: 1000,
            fuel: 'Jet A',
            transmission: 'N/A'
        },
        seller: {
            id: 'seller8',
            name: 'William Gates',
            rating: 5.0,
            totalRatings: 23,
            joinDate: '2017',
            avatar: user
        },
        location: 'Savannah, USA',
        createdAt: formatDate('2024-03-08T13:45:00Z'),
        status: 'available'
    },
    {
        id: '9',
        name: "Lamborghini Aventador",
        title: "Lamborghini Aventador SVJ",
        style: 'Lamborghini',
        type: 'Supercar',
        color: 'Black',
        starting_bid: 800000,
        current_bid: 850000,
        sale_type: 'auction',
        auction_end_time: formatDate('2024-04-25T16:00:00Z'),
        isPredefined: true,
        image: 'Lambo1.jpg',
        images: createImageArray('Lambo1.jpg'),
        description: 'Limited edition Lamborghini Aventador SVJ with track package.',
        specifications: {
            make: 'Lamborghini',
            model: 'Aventador SVJ',
            year: 2023,
            mileage: 2000,
            fuel: 'Petrol',
            transmission: 'Automatic'
        },
        seller: {
            id: 'seller9',
            name: 'Giorgio Rossi',
            rating: 5.0,
            totalRatings: 178,
            joinDate: '2017',
            avatar: user
        },
        location: "Sant'Agata Bolognese, Italy",
        createdAt: formatDate('2024-03-07T10:15:00Z'),
        status: 'available'
    },
    {
        id: '10',
        name: "Husqvarna Vitpilen",
        title: "Husqvarna Vitpilen 401",
        style: 'Husqvarna',
        type: 'Motorcycle',
        color: 'Silver',
        price: 35000,
        sale_type: 'fixed',
        isPredefined: true,
        image: 'Vitpilen401.jpg',
        images: createImageArray('Vitpilen401.jpg'),
        description: 'Modern cafe racer with exceptional handling and unique design.',
        specifications: {
            make: 'Husqvarna',
            model: 'Vitpilen 401',
            year: 2023,
            mileage: 3000,
            fuel: 'Petrol',
            transmission: 'Manual'
        },
        seller: {
            id: 'seller10',
            name: 'Erik Andersson',
            rating: 4.7,
            totalRatings: 89,
            joinDate: '2021',
            avatar: user
        },
        location: 'Stockholm, Sweden',
        createdAt: formatDate('2024-03-06T09:30:00Z'),
        status: 'available'
    }
];

export { predefinedImages };
export default carsData;

