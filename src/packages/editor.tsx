import { defineComponent , computed, inject , ref} from "vue";
import { componentInerface } from '../utils/editConfig';
import { useMneuDragger }  from '../hooks/menuDrag';
import deepcopy from 'deepcopy';    // 深拷贝插件
import EditorBlock from "./editor-block";
import '../asset/css/editor.scss';


export default defineComponent({
    props:{
        modelValue:{type:Object}
    },
    // emit:['update:modelValue'],
    setup(props,ctx){
        const data:any = computed({
            get(){
                // 获取 计算属性的值 需要 .value 
                return props.modelValue
            },
            set(newVal){
                ctx.emit('update:modelValue',deepcopy(newVal))
            }
        })

        const config:componentInerface = inject('config') as componentInerface;
        const containerStyle= computed(() => ({   // 画布大小 放入计算属性
            width:data.value!.container.width+'px',
            height:data.value!.container.height+'px'
        }))  
        /**
         * h5 拖拽
         */
        const containRef:any = ref(null);   // 获取整个画布元素
        // 1 左侧物料区 菜单拖拽功能
        let {dragStart,dragend} = useMneuDragger(containRef,data);  
        // 2 获取焦点
        let blockMousedown = (e,block)=> {
            console.log('e',e);
            console.log('block',block);
        }
        // 3 画布元素 实现拖拽
        return ()=> <div class="editor">
            <div class='editor_left'>
                {/* 根据 映射列表 渲染对应内容 */}
                {
                 config.componentList.map(component =>(
                    <div class='editor_left_item' 
                        draggable
                        onDragstart={e => dragStart(e,component)}
                        onDragend={dragend}
                    >
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
                    <div class="editor_container_canvas_content" 
                        style={containerStyle.value}
                        ref={containRef}    
                    >
                        {
                            (data.value!.blocks.map(block => (
                                <EditorBlock 
                                block={block}
                                // onMousedown={(e) =>blockMousedown(e,block)}  
                                />
                            )))
                        }
                    </div>
                </div>
            </div>
        </div>
    }
})