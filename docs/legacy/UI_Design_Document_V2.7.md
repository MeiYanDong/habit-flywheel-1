
# 习惯飞轮 UI设计文档 V2.7（历史参考）

> 历史参考文档，不代表当前主设计方向。
> 这份文档保留 v2.7 阶段的视觉规范、模块布局和组件样式，可作为旧版界面参考。
> 当前产品与信息架构方向请查看 `../plan.md`。

## 概述
习惯飞轮在 v2.7 阶段被设计为一个基于能量系统的习惯管理应用，采用苹果设计风格的紫金黑主题。用户通过完成习惯获得能量，用能量兑换奖励，形成正向反馈循环。

## 整体设计理念
- **设计风格**: 苹果简约风格
- **主题配色**: 紫金黑配色方案
- **交互理念**: 简洁直观，专注用户体验
- **响应式**: 完全适配移动端和桌面端

## 配色系统

### 主色调
```css
--primary-purple: 124 58 237;      /* #7C3AED */
--primary-gold: 245 158 11;        /* #F59E0B */
--primary-dark: 31 41 55;          /* #1F2937 */
```

### 辅助色调
```css
--purple-light: 167 139 250;       /* #A78BFA */
--purple-dark: 91 33 182;          /* #5B21B6 */
--gold-light: 251 191 36;          /* #FBBF24 */
--gold-dark: 217 119 6;            /* #D97706 */
```

### 功能色调
```css
--success: 16 185 129;             /* #10B981 - 绿色，用于成功状态 */
--warning: 245 158 11;             /* #F59E0B - 琥珀色，用于警告 */
--error: 239 68 68;                /* #EF4444 - 红色，用于错误 */
--info: 59 130 246;                /* #3B82F6 - 蓝色，用于信息 */
```

### 中性色调
```css
--background: 0 0% 100%;           /* 白色背景 */
--foreground: 222.2 84% 4.9%;      /* 深灰色文字 */
--muted: 210 40% 96.1%;            /* 浅灰色 */
--muted-foreground: 215.4 16.3% 46.9%; /* 中等灰色文字 */
--border: 214.3 31.8% 91.4%;       /* 边框颜色 */
```

## 字体系统

### 字体族
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### 字体大小层级
```css
text-xs: 0.75rem;     /* 12px - 辅助信息 */
text-sm: 0.875rem;    /* 14px - 次要文字 */
text-base: 1rem;      /* 16px - 正文 */
text-lg: 1.125rem;    /* 18px - 小标题 */
text-xl: 1.25rem;     /* 20px - 标题 */
text-2xl: 1.5rem;     /* 24px - 大标题 */
text-3xl: 1.875rem;   /* 30px - 数字显示 */
```

### 字重
```css
font-medium: 500;     /* 中等粗细 */
font-semibold: 600;   /* 半粗体 */
font-bold: 700;       /* 粗体 */
```

## 圆角系统
```css
--radius: 0.75rem;                 /* 12px - 基础圆角 */
rounded-sm: calc(var(--radius) - 4px); /* 8px */
rounded-md: calc(var(--radius) - 2px); /* 10px */
rounded-lg: var(--radius);             /* 12px */
rounded-xl: 1rem;                      /* 16px */
```

## 阴影系统
```css
.shadow-apple-sm: box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
.shadow-apple-md: box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
.shadow-apple-lg: box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
.shadow-apple-xl: box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
```

## 布局结构

### 整体布局
```
┌─────────────────────────────────────┐
│                                     │
│  [侧边栏 264px]  [主内容区 flex-1]    │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

### 侧边栏设计
- **宽度**: 264px (w-64)
- **背景**: 白色 (bg-white)
- **阴影**: shadow-lg
- **边框**: 右侧边框 (border-r)

#### 侧边栏头部
```
┌─────────────────────┐
│        🌟           │
│    习惯飞轮          │
│  让每一份努力       │
│ 都精准浇灌你的目标   │
└─────────────────────┘
```
- **图标**: 🌟 (text-2xl)
- **标题**: "习惯飞轮" (text-lg font-semibold)
- **副标题**: 两行描述文字 (text-xs text-gray-600)
- **内边距**: p-6

#### 导航菜单
```css
/* 菜单项样式 */
.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  space-x: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: colors;
}

