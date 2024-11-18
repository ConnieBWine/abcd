// CarContext.jsx
import React, { createContext, useContext } from 'react';
import axios from 'axios';
import carsData from './carsData';

// Import predefined images 
import f40 from '../assets/images/f40.jpg';
import Duke390 from '../assets/images/Duke390.jpg';
import G800 from '../assets/images/G800.jpg';
import z1000 from '../assets/images/z1000.jpg';
import range_rover1 from '../assets/images/range_rover1.jpg';
import Audi1 from "../assets/images/Audi1.jpg";
import Ducati1 from '../assets/images/speed_triple.jpg';
import Supra1 from '../assets/images/supra.jpg';
import F8 from '../assets/images/ferrari_f8.jpg';
import H2 from '../assets/images/H2.jpg';
import jeep1 from '../assets/images/jeep1.jpg';
import Lamborghini from '../assets/images/Lambo1.jpg';
import Bentley1 from '../assets/images/bentley1.jpg';
import Rx7 from '../assets/images/rx7.jpg';
import Triumph from '../assets/images/Triumph.jpg';

export const predefinedImages = {
    'f40.jpg': f40,
    'Duke390.jpg': Duke390,
    'G800.jpg': G800,
    'z1000.jpg': z1000,
    'range_rover1.jpg': range_rover1,
    'Audi1.jpg': Audi1,
    'speed_triple.jpg': Ducati1,
    'supra.jpg': Supra1,
    'ferrari_f8.jpg': F8,
    'H2.jpg': H2,
    'jeep1.jpg': jeep1,
    'Lambo1.jpg': Lamborghini,
    'bentley1.jpg': Bentley1,
    'rx7.jpg': Rx7,
    'Triumph.jpg': Triumph
};

// Create the context
const CarContext = createContext();

// Helper function to get image filename
const getImageFilename = (path) => {
    if (!path) return '';
    return path.split('/').pop();
};

// Helper function to validate image path
const isValidImagePath = (path) => {
    if (!path) return false;
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return validExtensions.some(ext => path.toLowerCase().endsWith(ext));
};

export const CarProvider = ({ children }) => {
    // Process cars to ensure they have the required properties
    const processedCars = carsData.map(car => ({
        ...car,
        isPredefined: true,
        images: car.images || [{ url: car.image }]
    }));

    // CarContext.jsx
    const resolveImagePath = (imagePath, isPredefined = false, carId = null) => {
        try {
            if (!imagePath) return '/placeholder.jpg';

            // For predefined images
            if (isPredefined) {
                // First check if it's an imported image
                const filename = getImageFilename(imagePath);
                if (predefinedImages[filename]) {
                    return predefinedImages[filename]; 
                }
                
                // Then try assets path
                if (isValidImagePath(imagePath)) {
                    return `/assets/images/${filename}`;
                }
            }

            // For uploaded images
            if (carId) {
                return imagePath.startsWith('http') 
                    ? imagePath 
                    : `/uploads/vehicles/${carId}/images/${getImageFilename(imagePath)}`;
            }

            return '/placeholder.jpg';
        } catch (error) {
            console.error('Error resolving image:', error);
            return '/placeholder.jpg'; 
        }
    };

    const contextValue = {
        cars: processedCars,
        getImagePath: (car) => {
            try {
                if (car.isPredefined && car.image) {
                    return resolveImagePath(car.image, true);
                }

                if (car.images && car.images.length > 0) {
                    const firstImage = car.images[0];
                    return typeof firstImage === 'object' && firstImage.url
                        ? resolveImagePath(firstImage.url, false, car.id)
                        : resolveImagePath(firstImage, false, car.id);
                }

                if (car.image) {
                    return resolveImagePath(car.image, car.isPredefined, car.id);
                }

                return '/placeholder.jpg';
            } catch (error) {
                console.error('Error in getImagePath:', error);
                return '/placeholder.jpg';
            }
        },

        isPredefineImage: (imagePath) => {
            const filename = getImageFilename(imagePath);
            return !!predefinedImages[filename];
        },
        
        getAllImages: (car) => {
            if (!car) return [];
            try {
                if (car.images && Array.isArray(car.images)) {
                    return car.images.map(img => {
                        const imgUrl = typeof img === 'object' ? img.url : img;
                        return resolveImagePath(imgUrl, car.isPredefined, car.id);
                    });
                }
                if (car.image) {
                    return [resolveImagePath(car.image, car.isPredefined, car.id)];
                }
                return [];
            } catch (error) {
                console.error('Error getting all images:', error);
                return [];
            }
        }
    };

    return (
        <CarContext.Provider value={contextValue}>
            {children}
        </CarContext.Provider>
    );
};

// Custom hook for using the car context
export const useCars = () => {
    const context = useContext(CarContext);
    if (!context) {
        throw new Error('useCars must be used within a CarProvider');
    }
    return context;
};

export default CarContext;