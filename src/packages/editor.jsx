import { defineComponent , computed, inject , ref, nextTick} from "vue";
import { componentInerface } from '../utils/editConfig';
import { useMneuDragger }  from '../hooks/useMenuDrag';
import { useFocus } from '../hooks/useFocus';
import { useBlockDrag } from '../hooks/useBlockDrag';
import { useCommand } from '../hooks/useCommand';
import deepcopy from 'deepcopy';    // 深拷贝插件
import '../asset/css/editor.scss';
import { $dialog } from "../components/Dialog";
import { $dropdown } from "../components/Dropdown";
import { ElButton } from "element-plus";
import { DropdownItem } from '../components/Dropdown';
import EditorOperator from './editor-operator'; 
import EditorBlock from "./editor-block";



export default defineComponent({
    props:{
        modelValue:{type:Object}
    },
    // emit:['update:modelValue'],
    setup(props,ctx){
        // 预览时 内容不能再操作
        let previewRef = ref(false);   // 是否开启预览
        let editorRef = ref(true);    // 是否在编辑状态

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
        let { blockMousedown ,clearBlockFocus,focusData , lastSelectBlock} = useFocus(data,previewRef,(e) => {
            mousedown(e);
        })
        let {mousedown,markLine} = useBlockDrag(focusData,lastSelectBlock,data);

        // 3 实现 画布被选中元素 拖拽 

        // 头部菜单 撤销 重做
        const {commands }  = useCommand(data,focusData);
        
        const buttons = [
            {label:'撤销',handler:() => commands.undo()},
            {label:'重做',handler:() => commands.redo()},
            {label:'导出',handler:() => {
                $dialog({
                    title:"导出json",
                    content:JSON.stringify(data.value),
                })
            }},
            {label:'导入',handler:() => {
                $dialog({
                    title:"导入json",
                    content:'内容',
                    footer:true,
                    onConfirm(text){   // 回调 拿到输入的文本 
                        commands.updateContainer(JSON.parse(text));
                    }
                })
            }},
            {label:'置顶',handler:() => commands.placeTop()},
            {label:'置底',handler:() => commands.placeBottom()},
            {label:'删除',handler:() => commands.delete()},

            {label:()=>previewRef.value ? '编辑':'预览',handler:() => {
                clearBlockFocus();
                previewRef.value = !previewRef.value;
            }},
            {label:'关闭',handler:() => {
                editorRef.value = false
            }}

        ]

        const onContextmenuBlock = (e,block) => {
            // 鼠标右击事件 阻止默认行为
            e.preventDefault();
            $dropdown({
                el:e.target,   // 以某个元素为准
                content:() => {
                    return <>
                        <DropdownItem label='删除' onClick={() => commands.delete()} />
                        <DropdownItem label='置顶' onClick={() => commands.placeTop()} />
                        <DropdownItem label='置底' onClick={() => commands.placeBottom()} />
                        <DropdownItem label='查看' onClick={() => {
                              $dialog({
                                    title:"查看节点数据",
                                    content:JSON.stringify(block),
                                })
                        }} />
                    </>
                }
            })
        }


        return ()=> !editorRef.value ? <>
              <div class="editor_container_canvas_content" 
                    style={containerStyle.value}
                    style='background:yellowgreen'
                >
                    {
                        (data.value.blocks.map((block,index) => (
                            <EditorBlock 
                                class={ 'editor_block_preview' }
                                block={block}
                            />
                        )))
                    }
                </div>
                <div>
                    <ElButton type='primary' onClick={() => editorRef.value = true}>继续编辑</ElButton>
                </div>
        
        </>:<div class="editor">
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
                        const label = typeof btn.label === 'function' ? btn.label() : btn.label;  
                        return <div class='editor_top_item' onClick={btn.handler}>{label}</div>
                    })
                }
            </div>
            <div class='editor_right'>
                {/* 
                    右侧属性控制
                */}
                <EditorOperator block={lastSelectBlock.value} data={data.value} />
            </div>
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
                                    class={previewRef.value ? 'editor_block_preview' : ''}
                                    block={block}
                                    onMousedown={(e) =>blockMousedown(e,block,index)}  
                                    onContextmenu = {(e) => onContextmenuBlock(e,block)}
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