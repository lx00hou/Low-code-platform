import { defineComponent , computed, inject, provide} from "vue";
import { componentInerface } from '../utils/editConfig';
import EditorBlock from "./editor-block";
import './editor.scss';


export default defineComponent({
    props:{
        modelValue:{type:Object}
    },
    setup(props){
        const data = computed({
            get(){
                // 获取 计算属性的值 需要 .value 
                return props.modelValue
            },
            set(){}
        })

        const config:componentInerface = inject('config') as componentInerface;
        const containerStyle= computed(() => ({   // 画布大小 放入计算属性
            width:data.value!.container.width+'px',
            height:data.value!.container.height+'px'
        }))  

        return ()=> <div class="editor">
            <div class='editor_left'>
                {/* 根据 映射列表 渲染对应内容 */}
                {
                 config.componentList.map(component =>(
                    <div class='editor_left_item'>
                        <span>{component.label}</span>
                        <div>{component.preview()}</div>
                    </div>
                 ))
                }
            </div>
            <div class='editor_top'>菜单栏</div>
            <div class='editor_right'>属性控制</div>
            <div class='editor_container'>
                <div class="editor_container_canvas">
                    {/* 负责产生滚动条 */}
                    <div class="editor_container_canvas_content" style={containerStyle.value}>
                        {
                            (data.value!.blocks.map(block => (
                                <EditorBlock  block={block} />
                            )))
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})