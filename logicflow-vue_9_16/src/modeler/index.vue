<template>
  <a-layout style="height: 100%; width: 100%; margin: 0; overflow: hidden">
    <a-layout-header style="background: #fff; height: 42px; line-height: 32px; padding: 5px 10px">
      <toolbar />
    </a-layout-header>

    <a-layout-content>
      <splitpanes class="default-theme" @resized="onResize" :dbl-click-splitter="false" :push-other-panes="false">
        <!-- 中间：画布 + 自定义左侧 Palette -->
        <pane :size="propertiesPanel.collapsed ? 100 - paneSize / 100 : 100 - paneSize">
          <div
            ref="container"
            class="graph-with-leftbar"
            style="height: 100%; width: 100%; padding: 4px; box-shadow: 0 0 4px rgb(0 0 0 / 30%) inset; background: #fff">
          </div>

          <!-- 自定义 Palette（覆盖在画布左侧） -->
          <div class="palette-fixed">
            <Palette :lf="modeler.lf" :groups="groups" />
          </div>
        </pane>

        <!-- 右侧：自定义属性面板 -->
        <pane
          :size="propertiesPanel.collapsed ? paneSize / 100 : paneSize"
          v-show="!propertiesPanel.collapsed"
          style="padding: 10px; background-color: #f8f8f8; overflow: hidden auto">
          <keep-alive>
            <DynamicPropertiesPanel :lf="modeler.lf" :selectedId="selectedId" />
          </keep-alive>
        </pane>
      </splitpanes>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">

import { ref, nextTick, onMounted, onBeforeUnmount, provide } from 'vue'
import DynamicPropertiesPanel from '@/components/DynamicPropertiesPanel.vue'
import Palette from '@/components/palette/Palette.vue'
import { groups } from '@/components/palette/palette-data'

import { Definition } from '@logicflow/core'
import '@logicflow/core/dist/style/index.css'
import { DndPanel, InsertNodeInPolyline, Menu, MiniMap, SelectionSelect, Snapshot } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'
import 'highlight.js/styles/stackoverflow-light.css'
import { PropertiesPanelConfig, useModeler } from 'logicflow-useapi'
import { addListener } from 'resize-detector'
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'

import models, { nodeDefs } from '../models'
import propertiesPanelConfigs from '../models/propertiesPanel'
import Toolbar from './toolbar.vue'

const container = ref<HTMLElement>()
const paneSize = ref(30)
const selectedId = ref<string | null>(null)

// Model Config
const urlParams = new URLSearchParams(location.search)
const _mt = urlParams.has('modelType') ? urlParams.get('modelType') : 'bpmn'
const modelType = ref(_mt)
const model = models.find(m => m.name === modelType.value) || models[0]

// 关闭默认右栏（我们用自己的）
const propertiesPanelConfig: PropertiesPanelConfig = {
  ...propertiesPanelConfigs[model.name],
  useDefault: false,
}

// Modeler
const modeler = useModeler(model, propertiesPanelConfig)
const { propertiesPanel } = modeler

function containerResize() {
  if (container.value && modeler.lf) {
    const { width, height } = container.value.getBoundingClientRect()
    modeler.lf.resize(width - 8, height - 8)
  }
}

async function onResize(e: any) {
  if (!container.value || !modeler.lf) return
  if (e[1] && e[1].size) {
    const size = e[1].size
    propertiesPanel.collapsed = size < 5
    paneSize.value = size
    await nextTick()
    containerResize()
  }
}

// provide context
provide('modeler_context', modeler)

onMounted(async () => {
  if (!container.value) return
  const options: Definition = {
    container: container.value,
    adjustEdgeStartAndEnd: true,
    edgeTextDraggable: true,
    multipleSelectKey: 'meta',
    style: { nodeText: { overflowMode: 'autoWrap' } },
    keyboard: { enabled: true },
    // 用 DndPanel 提供 dnd 能力（UI 我们隐藏）
    plugins: [DndPanel, InsertNodeInPolyline, Menu, MiniMap, SelectionSelect, Snapshot],
  }
  modeler.initLogicFlow(options)

  // 统一注册所有节点，并记录已注册的 type 集合
  const registered: string[] = []
  nodeDefs.forEach(def => {
    if (def?.type && def.view && def.model) {
      modeler.lf.register(def)
      registered.push(def.type)
    } else {
      console.warn('[register] 非法节点定义：', def)
    }
  })
  ;(modeler.lf as any).__registeredTypes = new Set(registered)
  console.log('[register] 已注册类型:', registered)

  // 新增节点时，兜底把文字清空（双保障）
  modeler.lf.on('node:add', ({ data }: any) => {
    modeler.lf.updateText(data.id, '')
  })
  modeler.lf.on('node:added', ({ data }: any) => {
    modeler.lf.updateText(data.id, '')
  })

  // 对照 Palette，提示没对上的类型（开发期可留）
  for (const g of groups) {
    for (const it of g.items) {
      if (!(modeler.lf as any).__registeredTypes.has(it.type)) {
        console.warn('[palette-miss]', it.properties?.deviceName || it.label, '→ 未找到已注册类型：', it.type)
      }
    }
  }

  await nextTick()
  containerResize()

  // 同步选中 id
  modeler.lf.on('element:click', ({ data }: any) => { selectedId.value = data?.id || null })
  modeler.lf.on('blank:click', () => { selectedId.value = null })
  modeler.lf.on('selection:change', ({ nodes }: any) => {
    selectedId.value = nodes?.length ? nodes[0].id : null
  })

  // 容器大小监听
  let running = false
  addListener(container.value, () => {
    if (running) return
    running = true
    setTimeout(async () => {
      running = false
      await nextTick()
      containerResize()
    }, 200)
  })
})

onBeforeUnmount(() => {
  if (!modeler.lf) return
  modeler.lf.off('element:click')
  modeler.lf.off('blank:click')
  modeler.lf.off('selection:change')
  modeler.lf.off('node:add')
  modeler.lf.off('node:added')
})
</script>

<style>
:root { --leftbar-w: 260px; } /* 侧栏宽度可调 */

.graph-with-leftbar{
  position: relative;
  padding-left: calc(var(--leftbar-w) + 8px); /* 给左栏让位 */
  box-sizing: border-box;
}

/* 我们自己的左侧面板容器 */
.palette-fixed{
  position: absolute;
  inset: 0 auto 0 0;           /* top:0; left:0; bottom:0 */
  width: var(--leftbar-w);
  overflow: auto;
  padding: 8px 8px 12px;
  background: #fff;
  box-shadow: 0 0 4px rgb(0 0 0 / 30%) inset;
  z-index: 2;                  /* 在画布上层，便于点击 */
}

/* 隐藏官方 DndPanel 的 UI（仅保留拖拽能力） */
.lf-dndpanel { display: none !important; }

.lf-mini-map{ padding-top:0; right:5px; bottom:5px; height:120px; box-shadow:0 1px 4px rgb(0 0 0 / 30%); background-color:rgba(255,255,255,.8); }
.lf-mini-map-header, .lf-mini-map-close{ visibility:hidden; }
.lf-mini-map .lf-graph{ background:none; }
</style>
