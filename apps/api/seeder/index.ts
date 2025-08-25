import 'dotenv/config';
import { DatabaseService } from '../src/db/drizzle.service';
import {
  roleSchema,
  permissionSchema,
  rolePermissionSchema,
} from '../src/db/schemas';

const roleData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./role.json') as (typeof roleSchema)['$inferSelect'][];
const permissionData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./permission.json') as (typeof permissionSchema)['$inferSelect'][];
const rolePermissionData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./role_permission.json') as (typeof rolePermissionSchema)['$inferSelect'][];

async function main() {
  console.log('🚀 Starting comprehensive database seeding...');
  const databaseService = new DatabaseService();

  try {
    // 1. Seed Roles
    console.log('\n📋 Seeding roles...');
    await seedRoles(databaseService);

    // 2. Seed Permissions
    console.log('\n🔐 Seeding permissions...');
    await seedPermissions(databaseService);

    // 3. Seed Role-Permissions
    console.log('\n🔗 Seeding role-permissions...');
    await seedRolePermissions(databaseService);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Roles: ${roleData.length}`);
    console.log(`   - Permissions: ${permissionData.length}`);
    console.log(`   - Role-Permissions: ${rolePermissionData.length}`);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function seedRoles(databaseService: DatabaseService) {
  const existingRoles = await databaseService.db
    .select({ id: roleSchema.id })
    .from(roleSchema);

  const existingRoleIds = existingRoles.map((r) => r.id);
  const rolesToCreate = roleData.filter((r) => !existingRoleIds.includes(r.id));

  if (rolesToCreate.length > 0) {
    await databaseService.db.insert(roleSchema).values(rolesToCreate);
    console.log(`   ✅ Created ${rolesToCreate.length} new roles`);
  } else {
    console.log('   ℹ️  All roles already exist');
  }
}

async function seedPermissions(databaseService: DatabaseService) {
  const existingPermissions = await databaseService.db
    .select({ id: permissionSchema.id })
    .from(permissionSchema);

  const existingPermissionIds = existingPermissions.map((p) => p.id);
  const permissionsToCreate = permissionData.filter(
    (p) => !existingPermissionIds.includes(p.id)
  );

  if (permissionsToCreate.length > 0) {
    await databaseService.db
      .insert(permissionSchema)
      .values(permissionsToCreate);
    console.log(`   ✅ Created ${permissionsToCreate.length} new permissions`);
  } else {
    console.log('   ℹ️  All permissions already exist');
  }
}

async function seedRolePermissions(databaseService: DatabaseService) {
  // Check existing role-permissions
  const existingRolePermissions = await databaseService.db
    .select({
      role_id: rolePermissionSchema.role_id,
      permission_id: rolePermissionSchema.permission_id,
    })
    .from(rolePermissionSchema);

  const existingRolePermissionKeys = existingRolePermissions.map(
    (rp) => `${rp.role_id}-${rp.permission_id}`
  );

  const rolePermissionsToCreate = rolePermissionData.filter(
    (rp) =>
      !existingRolePermissionKeys.includes(`${rp.role_id}-${rp.permission_id}`)
  );

  if (rolePermissionsToCreate.length > 0) {
    await databaseService.db
      .insert(rolePermissionSchema)
      .values(rolePermissionsToCreate);
    console.log(
      `   ✅ Created ${rolePermissionsToCreate.length} new role-permissions`
    );
  } else {
    console.log('   ℹ️  All role-permissions already exist');
  }
}

// Error handling and graceful shutdown
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main()
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  });
