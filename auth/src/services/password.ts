import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

//scrypt is a Node.js built-in module for hashing passwords
// randomBytes is used to generate a random salt
// promisify is used to convert callback-based functions to promise-based
// What Promisify does is it takes a function that uses a callback and returns a new function that returns a promise instead.

const scryptAsync = promisify(scrypt);
//This line converts the scrypt function into a promise-based function
//Promised-based function is a function that returns a promise instead of using a callback

export class Password {
  //This method will hash the password using bcrypt
  static async toHash(password: string) {
    // Generate a random salt
    const salt = randomBytes(8).toString('hex'); // 8 bytes of random data, converted to hex string
    // Hash the password with the salt using scrypt
    const buf = (await scryptAsync(password, salt, 64)) as Buffer; // 64 is the length of the hash

    return `${buf.toString('hex')}.${salt}`; // Return the hash and salt concatenated with a dot

    /*The returned string will be in the format: hash.salt
      For example: 'a1b2c3d4e5f6g7h8i9j0.k1l2m3n4o5p6q7r8s9t0'*/
  }

  //This method will compare the stored password with the supplied password
  static async compare(storedPassword: string, suppliedPassword: string) {
    // Split the stored password into hash and salt
    const [hashedPassword, salt] = storedPassword.split('.'); // Split the string into two parts using the dot as a separator
    // Hash the supplied password with the same salt
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer; // Hash the supplied password with the same salt
    // Compare the hashed password with the stored hashed password
    return buf.toString('hex') === hashedPassword; // Return true if they match, false otherwise
  }
}

// Password.hash -->This method will hash the password using bcrypt
// Password.compare -->This method will compare the stored password with the supplied password
