// 映射列表
// componentList:[] -->  显示所有物料 
// componentMap:{} -->  key 对应的 组件映射
import {ElButton,ElInput} from 'element-plus';

export interface registerInterface {
    label:string,
    preview:Function,
    render:Function,
    key:string,
    props:{
        type:string,
        [propName:string]:any
    }
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
// 工厂函数 传入label名称 
const createInputProp = (label:string) => ({type:'input',label});
const createColorProp = (label:string) => ({type:'color',label});
const createSelectProp = (label:string,options:{
    label:string,
    value:string
}[]) => ({type:'select',label,options});
/**
 * 注册物料 组件
 */
registerConfig.register({
    label:'文本',
    preview:() => '预览文本',
    render:() => '渲染文本',
    key:'text',
    props:{
        text:createInputProp('文本内容'),
        color:createColorProp('字体颜色'),
        size:createSelectProp('字体大小',[
            {label:'14px',value:'14px'},
            {label:'20px',value:'20px'},
            {label:'24px',value:'24px'}
        ])


    }
})
registerConfig.register({
    label:'按钮',
    preview:() => <ElButton>预览按钮</ElButton>,
    render:() => <ElButton>渲染按钮</ElButton>,
    key:'button',
    props:{
        text:createInputProp('按钮内容'),
        type:createSelectProp('按钮类型',[
            {label:'基础',value:'primary'},
            {label:'成功',value:'scuuess'},
            {label:'警告',value:'warning'},
            {label:'危险',value:'danger'},
            {label:'文本',value:'text'},
        ]),
        size:createSelectProp('按钮大小',[
            {label:'默认',value:''},
            {label:'中等',value:'medium'},
            {label:'小',value:'small'},
            {label:'级小',value:'mini'},
        ])
      

    }
})
registerConfig.register({
    label:'输入框',
    preview:() => <ElInput placeholder='预览输入框' />,
    render:() => <ElInput placeholder='渲染输入框' />,
    key:'input'
})