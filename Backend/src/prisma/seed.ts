import { PrismaClient, Category, Role, Size, Unit } from '@prisma/client';
import * as argon from 'argon2';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('PrismaSeed');

// --- Config ---
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'datrootx@gmail.com';
const OWNER_PHONE = process.env.OWNER_PHONE || '09875954408';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || '123456';
const OWNER_FIRSTNAME = process.env.OWNER_FISRTNAME || 'Dat';
const OWNER_LASTNAME = process.env.OWNER_LASTNAME || 'Huynh';

/**
 * Seeds all roles using upsert for idempotency.
 */
async function seedRoles() {
  logger.log('🪄 Seeding roles...');
  const roles = [
    { role_name: 'owner' },
    { role_name: 'manager' },
    { role_name: 'staff' },
    { role_name: 'barista' },
    { role_name: 'baker' },
    { role_name: 'customer' },
    { role_name: 'stocktaker' },
    { role_name: 'cashier' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { role_name: role.role_name },
      update: {},
      create: role,
    });
  }
  logger.log('✅ Seeded roles');
  return prisma.role.findMany();
}

/**
 * Seeds the main Owner user.
 */
async function seedOwner() {
  logger.log('🪄 Seeding owner user...');
  const existingOwner = await prisma.user.findUnique({
    where: { email: OWNER_EMAIL },
  });

  if (existingOwner) {
    logger.warn('⚠️ Owner already exists, skipping...');
    return existingOwner;
  }

  const ownerRole = await prisma.role.findUnique({
    where: { role_name: 'owner' },
  });
  if (!ownerRole) throw new Error('Owner role not found. Run seedRoles first.');

  const owner = await prisma.user.create({
    data: {
      phone_number: OWNER_PHONE,
      email: OWNER_EMAIL,
      first_name: OWNER_FIRSTNAME,
      last_name: OWNER_LASTNAME,
      hash: await argon.hash(OWNER_PASSWORD),
      is_locked: false,
      detail: {
        create: {
          birthday: new Date('2000-01-01'),
          sex: 'other',
          avatar_url: 'default.png',
          address: 'Unknown',
        },
      },
      roles: {
        connect: { id: ownerRole.id },
      },
    },
    include: { detail: true, roles: true },
  });
  logger.log('✅ Seeded owner user:', owner.email);
  return owner;
}

/**
 * Seeds static data like Categories, Sizes, Options, and Payment Methods.
 */
async function seedStaticData() {
  logger.log('🪄 Seeding static data (Categories, Sizes, Options, Payments)...');

  // 3. Categories
  const coffeeCategory =
    (await prisma.category.findFirst({ where: { name: 'Coffee' } })) ||
    (await prisma.category.create({
      data: { name: 'Coffee', sort_index: 1, is_parent_category: true },
    }));
  const teaCategory =
    (await prisma.category.findFirst({ where: { name: 'Tea' } })) ||
    (await prisma.category.create({
      data: { name: 'Tea', sort_index: 2, is_parent_category: true },
    }));
  const toppingCategory =
    (await prisma.category.findFirst({ where: { name: 'Topping' } })) ||
    (await prisma.category.create({
      data: { name: 'Topping', sort_index: 99, is_parent_category: false },
    }));
  logger.log('✅ Seeded categories');

  // 4. Sizes
  await prisma.size.upsert({
    where: { name: 'Small' },
    update: {},
    create: { name: 'Small', sort_index: 1 },
  });
  await prisma.size.upsert({
    where: { name: 'Medium' },
    update: {},
    create: { name: 'Medium', sort_index: 2 },
  });
  await prisma.size.upsert({
    where: { name: 'Large' },
    update: {},
    create: { name: 'Large', sort_index: 3 },
  });
  logger.log('✅ Seeded sizes');
  const [sizeS, sizeM, sizeL] = await prisma.size.findMany({
    orderBy: { sort_index: 'asc' },
  });

  // 5. Option Groups
  const sugarOptionGroup =
    (await prisma.optionGroup.findFirst({ where: { name: 'Sugar Level' } })) ||
    (await prisma.optionGroup.create({
      data: {
        name: 'Sugar Level',
        values: {
          create: [
            { name: '0%', sort_index: 1 },
            { name: '50%', sort_index: 2 },
            { name: '100%', sort_index: 3 },
          ],
        },
      },
    }));
  const iceOptionGroup =
    (await prisma.optionGroup.findFirst({ where: { name: 'Ice Level' } })) ||
    (await prisma.optionGroup.create({
      data: {
        name: 'Ice Level',
        values: {
          create: [
            { name: 'No Ice', sort_index: 1 },
            { name: 'Less Ice', sort_index: 2 },
            { name: 'Normal Ice', sort_index: 3 },
          ],
        },
      },
    }));
  logger.log('✅ Seeded option groups');

  // 8. Payment Methods
  await prisma.paymentMethod.upsert({
    where: { name: 'cash' },
    update: {},
    create: { name: 'cash', is_active: true },
  });
  await prisma.paymentMethod.upsert({
    where: { name: 'vnpay' },
    update: {},
    create: { name: 'vnpay', is_active: true },
  });
  logger.log('✅ Seeded payment methods');

  return { coffeeCategory, teaCategory, toppingCategory, sizeS, sizeM, sizeL };
}

