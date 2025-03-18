## Fork 二次開發管理策略

本文檔描述如何在 fork 的倉庫中進行二次開發，同時保持與上游倉庫同步的能力，確保未來可以輕鬆合併上游的更新。

---

## 1. 程式碼隔離策略

### 1.1 使用命名空間

我們使用 `niio-` 或 `NIIO_` 前綴來標識我們新增的所有文件、類別、函數和變數，以確保我們的自訂內容與上游程式碼清晰區分。

例如：

```javascript
// 新文件命名
niio-helpUrlsManager.js

// 新類別或新函數命名
function niioReplaceHelpUrls() { ... }

// 配置常數
const NIIO_CONFIG = { ... }
```

### 1.2 使用註解標記

在修改原始程式碼的地方，使用特殊註解標記變更：

```javascript
// NIIO-START: helpUrls centralization
import { getHelpUrl } from 'src/common/helpUrls';
// NIIO-END

// 原始程式碼
function originalFunction() {
  // NIIO-MODIFY: 替換硬編碼 URL 為集中化配置
  // 原始程式碼: href="https://help.mingdao.com/worksheet/control-select"
  href={getHelpUrl('worksheet', 'select')}
}
```

這種標記方式的優點：
1. 清楚標示哪些部分是我們的修改
2. 記錄原始程式碼內容
3. 方便未來搜尋修改點

---

## 2. 文件管理策略

### 2.1 擴展而非覆蓋

盡可能透過擴展，而非直接修改原始文件來實現功能：

1. 建立擴展元件或包裝器：
```javascript
// 建立原始元件的包裝器
import OriginalComponent from 'upstream/path/OriginalComponent';

export default function NiioWrappedComponent(props) {
  // 添加自訂邏輯
  return <OriginalComponent {...props} onHelpLinkClick={useNiioHelpLinks} />;
}
```

2. 使用高階元件（HOC）或裝飾器：
```javascript
import { withNiioHelpLinks } from './niio-decorators';
import OriginalComponent from 'upstream/path/OriginalComponent';

export default withNiioHelpLinks(OriginalComponent);
```

### 2.2 集中管理修改

建立專屬目錄來存放二次開發代碼：

```
/src/niio/           # 我們的二次開發程式碼
  /components/       # 自訂或改進的元件
  /helpers/          # 工具函數
  /overrides/        # 對原始程式碼的覆蓋
  /patches/          # 記錄對原始文件的修改
```

---

## 3. 與上游同步的策略

### 3.1 建立穩定的分支結構

```
main                # 主要分支，包含所有二次開發內容
├── upstream        # 跟蹤上游主分支的同步分支
└── features/       # 功能開發分支
    ├── helpurls    # 特定功能分支
    └── ...
```

### 3.2 定期同步上游程式碼

定期從上游獲取更新並合併至 `upstream` 分支：

```bash
# 取得上游更新
git fetch upstream

# 更新 upstream 分支
git checkout upstream
git merge upstream/main

# 合併到 main 分支
git checkout main
git merge --no-ff upstream
```

### 3.3 使用自動化工具記錄修改

編寫腳本來自動掃描與上游的差異：

```bash
#!/bin/bash
# 生成差異報告
git diff upstream/main..main > docs/niio-modifications.diff

# 統計修改的文件數量
echo "修改文件數: $(git diff --name-only upstream/main..main | wc -l)" > docs/niio-stats.txt
```

---

## 4. 針對 helpUrls 的特定策略

### 4.1 使用配置擴展

擴展原始的 `helpUrlConfig`，而非直接覆蓋它：

```javascript
// 導入原始配置
import { originalHelpUrlConfig } from './originalConfig';

// 擴展配置
export const niioHelpUrlConfig = {
  ...originalHelpUrlConfig,
  // 添加我們的自訂配置
  baseUrl: process.env.NIIO_HELP_BASE_URL || originalHelpUrlConfig.baseUrl,
  worksheet: {
    ...originalHelpUrlConfig.worksheet,
    // 添加我們的額外映射
    niioCustomFeature: '/worksheet/niio-custom-feature',
  }
};
```

### 4.2 建立遷移腳本

我們建立了 `CI/scripts/migrateHelpUrls.js`，用於遷移硬編碼的 URL，並可作為未來重構的範本。

### 4.3 文檔化所有修改

在 `docs/help-url-migration.md` 中詳細記錄所有修改，提供遷移指南與示例，確保開發團隊理解我們的變更，並簡化後續維護。

---

## 5. 衝突解決策略

當上游更新與我們的二次開發發生衝突時，處理方式如下：

1. **識別衝突區域**：使用我們的註解標記快速定位衝突點。
2. **分析變更**：理解上游變更的意圖，以及我們修改的目標。
3. **優先採用上游實現**：如果可能，優先使用上游的實現，然後再重新應用我們的修改。
4. **記錄決策**：記錄合併決策的原因，特別是對複雜的合併。

---

## 6. 自動化測試

為我們的二次開發內容建立專屬測試：

```javascript
// tests/niio/helpUrls.test.js
describe('NIIO HelpUrls', () => {
  it('should properly replace original URLs', () => {
    // 測試代碼
  });
});
```

這些測試可確保我們的修改在上游更新後仍能正常運行。

---

## 7. 發布流程

1. 確保所有二次開發程式碼均已正確標記。
2. 執行完整測試套件。
3. 生成差異報告，確保更改符合預期。
4. 創建發布標籤，格式為 `vX.Y.Z-niio.N`，其中：
   - `X.Y.Z` 為上游版本號
   - `N` 為我們的內部版本號

---

## 8. 文檔與知識傳承

1. **所有修改必須包含明確的文檔**，確保其他開發人員能快速理解變更。
2. **維護修改日誌**，記錄所有對上游程式碼的變更，以便日後查詢。
3. **使用內部 Wiki 或知識庫**，共享二次開發的知識與決策。

---

透過這些策略，我們能夠在保持對上游更新的適應性的同時，有效管理我們的二次開發內容，提高開發效率並確保程式碼的可維護性。