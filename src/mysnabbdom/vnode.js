// 函数的功能非常简单，就是把传入的5个参数组合成对象返回

/**
 * @description: 生成虚拟dom
 * @param {*} sel 元素标签选择器
 * @param {*} data 数据
 * @param {*} children 子节点
 * @param {*} text 文字
 * @param {*} elm 真实的dom节点
 * @return {*} 虚拟Dom
 */
export default function (sel, data, children, text, elm) {
  const key = data.key;
  return {
    sel, data, children, text, elm, key
  };
}