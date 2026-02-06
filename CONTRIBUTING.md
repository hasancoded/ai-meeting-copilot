# Contributing to AI Meeting Copilot

Thank you for your interest in contributing to AI Meeting Copilot! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment for all contributors.

## Getting Started

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-meeting-copilot.git
   cd ai-meeting-copilot
   ```

3. Install dependencies:

   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../web
   npm install
   ```

4. Set up your development environment:

   ```bash
   # Backend
   cd server
   cp .env.development.example .env.development
   # Edit .env.development with your configuration

   # Frontend
   cd ../web
   cp .env.example .env
   ```

5. Run database migrations:

   ```bash
   cd server
   npx prisma migrate dev
   ```

6. Start the development servers:

   ```bash
   # Backend (in one terminal)
   cd server
   npm run dev

   # Frontend (in another terminal)
   cd web
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:

- `feature/add-calendar-integration`
- `fix/upload-error-handling`
- `docs/update-api-documentation`
- `refactor/improve-auth-middleware`

### Making Changes

1. Write clean, readable code following the existing code style
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before committing

### Code Style Guidelines

#### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` types when possible

#### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

#### Backend Code

- Use async/await for asynchronous operations
- Implement proper error handling
- Validate all user inputs with Zod schemas
- Follow RESTful API conventions

### Testing

#### Backend Tests

Run the test suite:

```bash
cd server
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

#### Writing Tests

- Write tests for all new features
- Ensure edge cases are covered
- Use descriptive test names
- Follow the existing test structure

### Commit Message Convention

We follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `chore`: Build/config changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring

**Examples:**

```
feat(meetings): add calendar integration

Implement Google Calendar sync for meetings.
Users can now automatically create calendar events.

Closes #123
```

```
fix(auth): resolve token expiration issue

Fixed bug where JWT tokens were expiring prematurely
due to incorrect time calculation.
```

### Pull Request Process

1. **Update your branch** with the latest main:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes**:

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title following commit message convention
   - Detailed description of changes
   - Screenshots for UI changes
   - Link to related issues

4. **PR Checklist**:
   - [ ] All tests pass
   - [ ] Code follows project style guidelines
   - [ ] Documentation updated (if applicable)
   - [ ] Commit messages follow convention
   - [ ] No merge conflicts with main branch

5. **Code Review**:
   - Address reviewer feedback promptly
   - Make requested changes in new commits
   - Respond to comments and questions

6. **Merge**:
   - Once approved, a maintainer will merge your PR
   - Your branch will be deleted after merge

## Project Structure

### Backend (`server/`)

- `src/routes/` - API route handlers
- `src/services/` - Business logic and external services
- `src/middleware/` - Express middleware
- `src/tests/` - Test files
- `src/utils/` - Utility functions
- `prisma/` - Database schema and migrations

### Frontend (`web/`)

- `src/components/` - React components
- `src/pages/` - Page components
- `src/lib/` - Utility libraries
- `src/store/` - State management
- `src/` - Application entry point

## Adding New Features

### Backend Features

1. **Define the API endpoint** in appropriate route file
2. **Add validation schema** using Zod
3. **Implement business logic** in service layer
4. **Write tests** for the new functionality
5. **Update API documentation** in `docs/API.md`

### Frontend Features

1. **Create components** in appropriate directory
2. **Add routing** if needed in `App.tsx`
3. **Implement state management** using Zustand
4. **Style with TailwindCSS**
5. **Test manually** in development

### Database Changes

1. **Update Prisma schema** in `server/prisma/schema.prisma`
2. **Create migration**:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```
3. **Update TypeScript types** if needed
4. **Test migration** on clean database

## Reporting Bugs

Use GitHub Issues to report bugs. Include:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots or error messages
- Relevant logs

## Requesting Features

Use GitHub Issues for feature requests. Include:

- Clear description of the feature
- Use case and benefits
- Proposed implementation (if applicable)
- Any relevant examples or mockups

## Questions?

- Open a GitHub Discussion for general questions
- Check existing issues and documentation
- Review the API documentation in `docs/API.md`

## License

By contributing to AI Meeting Copilot, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing!
