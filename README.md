# ResearchOS — 多源证据驱动的 AI 调研决策系统

## 项目简介

我们要做的是一个能把问卷、访谈、舆情等零散研究信息自动整合、分析并直接转成可执行决策建议的 AI 调研决策系统，帮助企业更快看清问题、做对动作、拿到结果。

## 核心价值链

```
决策 → 认知 → 洞察 → 行动 → 回看
```

## 仓库结构

```text
apps/
  web/        Vue 前端应用
  api/        Next.js BFF / API
packages/
  shared/     当前 MVP 共享层（迁移中）
  domain/     目标领域模型与类型包
  mock-data/  目标 mock 数据与 mock repository 包
  config/     共享工程配置预留
specs/
  features/   各功能模块 OpenSpec
  platform/   架构、鉴权、租户等平台规范
docs/
  architecture/
  product/
  adr/
```

详细边界说明见 [docs/architecture/repository-structure.md](docs/architecture/repository-structure.md)。

## 开发约束

- 前端按 `app / features / shared` 分层演进。
- 后端按 `route / modules / shared / infrastructure` 分层演进。
- 新功能先补 `specs/`，再写实现。
- `packages/shared` 是迁移过渡层，后续逐步拆到 `packages/domain` 和 `packages/mock-data`。

## 文档目录

| 文档 | 内容 |
|------|------|
| [01-产品定义](docs/01-产品定义.md) | 产品定位、目标用户、核心价值、对象模型、成功指标 |
| [02-功能架构](docs/02-功能架构.md) | 五层架构（数据层/语义层/推理层/决策层/闭环层）及数据流 |
| [03-闭环试点方案](docs/03-闭环试点方案.md) | 品牌健康度场景试点、功能清单、验证假设、时间线 |
| [04-竞品分析与市场定位](docs/04-竞品分析与市场定位.md) | 全球竞品格局、市场空白、差异化壁垒、定位声明 |
| [07-架构设计-v1.2](docs/07-架构设计-v1.2.md) | 当前架构设计上游文档 |
| [Repository Architecture](docs/architecture/repository-structure.md) | 仓库结构、模块边界、迁移规则 |
| [OpenSpec Template](specs/templates/README.md) | 功能/平台 spec 编写约定 |

## 项目起源

当前 SaaS 项目中图表配置复杂、种类繁多，最初想做"AI 生成图表"。经过深度讨论后发现：

- 现有项目图表能力已经很成熟（30+ 图表类型，ECharts 驱动）
- 项目中已有 AI 问树等 AI 辅助研究能力
- 单纯做"图表生成"或"图表+洞察"缺乏差异化

最终方向升级为：**不做 AI 图表生成器，做多源证据驱动的调研决策系统**。
