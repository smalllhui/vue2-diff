# vue2 diff算法剖析

代码参考[snabbdom](https://github.com/snabbdom/snabbdom)

```
"snabbdom": "^2.1.0"
```

## 一、环境搭建

### 1、安装webpack

```json
//package.json
{
  "name": "study-snabbdom",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^5.11.0",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.0"
  }
}
```

### 2、配置webpack

```js
// webpack.config.js
// 从https://www.webpackjs.com/官网照着配置
const path = require('path');

module.exports = {
    // 入口
    entry: './src/index.js',
    // 出口
    output: {
        // 虚拟打包路径，就是说文件夹不会真正生成，而是在8080端口虚拟生成
        publicPath: 'xuni',
        // 打包出来的文件名，不会真正的物理生成
        filename: 'bundle.js'
    },
    devServer: {
        // 端口号
        port: 8080,
        // 静态资源文件夹
        contentBase: 'www'
    }
};
```

### 3、创建index.html文件

在项目根路径创建**`www`**文件夹，下创建index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <button id="btn">按我改变DOM</button>
    <div id="container"></div>
    
    <script src="/xuni/bundle.js"></script>
</body>
</html>
```

### 4、创建index.js文件

在项目根路径创建**`src`**文件夹，下创建index.js

```js
//index.js
console.log('我是webpack入口js文件');
```

### 5、运行项目

npm run dev

在浏览器输入：http://localhost:8080/
浏览器控制台输出：我是webpack入口js文件 即配置成功

## 二、虚拟DOM和diff算法

### 1、虚拟DOM介绍

#### 虚拟DOM

![01.PNG](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/23eba462dbf845bbb2e525c9ab602869~tplv-k3u1fbpfcp-watermark.image?)

#### 虚拟DOM树

![03.PNG](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/848af1153a7a4bbb8769a3fc44ef908f~tplv-k3u1fbpfcp-watermark.image?)

### 2、diff算法

##### 1、diff算法介绍

![02.PNG](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc70ed453f9843188f7284384bbbc983~tplv-k3u1fbpfcp-watermark.image?)

- 最小量更新太厉害啦！真的是最小量更新！**`当然，key很重要`**。key是这个节点的 唯一标识，告诉diff算法，在更改前后它们是同一个DOM节点。

- **`只有是同一个虚拟节点，才进行精细化比较，否则就是暴力删除旧的、插入新的。`** 延伸问题：如何定义是同一个虚拟节点？答：**`选择器相同且key相同。`**

- **`只进行同层比较，不会进行跨层比较。`**即使是同一片虚拟节点，但是跨层了，对不起，精细化比较不diff你，而是暴力删除旧的、然后插入新的。

##### 2、如何定义“同一个节点”
 <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4ff7cce8785d4f7a9a48c5b4b632f6cd~tplv-k3u1fbpfcp-watermark.image?" style="zoom:50%;" />

##### 3、子节点需要递归创建的

 <img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0afd42e594044f44b2322a3eefb8e2bf~tplv-k3u1fbpfcp-watermark.image?" style="zoom:50%;" />


##### 4、如何判断新旧节点不是同一个节点时

 <img src="https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2f98758b032844658834ac7895a7ee25~tplv-k3u1fbpfcp-watermark.image?" style="zoom:50%;" />

```js
import vnode from './vnode.js';
import createElement from "./createElement"
/**
 * @description: 节点上树
 * @param {*} oldVnode 老节点
 * @param {*} newVnode 新节点
 */
export default function patch(oldVnode, newVnode) {
  // 判断传入的第一个参数，是DOM节点还是虚拟节点？
  if (oldVnode.sel == '' || oldVnode.sel == undefined) {
    // 传入的第一个参数是DOM节点，此时要包装为虚拟节点
    oldVnode = vnode(oldVnode.tagName.toLowerCase(), {}, [], undefined, oldVnode);
  }

  // 判断oldVnode和newVnode是不是同一个节点
  if (oldVnode.key == newVnode.key && oldVnode.sel == newVnode.sel) {
    console.log('是同一个节点,精细化对比');

  } else {
    console.log('不是同一个节点，暴力插入新的，删除旧的');
    let newVnodeElm = createElement(newVnode);

    // 插入到老节点之前
    if (oldVnode.elm.parentNode && newVnodeElm) {
      oldVnode.elm.parentNode.insertBefore(newVnodeElm, oldVnode.elm);
    }
    // 删除老节点
    oldVnode.elm.parentNode.removeChild(oldVnode.elm);
  }
};
```

##### 5、处理新旧节点是同一个节点时

![07.PNG](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16edcb215b314d00b500bb0a9ee069e4~tplv-k3u1fbpfcp-watermark.image?)

```javascript
import createElement from "./createElement";
import updateChildren from './updateChildren.js';

/**
 * @description: oldVnode和newVnode是不是同一个节点 精细化对比
 * @param {*} oldVnode 旧节点
 * @param {*} newVnode 新节点
 */
export default function patchVnode(oldVnode, newVnode) {
  // 判断新旧vnode是否是同一个对象
  if (oldVnode === newVnode) return;
  // 判断新vnode有没有text属性
  if (newVnode.text != undefined && (newVnode.children == undefined || newVnode.children.length == 0)) {
    // 新vnode有text属性
    console.log('新vnode有text属性');
    if (newVnode.text != oldVnode.text) {
      // 如果新虚拟节点中的text和老的虚拟节点的text不同，那么直接让新的text写入老的elm中即可。如果老的elm中是children，那么也会立即消失掉。
      oldVnode.elm.innerText = newVnode.text;
    }
  } else {
    // 新vnode没有text属性，有children
    console.log('新vnode没有text属性');
    // 判断老的有没有children
    if (oldVnode.children != undefined && oldVnode.children.length > 0) {
      // 老的有children，新的也有children，此时就是最复杂的情况。
      updateChildren(oldVnode.elm, oldVnode.children, newVnode.children);
    } else {
      // 老的没有children，新的有children
      // 清空老的节点的内容
      oldVnode.elm.innerHTML = '';
      // 遍历新的vnode的子节点，创建DOM，上树
      for (let i = 0; i < newVnode.children.length; i++) {
        let dom = createElement(newVnode.children[i]);
        oldVnode.elm.appendChild(dom);
      }
    }
  }
}
```

#### 3、子节点更新策略

对比 （从上往下，顺序不能变、命中一种就不再进行命中判断了）
	① 新前与旧前
	② 新后与旧后
	③ 新后与旧前 （此种发生了，涉及移动节点，那么新前指向的节点，移动的旧后之后）
	④ 新前与旧后 （此种发生了，涉及移动节点，那么新前指向的节点，移动的旧前之前）

4个如果都没有命中，就需要用循环来寻找了。移动到oldStartIdx之前。
如果是新节点先循环完毕，如果老节点中 还有剩余节点(旧前和新后指针中间的节 点)，说明他们是要被删除的节点。

###### ① 新前和旧前命中

1、**新数组的结尾节点有剩余则添加**

 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/903ab89fa722417687249269ca4e8113~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

从左往右比对完，老数组的游标先相交了，发现新数组结尾还有节点没有比对，则追加【创建新数组中剩下没有比对的节点】

2、**老数组的结尾节点有剩余则删除**

 ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1d3c4df8768491e9ff7cc7dd8258db2~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

从左往右比对完，新数组的游标先相交了，发现老数组结尾还有节点没有比对，则删除老数组剩下没有比对的节点。

```js
import patchVnode from './patchVnode.js';
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


  // 开始大while了
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (checkSameVnode(oldStartVnode, newStartVnode)) {
      console.log('①新前和旧前命中');
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (checkSameVnode(oldEndVnode, newEndVnode)) {
      console.log('②新后和旧后命中');

    } else if (checkSameVnode(oldStartVnode, newEndVnode)) {
      console.log('③新后和旧前命中');

    } else if (checkSameVnode(oldEndVnode, newStartVnode)) {
      console.log('④新前和旧后命中');

    } else {
      // 四种命中都没有命中

    }
  }

  // 继续看看有没有剩余的要处理
  if (newStartIdx <= newEndIdx) {
    // 1、新数组的结尾节点有剩余则添加
    console.log('新数组中还有未处理节点');
    // 遍历新的newCh，添加到老的后面
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      // insertBefore方法可以自动识别null，如果是null就会自动排到队尾去。和appendChild是一致了。
      // newCh[i]现在还没有真正的DOM，所以要调用createElement()函数变为DOM
      parentElm.insertBefore(createElement(newCh[i]), oldCh[oldStartIdx] ? oldCh[oldStartIdx].elm : null);
    }
  } else if (oldStartIdx <= oldEndIdx) {
    // 2、老数组的结尾节点有剩余则删除
    console.log('老数组的结尾节点有剩余则删除');
    // 批量删除oldStart和oldEnd指针之间的项
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      parentElm.removeChild(oldCh[i].elm);
    }
  }
};
```

###### ② 新后与旧后

1、**新数组的开头节点有剩余则添加**

 ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2a770b79e1774d4a87022e6caa355dd5~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

从右往左比对完，老数组的游标先相交了，发现新数组开头还有节点没有比对，则在新数组开头创建没有比对的节点。

2、**老数组的开头节点有剩余则删除**

 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d67845110f4045cf916ca99e298024dc~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

从右往左比对完，新数组的游标先相交了，发现老数组的开头还有节点没有比对，则删除老数组开头没有比对的节点。

```js
import patchVnode from './patchVnode.js';
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


  // 开始大while了
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (checkSameVnode(oldStartVnode, newStartVnode)) {
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

    } else if (checkSameVnode(oldEndVnode, newStartVnode)) {
      console.log('④新前和旧后命中');

    } else {
      // 四种命中都没有命中

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
    // 2、老数组的结尾节点有剩余则删除
    console.log('老数组的结尾节点有剩余则删除');
    // 批量删除oldStart和oldEnd指针之间的项
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      parentElm.removeChild(oldCh[i].elm);
    }
  }
};
```

###### ③ 新后与旧前

 ![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/49df8b481bf24c99a6fa2df6e746e18c~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

如果老数组的开头节点与新数组的结尾节点比对成功了，除了会继续递归比对它们，还将真实节点 A 移动到结尾。

```js
if (checkSameVnode(oldStartVnode, newEndVnode)) {
      console.log('③新后和旧前命中');
      patchVnode(oldStartVnode, newEndVnode);
      // 当③新后与旧前命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧后的后面
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
} 
```

###### ④ 新前与旧后

 ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4119835217241e28327c8c0338fd405~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

如果老数组的结尾节点与新数组的开始节点比对成功了，除了会继续递归比对它们，还将真实节点D移动到开头。

```js
if (checkSameVnode(oldEndVnode, newStartVnode)) {
      console.log('④新前和旧后命中');
      patchVnode(oldEndVnode, newStartVnode);
      // 当④新前和旧后命中的时候，此时要移动节点。移动新前指向的这个节点到老节点的旧前的前面
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
      // 如何移动节点？？只要你插入一个已经在DOM树上的节点，它就会被移动
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
}
```

###### 以上四种情况都没对比成功

如果以上4种情况都没找到，则拿新数组的第一个节点去老数组中去查找。

 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b96e07c3ed443dfad27016d361f8298~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

如果拿新数组的第一个节点去老数组中查找成功了，则会继续递归比对它们，同时将比对到的节点移动到对应的节点前面，并且将老数组原来的位置内容设置为 undefind。

```js
else {
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
        // 1.2、没有找到
   
      }
}
```

 ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5bd01e8bfcda44c18851220452104f97~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp?)

如果拿新数组的第一个节点去老数组中查找，没找到，则创建一个新的节点**插入到未处理的节点前面**。

```js
else {
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
}
```

###### 完整子节点更新代码

```js
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
```
##### 4、流程图

![流程图.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9b2a5ff919424ad0ac1132cdebc0f63f~tplv-k3u1fbpfcp-watermark.image?)