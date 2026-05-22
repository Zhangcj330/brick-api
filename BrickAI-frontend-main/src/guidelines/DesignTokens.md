# Brick AI 设计令牌系统

本文档总结了 Brick AI 房产代理平台的基础设计令牌，确保整个应用的视觉一致性。

## 目录
- [颜色系统](#颜色系统)
- [排版](#排版)
- [间距与尺寸](#间距与尺寸)
- [圆角](#圆角)
- [阴影与视觉效果](#阴影与视觉效果)
- [渐变背景](#渐变背景)
- [组件样式](#组件样式)

---

## 颜色系统

### 主色调 (Primary)
- **primary**: `#030213` (深蓝黑色)
- **primary-foreground**: `oklch(1 0 0)` (纯白)
- **用途**: 主要按钮、导航栏品牌元素、强调文本

### 背景色 (Background)
- **background**: `#ffffff` (纯白)
- **foreground**: `oklch(0.145 0 0)` (深灰黑)
- **card**: `#ffffff` (卡片背景)
- **card-foreground**: `oklch(0.145 0 0)` (卡片文本)

### 次要色调 (Secondary)
- **secondary**: `oklch(0.95 0.0058 264.53)` (极浅紫灰)
- **secondary-foreground**: `#030213` (深蓝黑)
- **用途**: 次要按钮、标签、背景区域

### 中性色 (Muted)
- **muted**: `#ececf0` (浅灰)
- **muted-foreground**: `#717182` (中灰)
- **用途**: 占位符文本、禁用状态、次要信息

### 强调色 (Accent)
- **accent**: `#e9ebef` (极浅灰蓝)
- **accent-foreground**: `#030213`
- **用途**: 悬停状态、选中背景

### 边框与输入 (Border & Input)
- **border**: `rgba(0, 0, 0, 0.1)` (10% 不透明度黑色)
- **input**: `transparent`
- **input-background**: `#f3f3f5` (浅灰白)
- **switch-background**: `#cbced4` (中性灰)

### 语义色
- **destructive**: `#d4183d` (红色)
- **destructive-foreground**: `#ffffff`
- **ring**: `oklch(0.708 0 0)` (中灰 - 焦点环)

### 侧边栏 (Sidebar)
- **sidebar**: `oklch(0.985 0 0)` (极浅灰)
- **sidebar-foreground**: `oklch(0.145 0 0)`
- **sidebar-primary**: `#030213`
- **sidebar-accent**: `oklch(0.97 0 0)`
- **sidebar-border**: `oklch(0.922 0 0)`

### 图表色彩 (Charts)
- **chart-1**: `oklch(0.646 0.222 41.116)` (橙色)
- **chart-2**: `oklch(0.6 0.118 184.704)` (青色)
- **chart-3**: `oklch(0.398 0.07 227.392)` (蓝色)
- **chart-4**: `oklch(0.828 0.189 84.429)` (黄绿)
- **chart-5**: `oklch(0.769 0.188 70.08)` (黄色)

### 文本颜色应用
- **主要文本**: `text-gray-900`
- **次要文本**: `text-gray-600`, `text-gray-500`
- **占位符**: `text-gray-400`
- **链接/悬停**: `text-gray-700`

---

## 排版

### 字体大小
基础字体大小定义在 `:root` 中：
- **--font-size**: `16px` (根元素)

### 标题层级
```css
h1: var(--text-2xl), font-weight: 500, line-height: 1.5
h2: var(--text-xl), font-weight: 500, line-height: 1.5
h3: var(--text-lg), font-weight: 500, line-height: 1.5
h4: var(--text-base), font-weight: 500, line-height: 1.5
```

### 正文与元素
```css
p: var(--text-base), font-weight: 400, line-height: 1.5
label: var(--text-base), font-weight: 500, line-height: 1.5
button: var(--text-base), font-weight: 500, line-height: 1.5
input: var(--text-base), font-weight: 400, line-height: 1.5
```

### 字重 (Font Weight)
- **--font-weight-normal**: `400` (常规文本)
- **--font-weight-medium**: `500` (标题、按钮、标签)

### 特殊排版
- **小标签**: `text-xs` + `uppercase` + `tracking-[0.3em]` (字母间距)
- **示例**: `"AUSTRALIAN PROPERTY INTELLIGENCE"` 标签

---

## 间距与尺寸

### Padding 常用值
- **容器内边距**: `px-4`, `px-6`, `sm:px-8`
- **卡片内边距**: `p-6`, `sm:p-8`
- **按钮内边距**: `px-4 py-1.5` (小), `px-4 py-2` (中)
- **表单输入**: `px-4 py-1.5`

### Margin 常用值
- **区块间距**: `mt-6`, `mt-10`, `mt-12`, `mt-16`, `mt-24`
- **元素间距**: `gap-2`, `gap-4`, `gap-6`

### 高度
- **导航栏**: `h-16`
- **按钮**: `h-9` (默认), `h-8` (小), `h-10` (大)
- **输入框**: `h-14`
- **图标按钮**: `h-9 w-9`

### 最大宽度
- **主容器**: `max-w-6xl`
- **内容区**: `max-w-3xl`
- **消息气泡**: `max-w-[80%]`

---

## 圆角

### 基础圆角
- **--radius**: `0.625rem` (10px)

### 尺寸变体
- **--radius-sm**: `calc(var(--radius) - 4px)` → `6px`
- **--radius-md**: `calc(var(--radius) - 2px)` → `8px`
- **--radius-lg**: `var(--radius)` → `10px`
- **--radius-xl**: `calc(var(--radius) + 4px)` → `14px`

### Tailwind 应用
- **小圆角**: `rounded-md` (6px)
- **中圆角**: `rounded-lg`, `rounded-xl`
- **大圆角**: `rounded-2xl` (16px), `rounded-3xl` (24px)
- **圆形**: `rounded-full` (按钮、标签、头像)

---

## 阴影与视觉效果

### 卡片阴影
```css
shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)]
```
- **用途**: 主要内容卡片、对话框、悬浮元素

### 边框
- **标准边框**: `border border-gray-200`
- **深色边框**: `border-gray-300`
- **强调边框**: `border-gray-900`

### 背景模糊
- **毛玻璃效果**: `bg-white/80` + `backdrop-blur-xl`
- **轻微模糊**: `bg-white/60` + `backdrop-blur-sm`

### 焦点环
- **outline-ring/50**: 50% 不透明度焦点环
- **focus-visible:ring-[3px]**: 3px 宽度焦点环

---

## 渐变背景

### Aurora 变体 (蓝绿渐变)
```css
base: bg-gradient-to-b from-blue-50 via-white to-emerald-50
overlay: bg-[radial-gradient(circle_at_top,_rgba(74,95,255,0.08),_transparent_55%),
          radial-gradient(circle_at_bottom,_rgba(92,255,211,0.08),_transparent_45%)]
```

### Dusk 变体 (橙黄渐变)
```css
base: bg-gradient-to-b from-orange-50 via-white to-amber-50
overlay: bg-[radial-gradient(circle_at_top,_rgba(255,148,74,0.12),_transparent_52%),
          radial-gradient(circle_at_bottom,_rgba(255,191,105,0.1),_transparent_50%)]
```

### Coastal 变体 (青蓝渐变)
```css
base: bg-gradient-to-b from-cyan-50 via-white to-blue-50
overlay: bg-[radial-gradient(circle_at_top,_rgba(76,201,240,0.12),_transparent_58%),
          radial-gradient(circle_at_bottom,_rgba(129,236,236,0.1),_transparent_48%)]
```

---

## 组件样式

### 按钮 (Button)

#### 变体
- **default**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **outline**: `border bg-background hover:bg-accent`
- **ghost**: `hover:bg-accent hover:text-accent-foreground`
- **destructive**: `bg-destructive text-white hover:bg-destructive/90`
- **secondary**: `bg-secondary text-secondary-foreground hover:bg-secondary/80`

#### 尺寸
- **default**: `h-9 px-4 py-2`
- **sm**: `h-8 px-3`
- **lg**: `h-10 px-6`
- **icon**: `size-9` (正方形)

#### 应用示例
```tsx
// 主要操作
<button className="rounded-full bg-gray-900 px-4 py-1.5 font-medium text-white">
  Try the chat
</button>

// 次要操作
<button className="rounded-full border border-gray-300 px-4 py-1.5 text-gray-700">
  Sign in
</button>

// 发送按钮
<button className="h-9 w-9 rounded-full bg-gray-900 text-white">
  <Send className="h-4 w-4" />
</button>
```

### 输入框 (Input)

```tsx
<input className="
  h-14 w-full bg-transparent 
  text-sm sm:text-base 
  text-gray-900 
  placeholder:text-gray-400 
  focus:outline-none
" />

// 带背景的输入框
<div className="
  rounded-2xl 
  border border-gray-300 
  bg-white 
  px-4 py-1.5
">
  <input className="bg-transparent..." />
</div>
```

### 标签 (Badge/Tag)

```tsx
// 小型标签
<div className="
  inline-flex items-center 
  rounded-full 
  border border-gray-200 
  bg-white/60 
  px-4 py-1 
  text-xs font-medium uppercase 
  tracking-[0.3em] 
  text-gray-600 
  backdrop-blur-sm
">
  AUSTRALIAN PROPERTY INTELLIGENCE
</div>
```

### 消息气泡 (Message Bubble)

```tsx
// 用户消息
<div className="
  max-w-[80%] 
  rounded-2xl 
  border border-gray-900 
  bg-gray-900 
  px-4 py-3 
  text-sm sm:text-base 
  text-white
">
  Message content
</div>

// AI 回复
<div className="
  max-w-[80%] 
  rounded-2xl 
  border border-gray-200 
  bg-gray-50 
  px-4 py-3 
  text-sm sm:text-base 
  text-gray-900
">
  Response content
</div>
```

### 卡片 (Card)

```tsx
<div className="
  rounded-3xl 
  border border-gray-200 
  bg-white/80 
  p-6 sm:p-8 
  shadow-[0_20px_70px_-15px_rgba(0,0,0,0.1)] 
  backdrop-blur-xl
">
  Card content
</div>
```

---

## 响应式断点

基于 Tailwind CSS 默认断点：
- **sm**: `640px` (小屏幕)
- **md**: `768px` (中屏幕)
- **lg**: `1024px` (大屏幕)
- **xl**: `1280px` (超大屏幕)
- **2xl**: `1536px` (超超大屏幕)

### 常见响应式模式
```css
text-sm sm:text-base           /* 文本大小 */
pt-24 sm:pt-28                 /* 上边距 */
p-6 sm:p-8                     /* 内边距 */
sm:text-5xl                    /* 标题大小 */
```

---

## 过渡与动画

### 标准过渡
```css
transition          /* 默认全属性过渡 */
transition-all      /* 显式全属性过渡 */
```

### 悬停状态
- **颜色变化**: `hover:bg-gray-800`, `hover:text-gray-900`
- **边框变化**: `hover:border-gray-400`
- **背景透明度**: `hover:bg-primary/90`

### 禁用状态
```css
disabled:bg-gray-300
disabled:text-gray-500
disabled:pointer-events-none
disabled:opacity-50
```

---

## 图标规范

### 图标库
使用 **lucide-react** 作为主要图标库

### 常用图标
- **Send**: 发送消息
- **Sparkles**: AI 功能
- **MapPin**: 位置标记
- **Heart**: 收藏
- **Grid3x3**: 网格视图
- **Map**: 地图视图
- **X**: 关闭

### 尺寸
- **h-4 w-4**: 小图标 (按钮内)
- **h-5 w-5**: 中图标
- **h-6 w-6**: 大图标

---

## 布局模式

### 居中容器
```tsx
<div className="mx-auto max-w-6xl px-6">
  Content
</div>
```

### Flexbox 常用组合
```css
flex items-center justify-between    /* 两端对齐 */
flex items-center gap-4              /* 居中 + 间距 */
flex flex-col gap-6                  /* 垂直堆叠 */
```

### 网格布局
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
```

---

## 可访问性 (Accessibility)

### ARIA 标签
```tsx
aria-label="Send first message"
aria-invalid="true"
```

### 焦点可见性
```css
focus:outline-none
focus-visible:ring-[3px]
focus-visible:ring-ring/50
```

### 屏幕阅读器
```tsx
<span className="sr-only">Delete</span>
```

---

## 使用建议

1. **保持一致性**: 始终使用设计令牌中定义的颜色和间距值
2. **响应式优先**: 默认移动端设计，使用 `sm:`, `md:` 等断点扩展
3. **语义化**: 使用语义化的颜色名称 (primary, destructive) 而非直接颜色值
4. **可组合性**: 利用 Tailwind 的组合能力，避免创建自定义 CSS
5. **深色模式**: 虽然当前为浅色主题，所有令牌已定义深色模式变体以备未来使用

---

*最后更新: 2026年3月13日*
