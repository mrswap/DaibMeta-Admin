// src/features/patent/pages/healthPackages/healthPackagesData.js

// Available Services (jo package me add ho sakti hain)
export const AVAILABLE_SERVICES = [
    { id: 1, name: "Blood & Pathology Tests" },
    { id: 2, name: "ECG Testing" },
    { id: 3, name: "USG / X-Ray / CT" },
    { id: 4, name: "Supplements" },
    { id: 5, name: "Medical Devices" },
    { id: 6, name: "Doctor Consultation" },
    { id: 7, name: "Dietician Consultation" },
];

// Static Packages Data
export const HEALTH_PACKAGES = [
    {
        id: 1,
        name: "Basic Diabetes Care",
        description: "Essential tests for diabetes management",
        price: 999,
        mrp: 1500,
        image: "",
        is_active: true,
        services: [
            { id: 1, name: "Blood & Pathology Tests" },
            { id: 6, name: "Doctor Consultation" },
        ],
    },
    {
        id: 2,
        name: "Comprehensive Health Checkup",
        description: "Complete full body checkup including heart and kidney",
        price: 2499,
        mrp: 4000,
        image: "",
        is_active: true,
        services: [
            { id: 1, name: "Blood & Pathology Tests" },
            { id: 2, name: "ECG Testing" },
            { id: 3, name: "USG / X-Ray / CT" },
            { id: 6, name: "Doctor Consultation" },
        ],
    },
];