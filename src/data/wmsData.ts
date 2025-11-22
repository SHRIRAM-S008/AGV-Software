import { InventoryItem, Rack, Shelf, WarehouseSlot } from '@/types';

// Realistic WMS Dataset - Electronics, Accessories, PC Components
export const realisticInventoryData: InventoryItem[] = [
  // Rack A - Electronics
  {
    id: 'ip17-200',
    skuCode: 'IP17-200',
    name: 'iPhone 17',
    category: 'Mobiles',
    quantity: 200,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.2,
    dimensions: { width: 0.07, height: 0.15, depth: 0.08 },
    location: {
      id: 'slot-a-a1-1',
      rack: 'A',
      shelf: 'A1',
      slot: '1',
      position: { x: 10, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 50,
    maxStockLevel: 300,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ip17p-100',
    skuCode: 'IP17P-100',
    name: 'iPhone 17 Pro',
    category: 'Mobiles',
    quantity: 100,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.22,
    dimensions: { width: 0.07, height: 0.15, depth: 0.08 },
    location: {
      id: 'slot-a-a1-2',
      rack: 'A',
      shelf: 'A1',
      slot: '2',
      position: { x: 10, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 25,
    maxStockLevel: 150,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ip17pm-50',
    skuCode: 'IP17PM-50',
    name: 'iPhone 17 Pro Max',
    category: 'Mobiles',
    quantity: 50,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.24,
    dimensions: { width: 0.08, height: 0.16, depth: 0.08 },
    location: {
      id: 'slot-a-a1-3',
      rack: 'A',
      shelf: 'A1',
      slot: '3',
      position: { x: 10, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 15,
    maxStockLevel: 100,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ip16-40',
    skuCode: 'IP16-40',
    name: 'iPhone 16',
    category: 'Mobiles',
    quantity: 40,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.19,
    dimensions: { width: 0.07, height: 0.15, depth: 0.08 },
    location: {
      id: 'slot-a-a2-1',
      rack: 'A',
      shelf: 'A2',
      slot: '1',
      position: { x: 10, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 20,
    maxStockLevel: 80,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ip16p-20',
    skuCode: 'IP16P-20',
    name: 'iPhone 16 Pro',
    category: 'Mobiles',
    quantity: 20,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.21,
    dimensions: { width: 0.07, height: 0.15, depth: 0.08 },
    location: {
      id: 'slot-a-a2-2',
      rack: 'A',
      shelf: 'A2',
      slot: '2',
      position: { x: 10, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 10,
    maxStockLevel: 50,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ip16pm-10',
    skuCode: 'IP16PM-10',
    name: 'iPhone 16 Pro Max',
    category: 'Mobiles',
    quantity: 10,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.23,
    dimensions: { width: 0.08, height: 0.16, depth: 0.08 },
    location: {
      id: 'slot-a-a2-3',
      rack: 'A',
      shelf: 'A2',
      slot: '3',
      position: { x: 10, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 5,
    maxStockLevel: 30,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'mba4-30',
    skuCode: 'MBA4-30',
    name: 'MacBook M4 Air',
    category: 'Laptops',
    quantity: 30,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 1.2,
    dimensions: { width: 0.30, height: 0.22, depth: 0.15 },
    location: {
      id: 'slot-a-a5-1',
      rack: 'A',
      shelf: 'A5',
      slot: '1',
      position: { x: 10, y: 5, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 10,
    maxStockLevel: 50,
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'mbp4-20',
    skuCode: 'MBP4-20',
    name: 'MacBook M4 Pro',
    category: 'Laptops',
    quantity: 20,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 1.6,
    dimensions: { width: 0.31, height: 0.22, depth: 0.16 },
    location: {
      id: 'slot-a-a5-2',
      rack: 'A',
      shelf: 'A5',
      slot: '2',
      position: { x: 10, y: 5, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 8,
    maxStockLevel: 35,
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'mbm4-10',
    skuCode: 'MBM4-10',
    name: 'MacBook M4 Max',
    category: 'Laptops',
    quantity: 10,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 2.2,
    dimensions: { width: 0.36, height: 0.24, depth: 0.16 },
    location: {
      id: 'slot-a-a5-3',
      rack: 'A',
      shelf: 'A5',
      slot: '3',
      position: { x: 10, y: 5, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 5,
    maxStockLevel: 20,
    createdAt: new Date('2025-03-05'),
    updatedAt: new Date('2025-11-22')
  },

  // Rack B - Accessories
  {
    id: 'app-80',
    skuCode: 'APP-80',
    name: 'AirPods Pro',
    category: 'Audio',
    quantity: 80,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.05,
    dimensions: { width: 0.05, height: 0.06, depth: 0.02 },
    location: {
      id: 'slot-b-b1-1',
      rack: 'B',
      shelf: 'B1',
      slot: '1',
      position: { x: 20, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 20,
    maxStockLevel: 120,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ap3-100',
    skuCode: 'AP3-100',
    name: 'AirPods 3',
    category: 'Audio',
    quantity: 100,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.04,
    dimensions: { width: 0.05, height: 0.05, depth: 0.02 },
    location: {
      id: 'slot-b-b1-2',
      rack: 'B',
      shelf: 'B1',
      slot: '2',
      position: { x: 20, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 30,
    maxStockLevel: 150,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'aw10-40',
    skuCode: 'AW10-40',
    name: 'Apple Watch Series 10',
    category: 'Wearables',
    quantity: 40,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.03,
    dimensions: { width: 0.04, height: 0.04, depth: 0.01 },
    location: {
      id: 'slot-b-b2-1',
      rack: 'B',
      shelf: 'B2',
      slot: '1',
      position: { x: 20, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 15,
    maxStockLevel: 60,
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'awu2-20',
    skuCode: 'AWU2-20',
    name: 'Apple Watch Ultra 2',
    category: 'Wearables',
    quantity: 20,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.06,
    dimensions: { width: 0.05, height: 0.05, depth: 0.01 },
    location: {
      id: 'slot-b-b2-2',
      rack: 'B',
      shelf: 'B2',
      slot: '2',
      position: { x: 20, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 8,
    maxStockLevel: 30,
    createdAt: new Date('2025-02-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'tc-500',
    skuCode: 'TC-500',
    name: 'Type-C Cable',
    category: 'Accessories',
    quantity: 500,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.05,
    dimensions: { width: 0.01, height: 0.20, depth: 0.01 },
    location: {
      id: 'slot-b-b3-1',
      rack: 'B',
      shelf: 'B3',
      slot: '1',
      position: { x: 20, y: 3, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 100,
    maxStockLevel: 800,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'c30-200',
    skuCode: 'C30-200',
    name: '30W Charger',
    category: 'Accessories',
    quantity: 200,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.08,
    dimensions: { width: 0.06, height: 0.08, depth: 0.03 },
    location: {
      id: 'slot-b-b3-2',
      rack: 'B',
      shelf: 'B3',
      slot: '2',
      position: { x: 20, y: 3, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 50,
    maxStockLevel: 300,
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-11-22')
  },

  // Rack C - Computer Components
  {
    id: 'rtx4090-8',
    skuCode: 'RTX4090-8',
    name: 'RTX 4090 GPU',
    category: 'PC Hardware',
    quantity: 8,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 1.5,
    dimensions: { width: 0.30, height: 0.15, depth: 0.05 },
    location: {
      id: 'slot-c-c1-1',
      rack: 'C',
      shelf: 'C1',
      slot: '1',
      position: { x: 30, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 3,
    maxStockLevel: 15,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'rtx4080-12',
    skuCode: 'RTX4080-12',
    name: 'RTX 4080 GPU',
    category: 'PC Hardware',
    quantity: 12,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 1.3,
    dimensions: { width: 0.28, height: 0.14, depth: 0.05 },
    location: {
      id: 'slot-c-c1-2',
      rack: 'C',
      shelf: 'C1',
      slot: '2',
      position: { x: 30, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 5,
    maxStockLevel: 20,
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'i9g14-30',
    skuCode: 'I9G14-30',
    name: 'Intel i9 14th Gen',
    category: 'Processor',
    quantity: 30,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.1,
    dimensions: { width: 0.05, height: 0.05, depth: 0.01 },
    location: {
      id: 'slot-c-c2-1',
      rack: 'C',
      shelf: 'C2',
      slot: '1',
      position: { x: 30, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 10,
    maxStockLevel: 50,
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'i7g14-40',
    skuCode: 'I7G14-40',
    name: 'Intel i7 14th Gen',
    category: 'Processor',
    quantity: 40,
    unitType: 'units',
    handlingPriority: 'high_value',
    weight: 0.09,
    dimensions: { width: 0.05, height: 0.05, depth: 0.01 },
    location: {
      id: 'slot-c-c2-2',
      rack: 'C',
      shelf: 'C2',
      slot: '2',
      position: { x: 30, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 15,
    maxStockLevel: 60,
    createdAt: new Date('2025-02-20'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ram32-100',
    skuCode: 'RAM32-100',
    name: '32GB DDR5 RAM',
    category: 'RAM',
    quantity: 100,
    unitType: 'units',
    handlingPriority: 'fragile',
    weight: 0.08,
    dimensions: { width: 0.13, height: 0.03, depth: 0.01 },
    location: {
      id: 'slot-c-c3-1',
      rack: 'C',
      shelf: 'C3',
      slot: '1',
      position: { x: 30, y: 3, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 30,
    maxStockLevel: 150,
    createdAt: new Date('2025-01-25'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ssd1t-150',
    skuCode: 'SSD1T-150',
    name: '1TB NVMe SSD',
    category: 'Storage',
    quantity: 150,
    unitType: 'units',
    handlingPriority: 'fragile',
    weight: 0.08,
    dimensions: { width: 0.08, height: 0.02, depth: 0.22 },
    location: {
      id: 'slot-c-c4-1',
      rack: 'C',
      shelf: 'C4',
      slot: '1',
      position: { x: 30, y: 4, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 50,
    maxStockLevel: 200,
    createdAt: new Date('2025-01-30'),
    updatedAt: new Date('2025-11-22')
  },

  // Rack D - Other Equipment
  {
    id: 'cctv-50',
    skuCode: 'CCTV-50',
    name: 'CCTV Cameras',
    category: 'Security',
    quantity: 50,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.5,
    dimensions: { width: 0.10, height: 0.10, depth: 0.08 },
    location: {
      id: 'slot-d-d1-1',
      rack: 'D',
      shelf: 'D1',
      slot: '1',
      position: { x: 40, y: 1, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 15,
    maxStockLevel: 80,
    createdAt: new Date('2025-02-05'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'rtr-80',
    skuCode: 'RTR-80',
    name: 'Routers',
    category: 'Networking',
    quantity: 80,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.3,
    dimensions: { width: 0.20, height: 0.05, depth: 0.15 },
    location: {
      id: 'slot-d-d2-1',
      rack: 'D',
      shelf: 'D2',
      slot: '1',
      position: { x: 40, y: 2, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 25,
    maxStockLevel: 120,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'ec-500',
    skuCode: 'EC-500',
    name: 'Ethernet Cables',
    category: 'Networking',
    quantity: 500,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.1,
    dimensions: { width: 0.01, height: 0.01, depth: 2.0 },
    location: {
      id: 'slot-d-d3-1',
      rack: 'D',
      shelf: 'D3',
      slot: '1',
      position: { x: 40, y: 3, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 100,
    maxStockLevel: 800,
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'pb-150',
    skuCode: 'PB-150',
    name: 'Power Banks',
    category: 'Accessories',
    quantity: 150,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.2,
    dimensions: { width: 0.07, height: 0.14, depth: 0.02 },
    location: {
      id: 'slot-d-d4-1',
      rack: 'D',
      shelf: 'D4',
      slot: '1',
      position: { x: 40, y: 4, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 40,
    maxStockLevel: 200,
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'bs-60',
    skuCode: 'BS-60',
    name: 'Bluetooth Speakers',
    category: 'Audio',
    quantity: 60,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.3,
    dimensions: { width: 0.08, height: 0.08, depth: 0.08 },
    location: {
      id: 'slot-d-d5-1',
      rack: 'D',
      shelf: 'D5',
      slot: '1',
      position: { x: 40, y: 5, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 20,
    maxStockLevel: 100,
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-11-22')
  },
  {
    id: 'bcs-40',
    skuCode: 'BCS-40',
    name: 'Barcode Scanners',
    category: 'Utility',
    quantity: 40,
    unitType: 'units',
    handlingPriority: 'normal',
    weight: 0.15,
    dimensions: { width: 0.08, height: 0.15, depth: 0.05 },
    location: {
      id: 'slot-d-d6-1',
      rack: 'D',
      shelf: 'D6',
      slot: '1',
      position: { x: 40, y: 6, z: 0 },
      isOccupied: true,
      lastUpdated: new Date()
    },
    minStockLevel: 12,
    maxStockLevel: 60,
    createdAt: new Date('2025-02-25'),
    updatedAt: new Date('2025-11-22')
  }
];

// Generate realistic rack structure based on inventory data
export const generateRackStructure = (): Rack[] => {
  const racks: Rack[] = [];
  
  // Create 4 racks (A, B, C, D)
  for (let rackLetter of ['A', 'B', 'C', 'D']) {
    const rackId = `rack-${rackLetter.toLowerCase()}`;
    const shelves: Shelf[] = [];
    
    // Create 6 shelves per rack (A1-A6, B1-B6, etc.)
    for (let shelfNum = 1; shelfNum <= 6; shelfNum++) {
      const shelfId = `${rackLetter}${shelfNum}`;
      const slots: WarehouseSlot[] = [];
      
      // Create 4 slots per shelf
      for (let slotNum = 1; slotNum <= 4; slotNum++) {
        const slotId = `${rackLetter}${shelfNum}-${slotNum}`;
        const inventoryItem = realisticInventoryData.find(item => 
          item.location.rack === rackLetter && 
          item.location.shelf === shelfId && 
          item.location.slot === slotNum.toString()
        );
        
        slots.push({
          id: `slot-${rackLetter.toLowerCase()}-${shelfId}-${slotNum}`,
          rack: rackLetter,
          shelf: shelfId,
          slot: slotNum.toString(),
          position: { 
            x: 10 + (rackLetter.charCodeAt(0) - 65) * 10, 
            y: shelfNum, 
            z: 0 
          },
          isOccupied: !!inventoryItem,
          item: inventoryItem,
          lastUpdated: inventoryItem?.updatedAt || new Date()
        });
      }
      
      const occupiedSlots = slots.filter(slot => slot.isOccupied).length;
      shelves.push({
        id: `shelf-${rackLetter.toLowerCase()}-${shelfId}`,
        rackId: rackId,
        name: shelfId,
        level: shelfNum,
        slots: slots,
        capacity: 4,
        currentLoad: occupiedSlots,
        weightLimit: 50,
        currentWeight: slots.reduce((total, slot) => total + (slot.item?.weight || 0), 0)
      });
    }
    
    const totalCapacity = shelves.reduce((total, shelf) => total + shelf.capacity, 0);
    const currentUtilization = shelves.reduce((total, shelf) => total + shelf.currentLoad, 0);
    
    racks.push({
      id: rackId,
      name: `Rack ${rackLetter}`,
      position: { x: 10 + (rackLetter.charCodeAt(0) - 65) * 10, y: 5, z: 0 },
      dimensions: { width: 2, height: 6, depth: 1 },
      shelves: shelves,
      totalCapacity: totalCapacity,
      currentUtilization: currentUtilization,
      agvAccessPath: [
        { x: 10 + (rackLetter.charCodeAt(0) - 65) * 10, y: 0, z: 0 },
        { x: 10 + (rackLetter.charCodeAt(0) - 65) * 10, y: 7, z: 0 }
      ],
      isAccessible: true
    });
  }
  
  return racks;
};

export const realisticRacks = generateRackStructure();
