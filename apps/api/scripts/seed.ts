import 'dotenv/config';
import { DatabaseService } from '../src/db/drizzle.service';
import { roleSchema } from '../src/db/schemas';

async function main() {
  console.log('Seeding database...');
  const databaseService = new DatabaseService();
  // Get existing role names
  const existingRoles = await databaseService.db
    .select({ name: roleSchema.name })
    .from(roleSchema);
  const existingRoleNames = existingRoles.map((r) => r.name);
  // Define the roles to be created
  const rolesToCreate = [
    {
      id: 'admin',
      name: 'admin',
      description: 'Administrator role with full access',
      is_active: true,
    },
    {
      id: 'children',
      name: 'children',
      description: 'Children role with limited access',
      is_active: true,
    },
    {
      id: 'coach',
      name: 'coach',
      description: 'Coach role with specific permissions',
      is_active: true,
    },
  ].filter((r) => !existingRoleNames.includes(r.name));

  // Insert only roles that don't exist
  if (rolesToCreate.length > 0) {
    await databaseService.db.insert(roleSchema).values(rolesToCreate);
    console.log(
      `Created ${rolesToCreate.length} new roles: ${rolesToCreate.map((r) => r.name).join(', ')}`
    );
  } else {
    console.log('All roles already exist in the database.');
  }
  console.log('Database seeding completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
