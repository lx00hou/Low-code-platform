import { ElButton, ElDialog, ElInput } from "element-plus";
import { provide,inject, defineComponent,createVNode,render, reactive, computed, onMounted, ref, onBeforeUnmount } from "vue";
import '../asset/css/editor.scss';


export const DropdownItem = defineComponent({
    props:{
        label:String
    },
    setup(props, ctx){
        let {label} = props; 
        let hide = inject('hide');
        return () => <div class='dropdown-item' onClick={hide}>
            <span>{label}</span>
        </div>
    }
})

const DropdownComponent = defineComponent({
    props:{
        option:{type:Object}
    },
    setup(props, ctx) {
        const state = reactive({
            option:props.option,   // 更新 option数据
            isShow:false,
            top:0,
            left:0
        })
        ctx.expose({   // 外界调用组件的方法 (向外界暴露方法)
            showDropdown(option){
                state.option = option; 
                state.isShow = true;
                let {left,top,height} = option.el.getBoundingClientRect(); 
                state.top = top + height;
                state.left = left;
            }
        })
        provide('hide',() => {
            // 向下级组件注入点击隐藏 方法
            state.isShow = false;
        })
        const classes = computed(() => [
            'dropdown',
            {
                'dropdown-isshow':state.isShow
            }
        ])
        const styles = computed(() => ({
            top:state.top+'px',
            left:state.left+'px'
        }))
        const el = ref(null);
        const onMousedownDocument = (e) => {
            // 由于我们之前禁止了事件传播 , 所以采用捕获body点击事件
            if(!el.value.contains(e.target)){   // 点击下拉菜单内部 不做任何处理
                state.isShow = false
            }
        }
        onMounted(() => {
            // addEventListener() 第三个参数 true:捕获(由外向里) ,false:冒泡(由里向外) 
            document.body.addEventListener('mousedown',onMousedownDocument,true)
        })
        onBeforeUnmount(() => {
            document.body.removeEventListener('mousedown',onMousedownDocument)
        })
        return ()=>{
            return <div class={classes.value} style={styles.value} ref={el}>
                {state.option.content()}
            </div>
        }
        
    },
})





let vm;   // 组件实例 
export function $dropdown(option){
    // 手动挂载组件
    if(!vm){
        let el = document.createElement('div');
        vm = createVNode(DropdownComponent,{option})   //  组件渲染虚拟节点
        document.body.appendChild((render(vm,el),el))   // 渲染真实节点扔到页面中
    }
    let {showDropdown} = vm.component.exposed
    showDropdown(option)
}