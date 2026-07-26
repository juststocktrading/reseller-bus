import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Reseller Bus database...');

  // 1. Seed Super Admin
  const adminEmail = 'admin@resellerbus.co.uk';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        countryCode: '+44',
        mobileNumber: '07344056285',
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('Created Super Admin: admin@resellerbus.co.uk / Password123!');
  }

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Kiddies Mix', slug: 'kiddies-mix', description: 'Premium children & toddlers wholesale bales' },
    { name: 'Women Mix', slug: 'women-mix', description: 'Top UK high street ladies wear & boutique mixes' },
    { name: 'Men Mix', slug: 'men-mix', description: 'Quality mens shirts, trousers, jackets and urban wear' },
    { name: 'General Mix', slug: 'general-mix', description: 'Assorted family mix for market stalls and reseller boutiques' },
    { name: 'Winter Warmers', slug: 'winter-warmers', description: 'Heavyweight hoodies, coats, and winter clothing bales' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories[cat.name] = created.id;
  }

  // 3. Seed Initial 50kg Bales Products
  const productsData = [
    {
      title: '50kg Kiddies Clothing Bale (New With Tags)',
      slug: '50kg-kiddies-clothing-bale',
      categoryId: categories['Kiddies Mix'],
      price: 600.0,
      weightKg: 50,
      grade: 'Cream Grade NWT (95% New with Tags)',
      estimatedPieces: '320 - 380 items',
      avgCostPerPiece: 1.71,
      estimatedResale: 8.50,
      stockCount: 15,
      isPreOrder: false,
      description: 'Assorted UK high street kids clothing including tops, jeans, dresses, hoodies, and babywear. High resale margin product.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      title: '50kg Women Mix Clothing Bale (Cream Grade)',
      slug: '50kg-women-mix-clothing-bale',
      categoryId: categories['Women Mix'],
      price: 500.0,
      weightKg: 50,
      grade: 'Cream Grade NWT (95% New with Tags)',
      estimatedPieces: '160 - 200 items',
      avgCostPerPiece: 2.77,
      estimatedResale: 18.00,
      stockCount: 25,
      isPreOrder: false,
      description: 'Handpicked UK ladies apparel containing dresses, blouses, skirts, trousers, and knitwear. Excellent variety and ready for boutique display.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      title: '50kg Men Mix Clothing Bale (Premium Grade)',
      slug: '50kg-men-mix-clothing-bale',
      categoryId: categories['Men Mix'],
      price: 750.0,
      weightKg: 50,
      grade: 'Cream Grade NWT (95% New with Tags)',
      estimatedPieces: '150 - 190 items',
      avgCostPerPiece: 4.41,
      estimatedResale: 25.00,
      stockCount: 10,
      isPreOrder: false,
      description: 'High demand UK gents clothing mix featuring polo shirts, denim jeans, chinos, jackets, and smart casual shirts.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      title: '50kg General Mix Family Bale',
      slug: '50kg-general-mix-family-bale',
      categoryId: categories['General Mix'],
      price: 590.0,
      weightKg: 50,
      grade: 'Cream Grade NWT (95% New with Tags)',
      estimatedPieces: '200 - 250 items',
      avgCostPerPiece: 2.62,
      estimatedResale: 15.00,
      stockCount: 18,
      isPreOrder: false,
      description: 'Perfect balance of ladies, gents, and children clothing in one 50kg bale. Ideal for market stall owners and multi-category resellers.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80',
      ]),
    },
    {
      title: 'Pre-Order: 50kg Winter Warmers & Jackets Bale',
      slug: 'preorder-50kg-winter-warmers-jackets-bale',
      categoryId: categories['Winter Warmers'],
      price: 680.0,
      weightKg: 50,
      grade: 'Cream Grade NWT (95% New with Tags)',
      estimatedPieces: '140 - 180 items',
      avgCostPerPiece: 4.25,
      estimatedResale: 28.00,
      stockCount: 0,
      isPreOrder: true,
      description: 'High demand pre-order bale containing UK brand coats, heavy jackets, fleece jumpers, and winter wear. Ships upon container arrival.',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80',
      ]),
    },
  ];

  for (const prod of productsData) {
    // Only creates products that don't exist yet (by slug) - never overwrites
    // live price/stock/description edits made through the Admin Panel.
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: prod,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