/**
 * Seeds products (Toppings first, then main Products).
 */
async function seedProducts(
  categories: { coffeeCategory: Category; toppingCategory: Category },
  sizes: { sizeS: Size; sizeM: Size; sizeL: Size },
) {
  const { coffeeCategory, toppingCategory } = categories;
  const { sizeS, sizeM, sizeL } = sizes;
  logger.log('🪄 Seeding products (toppings and main)...');

  // 6. Seed Toppings (as Products)
  const pearl =
    (await prisma.product.findFirst({ where: { name: 'Pearl' } })) ||
    (await prisma.product.create({
      data: {
        name: 'Pearl',
        price: 5000,
        is_multi_size: false,
        isTopping: true,
        category_id: toppingCategory.id,
      },
    }));
  const cheeseFoam =
    (await prisma.product.findFirst({ where: { name: 'Cheese Foam' } })) ||
    (await prisma.product.create({
      data: {
        name: 'Cheese Foam',
        price: 10000,
        is_multi_size: false,
        isTopping: true,
        category_id: toppingCategory.id,
      },
    }));
  logger.log('✅ Seeded toppings (as Products)');

  // 7. Seed Main Product (Latte)
  const productCount = await prisma.product.count({
    where: { name: 'Latte' },
  });
  let latte;
  if (productCount === 0) {
    const sugarValues = await prisma.optionValue.findMany({
      where: { option_group: { name: 'Sugar Level' } },
    });
    const iceValues = await prisma.optionValue.findMany({
      where: { option_group: { name: 'Ice Level' } },
    });
    const allOptions = [...sugarValues, ...iceValues];

    latte = await prisma.product.create({
      data: {
        name: 'Latte',
        is_multi_size: true,
        product_detail: 'Hot or iced latte with espresso and milk',
        category_id: coffeeCategory.id,
        price: 35000, // Base price (Medium)
        sizes: {
          create: [
            { size_id: sizeS.id, price: 30000 },
            { size_id: sizeM.id, price: 35000 },
            { size_id: sizeL.id, price: 40000 },
          ],
        },
        optionValues: {
          create: allOptions.map((val) => ({
            option_value_id: val.id,
          })),
        },
        toppings: {
          create: [{ topping_id: pearl.id }, { topping_id: cheeseFoam.id }],
        },
        images: {
          create: [
            { image_name: 'latte1.png', sort_index: 1 },
            { image_name: 'latte2.png', sort_index: 2 },
          ],
        },
      },
    });
    logger.log('✅ Seeded main products (Latte)');
  } else {
    latte = await prisma.product.findFirst({ where: { name: 'Latte' } });
    logger.warn('⚠️ Main products already exist, skipping...');
  }

  return { latte, pearl, cheeseFoam };
}

/**
 * Seeds all inventory-related models: Units, Conversions, Materials, Recipes.
 */
