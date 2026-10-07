export type Product = {
  id: string
  slug: string
  sku: string
  name: string
  description: string
  category: string
  subcategories?: string[]
  basePrice: number
  salePrice?: number
  defaultWeight: string // e.g., '0.5 kg'
  availableWeights: { weight: string; priceMultiplier: number; serves: string }[]
  flavors: string[]
  egglessAvailable: boolean
  egglessPricePremium: number
  stock: number
  images: string[]
  ingredients: string[]
  allergens: string[]
  shelfLife: string
  bestseller: boolean
  rating: number
  reviewCount: number
  deliveryEligibility: string[] // '60-min', 'same-day', 'midnight', 'fixed-time'
}

export type Location = {
  id: string
  city: string
  state: string
  pincodes: string[]
  serviceable: boolean
  capabilities: string[] // '60-min', 'same-day', 'midnight', 'fixed-time'
}

export type DeliveryZone = {
  id: string
  name: string
  capabilities: {
    type: string // 'same-day', 'midnight', etc.
    fee: number
    cutoffTime?: string // '18:00'
    timeWindows?: string[]
  }[]
}

export const mockProducts: Product[] = [
  {
    id: 'p-1',
    slug: 'classic-belgian-truffle',
    sku: 'CB-001',
    name: 'Classic Belgian Truffle',
    description: 'A rich, dark chocolate truffle cake layered with premium Belgian chocolate ganache.',
    category: 'Classic Cakes',
    basePrice: 649,
    salePrice: 599,
    defaultWeight: '0.5 kg',
    availableWeights: [
      { weight: '0.5 kg', priceMultiplier: 1, serves: '4-5' },
      { weight: '1 kg', priceMultiplier: 1.8, serves: '8-10' },
      { weight: '1.5 kg', priceMultiplier: 2.7, serves: '12-15' },
      { weight: '2 kg', priceMultiplier: 3.5, serves: '16-20' },
    ],
    flavors: ['Chocolate'],
    egglessAvailable: true,
    egglessPricePremium: 50,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=85'],
    ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Belgian Chocolate', 'Cream'],
    allergens: ['Dairy', 'Gluten', 'Soy'],
    shelfLife: '3 Days',
    bestseller: true,
    rating: 4.9,
    reviewCount: 342,
    deliveryEligibility: ['60-min', 'same-day', 'midnight', 'fixed-time']
  },
  {
    id: 'p-2',
    slug: 'midnight-red-velvet',
    sku: 'RV-002',
    name: 'Midnight Red Velvet',
    description: 'Soft, buttery red velvet sponge layered with smooth cream cheese frosting.',
    category: 'Classic Cakes',
    basePrice: 749,
    defaultWeight: '0.5 kg',
    availableWeights: [
      { weight: '0.5 kg', priceMultiplier: 1, serves: '4-5' },
      { weight: '1 kg', priceMultiplier: 1.8, serves: '8-10' },
    ],
    flavors: ['Red Velvet'],
    egglessAvailable: true,
    egglessPricePremium: 50,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&q=85'],
    ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Cream Cheese', 'Butter'],
    allergens: ['Dairy', 'Gluten'],
    shelfLife: '3 Days',
    bestseller: true,
    rating: 4.8,
    reviewCount: 256,
    deliveryEligibility: ['same-day', 'midnight', 'fixed-time']
  },
  {
    id: 'p-3',
    slug: 'pistachio-rasmalai-cake',
    sku: 'RC-003',
    name: 'Pistachio Rasmalai Cake',
    description: 'A fusion delight. Cardamom sponge soaked in saffron milk, layered with fresh rasmalai and pistachios.',
    category: 'Gourmet Cakes',
    basePrice: 799,
    defaultWeight: '0.5 kg',
    availableWeights: [
      { weight: '0.5 kg', priceMultiplier: 1, serves: '4-5' },
      { weight: '1 kg', priceMultiplier: 1.8, serves: '8-10' },
      { weight: '1.5 kg', priceMultiplier: 2.7, serves: '12-15' },
    ],
    flavors: ['Rasmalai'],
    egglessAvailable: true,
    egglessPricePremium: 100, // specialty
    stock: 10,
    images: ['https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=85'],
    ingredients: ['Flour', 'Sugar', 'Milk', 'Cardamom', 'Saffron', 'Pistachios'],
    allergens: ['Dairy', 'Gluten', 'Nuts'],
    shelfLife: '2 Days',
    bestseller: true,
    rating: 4.9,
    reviewCount: 412,
    deliveryEligibility: ['same-day', 'fixed-time'] // no 60-min for gourmet
  },
  {
    id: 'p-4',
    slug: 'chocolate-biscoff-crunch',
    sku: 'CB-004',
    name: 'Chocolate Biscoff Crunch',
    description: 'Chocolate sponge with Lotus Biscoff spread, crushed cookies, and a caramel drip.',
    category: 'Classic Cakes',
    basePrice: 699,
    defaultWeight: '0.5 kg',
    availableWeights: [
      { weight: '0.5 kg', priceMultiplier: 1, serves: '4-5' },
      { weight: '1 kg', priceMultiplier: 1.8, serves: '8-10' },
    ],
    flavors: ['Biscoff', 'Chocolate'],
    egglessAvailable: true,
    egglessPricePremium: 50,
    stock: 25,
    images: ['https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=85'],
    ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Biscoff Spread', 'Cream'],
    allergens: ['Dairy', 'Gluten', 'Soy'],
    shelfLife: '3 Days',
    bestseller: false,
    rating: 4.7,
    reviewCount: 120,
    deliveryEligibility: ['60-min', 'same-day', 'midnight', 'fixed-time']
  },
  {
    id: 'p-5',
    slug: 'fresh-strawberry-cloud',
    sku: 'FS-005',
    name: 'Fresh Strawberry Cloud',
    description: 'Light vanilla sponge filled with fresh strawberry compote and whipped cream.',
    category: 'Classic Cakes',
    basePrice: 649,
    defaultWeight: '0.5 kg',
    availableWeights: [
      { weight: '0.5 kg', priceMultiplier: 1, serves: '4-5' },
      { weight: '1 kg', priceMultiplier: 1.8, serves: '8-10' },
    ],
    flavors: ['Strawberry', 'Vanilla'],
    egglessAvailable: true,
    egglessPricePremium: 50,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=85'],
    ingredients: ['Flour', 'Sugar', 'Fresh Strawberries', 'Cream'],
    allergens: ['Dairy', 'Gluten'],
    shelfLife: '2 Days',
    bestseller: false,
    rating: 4.6,
    reviewCount: 89,
    deliveryEligibility: ['same-day', 'fixed-time']
  }
]