/* 激活状态 */
.nav-item.active {
  background: rgb(237 233 254); /* purple-100 */
  color: rgb(109 40 217);       /* purple-700 */
  border: 1px solid rgb(196 181 253); /* purple-200 */
}

/* 悬停状态 */
.nav-item:hover {
  background: rgb(243 244 246); /* gray-100 */
  color: rgb(17 24 39);         /* gray-900 */
}
```

#### 菜单项列表
1. **今日习惯** - Calendar 图标
2. **习惯管理** - CheckCircle 图标
3. **奖励管理** - Gift 图标
4. **绑定管理** - Link2 图标
5. **历史记录** - BarChart3 图标
6. **设置中心** - Settings 图标

### 主内容区设计
- **布局**: flex-1 p-6 overflow-y-auto
- **背景**: bg-gray-50

## 组件设计规范

### 卡片组件 (Card)
```css
.card {
  background: white;
  border-radius: 12px;
  border: 1px solid rgb(229 231 235); /* gray-200 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 按钮组件设计

#### 主要按钮 (Primary)
```css
.btn-primary {
  background: rgb(124 58 237);      /* purple-600 */
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: rgb(109 40 217);      /* purple-700 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

#### 次要按钮 (Secondary)
```css
.btn-secondary {
  background: rgb(245 158 11);      /* amber-500 */
  color: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: rgb(217 119 6);       /* amber-600 */
}
```

#### 轮廓按钮 (Outline)
```css
.btn-outline {
  border: 1px solid rgb(209 213 219); /* gray-300 */
  color: rgb(55 65 81);               /* gray-700 */
  background: white;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: rgb(167 139 250);     /* purple-400 */
  color: rgb(109 40 217);             /* purple-700 */
  background: rgb(250 245 255);       /* purple-50 */
}
```

### 徽章组件 (Badge)
```css
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 600;
  transition: colors;
}

/* 成功徽章 */
.badge.success {
  background: rgb(220 252 231);      /* green-100 */
  color: rgb(22 101 52);             /* green-800 */
  border: 1px solid rgb(187 247 208); /* green-200 */
}

/* 默认徽章 */
.badge.default {
  background: rgb(243 244 246);      /* gray-100 */
  color: rgb(55 65 81);              /* gray-700 */
  border: 1px solid rgb(229 231 235); /* gray-200 */
}
```

### 进度条组件
```css
.progress-container {
  width: 100%;
  background: rgb(229 231 235);      /* gray-200 */
  border-radius: 9999px;
  height: 8px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(135deg, rgb(124 58 237), rgb(245 158 11));
  height: 100%;
  border-radius: 9999px;
  transition: all 0.5s ease-out;
}
```

## 页面设计规范

### 今日习惯页面

#### 页面头部
```
              今日习惯
    专注今天，让每一次打卡都充满成就感
```
- **标题**: text-2xl font-semibold text-gray-900
- **副标题**: text-gray-600

#### 统计卡片
```
┌─────────────────────────────────────┐
│             2/3                     │
│          今日任务完成               │
│        ⚡ 已获得 50 能量            │
└─────────────────────────────────────┘
```
- **背景**: 紫金渐变 (bg-gradient-to-r from-purple-50 to-amber-50)
- **数字**: text-3xl font-bold text-purple-700
- **描述**: text-sm text-gray-600
- **能量显示**: 琥珀色闪电图标 + text-lg font-medium

#### 习惯卡片网格
- **布局**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- **卡片悬停**: hover:shadow-lg
- **完成状态**: bg-green-50 border-green-200

### 习惯管理页面

#### 页面头部操作栏
```
习惯管理                           [筛选下拉框] [添加习惯按钮]
管理您的习惯，让每一个小目标都成为成长的动力
```

#### 筛选下拉框
```css
.filter-select {
  width: 128px; /* w-32 */
  height: 40px; /* h-10 */
  border: 1px solid rgb(209 213 219); /* border-input */
  border-radius: 6px;
  background: white;
}
```

筛选选项：
1. **活跃习惯** (active)
2. **已归档** (archived)  
3. **全部习惯** (all)

#### 习惯卡片设计
```
┌─────────────────────────────────────┐
│ 每日阅读              [编辑] [删除] │
│ +10⚡ 今日已完成                    │
│                                     │
│ ┌─ 绑定奖励 ──────────────────────┐ │
│ │ iPhone 15 Pro                   │ │
│ │ 120/1000⚡                      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [归档]                              │
└─────────────────────────────────────┘
```

### 奖励管理页面

#### 筛选选项
1. **可兑换** (redeemable) - 显示所有未兑换奖励
2. **已兑换** (redeemed)
3. **全部奖励** (all)

#### 奖励卡片设计
```
┌─────────────────────────────────────┐
│           iPhone 15 Pro             │
│                                     │
│ 进度                          12%   │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│           120/1000⚡                │
│                                     │
│ [🎯 继续努力] / [🎉 立即兑换]        │
└─────────────────────────────────────┘
```

## 交互动画

### 悬停效果
```css
.hover-lift {
  transition: transform 0.2s;
}