async function seedInventory(owner, latte, sizeM) {
  logger.log('🪄 Seeding inventory (Units, Materials, Recipes)...');
  // 9. Seed Units
  const unitsData = [
    { name: 'Gram', symbol: 'g', class: 'weight' },
    { name: 'Kilogram', symbol: 'kg', class: 'weight' },
    { name: 'Milliliter', symbol: 'ml', class: 'volume' },
    { name: 'Liter', symbol: 'l', class: 'volume' },
    { name: 'Piece', symbol: 'pc', class: 'count' },
    { name: 'Pack', symbol: 'pack', class: 'count' },
    { name: 'Box', symbol: 'box', class: 'count' },
    { name: 'Bottle', symbol: 'btl', class: 'count' },
  ];
  for (const unit of unitsData) {
    await prisma.unit.upsert({
      where: { symbol: unit.symbol },
      update: {},
      create: unit,
    });
  }
  logger.log('✅ Seeded Unit table');

  // 10. Seed Unit Conversions
  const unitMap = new Map(
    (await prisma.unit.findMany()).map((u) => [u.symbol, u.id]),
  );
  const getId = (symbol: string) => {
    const id = unitMap.get(symbol);
    if (!id) throw new Error(`Unit with symbol ${symbol} not found`);
    return id;
  };

  const conversions = [
    { from: 'kg', to: 'g', factor: 1000 },
    { from: 'g', to: 'kg', factor: 0.001 },
    { from: 'l', to: 'ml', factor: 1000 },
    { from: 'ml', to: 'l', factor: 0.001 },
  ];
  for (const c of conversions) {
    await prisma.unitConversion.upsert({
      where: {
        from_unit_to_unit: { from_unit: getId(c.from), to_unit: getId(c.to) },
      },
      update: {},
      create: {
        from_unit: getId(c.from),
        to_unit: getId(c.to),
        factor: c.factor,
      },
    });
  }
  logger.log('✅ Seeded UnitConversion table');

  // 11. Seed Materials
  const materialsData = [
    { name: 'Coffee Beans', unitId: getId('kg'), code: 'cb' },
    { name: 'Fresh Milk', unitId: getId('l'), code: 'fm' },
    { name: 'Sugar', unitId: getId('kg'), code: 'sg' },
    { name: 'Ice Cubes', unitId: getId('l'), code: 'ic' },
  ];
  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    await prisma.material.createMany({ data: materialsData });
    logger.log('✅ Seeded Materials');
  } else {
    logger.warn('⚠️ Materials already exist, skipping...');
  }

  // 12. Seed Recipe
  const latteRecipe = await prisma.recipe.upsert({
    where: { product_id: latte.id },
    update: {},
    create: { product_id: latte.id },
  });

  // 13. Seed MaterialRecipe
  const materialRecipeCount = await prisma.materialRecipe.count();
  if (materialRecipeCount === 0) {
    const coffeeBeans = await prisma.material.findFirst({
      where: { code: 'cb' },
    });
    const milk = await prisma.material.findFirst({ where: { code: 'fm' } });
    const sugar = await prisma.material.findFirst({ where: { code: 'sg' } });

    if (!coffeeBeans || !milk || !sugar)
      throw new Error('❌ Missing base materials');

    await prisma.materialRecipe.createMany({
      data: [
        // **FIX**: Using dynamic sizeM.id instead of hardcoded 1
        {
          recipeId: latteRecipe.id,
          materialId: coffeeBeans.id,
          consume: 0.02,
          sizeId: 1,
        }, // 20g
        {
          recipeId: latteRecipe.id,
          materialId: milk.id,
          consume: 0.18,
          sizeId: 2,
        }, // 180ml
        {
          recipeId: latteRecipe.id,
          materialId: sugar.id,
          consume: 0.01,
          sizeId: 3,
        }, // 10g
      ],
    });


    // 15. Seed MaterialImportation
    const importCount = await prisma.materialImportation.count();
    if (importCount === 0) {
      const materials = await prisma.material.findMany();
      for (const m of materials) {
        await prisma.materialImportation.create({
          data: {
            materialId: m.id,
            importQuantity: 10, // Initial import matches 'remain'
            pricePerUnit: 10000, // Placeholder price
            employeeId: owner.id, // **FIX**: Using owner object
            importDate: new Date(new Date().setDate(new Date().getDate() - 3)),
          },
        });
      }
      logger.log('✅ Seeded MaterialImportation');
    } else {
      logger.warn('⚠️ MaterialImportation already exists, skipping...');
    }

    // =======================
    // Seed MaterialRemain (NEW)
    // =======================
    const remainCount = await prisma.materialRemain.count();
    if (remainCount === 0) {
      logger.log('🪄 Seeding MaterialRemain (initial snapshot)...');

      // Create a "snapshot" of the initial inventory
      const materials = await prisma.material.findMany();
      const snapshotData = materials.map(m => ({
        materialId: m.id,
        remain: 10, // Use the initial 10
        date: new Date(),
      }));

      await prisma.materialRemain.createMany({ data: snapshotData });
      logger.log('✅ Seeded MaterialRemain');
    } else {
      logger.warn('⚠️ MaterialRemain already exists, skipping...');
    }
    const contractingCount = await prisma.contracting.count();
    if (contractingCount === 0) {
      logger.log('🪄 Seeding contracting (initial snapshot)...');

      // Create a "snapshot" of the initial inventory
      const materialRemains = await prisma.materialRemain.findMany();
      const snapshotData = materialRemains.map(m => ({
        material_remainId: m.id,
        quantity: 5, // Use the initial 10
        created_at: new Date(),
      }));

      await prisma.contracting.createMany({ data: snapshotData });
      logger.log('✅ Seeded contracting');
    } else {
      logger.warn('⚠️ contracting already exists, skipping...');
    }
    logger.log('✅ Seeded MaterialRecipe (Latte)');
  } else {
    logger.warn('⚠️ MaterialRecipe already exists, skipping...');
  }


  // =======================
  // Seed WasteLog (NEW)
  // =======================
  const wasteLogCount = await prisma.watseLog.count();
  if (wasteLogCount === 0) {
    logger.log('🪄 Seeding WasteLog...');

    const milk = await prisma.material.findFirst({ where: { code: 'fm' } });
    const beans = await prisma.material.findFirst({ where: { code: 'cb' } });

    // Use the 'owner' passed into the seedInventory function
    if (milk && beans && owner) {
      await prisma.watseLog.createMany({
        data: [
          {
            materialId: milk.id,
            quantity: 0.5, // e.g., 0.5 Liters
            reason: 'Spilled during transfer',
            date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
            employeeId: owner.id,
          },
          {
            materialId: beans.id,
            quantity: 1, // e.g., 1 kg
            reason: 'Expired batch',
            date: new Date(new Date().setDate(new Date().getDate() - 2)), // Two days ago
            employeeId: owner.id,
          },
        ],
      });
      logger.log('✅ Seeded WasteLog');
    } else {
      logger.warn('⚠️ Could not seed WasteLog, missing milk/beans/owner.');
    }
  } else {
    logger.warn('⚠️ WasteLog already exists, skipping...');
  }

}

