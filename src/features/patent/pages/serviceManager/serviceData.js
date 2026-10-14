// src/features/patent/pages/serviceManager/serviceData.js

export const SERVICE_CATEGORIES = [
    {
        id: 1,
        name: "Blood & Pathology Tests",
        description: "HbA1c, Fasting, Lipid & Renal",
        image: "",
        is_active: true,
        items: [
            { id: 101, name: "HbA1c", mrp: 500, discount_price: 450, is_active: true },
            { id: 102, name: "Fasting Blood Sugar", mrp: 200, discount_price: 150, is_active: true },
            { id: 103, name: "Lipid Profile", mrp: 700, discount_price: 600, is_active: true },
            { id: 104, name: "Renal Function Test", mrp: 900, discount_price: 810, is_active: true },
        ],
    },
    {
        id: 2,
        name: "ECG Testing",
        description: "12-Lead Clinical ECG",
        image: "",
        is_active: true,
        items: [
            { id: 201, name: "12-Lead ECG", mrp: 500, discount_price: 400, is_active: true },
            { id: 202, name: "2D Echo", mrp: 1500, discount_price: 1200, is_active: true },
        ],
    },
    {
        id: 3,
        name: "USG / X-Ray / CT",
        description: "Radiology partner slots",
        image: "",
        is_active: true,
        items: [
            { id: 301, name: "USG Abdomen", mrp: 1000, discount_price: 900, is_active: true },
            { id: 302, name: "X-Ray Chest", mrp: 400, discount_price: 350, is_active: true },
            { id: 303, name: "CT Scan Brain", mrp: 4000, discount_price: 3500, is_active: true },
        ],
    },
    {
        id: 4,
        name: "Supplements",
        description: "Vitamins & metabolic aids",
        image: "",
        is_active: true,
        items: [
            { id: 401, name: "Vitamin D3", mrp: 600, discount_price: 550, is_active: true },
            { id: 402, name: "Omega-3", mrp: 800, discount_price: 700, is_active: true },
            { id: 403, name: "Multivitamin", mrp: 500, discount_price: 450, is_active: true },
        ],
    },
    {
        id: 5,
        name: "Medical Devices",
        description: "CGM, strips & BP meters",
        image: "",
        is_active: true,
        items: [
            { id: 501, name: "CGM Sensor", mrp: 5000, discount_price: 4500, is_active: true },
            { id: 502, name: "Glucometer Strips", mrp: 1000, discount_price: 800, is_active: true },
            { id: 503, name: "BP Monitor", mrp: 2500, discount_price: 2200, is_active: true },
        ],
    },
];