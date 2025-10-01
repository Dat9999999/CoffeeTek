
import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';
const prisma = new PrismaClient();

async function main() {
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
    // seed roles
    for (const role of roles) {
        await prisma.role.upsert({
            where: { role_name: role.role_name },
            update: {},
            create: role,
        });
    }

    //seed owner user
    const ownerRole = await prisma.role.findUnique({
        where: { role_name: 'owner' },
    });

    const owner = await prisma.user.upsert({
        where: { phone_number: process.env.OWNER_PHONE || '0123456789' },
        update: {},
        create: {
            phone_number: process.env.OWNER_PHONE || '0123456789',
            email: process.env.OWNER_EMAIL || '',
            first_name: process.env.OWNER_FISRTNAME || 'Dat',
            last_name: process.env.OWNER_LASTNAME || 'Huynh',
            hash: await argon.hash(process.env.OWNER_PASSWORD || '123456'), // password
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
                connect: { id: ownerRole?.id }
            }
        },
        include: { detail: true, roles: true },
    });
    console.log('Seeded owner user:', owner);

    // 1. Category
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

    // 2. Size
    const sizeS = await prisma.size.create({ data: { name: 'Small', sort_index: 1, increase_rate: 0.0 } });
    const sizeM = await prisma.size.create({ data: { name: 'Medium', sort_index: 2, increase_rate: 1.5 } });
    const sizeL = await prisma.size.create({ data: { name: 'Large', sort_index: 3, increase_rate: 3.0 } });

    // 3. OptionGroup + OptionValues (ví dụ: Đường, Đá)
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

    // 4. Toppings
    const pearl = await prisma.topping.create({
        data: { name: 'Pearl', price: 5000, sort_index: 1 },
    });

    const cheeseFoam = await prisma.topping.create({
        data: { name: 'Cheese Foam', price: 10000, sort_index: 2 },
    });

    // 5. Product
    const latte = await prisma.product.create({
        data: {
            name: 'Latte',
            is_multi_size: true,
            product_detail: 'Hot or iced latte with espresso and milk',
            category_id: coffeeCategory.id,
            sizes: {
                create: [
                    { size_id: sizeS.id, price: 30000 },
                    { size_id: sizeM.id, price: 35000 },
                    { size_id: sizeL.id, price: 40000 },
                ],
            },
            optionValues: {
                create: [
                    { option_value_id: sugarGroup.id }, // ví dụ 50%
                    { option_value_id: iceGroup.id },   // Normal Ice
                ],
            },
            toppings: {
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
        include: {
            sizes: true,
            optionValues: true,
            toppings: true,
            images: true,
        },
    });
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