/**
 * Seeds loyalty-related models: Levels, Customer, and CustomerPoints.
 */
async function seedLoyalty() {
  logger.log('🪄 Seeding loyalty data...');
  // 16. Seed Loyal Levels
  await prisma.loyalLevel.upsert({
    where: { name: 'Bronze' },
    update: {},
    create: { name: 'Bronze', required_points: 0 },
  });
  await prisma.loyalLevel.upsert({
    where: { name: 'Silver' },
    update: {},
    create: { name: 'Silver', required_points: 100 },
  });
  await prisma.loyalLevel.upsert({
    where: { name: 'Gold' },
    update: {},
    create: { name: 'Gold', required_points: 500 },
  });
  await prisma.loyalLevel.upsert({
    where: { name: 'Platinum' },
    update: {},
    create: { name: 'Platinum', required_points: 1000 },
  });
  logger.log('✅ Seeded Loyal Levels');
  const bronzeLevel = await prisma.loyalLevel.findUnique({
    where: { name: 'Bronze' },
  });

  // 17. Seed Customer User
  const customerEmail = 'customer@example.com';
  let customerUser = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!customerUser) {
    const customerRole = await prisma.role.findUnique({
      where: { role_name: 'customer' },
    });
    if (!customerRole)
      throw new Error('❌ Customer role not found. Seed roles first!');

    customerUser = await prisma.user.create({
      data: {
        phone_number: '0985954408',
        email: customerEmail,
        first_name: 'John',
        last_name: 'Doe',
        hash: await argon.hash('password123'),
        is_locked: false,
        detail: {
          create: {
            birthday: new Date('1995-05-15'),
            sex: 'male',
            avatar_url: 'default.png',
            address: '123 Main St',
          },
        },
        roles: {
          connect: { id: customerRole.id },
        },
      },
    });
    logger.log('✅ Seeded customer user:', customerUser.email);
  } else {
    logger.warn('⚠️ Customer user already exists, skipping...');
  }

  // 18. Seed Customer Points
  await prisma.customerPoint.upsert({
    where: { customerPhone: customerUser.phone_number },
    update: {},
    create: {
      points: 25,
      customerPhone: customerUser.phone_number,
      loyalLevelId: bronzeLevel!.id,
    },
  });
  logger.log('✅ Seeded Customer Points');
  return { customerUser };
}

/**
 * Seeds promotions and vouchers.
 */
