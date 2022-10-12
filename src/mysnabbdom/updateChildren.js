// 精细化对比 oldVnode和newVnode是不是同一个节点 
import patchVnode from './patchVnode.js';
// 真正创建节点。将vnode创建为DOM
import createElement from './createElement.js';

// 判断是否是同一个虚拟节点
function checkSameVnode(a, b) {
  return a.sel == b.sel && a.key == b.key;
};

/**
 * @description: diff更新子节点
 * @param {*} parentElm 父级dom节点
 * @param {*} oldCh 旧的子节点
 * @param {*} newCh 新的子节点
 * @return {*}
 */
export default function updateChildren(parentElm, oldCh, newCh) {
  // 旧前
  let oldStartIdx = 0;
  // 新前
  let newStartIdx = 0;
  // 旧后
  let oldEndIdx = oldCh.length - 1;
  // 新后
  let newEndIdx = newCh.length - 1;
  // 旧前节点
  let oldStartVnode = oldCh[0];
  // 旧后节点
  let oldEndVnode = oldCh[oldEndIdx];
  // 新前节点
  let newStartVnode = newCh[0];
  // 新后节点
  let newEndVnode = newCh[newEndIdx];

  let keyMap = null
  // 开始大while了
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 首先不是判断①②③④命中，而是要略过已经加undefined标记的东西
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx]
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx]
    } if (checkSameVnode(oldStartVnode, newStartVnode)) {
      console.log('①新前和旧前命中');
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (checkSameVnode(oldEndVnode, newEndVnode)) {
      console.log('②新后和旧后命中');
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldStartVnode, newEndVnode)) {
      console.log('③新后和旧前命中');
      patchVnode(oldStartVnode, newEndVnode);
      // 当③新后与旧前命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧后的后面
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (checkSameVnode(oldEndVnode, newStartVnode)) {
      console.log('④新前和旧后命中');
      patchVnode(oldEndVnode, newStartVnode);
      // 当④新前和旧后命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧前的前面
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      // 四种命中都没有命中
      // 制作keyMap一个映射对象，这样就不用每次都遍历老对象了。
      if (!keyMap) {
        keyMap = {};
        // 从oldStartIdx开始，到oldEndIdx结束，创建keyMap映射对象
        for (let i = oldStartIdx; i <= oldEndIdx; i++) {
          const key = oldCh[i].key;
          if (key !== undefined) {
            keyMap[key] = i;
          }
        }
      }

      // 1、拿新数组的第一个节点去老数组中去查找
      const idxInOld = keyMap[newStartVnode.key];

      // 1.1、找到
      if (idxInOld !== undefined) {
        // 如果不是undefined，不是全新的项，而是要移动
        const elmToMove = oldCh[idxInOld];
        // 1.1.1、继续递归比对它们
        patchVnode(elmToMove, newStartVnode);
        // 1.1.2、将比对到的节点移动到对应的节点前面，并且将老数组原来的位置内容设置为 undefind
        parentElm.insertBefore(elmToMove.elm, oldStartVnode.elm);
        oldCh[idxInOld] = undefined;
      } else {
        // 1.2、没有找到 则创建一个新的节点【插入到未处理的节点前面】
        // 判断，如果idxInOld是undefined表示它是全新的项
        // 被加入的项（就是newStartVnode这项)现不是真正的DOM节点
        parentElm.insertBefore(createElement(newStartVnode), oldStartVnode.elm);
      }

      // 指针下移，只移动新的头
      newStartVnode = newCh[++newStartIdx];

    }
  }

  // 新数组中还有未处理节点
  if (newStartIdx <= newEndIdx) {
    // 新数组的结尾节点有剩余则添加
    // 新数组的开头节点有剩余则添加
    console.log('新数组中还有未处理节点');
    // 遍历新的newCh，添加到老的后面
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // insertBefore方法可以自动识别null，如果是null就会自动排到队尾去。和appendChild是一致了。
      // newCh[i]现在还没有真正的DOM，所以要调用createElement()函数变为DOM
      parentElm.insertBefore(createElement(newCh[i]), oldCh[oldStartIdx] ? oldCh[oldStartIdx].elm : null);
    }
  } else if (oldStartIdx <= oldEndIdx) {
    // 新的先结束，判断老的虚拟DOM中是否还剩下，批量删除
    console.log('老数组的结尾节点有剩余则删除');
    // 批量删除oldStart和oldEnd指针之间的项
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldCh[i]) {
        parentElm.removeChild(oldCh[i].elm);
      }
    }
  }
};
