# AI 辩论助手

一个简洁的辩论计时工具，专注于单次辩论赛的计时功能。

## 功能特性

- 🕒 辩论倒计时功能
- ⚙️ 可自定义辩论时间设置
- 🔄 自动推进辩论进程
- ⏸️ 暂停/继续计时
- 🛑 结束辩论确认
- 🎯 自由辩论双计时器
- 🎨 简洁直观的界面设计

## 技术栈

- **前端框架**: Next.js 15.2.4
- **UI 组件**: Radix UI
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **表单处理**: React Hook Form
- **类型检查**: TypeScript
- **构建工具**: pnpm

## 安装

1. 克隆项目

```bash
git clone [项目地址]
cd ai-debate-assistant
```

2. 安装依赖

```bash
pnpm install
```

## 运行

1. 启动开发服务器

```bash
pnpm dev
```

2. 构建生产版本

```bash
pnpm build
```

3. 运行生产版本

```bash
pnpm start
```

## 使用说明

1. 在辩论页面直接设置辩论时间
2. 点击按钮推进辩论进程
3. 使用暂停按钮控制计时
4. 自由辩论时使用正反方各自的计时器
5. 随时可以结束辩论

## 辩论流程

1. 开场陈词：一辩各 3 分钟
2. 自由辩论：双方交替发言各 4 分钟
3. 现场提问：正反方各接受 2 位同学提问（无时间限制）
4. 总结陈词：四辩各 3 分钟

## 环境要求

- Node.js
- pnpm
- 现代浏览器（Chrome、Firefox、Safari 等）

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

[MIT](LICENSE)
