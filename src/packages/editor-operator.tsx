
/**
 * 右侧属性栏
 */
import { defineComponent , computed ,inject,ref, onMounted, ComputedRef} from "vue";
import { componentInerface } from '../utils/editConfig';
import { ElButton, ElColorPicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElSelect,ElOption } from "element-plus";
import { dataInterface } from "@/utils/dataJsonCheck"; 

export default defineComponent({
  props:{
   block:{type:Object},   // 用户选中的最有一个元素
   data:{type:Object}    // 当前试图的所有数据
  },
   setup(props,ctx) {
        const config:componentInerface = inject('config') as componentInerface;   // 试图组件的配置信息
       return () => {
        let content:any = [];
        if(!props.block){
            // 当前试图没有被选中的元素
            content.push(<>
                <ElFormItem label="容器宽度">
                    <ElInputNumber></ElInputNumber>
                </ElFormItem>
                <ElFormItem label="容器高度">
                    <ElInputNumber></ElInputNumber>
                </ElFormItem>
            </>)
        }else {
            // 当前试图至少有一个被选中的元素
            let component = config.componentMap[props.block.key];
            if(component && component.props){  // {text:{},size:{},color:{}
                content.push( Object.entries(component.props).map(([propName,propConfig]:any) =>{
                    return <ElFormItem label={propConfig.label}>
                        {{
                            input:() => <ElInput></ElInput>,
                            color:() => <ElColorPicker></ElColorPicker>,
                            select:() => <ElSelect>
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