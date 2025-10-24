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
  let coffeeCategory, teaCategory, toppingCategory;
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    coffeeCategory = await prisma.category.create({
      data: {
        name: 'Coffee',
        sort_index: 1,
        is_parent_category: true,
      },
    });

    teaCategory = await prisma.category.create({
      data: {
        name: 'Tea',
        sort_index: 2,
        is_parent_category: true,
      },
    });

    // Topping category (for items like 'Pearl', 'Cheese Foam')
    toppingCategory = await prisma.category.create({
      data: {
        name: 'Topping',
        sort_index: 99,
        is_parent_category: false,
      },
    });

    Logger.log('✅ Seeded categories');
  } else {
    coffeeCategory = await prisma.category.findFirst({ where: { name: 'Coffee' } });
    teaCategory = await prisma.category.findFirst({ where: { name: 'Tea' } });
    toppingCategory = await prisma.category.findFirst({ where: { name: 'Topping' } });
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
  let sugarGroup, iceGroup;
  const optionGroupCount = await prisma.optionGroup.count();
  if (optionGroupCount === 0) {
    sugarGroup = await prisma.optionGroup.create({
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

    iceGroup = await prisma.optionGroup.create({
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
    sugarGroup = await prisma.optionGroup.findFirst({ where: { name: 'Sugar Level' } });
    iceGroup = await prisma.optionGroup.findFirst({ where: { name: 'Ice Level' } });
    Logger.warn('⚠️ Option groups already exist, skipping...');
  }

  // =======================
  // 6. Seed Toppings (as Products)
  // =======================
  // **FIX**: Toppings are Products, not a separate model.
  if (!toppingCategory) throw new Error('Topping category not found');

  const toppingCount = await prisma.product.count({
    where: { category_id: toppingCategory.id },
  });

  if (toppingCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Pearl',
          price: 5000,
          is_multi_size: false,
          isTopping: true,
          category_id: toppingCategory.id,
        },
        {
          name: 'Cheese Foam',
          price: 10000,
          is_multi_size: false,
          isTopping: true,
          category_id: toppingCategory.id,
        },
      ],
    });
    Logger.log('✅ Seeded toppings (as Products)');
  } else {
    Logger.warn('⚠️ Toppings already exist, skipping...');
  }

  // =======================
  // 7. Seed Product
  // =======================
  const productCount = await prisma.product.count({ where: { NOT: { category_id: toppingCategory.id } } });
  if (productCount === 0) {
    const [sizeS, sizeM, sizeL] = await prisma.size.findMany({
      orderBy: { sort_index: 'asc' },
    });

    // **FIX**: Get OptionValues, not OptionGroups
    const sugarValues = await prisma.optionValue.findMany({
      where: { option_group: { name: 'Sugar Level' } },
    });
    const iceValues = await prisma.optionValue.findMany({
      where: { option_group: { name: 'Ice Level' } },
    });
    const allOptions = [...sugarValues, ...iceValues];

    // **FIX**: Get Topping Products
    const pearl = await prisma.product.findFirst({ where: { name: 'Pearl' } });
    const cheeseFoam = await prisma.product.findFirst({
      where: { name: 'Cheese Foam' },
    });

    if (!coffeeCategory || !pearl || !cheeseFoam) {
      throw new Error('Missing dependencies for product seeding');
    }

    await prisma.product.create({
      data: {
        name: 'Latte',
        is_multi_size: true,
        product_detail: 'Hot or iced latte with espresso and milk',
        category_id: coffeeCategory.id,
        price: 30000, // Base price (e.g., for Medium)
        sizes: {
          create: [
            { size_id: sizeS.id, price: 30000 },
            { size_id: sizeM.id, price: 35000 },
            { size_id: sizeL.id, price: 40000 },
          ],
        },
        optionValues: {
          // **FIX**: Connect to OptionValue IDs
          create: allOptions.map((val) => ({
            option_value_id: val.id,
          })),
        },
        toppings: {
          // **FIX**: Connect to Topping Product IDs
          create: [
            { topping_id: pearl.id },
            { topping_id: cheeseFoam.id },
          ],
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

  // =======================
  // 8. Seed Payment Method
  // =======================
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

  // =======================
  // 9. Seed Units
  // =======================
  const unitCount = await prisma.unit.count();
  if (unitCount === 0) {
    Logger.log('🪄 Seeding units...');
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
    Logger.log('✅ Seeded Unit table');
  } else {
    Logger.warn('⚠️ Units already exist, skipping...');
  }

  // =======================
  // 10. Seed Unit Conversions
  // =======================
  const conversionCount = await prisma.unitConversion.count();
  if (conversionCount === 0) {
    Logger.log('🪄 Seeding unit conversions...');
    const unitMap = await prisma.unit.findMany();
    const getId = (symbol: string) => {
      const u = unitMap.find((x) => x.symbol === symbol);
      if (!u) throw new Error(`Unit with symbol ${symbol} not found`);
      return u.id;
    };

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
    Logger.log('✅ Seeded UnitConversion table');
  } else {
    Logger.warn('⚠️ Unit conversions already exist, skipping...');
  }

  // =======================
  // 11. Seed Materials
  // =======================
  const materialCount = await prisma.material.count();
  if (materialCount === 0) {
    Logger.log('🪄 Seeding materials...');

    const kg = await prisma.unit.findFirst({ where: { symbol: 'kg' } });
    const l = await prisma.unit.findFirst({ where: { symbol: 'l' } });

    if (!kg || !l) {
      throw new Error('❌ Required base units not found. Seed Units first!');
    }

    const materials = [
      { name: 'Coffee Beans', remain: 50, unitId: kg.id, code: "cb" }, // 50kg
      { name: 'Fresh Milk', remain: 100, unitId: l.id, code: "fm" }, // 100l
      { name: 'Sugar', remain: 20, unitId: kg.id, code: "sg" }, // 20kg
      { name: 'Ice Cubes', remain: 50, unitId: l.id, code: "ic" }, // 50l (as proxy for kg)
    ];

    await prisma.material.createMany({ data: materials });

    Logger.log('✅ Seeded Materials');
  } else {
    Logger.warn('⚠️ Materials already exist, skipping...');
  }

  // =======================
  // 12. Seed Recipes
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
  // 13. Seed MaterialRecipe
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

    // base consumption (in kg/l) for a Medium Latte
    await prisma.materialRecipe.createMany({
      data: [
        { recipeId: latteRecipe.id, materialId: coffeeBeans.id, consume: 0.02, sizeId: 1 }, // 20g
        { recipeId: latteRecipe.id, materialId: milk.id, consume: 0.18, sizeId: 1 }, // 180ml
        { recipeId: latteRecipe.id, materialId: sugar.id, consume: 0.01, sizeId: 1 }, // 10g
      ],
    });

    Logger.log('✅ Seeded MaterialRecipe (Latte)');
  } else {
    Logger.warn('⚠️ MaterialRecipe already exists, skipping...');
  }


  // =======================
  // 15. Seed MaterialImportation
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
          importQuantity: m.remain, // Initial import matches 'remain'
          pricePerUnit: 10000, // Placeholder price
          employeeId: owner.id,
          importDate: new Date(),
        },
      });
    }

    Logger.log('✅ Seeded MaterialImportation');
  } else {
    Logger.warn('⚠️ MaterialImportation already exists, skipping...');
  }

  // =======================
  // 16. Seed Loyal Levels
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
  // 17. Seed Customer User (for points)
  // =======================
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
  // 18. Seed Customer Points
  // =======================
  const customerPointCount = await prisma.customerPoint.count();
  if (customerPointCount === 0) {
    Logger.log('🪄 Seeding Customer Points...');

    const bronzeLevel = await prisma.loyalLevel.findUnique({
      where: { name: 'Bronze' },
    });

    if (customerUser && bronzeLevel) {
      await prisma.customerPoint.create({
        data: {
          points: 25, // Give them some starting points
          customerPhone: customerUser.phone_number,
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
  // 19. Seed Promotions
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
  // 20. Seed ProductPromotion (NEW)
  // =======================
  const productPromoCount = await prisma.productPromotion.count();
  if (productPromoCount === 0) {
    Logger.log('🪄 Seeding ProductPromotions...');
    const latte = await prisma.product.findFirst({ where: { name: 'Latte' } });

    if (summerSale && latte) {
      await prisma.productPromotion.create({
        data: {
          productId: latte.id,
          promotionId: summerSale.id,
          new_price: 30000, // Latte base price (M) is 35k, sale price is 30k
        },
      });
      Logger.log('✅ Seeded ProductPromotion (Latte on Summer Sale)');
    } else {
      Logger.error('❌ Could not seed ProductPromotion. Missing Latte or SummerSale.');
    }
  } else {
    Logger.warn('⚠️ ProductPromotions already exist, skipping...');
  }

  // =======================
  // 21. Seed Vouchers (Was 17)
  // =======================
  const voucherCount = await prisma.voucher.count();
  if (voucherCount === 0) {
    Logger.log('🪄 Seeding Vouchers...');

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const customerUser = await prisma.user.findFirst({
      where: { email: 'customer@example.com' },
    });

    await prisma.voucher.createMany({
      data: [
        {
          code: 'WELCOME10',
          discount_percentage: 10,
          valid_from: today,
          valid_to: nextMonth,
          is_active: true,
        },
        {
          code: 'JOHNDOE20',
          discount_percentage: 20,
          valid_from: today,
          valid_to: nextMonth,
          is_active: true,
          userId: customerUser?.id, // Link to specific customer
        },
      ],
    });
    Logger.log('✅ Seeded Vouchers');
  } else {
    Logger.warn('⚠️ Vouchers already exist, skipping...');
  }

  // =======================
  // 22. Seed Order (NEW)
  // =======================
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    Logger.log('🪄 Seeding a test Order...');

    const customer = await prisma.user.findFirst({
      where: { email: 'customer@example.com' },
    });
    const staff = await prisma.user.findFirst({
      where: { email: 'huynhtandat184@gmail.com' },
    });
    const latte = await prisma.product.findFirst({ where: { name: 'Latte' } });
    const latteMedium = await prisma.productSize.findFirst({
      where: {
        product_id: latte!.id,
        size: { name: 'Medium' },
      },
      include: { size: true }
    });
    const pearlTopping = await prisma.product.findFirst({
      where: { name: 'Pearl' },
    });
    const cashMethod = await prisma.paymentMethod.findFirst({
      where: { name: 'cash' },
    });

    if (!customer || !staff || !latte || !latteMedium || !pearlTopping || !cashMethod) {
      throw new Error('❌ Missing data to create test order.');
    }

    const lattePrice = latteMedium.price; // 35000
    const pearlPrice = pearlTopping.price!; // 5000
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
        status: 'delivered',
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
    Logger.log('✅ Seeded 1 test order');
  } else {
    Logger.warn('⚠️ Orders already exist, skipping...');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });