<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🏗️ **Project Architecture**

### **Architecture Pattern**
**Feature-Based Modular Architecture** where business features are self-contained modules with entities living alongside their business logic.

### **Core Principles**
- ✅ **Feature-First Organization** - Group by business functionality
- ✅ **Entity Colocation** - Entities live with their features
- ✅ **Modular Design** - Self-contained, reusable modules
- ✅ **Smart File Organization** - Files vs folders based on count

## 📁 **Project Structure**

```
src/
├── auth/                           # Authentication & Authorization
│   ├── dto/                        # Multiple DTOs → folder
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/                     # Multiple guards → folder
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── auth.controller.ts          # Single file
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                          # User Management
│   ├── entities/                   # Multiple entities → folder
│   │   ├── user.entity.ts
│   │   └── user-profile.entity.ts
│   ├── dto/                        # Multiple DTOs → folder
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── users.controller.ts         # Single file
│   ├── users.service.ts
│   └── users.module.ts
├── notifications/                  # Simple feature
│   ├── notification.entity.ts      # Single entity → file
│   ├── notification.dto.ts         # Single DTO → file
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   └── notifications.module.ts
├── common/                         # Shared utilities
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── decorators/
├── config/                         # Configuration
├── database/                       # Database setup
│   ├── migrations/
│   └── seeds/
├── app.module.ts                   # Root module
└── main.ts                         # Entry point
```

## 📋 **File/Folder Organization Rules**

### **Decision Tree**
```
Count files in category:
├── 1 file? → Keep as single file
├── 2+ files? → Create folder
└── Future growth expected? → Create folder
```

### **Examples**

**Simple Feature:**
```
notifications/
├── notification.entity.ts      # Only 1 entity
├── notification.dto.ts         # Only 1 DTO
├── notifications.controller.ts
├── notifications.service.ts
└── notifications.module.ts
```

**Complex Feature:**
```
users/
├── entities/                   # Multiple entities
│   ├── user.entity.ts
│   └── user-profile.entity.ts
├── dto/                        # Multiple DTOs
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── users.controller.ts
├── users.service.ts
└── users.module.ts
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
