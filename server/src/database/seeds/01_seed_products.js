/**
 * Seed: Initial Products Catalog
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const count = await knex('products').count('id as total').first();
  if (count && count.total > 0) {
    return; // Already seeded
  }

  await knex('products').insert([
    {
      sku: 'CLOUD-SRV-01',
      name: 'Cloud Edge Server Pro X1',
      description: 'High-performance edge compute node designed for distributed microservices and containerized workloads.',
      category: 'Hardware',
      price: 1499.00,
      stock: 15,
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'NET-ROUTER-99',
      name: 'Dual-Band Mesh Cloud Gateway',
      description: 'Enterprise-grade mesh gateway with automated failover and Railway internal network bridge support.',
      category: 'Networking',
      price: 289.50,
      stock: 42,
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'DEV-LAPTOP-M3',
      name: 'Developer Workstation Ultra 16',
      description: '32GB RAM, 1TB NVMe, optimized for full-stack Node.js development and Docker container orchestration.',
      category: 'Computers',
      price: 2199.99,
      stock: 8,
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'ACC-KEY-RGB',
      name: 'Mechanical Hot-Swap Cloud Keyboard',
      description: 'Custom mechanical keyboard with programmable macro keys for git operations and cloud deployments.',
      category: 'Accessories',
      price: 129.00,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'IOT-CAM-4K',
      name: 'Smart Cloud Security Camera 4K',
      description: 'Direct streaming to edge CDN with AI-powered human detection and MQTT telemetry.',
      category: 'IoT',
      price: 89.90,
      stock: 110,
      image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=60'
    },
    {
      sku: 'NET-SWITCH-24',
      name: 'Managed 24-Port Gigabit Switch',
      description: 'Layer 2 managed switch with VLAN support, rack-mountable for on-premise cloud hybrid clusters.',
      category: 'Networking',
      price: 349.00,
      stock: 20,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60'
    }
  ]);
}

