# GitLab CI Integration

Generate automated changelogs and compliance reports inside GitLab CI/CD runners on commit pushes.

---

## 🚀 `.gitlab-ci.yml` Setup

```yaml
stages:
  - post-build

devdiff:
  stage: post-build
  image: node:20
  variables:
    OPENAI_API_KEY: $OPENAI_API_KEY
  script:
    - npx -y @eldrex/cli generate --output CHANGELOG.md --persona developer
  only:
    - main
```
