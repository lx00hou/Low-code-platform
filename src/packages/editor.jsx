import { defineComponent , computed, inject , ref} from "vue";
import { componentInerface } from '../utils/editConfig';
import { useMneuDragger }  from '../hooks/useMenuDrag';
import { useFocus } from '../hooks/useFocus';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { useCommand } from '../hooks/useCommand';
import deepcopy from 'deepcopy';    // 深拷贝插件
import EditorBlock from "./editor-block";
import '../asset/css/editor.scss';


export default defineComponent({
    props:{
        modelValue:{type:Object}
    },
    // emit:['update:modelValue'],
    setup(props,ctx){
        const data = computed({
            get(){
                // 获取 计算属性的值 需要 .value 
                return props.modelValue
            },
            set(newVal){
                ctx.emit('update:modelValue',deepcopy(newVal))
            }
        })

        const config = inject('config');
        const containerStyle= computed(() => ({   // 画布大小 放入计算属性
            width:data.value.container.width+'px',
            height:data.value.container.height+'px'
        }))  
    /**
     * 拖拽
    */    
        const containRef = ref(null);   // 获取整个画布元素
        // 1 左侧物料区 菜单拖拽功能
        let {dragStart,dragend} = useMneuDragger(containRef,data);  
        // 2 画布组件 鼠标按下 添加选中样式 监听鼠标移动 抬起事件
        let { blockMousedown ,clearBlockFocus,focusData , lastSelectBlock} = useFocus(data,(e) => {
            mousedown(e);
        })
        // 3 实现 画布被选中元素 拖拽 
        let {mousedown,markLine} = useBlockDrag(focusData,lastSelectBlock,data);

        // 头部菜单 撤销 重做
        const {commands }  = useCommand();
        
        const buttons = [
            {label:'撤销',handler:() => commands.undo()},
            {label:'重做',handler:() => commands.redo()}
        ]

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
            <div class='editor_top'>
                {
                    buttons.map((btn,index) =>{
                        return <div class='editor_top_item' onClick={btn.handler}>{btn.label}</div>
                    })
                }
            </div>
            <div class='editor_right'>属性控制</div>
            <div class='editor_container'>
                {/* 负责产生滚动条 */}
                <div class="editor_container_canvas">
                    <div class="editor_container_canvas_content" 
                        style={containerStyle.value}
                        ref={containRef} 
                        onMousedown={clearBlockFocus}   // 清除所有被选中的 组件样式
                    >
                        {
                            (data.value.blocks.map((block,index) => (
                                <EditorBlock 
                                    class={block.focus ? 'editor_block_focus' : ''}
                                    block={block}
                                    onMousedown={(e) =>blockMousedown(e,block,index)}  
                                />
                            )))
                        }
                        {markLine.x !== null && <div class='line-x' style={{left:markLine.x+'px'}}></div>}
                        {markLine.y !== null && <div class='line-y' style={{top:markLine.y+'px'}}></div>}

                    </div>
                       
                </div>
            </div>
        </div>
    }
})