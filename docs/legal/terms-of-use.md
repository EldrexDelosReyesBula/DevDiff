# Terms of Use

**Document Version:** v1.6.0  
**Last Updated:** August 8, 2026  
**Effective Date:** June 28, 2026

---

## Introduction

These Terms of Use ("Terms") govern your access to and use of DevDiff, including the CLI (`@eldrex/cli`), VS Code Extension, Gateway, MCP Server, and all associated open-source packages (collectively, the "Software"), made available by Eldrex Delos Reyes Bula ("Maintainer," "we," "us," or "our").

By downloading, installing, or using the Software in any form, you acknowledge that you have read, understood, and agree to be bound by these Terms. **If you do not agree to these Terms, you must not install or use the Software.**

---

## 1. License Grant

### 1.1 MIT License

The Software is distributed under the **MIT License**. A full copy of the license is available at:  
[https://github.com/EldrexDelosReyesBula/devdiff/blob/main/LICENSE](https://github.com/EldrexDelosReyesBula/devdiff/blob/main/LICENSE)

Under this license, you are granted the following rights, free of charge:

| Permission                   | Detail                                                    |
| :--------------------------- | :-------------------------------------------------------- |
| ✅ Personal & Commercial Use | Use DevDiff in any personal or commercial project         |
| ✅ Modification              | Modify the source code to suit your needs                 |
| ✅ Distribution              | Redistribute original or modified versions                |
| ✅ Sublicensing              | Include DevDiff in proprietary or larger software systems |
| ✅ Private Use               | Use without any obligation to publish changes             |

### 1.2 Conditions

The following conditions apply to all uses:

- The original copyright notice and MIT License text must be included in all copies or substantial portions of the Software.
- The Software is provided **"as is,"** without warranty of any kind. See Section 6 for full warranty disclaimer.

---

## 2. Responsible Use of AI Providers

DevDiff is designed to route your local code diffs to AI models for changelog generation. You assume full responsibility for how the Software interacts with AI providers:

2.1 **API Costs.** You are solely responsible for all API usage charges incurred on third-party cloud AI providers (OpenAI, Anthropic, Google Gemini, and others) as a result of using DevDiff. DevDiff does not mediate, reimburse, or cap these costs.

2.2 **Provider Compliance.** You agree to comply fully with the terms of service, acceptable use policies, and data handling agreements of any third-party AI provider you configure with DevDiff.

2.3 **Applicable Law.** You must not use DevDiff to transmit or process data in a manner that violates applicable local, national, or international laws, export control regulations, or AI provider usage policies.

2.4 **No Automatic Cloud Use.** DevDiff never enables cloud AI providers without your explicit configuration. If cloud provider credentials are detected in your environment, they are not used unless you have run `devdiff auth add` or explicitly set a provider in `.devdiff.config.js`.

---

## 3. Prohibited Uses

You agree that you will not use the Software to:

- Generate, distribute, or facilitate the creation of malicious code, malware, ransomware, spyware, or harmful software of any kind
- Attempt to bypass, circumvent, or compromise DevDiff's built-in security controls, including the Injection Guard, Redaction Engine, or Network Guard
- Process, transmit, or expose data belonging to other individuals or organizations without their explicit authorization and in compliance with applicable data protection law
- Impersonate DevDiff, the DevDiff project, or the Maintainer in any context
- Use DevDiff to train competing AI models on your diff context without authorization from relevant data owners
- Use DevDiff in applications or systems where AI-generated content could directly cause harm without human review (e.g., fully automated code deployment without review)

---

## 4. Intellectual Property

4.1 **Source Code.** The DevDiff source code is open source under the MIT License. You may use, fork, and build upon it as permitted by the MIT License.

4.2 **Brand Assets.** The DevDiff name, logo, and associated brand assets (including the DevDiff wordmark and icon) are the intellectual property of Eldrex Delos Reyes Bula. These brand assets are **not** licensed under the MIT License and may not be used in derivative products, forks, or competing tools without explicit written permission from the Maintainer.

4.3 **User Content.** You retain full ownership of your source code and repository content. DevDiff does not claim any rights to your intellectual property.

---

## 5. Third-Party Services

The Software may integrate with third-party services at your direction, including but not limited to Ollama, OpenAI, Anthropic, Google Gemini, Slack, GitHub, and GitLab.

- The Maintainer is not responsible for the availability, security, accuracy, or terms of any third-party service.
- Your use of third-party services is governed by their respective terms of service and privacy policies.
- DevDiff does not warrant that third-party integrations will remain available or compatible in future software versions.

---

## 6. No Warranty

**THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.** To the maximum extent permitted by applicable law, the Maintainer expressly disclaims all warranties, including but not limited to:

- Warranties of merchantability, fitness for a particular purpose, and non-infringement
- Warranties regarding the accuracy, completeness, or reliability of AI-generated changelog outputs
- Warranties regarding the continued availability or uptime of the documentation site or any associated service
- Warranties that the Software will be error-free or that defects will be corrected

---

## 7. Limitation of Liability

To the maximum extent permitted by applicable law, in no event shall the Maintainer, contributors, or sponsors of DevDiff be liable for any:

- Direct, indirect, incidental, special, exemplary, or consequential damages
- Loss of data, profits, revenue, or business opportunities
- Business interruption or system downtime
- Cost of substitute goods or services

arising out of or in connection with your use of or inability to use the Software, even if advised of the possibility of such damages.

If you are dissatisfied with the Software, your sole remedy is to discontinue use.

---

## 8. Indemnification

You agree to indemnify, defend, and hold harmless the Maintainer and contributors from and against any claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or related to:

- Your use of the Software in violation of these Terms
- Your violation of any applicable law or third-party rights
- Your configuration of the Software to interact with AI providers in an unauthorized or unlawful manner

---

## 9. Governing Law & Dispute Resolution

These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction of the Maintainer's domicile, without regard to conflict-of-law principles. Any disputes arising under these Terms shall first be attempted to be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to the courts of competent jurisdiction in the applicable jurisdiction.

---

## 10. Modifications to These Terms

The Maintainer reserves the right to update these Terms at any time. Material changes will be:

- Published to this page with an updated **Document Version** and **Last Updated** date
- Announced in the project's release notes or changelog
- Tracked publicly in git history

Continued use of the Software after publication of updated Terms constitutes acceptance of the revised Terms.

---

## 11. Severability

If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.

---

## 12. Contact

For questions regarding these Terms:

| Channel       | Link                                                                                                     |
| :------------ | :------------------------------------------------------------------------------------------------------- |
| GitHub Issues | [github.com/EldrexDelosReyesBula/devdiff/issues](https://github.com/EldrexDelosReyesBula/devdiff/issues) |
| Email         | eldrexdelosreyesbula@gmail.com                                                                           |
