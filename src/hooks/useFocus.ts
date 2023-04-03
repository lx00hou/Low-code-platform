import { computed,Ref } from "vue";
import { blockInterface,dataInterface } from '../utils/dataJsonCheck';
// 判断画布中 哪些元素被选中 && 添加 选中样式 && shift 多选
export function useFocus(data:Ref<dataInterface>,callback:Function){  
    const focusData = computed(() => {
        let focus:blockInterface[] = [];
        let unfocus:blockInterface[] = [];
        // push() 属于浅拷贝 数据(focus[])变化时,原数据(data)也会发生变化;
        data.value.blocks.forEach((block:blockInterface) =>  (block.focus ? focus : unfocus).push(block) )
        return {focus,unfocus}
    })
    let blockMousedown = (e,block)=> {
        e.preventDefault();
        e.stopPropagation(); 
        if(e.shiftKey){  // 按下 shift
            block.focus = !block.focus
        }else {
            if(!block.focus){
                // 清空其他组件的 focus 属性
                clearBlockFocus();
                block.focus = true;
            }
            else block.focus = false;
        }
        callback(e)  // 选中后 触发回调
    }
    const clearBlockFocus = () => data.value.blocks.forEach(block => block.focus = false);
   
    return {
        blockMousedown,clearBlockFocus,focusData
    }
}