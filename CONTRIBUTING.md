# Contributing to regular-calendar

First off, thank you for considering contributing to regular-calendar! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots, etc.)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Node.js version, browser, etc.)

### Suggesting Features

Feature requests are welcome! Please provide:

- **A clear and descriptive title**
- **A detailed description of the proposed feature**
- **Explain why this feature would be useful**
- **Include mockups or examples if applicable**

### Pull Requests

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**: `pnpm install`
3. **Make your changes** and ensure the code follows our style guidelines.
4. **Add tests** if applicable.
5. **Run the test suite**: `pnpm test`
6. **Run type checking**: `pnpm run type-check`
7. **Run linting**: `pnpm run lint`
8. **Submit a pull request** with a clear description of your changes.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/regular-calendar.git
cd regular-calendar

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the library
pnpm run build

# Type check
pnpm run type-check
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

- Run `pnpm run lint` to check for issues
- Run `pnpm run format` to auto-format your code

## Commit Messages

Please use clear and descriptive commit messages. We recommend following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

## License

By contributing to regular-calendar, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue if you have any questions. We're happy to help!
