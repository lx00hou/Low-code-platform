// 画布内 组件的拖拽
interface startInterface {
    startX:number,
    startY:number,
    startPos?:{
        left:number,
        top:number
    }[]
}
export function useBlockDrag(focusData){
    let dragState:startInterface = {
        startX:0,
        startY:0,
    }
    const mousedown = (e) => {
        // 鼠标按下时 记录被选中元素相对浏览器的 垂直水平座标
        dragState = {
            startX:e.clientX,
            startY:e.clientY,
            startPos:focusData.value.focus.map(({top,left}) => ({top,left}))
            /**
             * ({top,left}) => ({top,left})
             * 解构出每一项的top left ,返回一个对象 {top:top,left:left}
             */
        } as startInterface

        document.addEventListener('mousemove',mousemove);
        document.addEventListener('mouseup',mouseup);
    }
    const mousemove = (e) => {
        let {clientX:moveX,clientY:moveY} = e;   
        let durX = moveX - dragState.startX;   // 获取移动时 相对浏览器的 水平座标
        let durY = moveY - dragState.startY;   // 获取移动时 相对浏览器的 垂直坐标
        focusData.value.focus.forEach((block,idx) => {   // 实时更新选中元素 坐标
            block.top = dragState.startPos![idx].top + durY;
            block.left = dragState.startPos![idx].left + durX;
        })
    }
    const mouseup = (e) => {  // 鼠标抬起 销毁监听事件
        document.removeEventListener('mousemove',mousemove);
        document.removeEventListener('mouseup',mouseup);
    }


    return {
        mousedown
    }
}