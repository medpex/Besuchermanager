import { hashPassword } from "../server/utils/crypto";

async function generatePasswordHashes() {
  const passwords = [
    { name: "Admin", password: "J123654789j" },
    { name: "Benutzer", password: "user123" },
    { name: "Admin Test", password: "admin" } // Der Passwort, das offenbar funktioniert
  ];

  for (const user of passwords) {
    const hashedPassword = await hashPassword(user.password);
    console.log(`${user.name}: ${user.password} => ${hashedPassword}`);
  }
}

generatePasswordHashes().catch(console.error);