import { Ref,getCurrentInstance } from 'vue';
import { dataInterface } from '../utils/dataJsonCheck';
// import { events } from '../utils/event';
// 左侧组件 拖拽到 画布
export function useMneuDragger(containRef:Ref<HTMLDivElement>,data:Ref<dataInterface>){
    const curInstance = getCurrentInstance();
    let curComponent:any = null;   // 当前拖拽的物料组件
    const dragStart = (e,component) => {
        // 拖拽开始 绑定事件
        containRef.value!.addEventListener('dragenter',dragenter);  // 进入元素  
        containRef.value!.addEventListener('dragover',dragover);  // 目标元素经过
        containRef.value!.addEventListener('dragleave',dragleave);  // 离开元素
        containRef.value!.addEventListener('drop',drop);   // 松手
        curComponent = component;
        curInstance?.proxy?.$Bus.emit('start');
    }
    const dragend = (e) => {
        // 拖拽结束 移除事件
        containRef.value!.removeEventListener('dragenter',dragenter);  // 进入元素  
        containRef.value!.removeEventListener('dragover',dragover);  // 目标元素经过
        containRef.value!.removeEventListener('dragleave',dragleave);  // 离开元素
        containRef.value!.removeEventListener('drop',drop);   // 松手
        curInstance?.proxy?.$Bus.emit('end');
    }
    const dragenter = (e) => {
        e.dataTransfer.dropEffect = 'move';
    }
    const dragover = (e) => {
        e.preventDefault();
    }
    const dragleave = (e) => {
        e.dataTransfer.dropEffect = 'none'
    }
    const drop = (e) => {
        let {blocks} = data.value;
        // 更新 计算属性 数据
        data.value = {...data.value,blocks:[
            ...blocks,
            {
                top:e.offsetY,
                left:e.offsetX,
                zIndex:1,
                key:curComponent.key,
                alignCenter:true,   // 拖拽的元素 画布居中标识
                props:{}   // 组件独有的属性 text,color 等
            }
        ]}
        curComponent = null;
    }

    return {
        dragStart,dragend
    }

}