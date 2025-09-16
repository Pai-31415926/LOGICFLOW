// src/models/bpmn/nodes/MechatronicDevices_CartridgeFilter.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import cartridgeFilterSvg from '@/assets/icons/Mechatronic Devices_Cartridge Filter.svg'

// —— 属性接口 —— //
export interface CartridgeFilterProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string

  controlParam: string
  unit: string
  range: string
  powerSupply: string
}

class CartridgeFilterModel extends RectNodeModel {
  static extendKey = 'CartridgeFilterModel'

  // ✅ 增加表单 schema，和泵保持一致
  static formSchema = [
    { key: 'productModel', label: '产品型号', type: 'text' },
    { key: 'installDate', label: '安装日期', type: 'date' },
    { key: 'controlParam', label: '参数', type: 'text' },
    { key: 'unit', label: '单位', type: 'text' },
    { key: 'range', label: '设定范围', type: 'text' },
    { key: 'powerSupply', label: '供电方式', type: 'text' },
    { key: 'note', label: '备注', type: 'textarea' , placeholder: '请输入备注信息' },
  ]

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) {
      data.id = `CartridgeFilter_${getBpmnId()}`
    }
    super(data, graphModel)

    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  // 初始化默认属性
  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: CartridgeFilterProps = {
      deviceName: '滤芯过滤器',
      deviceNameEn: 'Cartridge Filter',
      productModel: '',
      installDate: '',
      note: '',

      controlParam: '无',
      unit: '无',
      range: '无',
      powerSupply: '无',
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class CartridgeFilterView extends RectNode {
  static extendKey = 'CartridgeFilterNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()

    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius, ry: radius,
        width, height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001
      }),
      h('image', {
        href: cartridgeFilterSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const MechatronicDevices_CartridgeFilter = {
  type: 'bpmn:cartridge-filter',
  view: CartridgeFilterView,
  model: CartridgeFilterModel,
}

export { CartridgeFilterView, CartridgeFilterModel }
export default MechatronicDevices_CartridgeFilter
