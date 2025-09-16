<template>
  <div class="palette">
    <input
      v-model="keyword"
      class="palette__search"
      type="text"
      placeholder="搜索组件…（中文名或 type）"
    />

    <details v-for="g in filteredGroups" :key="g.key" open class="palette__group">
      <summary class="palette__group-title">
        {{ g.name }}（{{ g.items.length }}）
      </summary>

      <div class="palette__grid">
        <div
          v-for="item in g.items"
          :key="item.type"
          class="palette__card"
          title="按住拖到画布；单击快速添加"
          @mousedown.prevent="onStartDrag(item, $event)"
          @click="onQuickAdd(item)"
        >
          <div class="palette__icon">
            <!-- ✅ 统一用 <img>，由 CSS 强制等比缩放到相同盒子大小 -->
            <img v-if="item.icon" :src="item.icon" alt="" />
            <span v-else>◎</span>
          </div>

          <!-- ✅ 只显示中文：优先 properties.deviceName -->
          <div class="palette__label">
            {{ (item.properties && item.properties.deviceName) || item.label }}
          </div>
        </div>
      </div>
    </details>

    <div v-if="!filteredGroups.length" class="palette__empty">暂无匹配结果</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface PaletteItem {
  type: string
  label: string
  icon?: string
  properties?: Record<string, any>
}
export interface PaletteGroup {
  key: string
  name: string
  items: PaletteItem[]
}

const props = defineProps<{ lf: any; groups: PaletteGroup[] }>()
const keyword = ref('')

const filteredGroups = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return props.groups
  return props.groups
    .map(g => ({
      ...g,
      items: g.items.filter(it => {
        const zh = (it.properties?.deviceName ?? it.label).toLowerCase()
        return zh.includes(k) || it.type.toLowerCase().includes(k)
      }),
    }))
    .filter(g => g.items.length)
})

function ensureType(t: string) {
  const set = props.lf?.__registeredTypes
  if (set && typeof set.has === 'function') {
    return set.has(t) ? t : 'rect'
  }
  return t
}

function onStartDrag(item: PaletteItem, e: MouseEvent) {
  const dnd = (props.lf && (props.lf.dnd || props.lf.extension?.dnd))
  if (!dnd || typeof dnd.startDrag !== 'function') return
  const type = ensureType(item.type)
  dnd.startDrag({
    type,
    text: '',
    properties: item.properties || {},
  })
}

function onQuickAdd(item: PaletteItem) {
  if (!props.lf || typeof props.lf.addNode !== 'function') return
  const type = ensureType(item.type)
  const center = props.lf.graphModel.getPointByClient({
    x: window.innerWidth * 0.55,
    y: window.innerHeight * 0.45,
  })
  props.lf.addNode({
    type,
    x: center.x,
    y: center.y,
    text: '',
    properties: item.properties || {},
  })
}
</script>

<style scoped>
/* 🧩 调这个就是全局“图标尺寸”（推荐 40~56 之间） */
:host, .palette {
  --icon-size: 48px;
}

.palette{ height: 100%; padding: 8px; background: #fff; overflow: auto; box-sizing: border-box; }
.palette__search{
  width: 100%; height: 32px; padding: 0 10px; border: 1px solid #e5e7eb; border-radius: 8px;
  outline: none; box-sizing: border-box; margin-bottom: 8px;
}
.palette__group{ margin: 6px 0 10px; }
.palette__group-title{ font-weight: 600; cursor: pointer; user-select: none; padding: 6px 2px; }
.palette__grid{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 4px 2px; }

.palette__card{
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 92px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fafafa;
  cursor: grab; user-select: none; transition: transform .08s, box-shadow .12s, border-color .12s;
  overflow: hidden; /* 防止个别图片有外部边距把卡片撑开 */
}
.palette__card:hover{ border-color: #93c5fd; box-shadow: 0 2px 10px rgba(0,0,0,.06); transform: translateY(-1px); }
.palette__card:active{ cursor: grabbing; }

/* 🎯 统一的图标盒子：固定宽高 + 居中 + 等比缩放 */
.palette__icon{
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid;
  place-items: center;
  margin-top: 6px;
}
.palette__icon img{
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;     /* 等比、不裁剪，完整显示 */
  image-rendering: auto;   /* 矢量/位图都清晰 */
  pointer-events: none;    /* 避免拖拽时选中图片本身 */
}
/* 兜底符号也居中同尺寸 */
.palette__icon > span{
  font-size: calc(var(--icon-size) * 0.6);
  line-height: 1;
}

.palette__label{
  margin-top: 6px; font-size: 12px; line-height: 1.2; text-align: center; padding: 0 6px; color: #333;
  overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.palette__empty{ padding: 16px; color: #9ca3af; text-align: center; }
.palette__icon { width: var(--icon-size, 48px); height: var(--icon-size, 48px); display: grid; place-items: center; }
.palette-icon {
  width: 48px;
  height: 48px;
  padding: 4px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 2px rgba(0,0,0,0.15);
}
.palette__icon img, .palette__icon svg { width: 100%; height: 100%; object-fit: contain; }
</style>
