// src/models/bpmn/nodes/ActuatingDevices_Relay.ts
import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'
import relaySvg from '@/assets/icons/Actuating Devices_Relay.svg'
import { baseFields, actuatingFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'

export interface RelayProps {
  deviceName: string
  deviceNameEn: string
  productModel: string
  installDate: string
  note: string
  controlParam: string
  unit: string
  rangeDisplay: string
  setpoint: 'On' | 'Off' | null
  interfaceType: string
  powerSupply: string
}

class RelayModel extends RectNodeModel {
  static extendKey = 'RelayModel'

  static formSchema: FieldSchema[] = [
    ...baseFields,
    // 去掉原来的 range.min/max，改成只读文本
    ...actuatingFields.filter(f => f.key !== 'range').map(f => {
      if (f.key === 'interfaceType' || f.key === 'powerSupply') return { ...f }
      return { ...f, disabled: true, readOnly: true }
    }),
    { key: 'rangeDisplay', label: '设定范围', type: 'text' }, // 固定显示“无”
    // 先放设定值
    { key: 'setpoint', label: '设定值', type: 'select', options: ['On', 'Off'] },
    // 最后再放备注框
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' },
  ]

  declare properties: RelayProps

  constructor(data: NodeConfig, graphModel: GraphModel) {
    if (!data.id) data.id = `Relay_${getBpmnId()}`
    super(data, graphModel)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: RelayProps = {
      deviceName: 'Relay',
      deviceNameEn: 'Relay',
      productModel: '',
      installDate: '',
      note: '触点容量',
      controlParam: '开关',
      unit: 'On/Off',
      rangeDisplay: '无',
      setpoint: 'Off',
      interfaceType: 'I/O',
      powerSupply: 'AC/DC',
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }

  setProperties(props: Partial<RelayProps>) {
    const allowed: Partial<RelayProps> = {}
    if (props.productModel !== undefined) allowed.productModel = props.productModel
    if (props.installDate !== undefined) allowed.installDate = props.installDate
    if (props.note !== undefined) allowed.note = props.note
    if (props.setpoint !== undefined) allowed.setpoint = props.setpoint
    if (props.interfaceType !== undefined) allowed.interfaceType = props.interfaceType
    if (props.powerSupply !== undefined) allowed.powerSupply = props.powerSupply
    allowed.rangeDisplay = this.properties.rangeDisplay
    super.setProperties(allowed)
    this.properties = { ...this.properties, ...allowed }
  }
}

class RelayView extends RectNode {
  static extendKey = 'RelayNode'

  getShape(): any {
    const { model } = this.props
    const { x, y, width, height, radius } = model
    const style = model.getNodeStyle()
    return h('g', {}, [
      h('rect', {
        x: x - width / 2,
        y: y - height / 2,
        rx: radius,
        ry: radius,
        width,
        height,
        fill: 'transparent',
        stroke: style.stroke,
        'stroke-opacity': 0.0001,
      }),
      h('image', {
        href: relaySvg,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box',
      }),
    ])
  }
}

export default { type: 'bpmn:relay', view: RelayView, model: RelayModel }
export { RelayView, RelayModel }
