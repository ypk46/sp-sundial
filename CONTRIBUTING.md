# Contributing to Sundial

Thanks for your interest in Sundial!

Sundial is a solo-maintained project. **I am not accepting code contributions (pull requests) at this time.** I am, however, very glad to receive feedback, bug reports, and feature ideas via GitHub Issues — that input shapes what I work on next.

## Reporting issues and giving feedback

The best way to contribute is to open an issue. Before opening one, please:

1. **Search existing issues** to avoid duplicates.
2. **Update to the latest release** and reproduce the problem there — fixes may already have shipped.
3. **Include the basics** so I can reproduce quickly:
   - Sundial version (see About / window title)
   - Operating system and version (e.g. macOS 15.2 on Apple Silicon, Windows 11, Ubuntu 24.04)
   - Super Productivity desktop version and whether the local REST API is enabled
   - Clear steps to reproduce, expected vs. actual behavior
   - Logs or screenshots if relevant (no private data — see [SECURITY.md](./SECURITY.md) for sensitive reports)

Use the issue templates — they prompt for the details above so you don't have to remember them.

### Bug reports

Open a [bug report](https://github.com/ypk46/sp-sundial/issues/new?template=bug_report.yml). The more reproducible, the faster I can triage.

### Feature requests

Open a [feature request](https://github.com/ypk46/sp-sundial/issues/new?template=feature_request.yml). A clear description of the problem you're trying to solve (not just the solution you imagine) is the most useful thing you can include.

## A note on releases

I use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.) for commit messages. This isn't something you need to follow — it's just why release changelogs look the way they do.

Releases are automated: when enough changes accumulate, a release PR is prepared automatically, I merge it, and binaries for macOS, Windows, and Linux are built and published to the [Releases page](https://github.com/ypk46/sp-sundial/releases).

## Security

Found a security issue? Please don't open a public issue. See [SECURITY.md](./SECURITY.md) for how to report it privately.
