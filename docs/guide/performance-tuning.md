# Performance Tuning & Low-End Device Optimization

DevDiff includes a hardware-aware **Low-End Device Optimizer** (`LowEndOptimizer`) that adapts memory consumption, concurrency, and worker thread pools based on hardware profile.

---

## ⚡ Performance Profiles by Hardware Tier

| Parameter | Low Tier (<= 4GB RAM, <= 2 cores) | Medium Tier (8GB RAM, 4 cores) | High Tier (>= 16GB RAM, >= 8 cores) |
| :--- | :--- | :--- | :--- |
| **Max Heap Cap** | 128 MB | 256 MB | 512 MB |
| **Max Files / Run** | 100 files | 500 files | 5,000 files |
| **Concurrency** | Sequential (1 chunk) | 2 concurrent chunks | 4 concurrent chunks |
| **Worker Threads** | 1 worker | 2 workers | 4 workers |
| **AI Model Tier** | Smallest available | Balanced | Best available |
| **Power Throttling** | Pauses on battery | Active | Active |
| **Thermal Protection** | Pauses when hot | Pauses when hot | Full speed |

---

## 🛡️ Dynamic Battery & Thermal Management

DevDiff detects battery discharging status and CPU thermal state (`normal`, `warm`, `hot`, `critical`) to prevent thermal throttling or draining laptop batteries during long background operations.
