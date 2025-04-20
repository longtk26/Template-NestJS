# From Tackman project

## Table of Contents

1. [Introduction](#introduction)
2. [Basic knowledges](#basic-knowledges)
   - [TypeScript types: unknown, void, never, any, null and undefined](#typescript-types-unknown-void-never-any-null-and-undefined)
3. [Handle transaction with prisma using NestJS-CLS](#handle-transaction-with-prisma-using-nestjs-cls)

## Introduction

## Basic knowledges

### TypeScript Types: unknown, void, never, any, null, and undefined

TypeScript's type system includes several special types that can sometimes be confusing but are essential for writing robust applications. This section explains how these types are used and provides guidance for their proper usage.

#### `unknown`

The `unknown` type represents any value but requires type checking before any operations can be performed on it. This is a type-safe alternative to `any`.

```typescript
// Usage in our codebase
function handleExternalData(data: unknown): void {
  // Type checking required before usage
  if (typeof data === 'string') {
    // Now TypeScript knows data is a string
    processString(data);
  } else if (Array.isArray(data)) {
    // Now TypeScript knows data is an array
    processArray(data);
  }
}
```

Use `unknown` when:

- You receive data from external sources (API responses, user input)
- You don't know the type at development time
- You want to ensure type checking before usage

#### `void`

The `void` type represents the absence of any value and is commonly used as the return type of functions that don't return a value.

```typescript
// Example from our codebase
public async sendVerificationEmail(email: string, token: string): Promise<void> {
  await this.mailerService.sendMail({
    to: email,
    subject: 'Email Verification',
    template: './verification',
    context: { token }
  });
}
```

#### `never`

The `never` type represents values that never occur. It's used for functions that never return (they throw exceptions or have infinite loops) or for impossible type conditions.

```typescript
// Example usage
function throwError(message: string): never {
  throw new Error(message);
}

// Used in exhaustive type checking
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

// In discriminated unions
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.trim();
  } else if (typeof value === 'number') {
    return value.toFixed(2);
  } else {
    // This will cause a compile error if new types are added to the union
    assertNever(value);
  }
}
```

#### `any`

The `any` type disables type checking, allowing all operations on values of this type. While convenient, it should be used sparingly as it undermines TypeScript's benefits.

```typescript
// Usage guideline
// AVOID this pattern
function processData(data: any) {
  data.someMethod(); // No type safety!
}

// PREFER this pattern
function processData<T extends { someMethod(): void }>(data: T) {
  data.someMethod(); // Type-safe
}
```

Use `any` only when:

- Working with dynamic content where types cannot be known
- Migrating from JavaScript to TypeScript incrementally
- Integrating with untyped third-party libraries

#### `null` and `undefined`

TypeScript distinguishes between `null` (explicitly empty value) and `undefined` (uninitialized value).

```typescript
// Usage in our template
interface UserPreferences {
  theme: string;
  notifications: boolean;
  profilePicture?: string; // Optional, can be undefined
  lastLogin: Date | null; // Can be explicitly null
}

// Working with null/undefined
function displayUserProfile(preferences: UserPreferences) {
  // Optional chaining for potentially undefined values
  const pictureSrc = preferences.profilePicture?.toString() || 'default.jpg';

  // Nullish coalescing for null or undefined values
  const lastActive = preferences.lastLogin ?? 'Never logged in';
}
```

##### Best Practices

1. Enable `strictNullChecks` in your TypeScript configuration
2. Use `undefined` for uninitialized variables and optional parameters/properties
3. Use `null` when you want to explicitly indicate absence of a value
4. Use type guards or the non-null assertion operator `!` when you're certain a value isn't null/undefined

## Handle transaction with prisma using NestJS-CLS

### What is NestJS-CLS?

NestJS-CLS (Continuation-Local Storage) is a powerful library that provides a way to store and access contextual information throughout the lifecycle of a request. It creates a storage space that persists across asynchronous calls, making it particularly useful for:

- **Request-scoped data sharing**: Share data across different services and methods without explicitly passing it through parameters
- **Transaction management**: Maintain a single transaction context across multiple repository calls
- **User context**: Access the current user information from any part of your application
- **Logging**: Attach request IDs to all log entries related to a specific request

### Before Using NestJS-CLS: Traditional Transaction Management

#### Approach 1: Passing Transaction Around

Without CLS, managing transactions typically required explicitly passing the transaction object through all function calls:

```typescript
// Service layer
async createUser(data: CreateUserDto): Promise<User> {
  return this.prisma.$transaction(async (tx) => {
    // Pass transaction explicitly to all repository methods
    const user = await this.userRepository.create(data, tx);
    await this.tokenRepository.createInitialTokens(user.id, tx);
    await this.profileRepository.createProfile(user.id, data.profile, tx);
    return user;
  });
}

// Repository layer
async create(data: CreateUserDto, tx?: PrismaClient): Promise<User> {
  const prisma = tx || this.prisma;
  return prisma.user.create({
    data: {
      email: data.email,
      password: await this.securityService.hashPassword(data.password)
    }
  });
}
```

**Problems with this approach:**

- Verbose code with transaction objects passed everywhere
- Easy to forget passing the transaction to some methods
- Function signatures become complex with optional transaction parameters

#### Approach 2: Transaction Manager Service

Another approach was to create a transaction manager service:

```typescript
// Transaction manager service
@Injectable()
class TransactionManager {
  private txnPrisma: PrismaClient | null = null;

  get prisma(): PrismaClient {
    return this.txnPrisma || this.prismaService;
  }

  async runInTransaction<T>(callback: () => Promise<T>): Promise<T> {
    if (this.txnPrisma) {
      // Already in a transaction
      return callback();
    }

    return this.prismaService.$transaction(async (tx) => {
      this.txnPrisma = tx;
      try {
        const result = await callback();
        this.txnPrisma = null;
        return result;
      } catch (error) {
        this.txnPrisma = null;
        throw error;
      }
    });
  }
}
```

**Problems with this approach:**

- Still requires careful management of the transaction state

### After Using NestJS-CLS with Prisma Plugin

NestJS-CLS with its Prisma plugin simplifies transaction management significantly:

#### 1. Setup

```typescript
import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { PrismaService } from '../orm/prisma';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
      global: true,
      middleware: { mount: true },
    }),
  ],
})
export class AppClsModule {}
```

#### 2. Simplified Transaction Usage with @Transactional Decorator

```typescript
// user.service.ts
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  @Transactional() // This single decorator handles all transaction logic
  async createUser(data: CreateUserDto): Promise<User> {
    // No need to pass transaction objects around
    const user = await this.userRepository.create(data);
    await this.tokenRepository.createInitialTokens(user.id);
    await this.profileRepository.createProfile(user.id, data.profile);
    return user;
  }
}
```

#### 3. Clean Repository Methods

```typescript
import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

@Injectable()
export abstract class BaseRepository<T, C, O> {
  protected readonly modelName: string;
  protected readonly prisma: TransactionHost<TransactionalAdapterPrisma>;

  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    this.prisma = txHost;
  }

  async create({ data }: { data: C }): Promise<T> {
    return this.prisma.tx[this.modelName].create({
      data,
    });
  }
}
```

### Benefits of the NestJS-CLS Approach

1. **Clean Code**: No need to pass transaction objects through function parameters
2. **Declarative Style**: Simply use `@Transactional()` decorator to define transaction boundaries
3. **Error Handling**: Automatic rollback on errors without try/catch boilerplate
4. **Request-Scoped**: Works correctly even in concurrent requests since the storage is request-scoped

By leveraging NestJS-CLS, we've eliminated the complexity of transaction management while maintaining full transactional integrity in our application.
