/**
 * Seed: Comprehensive Realistic Product Inventory Catalog (27 Products across 11 Categories)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Check if fully seeded
  const check = await knex('products')
    .whereIn('sku', ['GAM-PS5-SLIM', 'WEAR-AW-U2', 'CAM-SONY-A7IV'])
    .select('id');

  if (check && check.length === 3) {
    return; // Fully seeded
  }

  // Safely cleanup legacy prototype dummy items
  await knex('products')
    .whereIn('sku', [
      'CLOUD-SRV-01',
      'NET-ROUTER-99',
      'DEV-LAPTOP-M3',
      'ACC-KEY-RGB',
      'IOT-CAM-4K',
      'NET-SWITCH-24',
    ])
    .del();

  const productsList = [
    // --- COMPUTERS ---
    {
      sku: 'LAP-MBP-16',
      name: 'MacBook Pro 16" M3 Max',
      description: 'Apple M3 Max chip with 14-core CPU, 30-core GPU, 36GB Unified Memory, and 1TB ultra-fast SSD storage.',
      category: 'Computers',
      price: 3499.00,
      stock: 12,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'LAP-XPS-15',
      name: 'Dell XPS 15 OLED Laptop',
      description: '13th Gen Intel Core i9-13900H, 32GB DDR5 RAM, 1TB NVMe SSD, and NVIDIA GeForce RTX 4070 Graphics.',
      category: 'Computers',
      price: 2399.00,
      stock: 5,
      image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'LAP-TP-X1',
      name: 'Lenovo ThinkPad X1 Carbon Gen 12',
      description: 'Ultralight enterprise notebook with Intel Core Ultra 7, 32GB LPDDR5X, and 512GB PCIe SSD.',
      category: 'Computers',
      price: 1899.00,
      stock: 18,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60'
    },

    // --- DISPLAYS ---
    {
      sku: 'MON-DELL-U27',
      name: 'Dell UltraSharp 27" 4K USB-C Monitor',
      description: 'IPS Black panel, 2000:1 contrast ratio, 100% sRGB color gamut, and 90W Power Delivery hub.',
      category: 'Displays',
      price: 579.99,
      stock: 24,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'MON-LG-34',
      name: 'LG UltraWide 34" Curved Nano IPS',
      description: 'WQHD (3440 x 1440) 144Hz curved display with HDR400 and dual Thunderbolt 4 connectivity.',
      category: 'Displays',
      price: 799.00,
      stock: 4,
      image_url: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=60'
    },

    // --- PERIPHERALS ---
    {
      sku: 'MOU-LOGI-MX3S',
      name: 'Logitech MX Master 3S Wireless Mouse',
      description: '8,000 DPI Darkfield glass sensor, quiet clicks, and electromagnetic MagSpeed wheel scrolling.',
      category: 'Peripherals',
      price: 99.99,
      stock: 65,
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'KEY-CHRON-K2',
      name: 'Keychron K2 Pro Mechanical Keyboard',
      description: 'Wireless Bluetooth mechanical keyboard with QMK/VIA programmable firmware and hot-swappable switches.',
      category: 'Peripherals',
      price: 119.00,
      stock: 32,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'KEY-APP-MT',
      name: 'Apple Magic Trackpad',
      description: 'Wireless and rechargeable multi-touch trackpad with edge-to-edge glass and haptic Force Touch.',
      category: 'Peripherals',
      price: 149.00,
      stock: 0,
      image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60'
    },

    // --- AUDIO ---
    {
      sku: 'AUD-SONY-XM5',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Flagship active noise canceling with Dual Processors, 8 microphones, and 30-hour battery life.',
      category: 'Audio',
      price: 399.99,
      stock: 22,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'AUD-AP-PRO2',
      name: 'Apple AirPods Pro (2nd Generation)',
      description: 'Pro-level Active Noise Cancellation with Transparency mode and MagSafe Case (USB-C).',
      category: 'Audio',
      price: 249.00,
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'AUD-YETI-MIC',
      name: 'Logitech Blue Yeti USB Microphone',
      description: 'Tri-capsule array for cardioid, omni, bidirectional and stereo recording patterns.',
      category: 'Audio',
      price: 129.99,
      stock: 3,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=60'
    },

    // --- MOBILE ---
    {
      sku: 'MOB-S24-ULT',
      name: 'Samsung Galaxy S24 Ultra 512GB',
      description: 'Titanium chassis, Snapdragon 8 Gen 3 for Galaxy, 200MP Quad Telephoto Camera system, and S Pen.',
      category: 'Mobile',
      price: 1299.99,
      stock: 14,
      image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'MOB-IPAD-AIR',
      name: 'Apple iPad Air 11" M2 128GB',
      description: 'Liquid Retina display with P3 wide color, Apple M2 chip, Landscape 12MP Center Stage camera.',
      category: 'Mobile',
      price: 599.00,
      stock: 8,
      image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=60'
    },

    // --- ACCESSORIES ---
    {
      sku: 'ACC-ANKER-737',
      name: 'Anker 737 GaNPrime 140W Power Bank',
      description: '24,000mAh portable charger with two-way 140W fast charging and smart color digital display.',
      category: 'Accessories',
      price: 149.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1609592806787-3d9c5d0b9854?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'ACC-CALD-TS4',
      name: 'CalDigit TS4 Thunderbolt 4 Dock',
      description: '18 connectivity ports, 98W Power Delivery host charging, and dual 6K 60Hz display support.',
      category: 'Accessories',
      price: 399.95,
      stock: 0,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60'
    },

    // --- GAMING ---
    {
      sku: 'GAM-PS5-SLIM',
      name: 'Sony PlayStation 5 Slim Console',
      description: '1TB SSD, 4K 120Hz HDR gaming support, and DualSense wireless controller with haptic feedback.',
      category: 'Gaming',
      price: 499.99,
      stock: 16,
      image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'GAM-XBOX-X',
      name: 'Xbox Series X 1TB Console',
      description: '12 teraflops raw graphical processing power, DirectX raytracing, 4K gaming, and Quick Resume.',
      category: 'Gaming',
      price: 479.99,
      stock: 7,
      image_url: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'GAM-STEAM-OLED',
      name: 'Valve Steam Deck OLED 512GB',
      description: '7.4-inch 90Hz HDR OLED screen, custom AMD APU, and 50Wh battery for handheld PC gaming.',
      category: 'Gaming',
      price: 549.00,
      stock: 0,
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60'
    },

    // --- WEARABLES ---
    {
      sku: 'WEAR-AW-U2',
      name: 'Apple Watch Ultra 2 GPS + Cellular',
      description: '49mm titanium case, Action button, precision dual-frequency GPS, and up to 72 hours battery life.',
      category: 'Wearables',
      price: 799.00,
      stock: 20,
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'WEAR-GARMIN-F7',
      name: 'Garmin Fenix 7 Pro Solar Edition',
      description: 'Multisport GPS smartwatch with solar charging lens, built-in LED flashlight, and endurance metrics.',
      category: 'Wearables',
      price: 699.99,
      stock: 6,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60'
    },

    // --- NETWORKING ---
    {
      sku: 'NET-ASUS-AXE',
      name: 'ASUS ROG Rapture GT-AXE16000',
      description: 'Quad-band WiFi 6E gaming router with dual 10G ports and ASUS RangeBoost Plus technology.',
      category: 'Networking',
      price: 649.99,
      stock: 11,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'NET-UBI-UDM',
      name: 'Ubiquiti UniFi Dream Machine Pro',
      description: 'All-in-one enterprise security gateway and network appliance with 10G SFP+ throughput.',
      category: 'Networking',
      price: 379.00,
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'NET-SYN-DS923',
      name: 'Synology DiskStation DS923+ 4-Bay NAS',
      description: 'AMD Ryzen R1600 dual-core, 4GB ECC DDR4 RAM, and dual M.2 NVMe SSD cache acceleration slots.',
      category: 'Networking',
      price: 599.99,
      stock: 2,
      image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=60'
    },

    // --- CAMERAS ---
    {
      sku: 'CAM-SONY-A7IV',
      name: 'Sony Alpha 7 IV Mirrorless Camera',
      description: '33MP Exmor R CMOS sensor, 4K 60p 10-bit video, and real-time eye AF for human, animal, and bird.',
      category: 'Cameras',
      price: 2498.00,
      stock: 9,
      image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'CAM-DJI-POCKET3',
      name: 'DJI Osmo Pocket 3 Creator Combo',
      description: '1-inch CMOS sensor, 4K 120fps recording, 3-axis mechanical gimbal, and 2-inch rotatable OLED screen.',
      category: 'Cameras',
      price: 669.00,
      stock: 15,
      image_url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=60'
    },

    // --- OFFICE & DESK ---
    {
      sku: 'DESK-HERMAN-AER',
      name: 'Herman Miller Aeron Ergonomic Chair',
      description: 'Pellicle suspension breathable mesh, PostureFit SL adjustable spinal support, and graphite frame.',
      category: 'Office',
      price: 1395.00,
      stock: 14,
      image_url: 'https://images.unsplash.com/photo-1580481077197-0306129d297c?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'DESK-BENQ-SCREEN',
      name: 'BenQ ScreenBar Halo Monitor Light',
      description: 'Wireless controller, auto-dimming ambient sensor, back illumination, and zero screen glare.',
      category: 'Office',
      price: 179.00,
      stock: 0,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60'
    }
  ];

  // Insert items idempotently (skip if SKU already exists)
  for (const item of productsList) {
    const exists = await knex('products').where({ sku: item.sku }).first();
    if (!exists) {
      await knex('products').insert(item);
    }
  }
}

