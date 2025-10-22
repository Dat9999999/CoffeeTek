import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();

async function main() {
  // =======================
  // 1. Seed Roles
  // =======================
  const roleCount = await prisma.role.count();
  if (roleCount === 0) {
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
      await prisma.role.create({ data: role });
    }
    Logger.log('✅ Seeded roles');
  } else {
    Logger.warn('⚠️ Roles already exist, skipping...');
  }

  // =======================
  // 2. Seed Owner User
  // =======================
  const ownerEmail = process.env.OWNER_EMAIL || 'huynhtandat184@gmail.com';
  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  if (!existingOwner) {
    const ownerRole = await prisma.role.findUnique({
      where: { role_name: 'owner' },
    });

    const owner = await prisma.user.create({
      data: {
        phone_number: process.env.OWNER_PHONE || '09875954408',
        email: ownerEmail,
        first_name: process.env.OWNER_FISRTNAME || 'Dat',
        last_name: process.env.OWNER_LASTNAME || 'Huynh',
        hash: await argon.hash(process.env.OWNER_PASSWORD || '123456'),
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
          connect: { id: ownerRole?.id },
        },
      },
      include: { detail: true, roles: true },
    });
    Logger.log('✅ Seeded owner user:', owner.email);
  } else {
    Logger.warn('⚠️ Owner already exists, skipping...');
  }

  // =======================
  // 3. Seed Categories
  // =======================
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    const coffeeCategory = await prisma.category.create({
      data: {
        name: 'Coffee',
        sort_index: 1,
        is_parent_category: true,
      },
    });

    const teaCategory = await prisma.category.create({
      data: {
        name: 'Tea',
        sort_index: 2,
        is_parent_category: true,
      },
    });

    Logger.log('✅ Seeded categories');
  } else {
    Logger.warn('⚠️ Categories already exist, skipping...');
  }

  // =======================
  // 4. Seed Size
  // =======================
  const sizeCount = await prisma.size.count();
  if (sizeCount === 0) {
    await prisma.size.createMany({
      data: [
        { name: 'Small', sort_index: 1 },
        { name: 'Medium', sort_index: 2 },
        { name: 'Large', sort_index: 3 },
      ],
    });
    Logger.log('✅ Seeded sizes');
  } else {
    Logger.warn('⚠️ Sizes already exist, skipping...');
  }

  // =======================
  // 5. Seed OptionGroup
  // =======================
  const optionGroupCount = await prisma.optionGroup.count();
  if (optionGroupCount === 0) {
    const sugarGroup = await prisma.optionGroup.create({
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
    });

    const iceGroup = await prisma.optionGroup.create({
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
    });
    Logger.log('✅ Seeded option groups');
  } else {
    Logger.warn('⚠️ Option groups already exist, skipping...');
  }

  // =======================
  // 6. Seed Toppings
  // =======================
  const toppingCount = await prisma.topping.count();
  if (toppingCount === 0) {
    await prisma.topping.createMany({
      data: [
        { name: 'Pearl', price: 5000, sort_index: 1 },
        { name: 'Cheese Foam', price: 10000, sort_index: 2 },
      ],
    });
    Logger.log('✅ Seeded toppings');
  } else {
    Logger.warn('⚠️ Toppings already exist, skipping...');
  }

  // =======================
  // 7. Seed Product
  // =======================
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const coffeeCategory = await prisma.category.findFirst({
      where: { name: 'Coffee' },
    });
    const [sizeS, sizeM, sizeL] = await prisma.size.findMany();

    const sugarGroup = await prisma.optionGroup.findFirst({
      where: { name: 'Sugar Level' },
    });
    const iceGroup = await prisma.optionGroup.findFirst({
      where: { name: 'Ice Level' },
    });
    const pearl = await prisma.topping.findFirst({ where: { name: 'Pearl' } });
    const cheeseFoam = await prisma.topping.findFirst({
      where: { name: 'Cheese Foam' },
    });

    await prisma.product.create({
      data: {
        name: 'Latte',
        is_multi_size: true,
        product_detail: 'Hot or iced latte with espresso and milk',
        category_id: coffeeCategory!.id,
        price: 35000,
        sizes: {
          create: [
            { size_id: sizeS.id, price: 30000 },
            { size_id: sizeM.id, price: 35000 },
            { size_id: sizeL.id, price: 40000 },
          ],
        },
        optionValues: {
          create: [
            { option_value_id: sugarGroup!.id },
            { option_value_id: iceGroup!.id },
          ],
        },
        toppings: {
          create: [{ topping_id: pearl!.id }, { topping_id: cheeseFoam!.id }],
        },
        images: {
          create: [
            { image_name: 'latte1.png', sort_index: 1 },
            { image_name: 'latte2.png', sort_index: 2 },
          ],
        },
      },
    });
    Logger.log('✅ Seeded products');
  } else {
    Logger.warn('⚠️ Products already exist, skipping...');
  }

  // payment method
  const paymeyMethodCount = await prisma.paymentMethod.count();
  if (paymeyMethodCount == 0) {
    Logger.log('🪄 Seeding payment methods...');

    await prisma.paymentMethod.createMany({
      data: [
        {
          name: 'cash',
          is_active: true,
        },
        {
          name: 'vnpay',
          is_active: true,
        },
      ],
    });

    Logger.log('✅ Payment methods seeded successfully!');
  } else {
    Logger.warn('⚠️ Payment method already exist, skipping...');
  }
  const units = [
    { name: 'Gram', symbol: 'g', class: 'weight' },
    { name: 'Kilogram', symbol: 'kg', class: 'weight' },
    { name: 'Milliliter', symbol: 'ml', class: 'volume' },
    { name: 'Liter', symbol: 'l', class: 'volume' },
    { name: 'Piece', symbol: 'pc', class: 'count' },
    { name: 'Pack', symbol: 'pack', class: 'count' },
    { name: 'Box', symbol: 'box', class: 'count' },
    { name: 'Bottle', symbol: 'btl', class: 'count' },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { symbol: unit.symbol },
      update: {},
      create: unit,
    });
  }

  console.log('✅ Seeded Unit table');

  const unitMap = await prisma.unit.findMany();
  const getId = (symbol: string) => {
    const u = unitMap.find((x) => x.symbol === symbol);
    if (!u) throw new Error(`Unit with symbol ${symbol} not found`);
    return u.id;
  };

  // --- 3️⃣ Seed UnitConversion table ---
  const conversions = [
    // weight
    { from: 'kg', to: 'g', factor: 1000 },
    { from: 'g', to: 'kg', factor: 0.001 },

    // volume
    { from: 'l', to: 'ml', factor: 1000 },
    { from: 'ml', to: 'l', factor: 0.001 },
  ];

  for (const c of conversions) {
    await prisma.unitConversion.upsert({
      where: {
        from_unit_to_unit: {
          from_unit: getId(c.from),
          to_unit: getId(c.to),
        },
      },
      update: {},
      create: {
        from_unit: getId(c.from),
        to_unit: getId(c.to),
        factor: c.factor,
      },
    });
  }

  console.log('✅ Seeded UnitConversion table');

  // =======================
  // 8. Seed Materials
  // =======================
  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    Logger.log('🪄 Seeding materials...');

    const kg = await prisma.unit.findFirst({ where: { symbol: 'kg' } });
    const g = await prisma.unit.findFirst({ where: { symbol: 'g' } });
    const ml = await prisma.unit.findFirst({ where: { symbol: 'ml' } });
    const l = await prisma.unit.findFirst({ where: { symbol: 'l' } });

    if (!kg || !g || !ml || !l) {
      throw new Error('❌ Required base units not found. Seed Units first!');
    }

    const materials = [
      { name: 'Coffee Beans', remain: 50, unitId: kg.id },
      { name: 'Fresh Milk', remain: 100, unitId: l.id },
      { name: 'Sugar', remain: 20, unitId: kg.id },
      { name: 'Ice Cubes', remain: 500, unitId: l.id },
    ];

    await prisma.material.createMany({ data: materials });

    Logger.log('✅ Seeded Materials');
  } else {
    Logger.warn('⚠️ Materials already exist, skipping...');
  }

  // =======================
  // 9. Seed Recipes
  // =======================
  const recipeCount = await prisma.recipe.count();
  if (recipeCount === 0) {
    Logger.log('🪄 Seeding recipes...');

    const latte = await prisma.product.findFirst({ where: { name: 'Latte' } });
    if (!latte)
      throw new Error('❌ Product Latte not found. Seed products first!');

    const recipe = await prisma.recipe.create({
      data: {
        product_id: latte.id,
      },
    });

    Logger.log(`✅ Seeded recipe for Latte (id: ${recipe.id})`);
  } else {
    Logger.warn('⚠️ Recipes already exist, skipping...');
  }

  // =======================
  // 10. Seed MaterialRecipe
  // =======================
  const materialRecipeCount = await prisma.materialRecipe.count();
  if (materialRecipeCount === 0) {
    Logger.log('🪄 Seeding material_recipes...');

    const latteRecipe = await prisma.recipe.findFirst({
      where: {
        Product: { name: 'Latte' },
      },
    });
    if (!latteRecipe) throw new Error('❌ Latte recipe not found');

    const coffeeBeans = await prisma.material.findFirst({
      where: { name: 'Coffee Beans' },
    });
    const milk = await prisma.material.findFirst({
      where: { name: 'Fresh Milk' },
    });
    const sugar = await prisma.material.findFirst({ where: { name: 'Sugar' } });

    if (!coffeeBeans || !milk || !sugar)
      throw new Error('❌ Missing base materials');

    // base consumption for a Medium Latte
    await prisma.materialRecipe.createMany({
      data: [
        { recipeId: latteRecipe.id, materialId: coffeeBeans.id, consume: 0.18 },
        { recipeId: latteRecipe.id, materialId: milk.id, consume: 0.3 },
        { recipeId: latteRecipe.id, materialId: sugar.id, consume: 0.08 },
      ],
    });

    Logger.log('✅ Seeded MaterialRecipe (Latte)');
  } else {
    Logger.warn('⚠️ MaterialRecipe already exists, skipping...');
  }

  // =======================
  // 11. Seed ConsumeSize
  // =======================
  const consumeSizeCount = await prisma.consumeSize.count();
  if (consumeSizeCount === 0) {
    Logger.log('🪄 Seeding consume_sizes...');

    const sizes = await prisma.size.findMany();
    const latteRecipe = await prisma.recipe.findFirst({
      where: { Product: { name: 'Latte' } },
      include: { MaterialRecipe: true },
    });

    if (!latteRecipe) throw new Error('❌ Latte recipe not found');

    const sizeMap = Object.fromEntries(sizes.map((s) => [s.name, s.id]));
    const recipes = latteRecipe.MaterialRecipe;

    // For Large size → +20% material usage, Small → -20%
    for (const mr of recipes) {
      await prisma.consumeSize.createMany({
        data: [
          {
            productSizeId: sizeMap['Small'],
            materialRecipeId: mr.id,
            additionalConsume: 4, // rough estimate, e.g., less coffee, milk...
          },
          {
            productSizeId: sizeMap['Medium'],
            materialRecipeId: mr.id,
            additionalConsume: 6,
          },
          {
            productSizeId: sizeMap['Large'],
            materialRecipeId: mr.id,
            additionalConsume: 8,
          },
        ],
      });
    }

    Logger.log('✅ Seeded ConsumeSize');
  } else {
    Logger.warn('⚠️ ConsumeSize already exists, skipping...');
  }

  // =======================
  // 12. Seed MaterialImportation
  // =======================
  const importCount = await prisma.materialImportation.count();
  if (importCount === 0) {
    Logger.log('🪄 Seeding MaterialImportation...');

    const owner = await prisma.user.findFirst({
      where: { email: 'huynhtandat184@gmail.com' },
    });
    if (!owner) throw new Error('❌ Owner not found');

    const materials = await prisma.material.findMany();
    for (const m of materials) {
      await prisma.materialImportation.create({
        data: {
          materialId: m.id,
          importQuantity: m.remain,
          employeeId: owner.id,
          importDate: new Date(),
        },
      });
    }
    // =======================
    // 13. Seed Loyal Levels
    // =======================
    const loyalLevelCount = await prisma.loyalLevel.count();
    if (loyalLevelCount === 0) {
        Logger.log('🪄 Seeding Loyal Levels...');
        await prisma.loyalLevel.createMany({
            data: [
                { name: 'Bronze', required_points: 0 },
                { name: 'Silver', required_points: 100 },
                { name: 'Gold', required_points: 500 },
                { name: 'Platinum', required_points: 1000 },
            ],
        });
        Logger.log('✅ Seeded Loyal Levels');
    } else {
        Logger.warn('⚠️ Loyal Levels already exist, skipping...');
    }

    // =======================
    // 14. Seed Customer User (for points)
    // =======================
    // This is a new customer user, separate from the owner, to test customer points
    const customerEmail = 'customer@example.com';
    let customerUser = await prisma.user.findUnique({
        where: { email: customerEmail },
    });

    if (!customerUser) {
        Logger.log('🪄 Seeding customer user...');
        const customerRole = await prisma.role.findUnique({
            where: { role_name: 'customer' },
        });
        if (!customerRole) throw new Error('❌ Customer role not found. Seed roles first!');

        customerUser = await prisma.user.create({
            data: {
                phone_number: '0123456789',
                email: customerEmail,
                first_name: 'John',
                last_name: 'Doe',
                hash: await argon.hash('password123'), // Simple password for test user
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
        Logger.log('✅ Seeded customer user:', customerUser.email);
    } else {
        Logger.warn('⚠️ Customer user already exists, skipping...');
    }

    // =======================
    // 15. Seed Customer Points
    // =======================
    const customerPointCount = await prisma.customerPoint.count();
    if (customerPointCount === 0) {
        Logger.log('🪄 Seeding Customer Points...');

        // Find the Bronze loyal level
        const bronzeLevel = await prisma.loyalLevel.findUnique({
            where: { name: 'Bronze' },
        });

        if (customerUser && bronzeLevel) {
            // The schema links customerPhone (Int) to User.id (Int)
            await prisma.customerPoint.create({
                data: {
                    points: 25, // Give them some starting points
                    customerPhone: customerUser.phone_number, // This is the user phone number as per schema
                    loyalLevelId: bronzeLevel.id,
                },
            });
            Logger.log('✅ Seeded Customer Points');
        } else {
            Logger.error('❌ Could not seed Customer Points. Missing customer or bronze level.');
        }
    } else {
        Logger.warn('⚠️ Customer Points already exist, skipping...');
    }

    // =======================
    // 16. Seed Promotions
    // =======================
    const promotionCount = await prisma.promotion.count();
    let summerSale;
    if (promotionCount === 0) {
        Logger.log('🪄 Seeding Promotions...');

        const today = new Date();
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);

        summerSale = await prisma.promotion.create({
            data: {
                name: 'Summer Sale 2025',
                description: 'Get 20% off all summer drinks!',
                start_date: today,
                end_date: nextMonth,
                is_active: true,
            },
        });
        Logger.log('✅ Seeded Promotions');
    } else {
        summerSale = await prisma.promotion.findFirst({
            where: { name: 'Summer Sale 2025' },
        });
        Logger.warn('⚠️ Promotions already exist, skipping...');
    }

    // =======================
    // 17. Seed Vouchers
    // =======================
    const voucherCount = await prisma.voucher.count();
    if (voucherCount === 0) {
        Logger.log('🪄 Seeding Vouchers...');

        if (summerSale) {
            await prisma.voucher.create({
                data: {
                    code: 'SUMMER20',
                    discount_percentage: 0.20, // 20%
                    valid_from: summerSale.start_date,
                    valid_to: summerSale.end_date,
                    is_active: true,
                    promotionId: summerSale.id,
                },
            });
            Logger.log('✅ Seeded Vouchers');
        } else {
            Logger.error('❌ Could not seed Voucher. "Summer Sale 2025" promotion not found.');
        }
    } else {
        Logger.warn('⚠️ Vouchers already exist, skipping...');
    }

    // =======================
    // 18. Seed Product Promotions
    // =======================
    const productPromotionCount = await prisma.productPromotion.count();
    if (productPromotionCount === 0) {
        Logger.log('🪄 Seeding Product Promotions...');

        const latte = await prisma.product.findFirst({
            where: { name: 'Latte' },
        });

        if (latte && summerSale) {
            await prisma.productPromotion.create({
                data: {
                    productId: latte.id,
                    promotionId: summerSale.id,
                },
            });
            Logger.log('✅ Seeded Product Promotions (Latte + Summer Sale)');
        } else {
            Logger.error('❌ Could not seed Product Promotion. Missing Latte or Summer Sale.');
        }
    } else {
        Logger.warn('⚠️ Product Promotions already exist, skipping...');
    }

    Logger.log('✅ Seeded MaterialImportation');
  } else {
    Logger.warn('⚠️ MaterialImportation already exists, skipping...');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
