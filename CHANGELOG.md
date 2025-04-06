# Changelog

All notable changes to GenSou AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-04-06

### Added
- Initial release of GenSou AI
- Mind map-based story planning interface with React Flow
- Multi-AI model support: GPT-4o, GPT-4 Turbo, Claude 3.5, DeepSeek-V2, Qwen-JP, SakuraLLM, Matsuri
- Rich text editor with TipTap (horizontal and vertical text modes)
- Novel CRUD operations with chapter management (create, edit, delete, reorder)
- Knowledge base management (characters, settings, locations, terms) with tagging
- SEO-optimized landing page with Japanese OpenGraph metadata
- PWA support with offline capabilities
- Dark mode support
- Markdown export
- Docker Compose deployment support
- FastAPI backend with SQLAlchemy ORM
- Next.js 14 frontend with App Router, TypeScript, Tailwind CSS, Shadcn/ui
- Zustand state management

### Changed
- Rebranded from "GenSou (玄想)" to "GenSou AI"
- Updated icon from Brain to Network across all pages
- Improved mobile responsiveness

### Fixed
- Fixed elkjs dependency installation in Docker
- Fixed dark mode styling for React Flow controls
- Improved light mode visibility for pain points cards

---

## Versioning Scheme

- **Major (X.0.0)**: Breaking changes, major feature additions
- **Minor (0.X.0)**: New features, backward-compatible additions
- **Patch (0.0.X)**: Bug fixes, small improvements, documentation updates

---

## Release Notes Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Modified feature description

### Deprecated
- Feature that will be removed in future versions

### Removed
- Feature that has been removed

### Fixed
- Bug fix description

### Security
- Security vulnerability fix
```
