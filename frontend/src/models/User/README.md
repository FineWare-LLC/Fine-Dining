# The Ultra Over-Engineered User Model
> **Because mere mortals deserve a taste of epic wizardry.**

![User Model Banner](https://img.shields.io/badge/USER%20MODEL-LEGENDARY-purple?style=for-the-badge)

## Table of Contents
1. [Introduction](#introduction)
2. [Folder Structure](#folder-structure)
3. [Enums](#enums)
4. [Sub-Schemas](#sub-schemas)
5. [Main User Schema](#main-user-schema)
6. [Pre-Save Hooks](#pre-save-hooks)
7. [Instance Methods](#instance-methods)
8. [Static Methods](#static-methods)
9. [Example Usage](#example-usage)
10. [Tips & Best Practices](#tips--best-practices)

---

## Introduction
This **User Model** is a testament to what happens when we take software engineering to the extreme. Split into dedicated files for each logical piece—_Enums_, _Sub-schemas_, _Methods_, _Hooks_, and more—this architecture is designed to be:
- **Highly maintainable**
- **Massively extensible**
- **Nearly bulletproof**

It comes packed with features like:
- Multi-level role-based access control (RBAC)
- Soft-deletion with anonymization
- Payment methods, subscription logic, 2FA, login histories
- Flexible sub-schemas for addresses, preferences, social logins, and more

Dive in. Tweak. Rejoice in your unstoppable fortress of user data.

---

## Folder Structure
Here's how the project is laid out inside `/src/models/User`:

~~~
/src/models/User/
 ├─ enums/
 │   ├─ accountStatusEnum.js
 │   ├─ rolesEnum.js
 │   ├─ subscriptionPlanEnum.js
 │   └─ twoFAMethodEnum.js
 ├─ subSchemas/
 │   ├─ addressSchema.js
 │   ├─ loginHistorySchema.js
 │   ├─ paymentMethodSchema.js
 │   ├─ preferencesSchema.js
 │   ├─ securityQuestionSchema.js
 │   └─ socialAccountSchema.js
 ├─ user.methods.js
 ├─ user.preHooks.js
 ├─ user.statics.js
 ├─ userSchema.js
 └─ index.js
~~~

**Highlights**:
- **`enums/`**: Holds string arrays (`rolesEnum`, `accountStatusEnum`, etc.)
- **`subSchemas/`**: Each file defines a small Mongoose sub-schema
- **`user.methods.js`**: Contains instance methods (e.g., password reset)
- **`user.preHooks.js`**: Pre-save logic for password hashing, anonymization
- **`user.statics.js`**: Static methods on the User model
- **`userSchema.js`**: The grand aggregator that imports & composes everything
- **`index.js`**: The final Mongoose model is created and exported here

---

## Enums
Under the `/enums/` folder, each file exports a simple array:

1. **rolesEnum.js**
   ~~~js
   export default ['ADMIN', 'USER', 'PREMIUM', 'SUPER_ADMIN'];
   ~~~

2. **accountStatusEnum.js**
   ~~~js
   export default ['ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED', 'ARCHIVED'];
   ~~~

3. **subscriptionPlanEnum.js**
   ~~~js
   export default ['FREE', 'PREMIUM', 'ENTERPRISE'];
   ~~~

4. **twoFAMethodEnum.js**
   ~~~js
   export default ['NONE', 'TOTP', 'SMS', 'EMAIL'];
   ~~~

---

## Sub-Schemas
We store repeated or nested data (like addresses, payment methods, preferences) as sub-schemas in the `/subSchemas/` folder, each with `{ _id: false }`. Examples include:

- **paymentMethodSchema.js**
  ~~~js
  const paymentMethodSchema = new mongoose.Schema({
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    last4: { type: String, default: '' },
    expirationDate: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  }, { _id: false });

  export default paymentMethodSchema;
  ~~~

- **addressSchema.js**
  ~~~js
  const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' },
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
  }, { _id: false });

  export default addressSchema;
  ~~~

- **preferencesSchema.js**, **loginHistorySchema.js**,  
  **securityQuestionSchema.js**, **socialAccountSchema.js**, etc.

All of these fit seamlessly into the main user schema as arrays or single embedded objects.

---

## Main User Schema
Defined in `userSchema.js`, it references:
- **Enums** for `role`, `accountStatus`, etc.
- **Sub-schemas** like `paymentMethods`, `addresses`, `loginHistory`.
- A truckload of fields for subscription, 2FA, ephemeral tokens, notifications, and more.

Key fields include:

~~~js
{
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },

  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
  magicLinkToken: String,
  magicLinkExpiry: Date,

  phoneNumber: String,
  phoneVerificationToken: String,
  phoneVerificationExpiry: Date,
  isPhoneVerified: { type: Boolean, default: false },

  role: { type: String, enum: rolesEnum, default: 'USER' },
  accountStatus: { type: String, enum: accountStatusEnum, default: 'ACTIVE' },

  deletedAt: Date,
  archivedAt: Date,

  weight: Number,
  height: Number,
  gender: { type: String, enum: ['MALE','FEMALE','OTHER'], required: true },
  measurementSystem: { type: String, enum: ['METRIC','IMPERIAL'], required: true },
  ...
}
~~~

And it goes on—**over 50** possible fields, plus arrays for addresses, preferences, social accounts, etc.

---

## Pre-Save Hooks
We define `userPreSave` in `user.preHooks.js` and attach it via:

~~~js
userSchema.pre('save', userPreSave);
~~~

This hook:
1. **Hashes password** if it's new/modified using `bcrypt`.
2. **Soft-deletion**: If `accountStatus` is changed to `DELETED`, anonymize the user (scramble email, set `deletedAt`).
3. **Archiving**: If `accountStatus` changes to `ARCHIVED`, set `archivedAt`.

---

## Instance Methods
In `user.methods.js`, each function attaches to `userSchema.methods`:

1. **`generatePasswordResetToken()`**
    - Creates a 32-byte hex token with `crypto.randomBytes`.
    - Sets an expiry of 1 hour.

2. **`validatePasswordResetToken(token)`**
    - Compares the stored token & checks expiry.

3. **`generateMagicLinkToken()`**
    - Similar to reset token but stored in `magicLinkToken`.

4. **`enableTwoFactor(method, secret)`**
    - Sets `twoFactorEnabled = true`, with an optional secret for TOTP.

5. **`disableTwoFactor()`**
    - Sets `twoFactorEnabled = false` & method to `'NONE'`.

6. **`comparePassword(candidatePassword)`**
    - Uses `bcrypt.compare` to validate user password input.

~~~js
// Example usage:
const user = await User.findById(id).select('+password');
if (await user.comparePassword('somePassword')) {
  // Correct password!
}
~~~

---

## Static Methods
In `user.statics.js`, we attach to `userSchema.statics`:

1. **`findByEmailCaseInsensitive(email)`**
    - Lowercases the input to find the correct user record.

2. **`softDeleteUser(userId)`**
    - Sets `accountStatus` to `'DELETED'`, triggering anonymization.

~~~js
await User.softDeleteUser('someUserId');
~~~

---

## Example Usage
Once everything is composed in `userSchema.js` and exported from `index.js`, we can import:

~~~js
import User from 'path/to/models/User';

(async () => {
  // 1) Create a user
  const newUser = await User.create({
    name: 'Gandalf the White',
    email: 'gandalf@mordor.com',
    password: 'youShallNotPass',
    gender: 'OTHER',
    measurementSystem: 'METRIC',
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
  });
  
  // 2) Compare password (login scenario)
  const user = await User.findOne({ email: 'gandalf@mordor.com' }).select('+password');
  const isMatch = await user.comparePassword('youShallNotPass');
  console.log('Correct password?', isMatch); // true or false

  // 3) Generate a password reset token
  const token = user.generatePasswordResetToken();
  await user.save();
  console.log('Reset Token:', token);

  // 4) Soft-delete a user
  await User.softDeleteUser(user._id);
})();
~~~

---

## Tips & Best Practices
- **Index your queries**: `email` is already unique, but for other frequent lookups, add more indexes as needed.
- **Handle sensitive data carefully**: `password` is stored with `select: false`; always `.select('+password')` when comparing.
- **Password history**: Decide how many old hashes to keep, or if you really need them.
- **Security questions**: Always hash answers.
- **Performance**: This model is huge. If you only need minimal user data, consider splitting or microservices.
- **Customize**: Drop sub-schemas or fields not relevant to your app.

May your user data be protected, your code remain clean, and your application flourish!
