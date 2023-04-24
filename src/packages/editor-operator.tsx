
/**
 * 右侧属性栏
 */
import { defineComponent , computed ,inject,ref,watch, onMounted, ComputedRef, reactive} from "vue";
import { componentInerface } from '../utils/editConfig';
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect,ElOption } from "element-plus";
import { dataInterface } from "@/utils/dataJsonCheck"; 
import deepcopy from "deepcopy";
import { blockInterface } from "@/utils/dataJsonCheck";
export default defineComponent({
  props:{
   block:{type:Object},   // 用户选中的最有一个元素
   data:{type:Object}    // 当前试图的所有数据
  },
   setup(props,ctx) {
        const config:componentInerface = inject('config') as componentInerface;   // 试图组件的配置信息
        const state = reactive({
            editData:{} as {   // 当前试图没有被选中的组件
                width:number,
                height:number
            },
            selectData:{} as blockInterface   // 最后一个被选中的页面组件
        })
        let reset = () => {
            if(!props.block){
                // 当前试图没有被选中元素 绑定容器宽高
                state.editData = deepcopy(props.data!.container);
            }else {
                // 绑定最后一个被选中元素
                state.selectData = deepcopy(props.block) as blockInterface;
            }
        }
        watch(() => props.block,reset,{immediate:true})
       return () => {
        let content:any = [];
        if(!props.block){
            // 当前试图没有被选中的元素
            content.push(<>
                <ElFormItem label="容器宽度">
                    <ElInputNumber v-model={state.editData.width}></ElInputNumber>
                </ElFormItem>
                <ElFormItem label="容器高度">
                    <ElInputNumber v-model={state.editData.height}></ElInputNumber>
                </ElFormItem>
            </>)
        }else {
            // 当前试图至少有一个被选中的元素
            let component = config.componentMap[props.block.key];
            if(component && component.props){  // {text:{},size:{},color:{}
                content.push( Object.entries(component.props).map(([propName,propConfig]:any) =>{
                    return <ElFormItem label={propConfig.label}>
                        {{
                            input:() => <ElInput v-model={state.selectData.props[propName]}></ElInput>,
                            color:() => <ElColorPicker v-model={state.selectData.props[propName]}></ElColorPicker>,
                            select:() => <ElSelect v-model={state.selectData.props[propName]}>
                                {propConfig.options.map(opt => {
                                    return <ElOption label={opt.label} value={opt.value}></ElOption>
                                })}
                            </ElSelect>
                        }[propConfig.type]()}
                    </ElFormItem>
                } ))
            }

        }
        return <ElForm labelPosition='top' style="padding:30px">
                {content}
                <ElFormItem>
                    <ElButton type="primary">应用</ElButton>
                    <ElButton>重置</ElButton>
                </ElFormItem>
            </ElForm>
       }
       
   }

})