
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