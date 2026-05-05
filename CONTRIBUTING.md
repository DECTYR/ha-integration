# Contributing

Thanks for your interest in improving this integration.

## Clone and test locally

1. Clone the repository.
2. Create a Python virtual environment (3.13+ recommended).
3. Install development dependencies:

   ```bash
   pip install -U pip wheel
   pip install homeassistant pytest-homeassistant-custom-component pytest-asyncio ruff
   ```

4. From the repository root:

   ```bash
   ruff check .
   ruff format --check .
   pytest tests/ -v
   ```

## Pull requests

- Open an issue first for larger changes unless it is a trivial fix.
- Keep commits focused; use [Conventional Commits](https://www.conventionalcommits.org/) when possible (`feat:`, `fix:`, `docs:`, etc.).
- Ensure `ruff check`, `ruff format --check`, and `pytest` pass locally; CI runs the same checks.

See also the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
