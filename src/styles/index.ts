/**
 * 样式统一入口 —— 项目所有 CSS 只允许出现在 src/styles 下
 * 引入顺序：tailwind → 基础 → 组件 → 布局 → 工具
 */
import './tailwind.css'
import './base/variables.css'
import './base/reset.css'
import './base/typography.css'
import './base/scrollbar.css'
import './components/element.css'
import './components/form.css'
import './components/table.css'
import './layout/layout.css'
import './layout/transition.css'
import './utils/utilities.css'
