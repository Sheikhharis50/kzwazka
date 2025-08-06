import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { userSchema, roleSchema, childrenSchema } from 'src/db/schemas';
const db = drizzle(process.env.DATABASE_URL!);
async function main() {
  const user: typeof userSchema.$inferInsert = {
    id: '1',
    password: '123456',
    role_id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    created_at: new Date(),
    updated_at: new Date(),
  };

  await db.insert(userSchema).values(user);
  console.log('New user created!');

  const usersData = await db.select().from(userSchema);
  console.log('Getting all users from the database: ', usersData);
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  await db
    .update(userSchema)
    .set({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      updated_at: new Date(),
    })
    .where(eq(userSchema.email, user.email));
  console.log('User info updated!');

  await db.delete(userSchema).where(eq(userSchema.email, user.email));
  console.log('User deleted!');
}

main();
