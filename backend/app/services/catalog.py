"""Versioned, illustrative per-acre assumptions. Not current mandi prices or agronomic advice."""
DATA_VERSION = 'demo-2026.1'
CROPS = {
    'Wheat': {'yield': 18, 'price': 2400, 'cost': 18000, 'water': 1800, 'risk': .15, 'seasons': ['rabi'], 'soils': ['loamy','alluvial','clay'], 'color': '#2c704e'},
    'Mustard': {'yield': 7, 'price': 5400, 'cost': 12500, 'water': 900, 'risk': .24, 'seasons': ['rabi'], 'soils': ['loamy','alluvial','sandy'], 'color': '#e3b954'},
    'Chickpea': {'yield': 5.5, 'price': 5600, 'cost': 11000, 'water': 700, 'risk': .19, 'seasons': ['rabi'], 'soils': ['loamy','sandy'], 'color': '#a3bc8b'},
    'Rice': {'yield': 25, 'price': 2300, 'cost': 29000, 'water': 5000, 'risk': .20, 'seasons': ['kharif'], 'soils': ['loamy','alluvial','clay'], 'color': '#2c704e'},
    'Maize': {'yield': 22, 'price': 2200, 'cost': 17000, 'water': 1600, 'risk': .25, 'seasons': ['kharif'], 'soils': ['loamy','alluvial'], 'color': '#e3b954'},
    'Moong': {'yield': 4.5, 'price': 7000, 'cost': 9500, 'water': 600, 'risk': .22, 'seasons': ['kharif','zaid'], 'soils': ['loamy','alluvial','sandy'], 'color': '#a3bc8b'},
}
ASSUMPTIONS = [
    'Illustrative sample data, not live prices or validated agricultural forecasts.',
    'Yield: quintal/acre. Price: INR/quintal. Cost: INR/acre. Seasonal irrigation: m³/acre.',
    'Continuous acreage allocation; all land must be allocated. Soil and season are hard filters.',
    'Risk is an illustrative revenue haircut, not a measured probability. No weather forecast is used.',
    'Costs exclude unentered land rent, finance and transport. Confirm local soil, water and buyer access.',
]
