# GitLab CI

Generate changelogs automatically inside GitLab runners on commit pushes.

## Setup

Add the job step inside `.gitlab-ci.yml`:

```yaml
stages:
  - post-build

devdiff:
  stage: post-build
  image: node:20
  script:
    - npx @eldrex/cli generate --output CHANGELOG.md
  only:
    - main
```
