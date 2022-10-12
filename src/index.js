import h from './mysnabbdom/h'
import patch from "./mysnabbdom/patch"

// * 也就是说，调用h函数的时候形态必须是下面的三种之一：
// *  形态① h('div', {}, '文字')
// *  形态② h('div', {}, [])
// *  形态③ h('div', {}, h())

const oldVnode = h('ul', {}, [
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'B' }, 'B'),
  h('li', { key: 'D' }, 'D'),
  h('li', { key: 'C' }, 'C'),
]);

// 得到盒子和按钮
const container = document.getElementById('container');
const btn = document.getElementById('btn');

// 第一次上树
patch(container, oldVnode);

// 新节点
const newVode = h('ul', {}, [
  h('li', { key: 'E' }, 'E'),
  h('li', { key: 'A' }, 'A'),
  h('li', { key: 'C' }, 'C'),
  h('li', { key: 'B' }, 'B'),

]);
btn.onclick = function () {
  patch(oldVnode, newVode);
}