.hover-lift:hover {
  transform: scale(1.05);
}
```

### 完成动画
```css
.completion-animation {
  animation: completion-bounce 0.6s ease-out;
}

@keyframes completion-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### 能量图标动画
```css
.energy-icon {
  animation: pulse-energy 2s infinite;
}

@keyframes pulse-energy {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
}
```

## 图标使用规范

### 图标库
使用 lucide-react 图标库

### 常用图标映射
```tsx
import { 
  Calendar,     // 今日习惯
  CheckCircle,  // 习惯管理
  Gift,         // 奖励管理
  Link2,        // 绑定管理
  BarChart3,    // 历史记录
  Settings,     // 设置中心
  Plus,         // 添加
  Edit,         // 编辑
  Trash2,       // 删除
  Target,       // 目标
  Zap,          // 能量
} from 'lucide-react';
```

### 图标大小规范
```css
.icon-xs: h-3 w-3;    /* 12px */
.icon-sm: h-4 w-4;    /* 16px */
.icon-md: h-5 w-5;    /* 20px */
.icon-lg: h-6 w-6;    /* 24px */
```

## 间距系统
```css
space-1: 0.25rem;   /* 4px */
space-2: 0.5rem;    /* 8px */
space-3: 0.75rem;   /* 12px */
space-4: 1rem;      /* 16px */
space-6: 1.5rem;    /* 24px */
space-8: 2rem;      /* 32px */
```

## 响应式断点
```css
sm: 640px;    /* 小屏幕 */
md: 768px;    /* 中等屏幕 */
lg: 1024px;   /* 大屏幕 */
xl: 1280px;   /* 超大屏幕 */
2xl: 1536px;  /* 2K屏幕 */
```

## 移动端适配

### 网格响应式
```css
/* 桌面端：3列 */
.grid-responsive {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .grid-responsive {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-responsive {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

### 移动端侧边栏
在移动端，侧边栏应转换为抽屉式导航或底部导航栏。

## 状态设计

### 加载状态
使用 skeleton 组件或简单的脉冲动画

### 空状态
```
┌─────────────────────────────────────┐
│            🎯 图标                  │
│        还没有活跃的习惯              │
│   点击"添加习惯"开始您的第一个习惯吧！ │
└─────────────────────────────────────┘
```

### 错误状态
使用 toast 组件显示错误信息

## 实现细节

### CSS 类命名规范
- 使用 Tailwind CSS 原子类
- 自定义组件类使用 kebab-case
- 状态类使用前缀：`.is-`, `.has-`

### Z-index 层级
```css
.z-dropdown: 10;
.z-modal: 50;
.z-toast: 100;
```

### 过渡动画时长
```css
.transition-fast: 0.15s;
.transition-normal: 0.2s;
.transition-slow: 0.3s;
```

## 可访问性

### 颜色对比度
所有文字与背景的对比度符合 WCAG 2.1 AA 标准

### 键盘导航
所有交互元素支持键盘导航

### 屏幕阅读器
使用语义化 HTML 和 ARIA 标签

---

## 设计资源

### 渐变定义
```css
.gradient-purple-gold {
  background: linear-gradient(135deg, rgb(124 58 237) 0%, rgb(245 158 11) 100%);
}

.gradient-card {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
}
```

### 文字渐变
```css
.text-gradient-purple-gold {
  background: linear-gradient(135deg, rgb(124 58 237), rgb(245 158 11));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

这份文档涵盖了当前应用的所有设计细节，任何AI都可以根据这份文档准确复刻出相同的界面效果。
