
 import { defineComponent , computed} from "vue";

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

        return () => {
            return <div class='eidt-block'  style={containerStyle.value}>123</div>    
        }
        
    }

})