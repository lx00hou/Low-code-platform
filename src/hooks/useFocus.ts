import { computed,ComputedRef,ref,Ref } from "vue";
import { blockInterface,dataInterface } from '../utils/dataJsonCheck';

export interface focusDataInterface {
    focus:blockInterface[],   // 画布内被选中的物料组件数据
    unfocus  // 画布内没被选中的物料组数据
}

// 判断画布中 哪些元素被选中 && 添加 选中样式 && shift 多选
export function useFocus(data:Ref<dataInterface>,callback:Function){ 
    /**
     * data:JSON
     * callback:Function --> 画布物料组见被选中 回调函数
     */
    
    let lastSelectIndex = ref(-1);   // 最后一个被选中的元素索引
    let lastSelectBlock:ComputedRef<blockInterface> = computed(() => data.value.blocks[lastSelectIndex.value]);

    const focusData:ComputedRef<focusDataInterface> = computed(() => {
        let focus:blockInterface[] = [];
        let unfocus:blockInterface[] = [];
        // push() 属于浅拷贝 数据(focus[])变化时,原数据(data)也会发生变化;
        data.value.blocks.forEach((block:blockInterface) =>  (block.focus ? focus : unfocus).push(block) )
        return {focus,unfocus}
    }) 

    let blockMousedown = (e,block:blockInterface,index:number) :void => {   // 鼠标按下
        
        e.preventDefault();
        e.stopPropagation(); 
        if(e.shiftKey){  // 按下 shift
            if(focusData.value.focus.length <= 1){
                block.focus = true
            }else block.focus = !block.focus
            
        }else {
            if(!block.focus){
                // 清空其他组件的 focus 属性
                clearBlockFocus();
                block.focus = true;
            }
        }
        lastSelectIndex.value = index;
        callback(e)  // 选中后 触发回调
    }

    const clearBlockFocus = ():void => {
        lastSelectIndex.value = -1;
        data.value.blocks.forEach(block => block.focus = false);
    }
   
    return {
        blockMousedown,clearBlockFocus,focusData,lastSelectBlock
    }
}