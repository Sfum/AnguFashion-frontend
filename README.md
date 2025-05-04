# AnguFashion

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


my-nestjs-backend/

│
├── src/
│   ├── main.ts                    // Entry point of the application
│   ├── app.module.ts               // Root application module
│   ├── modules/                    // Feature modules go here
│   │   ├── auth/                   // Authentication module for sensitive login/signup logic
│   │   │   ├── auth.module.ts      // Module definition
│   │   │   ├── auth.controller.ts  // REST endpoints for auth
│   │   │   ├── auth.service.ts     // Business logic for authentication
│   │   │   ├── auth.guard.ts       // Guards for protecting routes
│   │   │   ├── dto/                // Data Transfer Objects
│   │   └── product/                // Example: Module for product data (migrated sensitive logic)
│   │       ├── product.module.ts   // Product module definition
│   │       ├── product.controller.ts // REST endpoints for products
│   │       ├── product.service.ts  // Logic for product operations (interacts with Firestore)
│   │       ├── dto/                // DTOs for product data
│   │
│   ├── shared/                     // Reusable utilities, services, or guards
│   │   ├── firestore/              // Firestore setup and logic
│   │   │   ├── firestore.module.ts // Firestore provider module
│   │   │   └── firestore.service.ts // Firestore service (connects to Firestore)
│   │   └── interceptors/           // Custom interceptors
│   │
│   ├── config/                     // Configuration files (for environment, DB connections)
│   ├── environments/               // Environment-specific config (dev, prod)
│   └── tests/                      // Unit and integration tests
│
├── package.json                    // Dependencies and scripts
├── tsconfig.json                   // TypeScript configuration
└── nest-cli.json                   // NestJS CLI configuration