export const mockLocations: Location[] = [
  { id: 'loc-1', city: 'Delhi NCR', state: 'Delhi', pincodes: ['110001', '110002', '110003', '122001', '201301'], serviceable: true, capabilities: ['60-min', 'same-day', 'midnight', 'fixed-time'] },
  { id: 'loc-2', city: 'Mumbai', state: 'Maharashtra', pincodes: ['400001', '400002', '400003'], serviceable: true, capabilities: ['same-day', 'midnight', 'fixed-time'] },
  { id: 'loc-3', city: 'Bangalore', state: 'Karnataka', pincodes: ['560001', '560002', '560003'], serviceable: true, capabilities: ['60-min', 'same-day', 'midnight', 'fixed-time'] },
  { id: 'loc-4', city: 'Hyderabad', state: 'Telangana', pincodes: ['500001', '500002'], serviceable: true, capabilities: ['same-day', 'fixed-time'] }
]

export const categories = [
  'Classic Cakes', 'Bento Cakes', 'Designer Cakes', 'Theme Cakes', 'Photo Cakes', 
  'Heart Cakes', 'Pinata Cakes', 'Pull Me Up Cakes', 'Drip Cakes', 'Cheesecakes', 'Half Cakes'
]

export const occasionsList = [
  'Birthday', 'Anniversary', 'Wedding', 'Baby Shower', 'Congratulations', 'Farewell', 'Graduation'
]

export const flavorsList = [
  'Chocolate', 'Vanilla', 'Red Velvet', 'Black Forest', 'Butterscotch', 'Pineapple', 
  'Blueberry', 'Strawberry', 'Coffee', 'Rasmalai', 'Biscoff', 'Ferrero', 'KitKat'
]

export const deliveryCapabilities = {
  '60-min': { title: '60 Minute Delivery', description: 'Selected products in selected areas', fee: 149 },
  'same-day': { title: 'Same Day Delivery', description: 'Freshly baked and sent today', fee: 0 },
  'midnight': { title: 'Midnight Delivery', description: '11 PM - 12 AM surprises', fee: 249 },
  'fixed-time': { title: 'Fixed Time Delivery', description: 'Choose your one-hour slot', fee: 99 },
  'early-morning': { title: 'Early Morning', description: '7 AM - 9 AM delivery', fee: 199 }
}
