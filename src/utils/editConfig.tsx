// 映射列表
// componentList:[] -->  显示所有物料 
// componentMap:{} -->  key 对应的 组件映射
import {ElButton,ElInput} from 'element-plus';

export interface registerInterface {
    label:string,
    preview:Function,
    render:Function,
    key:string
}
export interface componentInerface {
    componentList:registerInterface[],
    componentMap:{},
    register:Function
}

function createEditorConfid():componentInerface{
    const componentList = [] as registerInterface[];   // 所有组件
    const componentMap = {};   // 映射关系
    return {
        componentList,
        componentMap,
        register:(component:registerInterface) => {
            componentList.push(component);
            componentMap[component.key] = component;
        },
     
    }
}
export const registerConfig = createEditorConfid();
registerConfig.register({
    label:'文本',
    preview:() => '预览文本',
    render:() => '渲染文本',
    key:'text'
})
registerConfig.register({
    label:'按钮',
    preview:() => <ElButton>预览按钮</ElButton>,
    render:() => <ElButton>渲染按钮</ElButton>,
    key:'button'
})
registerConfig.register({
    label:'输入框',
    preview:() => <ElInput placeholder='预览输入框' />,
    render:() => <ElInput placeholder='渲染输入框' />,
    key:'input'
})