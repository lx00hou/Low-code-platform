
 import { defineComponent , computed ,inject} from "vue";
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

        const config:componentInerface = inject('config') as componentInerface;

        return () => {
            const component = config.componentMap[props.block!.key];
            let RenderComponent =  component.render();
            return <div class='eidt-block'  style={containerStyle.value}>
                { RenderComponent }
            </div>    
        }
        
    }

})