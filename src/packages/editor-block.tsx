
 import { defineComponent , computed ,inject,ref, onMounted} from "vue";
 import { componentInerface } from '../utils/editConfig';


export default defineComponent({
   props:{
    block:{type:Object}
   },
    setup(props) {
        const containerStyle = computed(() => ({   // 每一个UI组件的样式
            top:props.block!.top+'px',
            left:props.block!.left+'px',
            zIndex:props.block!.zIndex
        }))  
        const blockRef:any = ref(null);
        onMounted(() => {   // 元素渲染完毕后,当alignCenter 为true时,重新计算left top ,使元素居中
            let {offsetWidth,offsetHeight} = blockRef.value; 
            if(props.block!.alignCenter){
                // 原则重新派发事件,但是 vue3 Proxy代理,可以对数据进行更改 (但不建议)
                props.block!.left = props.block!.left -  offsetWidth/2;   
                props.block!.top = props.block!.top -  offsetHeight/2;
                props.block!.alignCenter = false;
            }
        })
        let blockMousedown = (e,block)=> {
            console.log('e',e.target);
            console.log('block',block);
        }
        const config:componentInerface = inject('config') as componentInerface;

        return () => {
            const component = config.componentMap[props.block!.key];
            let RenderComponent =  component.render();
            return <div class='eidt-block'  
                        style={containerStyle.value}
                        ref={blockRef}

                    >
                { RenderComponent }
            </div>    
        }
        
    }

})