async function seedPromos(latte, customerUser) {
  logger.log('🪄 Seeding promotions and vouchers...');
  // 19. Seed Promotions
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);

  let summerSale = await prisma.promotion.findFirst({
    where: { name: 'Summer Sale 2025' },
  });
  if (!summerSale) {
    summerSale = await prisma.promotion.create({
      data: {
        name: 'Summer Sale 2025',
        description: 'Get 20% off all summer drinks!',
        start_date: today,
        end_date: nextMonth,
        is_active: true,
      },
    });
    logger.log('✅ Created promotion Summer Sale 2025');
  } else {
    logger.log('✅ Promotion already exists: Summer Sale 2025');
  }

  // 20. Seed ProductPromotion
  if (latte) {
    const promoCount = await prisma.productPromotion.count({
      where: { productId: latte.id, promotionId: summerSale.id },
    });
    if (promoCount === 0) {
      await prisma.productPromotion.create({
        data: {
          productId: latte.id,
          promotionId: summerSale.id,
          new_price: 30000,
        },
      });
      logger.log('✅ Seeded ProductPromotion (Latte on Summer Sale)');
    }
  } else {
    logger.warn('⚠️ Latte product not found, skipping ProductPromotion.');
  }

  // 21. Seed Vouchers
  await prisma.voucher.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discount_percentage: 10,
      valid_from: today,
      valid_to: nextMonth,
      is_active: true,
      requirePoint: 200,
      minAmountOrder: 30000,
    },
  });
  await prisma.voucher.upsert({
    where: { code: 'JOHNDOE20' },
    update: {},
    create: {
      code: 'JOHNDOE20',
      discount_percentage: 20,
      valid_from: today,
      valid_to: nextMonth,
      is_active: true,
      requirePoint: 200,
      minAmountOrder: 30000,
      customerPhone: customerUser.phone_number,
    },
  });
  logger.log('✅ Seeded Vouchers');
}

/**
 * Seeds one example order.
 */
async function seedOrder(customer, staff, latte, latteMediumSize, pearlTopping) {
  logger.log('🪄 Seeding a test Order...');
  const orderCount = await prisma.order.count();
  if (orderCount > 0) {
    logger.warn('⚠️ Orders already exist, skipping...');
    return;
  }

  const latteMedium = await prisma.productSize.findFirst({
    where: {
      product_id: latte.id,
      size_id: latteMediumSize.id,
    },
  });
  const cashMethod = await prisma.paymentMethod.findFirst({
    where: { name: 'cash' },
  });

  if (!latteMedium || !cashMethod) {
    throw new Error('❌ Missing data to create test order.');
  }

  const lattePrice = latteMedium.price;
  const pearlPrice = pearlTopping.price!;
  const originalPrice = lattePrice + pearlPrice;

  // 1. Create PaymentDetail
  const payment = await prisma.paymentDetail.create({
    data: {
      payment_method_id: cashMethod.id,
      amount: originalPrice,
      status: 'completed',
    },
  });

  // 2. Create Order
  await prisma.order.create({
    data: {
      original_price: originalPrice,
      final_price: originalPrice,
      status: 'completed', // 'delivered' is not in your schema, using 'completed'
      customerPhone: customer.phone_number,
      staffId: staff.id,
      paymentDetailId: payment.id,
      order_details: {
        create: {
          quantity: 1,
          unit_price: lattePrice,
          product_name: latte.name,
          product_id: latte.id,
          size_id: latteMedium.size_id,
          ToppingOrderDetail: {
            create: {
              quantity: 1,
              unit_price: pearlPrice,
              topping_id: pearlTopping.id,
            },
          },
        },
      },
    },
  });
  logger.log('✅ Seeded 1 test order');
}

/**
 * Main seed function
 */
async function main() {
  logger.log('🚀 Start seeding...');

  // 1. Core Data
  await seedRoles();
  const owner = await seedOwner();
  const { coffeeCategory, teaCategory, toppingCategory, sizeS, sizeM, sizeL } =
    await seedStaticData();

  // 2. Products (Depends on Core Data)
  const { latte, pearl, cheeseFoam } = await seedProducts(
    { coffeeCategory, toppingCategory },
    { sizeS, sizeM, sizeL },
  );
  if (!latte) throw new Error('Latte seeding failed, aborting.');

  // 3. Inventory (Depends on Owner, Products, Sizes)
  await seedInventory(owner, latte, sizeM);

  // 4. Loyalty (Depends on Roles, Levels)
  const { customerUser } = await seedLoyalty();

  // 5. Promotions (Depends on Products, Customers)
  await seedPromos(latte, customerUser);

  // 6. Example Order (Depends on all)
  await seedOrder(customerUser, owner, latte, sizeM, pearl);

  logger.log('🏁 Seeding finished.');
}

// --- Execute ---
main()
  .catch((e) => {
    logger.error('❌ Seeding failed');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });