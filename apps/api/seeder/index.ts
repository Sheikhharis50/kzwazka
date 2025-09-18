import 'dotenv/config';
import { DatabaseService } from '../src/db/drizzle.service';
import {
  roleSchema,
  permissionSchema,
  rolePermissionSchema,
  locationSchema,
  userSchema,
  coachSchema,
  groupSchema,
  groupSessionSchema,
} from '../src/db/schemas';

// Define proper types for JSON data
type LocationJsonData = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  opening_time?: string;
  closing_time?: string;
  description?: string;
  amount?: string;
  is_active?: boolean;
};

type CoachJsonData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  photo_url?: string;
  password: string;
  role_id: string;
  location_name: string;
};

type GroupJsonData = {
  name: string;
  description?: string;
  min_age: number;
  max_age: number;
  skill_level: string;
  max_group_size: number;
  location_name: string;
  photo_url?: string;
  coach_email: string;
};

type SessionJsonData = {
  group_name: string;
  day: string;
  start_time: string;
  end_time: string;
};

const roleData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./role.json') as (typeof roleSchema)['$inferSelect'][];
const permissionData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./permission.json') as (typeof permissionSchema)['$inferSelect'][];
const rolePermissionData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./role_permission.json') as (typeof rolePermissionSchema)['$inferSelect'][];
const locationData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./location.json') as LocationJsonData[];
const coachData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./coach.json') as CoachJsonData[];
const groupData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./group.json') as GroupJsonData[];
const sessionData =
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('./session.json') as SessionJsonData[];

// Store ID mappings for reference
const idMappings = {
  locations: new Map<string, number>(),
  coaches: new Map<string, number>(),
  groups: new Map<string, number>(),
};

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
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

    // 4. Seed Locations
    console.log('\n📍 Seeding locations...');
    await seedLocations(databaseService);

    // 5. Seed Coaches (Users + Coach records)
    console.log('\n👨‍🏫 Seeding coaches...');
    await seedCoaches(databaseService);

    // 6. Seed Groups
    console.log('\n👥 Seeding groups...');
    await seedGroups(databaseService);

    // 7. Seed Group Sessions
    console.log('\n📅 Seeding group sessions...');
    await seedGroupSessions(databaseService);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Roles: ${roleData.length}`);
    console.log(`   - Permissions: ${permissionData.length}`);
    console.log(`   - Role-Permissions: ${rolePermissionData.length}`);
    console.log(`   - Locations: ${locationData.length}`);
    console.log(`   - Coaches: ${coachData.length}`);
    console.log(`   - Groups: ${groupData.length}`);
    console.log(`   - Sessions: ${sessionData.length}`);
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

async function seedLocations(databaseService: DatabaseService) {
  // Get existing locations by name to avoid duplicates
  const existingLocations = await databaseService.db
    .select({ id: locationSchema.id, name: locationSchema.name })
    .from(locationSchema);

  const existingLocationNames = new Set(existingLocations.map((l) => l.name));

  // Store existing location mappings
  existingLocations.forEach((loc) => {
    if (loc.name) {
      idMappings.locations.set(loc.name, loc.id);
    }
  });

  const locationsToCreate = locationData.filter(
    (l) => l.name && !existingLocationNames.has(l.name)
  );

  if (locationsToCreate.length > 0) {
    // Transform the data to match the database schema
    const locationRecords = locationsToCreate.map((loc) => ({
      name: loc.name,
      address1: loc.address1,
      address2: loc.address2 || null,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      opening_time: loc.opening_time || null,
      closing_time: loc.closing_time || null,
      description: loc.description || null,
      amount: loc.amount || null,
      is_active: loc.is_active ?? true,
    }));

    const insertedLocations = await databaseService.db
      .insert(locationSchema)
      .values(locationRecords)
      .returning({ id: locationSchema.id, name: locationSchema.name });

    // Store new location mappings
    insertedLocations.forEach((loc) => {
      if (loc.name) {
        idMappings.locations.set(loc.name, loc.id);
      }
    });

    console.log(`   ✅ Created ${locationsToCreate.length} new locations`);
  } else {
    console.log('   ℹ️  All locations already exist');
  }
}

async function seedCoaches(databaseService: DatabaseService) {
  // Get existing users by email to avoid duplicates
  const existingUsers = await databaseService.db
    .select({ id: userSchema.id, email: userSchema.email })
    .from(userSchema);

  const existingUserEmails = new Set(existingUsers.map((u) => u.email));

  // Store existing user mappings
  existingUsers.forEach((user) => {
    idMappings.coaches.set(user.email, user.id);
  });

  const coachesToCreate = coachData.filter(
    (c) => !existingUserEmails.has(c.email)
  );

  if (coachesToCreate.length > 0) {
    // Create user records first
    const userRecords = coachesToCreate.map((coach) => ({
      first_name: coach.first_name,
      last_name: coach.last_name,
      email: coach.email,
      phone: coach.phone,
      photo_url: coach.photo_url,
      password: coach.password,
      role_id: coach.role_id,
      is_active: true,
      is_verified: true,
    }));

    const insertedUsers = await databaseService.db
      .insert(userSchema)
      .values(userRecords)
      .returning({ id: userSchema.id, email: userSchema.email });

    // Store new user mappings
    insertedUsers.forEach((user) => {
      idMappings.coaches.set(user.email, user.id);
    });

    // Create coach records
    const coachRecords = coachesToCreate.map((coach) => {
      const userId = idMappings.coaches.get(coach.email);
      const locationId = idMappings.locations.get(coach.location_name);

      if (!userId) {
        throw new Error(`User not found for email: ${coach.email}`);
      }
      if (!locationId) {
        throw new Error(`Location not found for name: ${coach.location_name}`);
      }

      return {
        user_id: userId,
        location_id: locationId,
      };
    });

    await databaseService.db.insert(coachSchema).values(coachRecords);
    console.log(`   ✅ Created ${coachesToCreate.length} new coaches`);
  } else {
    console.log('   ℹ️  All coaches already exist');
  }
}

async function seedGroups(databaseService: DatabaseService) {
  // Get existing groups by name to avoid duplicates
  const existingGroups = await databaseService.db
    .select({ id: groupSchema.id, name: groupSchema.name })
    .from(groupSchema);

  const existingGroupNames = new Set(existingGroups.map((g) => g.name));

  // Store existing group mappings
  existingGroups.forEach((group) => {
    idMappings.groups.set(group.name, group.id);
  });

  const groupsToCreate = groupData.filter(
    (g) => !existingGroupNames.has(g.name)
  );

  if (groupsToCreate.length > 0) {
    const groupRecords = groupsToCreate.map((group) => {
      const locationId = idMappings.locations.get(group.location_name);
      const coachId = idMappings.coaches.get(group.coach_email);

      if (!locationId) {
        throw new Error(`Location not found for name: ${group.location_name}`);
      }
      if (!coachId) {
        throw new Error(`Coach not found for email: ${group.coach_email}`);
      }

      return {
        name: group.name,
        description: group.description,
        min_age: group.min_age,
        max_age: group.max_age,
        skill_level: group.skill_level,
        max_group_size: group.max_group_size,
        location_id: locationId,
        photo_url: group.photo_url,
        coach_id: coachId,
      };
    });

    const insertedGroups = await databaseService.db
      .insert(groupSchema)
      .values(groupRecords)
      .returning({ id: groupSchema.id, name: groupSchema.name });

    // Store new group mappings
    insertedGroups.forEach((group) => {
      idMappings.groups.set(group.name, group.id);
    });

    console.log(`   ✅ Created ${groupsToCreate.length} new groups`);
  } else {
    console.log('   ℹ️  All groups already exist');
  }
}

async function seedGroupSessions(databaseService: DatabaseService) {
  // Get existing sessions to avoid duplicates
  const existingSessions = await databaseService.db
    .select({
      id: groupSessionSchema.id,
      group_id: groupSessionSchema.group_id,
      day: groupSessionSchema.day,
      start_time: groupSessionSchema.start_time,
    })
    .from(groupSessionSchema);

  const existingSessionKeys = new Set(
    existingSessions.map((s) => `${s.group_id}-${s.day}-${s.start_time}`)
  );

  const sessionsToCreate = sessionData.filter((session) => {
    const groupId = idMappings.groups.get(session.group_name);
    if (!groupId) {
      console.warn(`   ⚠️  Group not found for name: ${session.group_name}`);
      return false;
    }
    const sessionKey = `${groupId}-${session.day}-${session.start_time}`;
    return !existingSessionKeys.has(sessionKey);
  });

  if (sessionsToCreate.length > 0) {
    const sessionRecords = sessionsToCreate.map((session) => {
      const groupId = idMappings.groups.get(session.group_name);

      if (!groupId) {
        throw new Error(`Group not found for name: ${session.group_name}`);
      }

      return {
        group_id: groupId,
        day: session.day,
        start_time: session.start_time,
        end_time: session.end_time,
      };
    });

    await databaseService.db.insert(groupSessionSchema).values(sessionRecords);

    console.log(`   ✅ Created ${sessionsToCreate.length} new group sessions`);
  } else {
    console.log('   ℹ️  All group sessions already exist');
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
