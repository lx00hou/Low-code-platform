// 画布内 组件的拖拽
import { ComputedRef, reactive,getCurrentInstance } from 'vue';
import { blockInterface,dataInterface } from '../utils/dataJsonCheck';
import { focusDataInterface } from './useFocus';

export function useBlockDrag(focusData,lastSelectBlock,data){
    let curInstance = getCurrentInstance();
    /**
     * focusData:focusDataInterface[] --> focus 被选中的物料组件信息集合
     * lastSelectBlock:blockInterface --> 最后一个被选中的物料组件信息
     */
    let dragState = {
        startX:0,
        startY:0,
        dragging:false   // 当前是否在拖拽 默认 false
    }
    let markLine = reactive({
        x:null,
        y:null
    })
    const mousedown = (e) => {
        // 被拖拽的元素 位置信息

        let BWidth = lastSelectBlock.value.width;
        let BHeight = lastSelectBlock.value.height;
        // // 鼠标按下时 记录被选中元素相对浏览器的 垂直水平座标
        dragState = {
            startX:e.clientX,
            startY:e.clientY,
            dragging:false,
            startLeft:lastSelectBlock.value.left,   // 被拖拽元素 left 
            startTop:lastSelectBlock.value.top,  // 被拖拽元素 top
            startPos:focusData.value.focus.map(({top,left}) => ({top,left})),
            /**
             * ({top,left}) => ({top,left})
             * 解构出每一项的top left ,返回一个对象 {top:top,left:left}
             */
            lines:(() => {
                let unfocusData = focusData.value.unfocus
                // 获取屏幕上所有 该出现辅助线的 位置集合
                let lines = {
                    x:[],
                    y:[]
                };  // 计算辅助线位置 y 横向 x 纵向
                [
                    ...unfocusData,
                    {
                        top:0,
                        left:0,
                        width:data.value.container.width,
                        left:data.value.container.left
                    }
                ].forEach((block) => {   // 获取所有 未被选中的元素信息位置
                    const {top:ATop,left:ALeft,width:AWidth,height:AHeight} = block;
                    lines.y.push({showTop:ATop,top:ATop});
                    lines.y.push({showTop:ATop,top:ATop - BHeight});
                    lines.y.push({showTop:ATop+AHeight / 2 ,top:ATop+AHeight / 2 - BHeight /2 });
                    // 对中
                    lines.y.push({showTop:ATop+AHeight,top:ATop+AHeight}); 
                    lines.y.push({showTop:ATop+AHeight,top:ATop+AHeight - BHeight});

                    lines.x.push({showLeft:ALeft,left:ALeft})
                    lines.x.push({showLeft:ALeft+AWidth,left:ALeft+AWidth})
                    lines.x.push({showLeft:ALeft+AWidth/2,left:ALeft+AWidth/2 - BWidth /2})
                    lines.x.push({showLeft:ALeft+AWidth,left:ALeft + AWidth - BWidth})
                    lines.x.push({showLeft:ALeft,left:ALeft - BWidth})
                })
                return lines
            })()
        }

        document.addEventListener('mousemove',mousemove);
        document.addEventListener('mouseup',mouseup);
    }
    const mousemove = (e) => {
        
        let {clientX:moveX,clientY:moveY} = e;   
        if(!dragState.dragging){
            dragState.dragging = true;   // 正在拖拽
            curInstance?.proxy?.$Bus.emit('start');   // 触发事件 拖拽前 记住位置
        }
        // 计算当前元素 left top 去lines中查找
        let left = moveX - dragState.startX + dragState.startLeft  // 最新位置 - 之前位置 + left
        let top = moveY - dragState.startY + dragState.startTop   // 最新位置 - 之前位置 + top

        let x = null;
        let y = null;
        // 计算横向辅助线 距离参照物元素 还有3像素时 显示辅助线
        for (let i = 0; i < dragState.lines.y.length; i++) {
            const {top:t,showTop:s} = dragState.lines.y[i];
            if(Math.abs(t-top) < 5){
                y = s;
                moveY = dragState.startY - dragState.startTop + t;
                break;
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            const {left:l,showLeft:s} = dragState.lines.x[i];
            if(Math.abs(l-left) < 5){
                x = s;
                moveX = dragState.startX - dragState.startLeft + l;
                break;
            }
        }
        // markLine 响应式数据 xy 更新 试图
        markLine.x = x;
        markLine.y = y;


        let durX = moveX - dragState.startX;   // 获取移动时 相对浏览器的 水平座标
        let durY = moveY - dragState.startY;   // 获取移动时 相对浏览器的 垂直坐标
        focusData.value.focus.forEach((block,idx) => {   // 实时更新选中元素 坐标
            block.top = dragState.startPos[idx].top + durY;
            block.left = dragState.startPos[idx].left + durX;
        })
    }
    const mouseup = (e) => {  // 鼠标抬起 销毁监听事件
        document.removeEventListener('mousemove',mousemove);
        document.removeEventListener('mouseup',mouseup);
        markLine.x = null;
        markLine.y = null;
        if(dragState.dragging) {  // 如果只是点击 不会触发 只有移动元素 dragging 才会变为true 
            dragState.dragging = false;
            curInstance?.proxy?.$Bus.emit('end');
        }
    }


    return {
        mousedown,markLine
    }
}