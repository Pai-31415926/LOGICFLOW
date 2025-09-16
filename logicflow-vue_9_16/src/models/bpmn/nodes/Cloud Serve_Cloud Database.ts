import { GraphModel, h, NodeConfig, RectNode, RectNodeModel } from '@logicflow/core'
import { getBpmnId } from '@logicflow/extension/es/bpmn/getBpmnId'

import cloudDatabaseSvg from '@/assets/icons/Cloud Serve_Cloud Database.svg'
import { baseFields, cloudFields, type FieldSchema } from '@/models/bpmn/schemas/commonSchema'
interface CloudDatabaseProps {
  deviceName: string;
  deviceNameEn: string;
  productModel: string;
  installDate: string;
  note: string;
  type: string;
  function: string;
  interfaceType: string;
  commMethod: string;
}

class CloudDatabaseModel extends RectNodeModel {
  static extendKey = 'CloudDatabaseModel'

  // ✅ 这里手动去掉 cloudFields 里的 installDate，避免重复
  static formSchema: FieldSchema[] = [
    ...baseFields,
    ...cloudFields.filter(f => f.key !== 'installDate'),
    { key: 'note', label: '备注', type: 'textarea', placeholder: '请输入备注信息' }
  ]

  constructor(data: NodeConfig, gm: GraphModel) {
    if (!data.id) data.id = `CloudDatabase_${getBpmnId()}`
    super(data, gm)
    this.width = this.width || 96
    this.height = this.height || 56
    if (this.text) this.text.editable = true
  }

  initNodeData(data: any) {
    super.initNodeData(data)
    const defaults: CloudDatabaseProps = {
      deviceName: '云数据库',
      deviceNameEn: 'Cloud Database',
      productModel: '',
      installDate: '',
      note: '',
      type: 'MySQL / TSDB',
      function: '数据存储',
      interfaceType: 'API',
      commMethod: 'TCP/IP'
    }
    this.properties = { ...defaults, ...(data.properties || {}) }
  }
}

class CloudDatabaseView extends RectNode {
  static extendKey = 'CloudDatabaseNode'
  getShape(): any {
    const { x, y, width, height, radius } = this.props.model
    const style = this.props.model.getNodeStyle()
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
        href: cloudDatabaseSvg,
        x: x - width / 2,
        y: y - height / 2,
        width, height,
        preserveAspectRatio: 'xMidYMid meet',
        'pointer-events': 'bounding-box'
      })
    ])
  }
}

const CloudServer_CloudDatabase = {
  type: 'bpmn:cloud-database',
  view: CloudDatabaseView,
  model: CloudDatabaseModel,
}

export { CloudDatabaseView, CloudDatabaseModel }
export default CloudServer_CloudDatabase
