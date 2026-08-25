# Security Policy

## Supported versions

Sundial is a small, solo-maintained project. Only the **latest release** receives security fixes. Please update before reporting.

| Version | Supported |
| ------- | --------- |
| Latest  | Yes       |
| Older   | No        |

## Reporting a vulnerability

**Do not open a public GitHub issue for security reports.**

Instead, please use GitHub's **private vulnerability reporting** on this repository:

1. Go to the repo's **Security** tab → **Report a vulnerability**.
2. Describe the issue, including steps to reproduce and the impact.
3. Submit. I'll receive it privately.

Alternatively, email me at **yuyik46@gmail.com** with `[Sundial security]` in the subject.

## What to expect

- **Acknowledgement** within 72 hours.
- An initial assessment within 7 days.
- A fix or mitigation timeline communicated once the report is confirmed.
- Coordinated disclosure: I'll credit you in the release notes unless you prefer to remain anonymous.

## Scope

Reports about the Sundial application itself, its local data handling, the token storage mechanism, or the build/release pipeline are all in scope.

Please **do not** report security issues with the upstream [Super Productivity](https://github.com/johannesjo/super-productivity) app or its local REST API to this repository — report those upstream.

## Build signing posture

Current releases are **unsigned** (no Apple Developer ID / Windows code-signing certificate). This means:

- **macOS**: Gatekeeper will warn that the app is "from an unidentified developer." Right-click → **Open** to bypass, or run `xattr -d com.apple.quarantine /path/to/Sundial.app`.
- **Windows**: SmartScreen may show a warning on first launch; click **More info → Run anyway**.

Always download binaries from the official [Releases page](https://github.com/ypk46/sp-sundial/releases). I will never distribute Sundial through any other channel.
