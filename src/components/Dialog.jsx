import { ElButton, ElDialog, ElInput } from "element-plus";
import { defineComponent,createVNode,render, reactive } from "vue";

const DialogComponent = defineComponent({
    props:{
        option:{type:Object}
    },
    setup(props, ctx) {
        const state = reactive({
            option:props.option,   // 更新 option数据
            isShow:false
        })
        ctx.expose({   // 外界调用组件的方法
            showDialog(option){
                state.option = option; 
                state.isShow = true;
            }
        })
        const cancel = () => {
            state.isShow = false;
        }
        const confirm = () => {
            state.isShow = false;
            state.option.onConfirm && state.option.onConfirm(state.option.content)
        }
        return ()=>{
            return <ElDialog v-model={state.isShow} title={state.option.title} >
                {{
                    default:()=> <ElInput 
                                    type='textarea'
                                    v-model={state.option.content}
                                    rows={10} />,
                    footer:()=> state.option.footer && <div>
                        <ElButton onclick={cancel} >取消</ElButton>
                        <ElButton type='primary' onclick={confirm} >确定</ElButton>
                    </div>
                }}
            </ElDialog>
        }
    },
})
let vm;   // 组件实例 
export function $dialog(option){
    // 手动挂载组件
    let el = document.createElement('div');
    vm = createVNode(DialogComponent,{option})   //  组件渲染虚拟节点

    document.body.appendChild((render(vm,el),el))   // 渲染真实节点扔到页面中
    let {showDialog} = vm.component.exposed
    showDialog(option)
}