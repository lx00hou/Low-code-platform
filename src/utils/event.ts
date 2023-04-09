import mitt from 'mitt';   // mitt  公共的发布订阅库
export const events = mitt();   // 导出一个 发布订阅对象