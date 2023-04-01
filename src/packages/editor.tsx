import { defineComponent , computed} from "vue";
import EditorBlock from "./editor-block";
import './editor.scss';

// interface blockInterface {
//     top:number,
//     left:number,
//     key:string,
//     [propName:string]: number | string
// }

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
       
        // const containerStyle = computed(() => {
        //     return {
        //         width:data.value.container.width+'px',
        //         height:data.value.container.height+'px'
        //     }
        // })  
        const containerStyle= computed(() => ({   // 画布大小 放入计算属性
            width:data.value!.container.width+'px',
            height:data.value!.container.height+'px'
        }))  

        return ()=> <div class="editor">
            <div class='editor_left'>左侧物料区</div>
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