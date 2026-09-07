# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Standardized `CHANGELOG.md` to track project history and releases.
- Added `llms.txt` for AI-friendly documentation and repository context indexing.

### Changed
- Refactored frontend navigation types to use discriminated unions (`NavLeafItem`, `NavGroupItem`) with appropriate type guards.

### Fixed
- Resolved cascading render issues (`react-hooks/set-state-in-effect`) in checkout and settings components.
- Fixed missing hook dependencies across multiple React components (`pos/index`, `checkout-dialog`, `category-dialog`, `employee-dialog`).
- Cleaned up unused imports and variables to adhere to strict ESLint rules.
- Configured ESLint to ignore AI-generated folders (`.agents`, `.claude`, `.opencode`, `.github`), avoiding false positive lint errors.
