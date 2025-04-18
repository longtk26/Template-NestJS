# From Tackman project

## Table of Contents

1. [Introduction](#introduction)
2. [Basic knowledges](#basic-knowledges)
   - [TypeScript types: unknown, void, never, any, null and undefined](#typescript-types-unknown-void-never-any-null-and-undefined)

## Introduction

The Tackman NestJS Template is a comprehensive, production-ready boilerplate for building scalable and maintainable backend applications. This template encapsulates best practices and modern architecture patterns for NestJS applications, allowing developers to rapidly deploy feature-rich services.

Built on top of NestJS, this template incorporates essential modules for authentication, user management, email services, and background processing. It leverages Prisma ORM for type-safe database access, Redis for caching, and implements CASL for flexible authorization policies.

The template is designed with a modular architecture that promotes separation of concerns and maintainability. Whether you're building a simple API or a complex microservice architecture, this template provides the solid foundation you need to get started quickly without compromising on quality or scalability.

Key architectural decisions include:

- **Repository Pattern**: Abstraction layer for data access
- **Modular Structure**: Feature-based organization with clear separation of concerns
- **Dependency Injection**: Leveraging NestJS's powerful DI container for flexible code
- **Background Processing**: Queue-based job processing for handling asynchronous tasks
- **JWT Authentication**: Secure token-based authentication with refresh token support
- **CASL Authorization**: Fine-grained permission control for roles and resources

This template is actively maintained and updated to incorporate the latest security practices and performance optimizations.

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

1. Enable `strictNullChecks` in your TypeScript configuration (already enabled in this template)
2. Use `undefined` for uninitialized variables and optional parameters/properties
3. Use `null` when you want to explicitly indicate absence of a value
4. Use type guards or the non-null assertion operator `!` when you're certain a value isn't null/undefined
