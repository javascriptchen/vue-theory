# 这是一个实现vue双向数据绑定的仓库
![](https://user-gold-cdn.xitu.io/2018/12/25/167e4dc1aeb98f7d?w=2006&h=906&f=png&s=248125)

1./compiler ⽬目录是编译模版;

2./core ⽬目录是 Vue.js 的核⼼心(也是后⾯面的重点);

3./platforms ⽬目录是针对核⼼心模块的 ‘平台’ 模块;

4./server ⽬目录是处理理服务端渲染;

5./sfc ⽬目录处理理单⽂文件 .vue;

6./shared ⽬目录提供全局⽤用到的⼯工具函数。

Vue.js 的组成是由 core + 对应的 ‘平台’ 补充代码构成(独立构建和运行时构建 只是 platforms 下 web 平台的两种选择)。
![](https://user-gold-cdn.xitu.io/2018/12/25/167e4e4c3277b95b?w=1754&h=962&f=png&s=282381)

###  vue的双向数据绑定
双向绑定（响应式原理）所涉及到的技术

```
1. Object.defineProperty
2. Observer
3. Watcher
4. Dep
5. Directive
```
#### 1. Object.defineProperty

```
var obj = {};
var a;
Object.defineProperty(obj,'a',{
  get: function(){
    console.log('get val');
    return a;
  },
  set: function(newVal){
    console.log('set val:' + newVal);
    a = newVal;
  }
});
obj.a // get val;   相当于<span>{{a}}</span>
obj.a = '111'; // set val:111  相当于<input v-model="a">
```

![](https://user-gold-cdn.xitu.io/2018/12/25/167e4e9983a2bb1c?w=1598&h=882&f=png&s=376242)
setter 触发消息到 Watcher watcher帮忙告诉 Directive 更新DOM，DOM中修改了数据 也会通知给 Watcher，watcher 帮忙修改数据。

### 2. Observer
```
观察者模式是软件设计模式的一种。
在此种模式中，一个目标对象管理所有相依于它的观 察者对象，并且在它本身的状态改变时主动发出通知。
这通常透过呼叫各观察者所提供的 方法来实现。此种模式通常被用来实时事件处理系统。
订阅者模式涉及三个对象:
发布者、主题对象、订阅者，三个对象间的是一对多的关系，
每当主题对象状态发生改变时，其相关依赖对象都会得到通知，并被自动更新。
看一个简单的示例:
```
![](https://user-gold-cdn.xitu.io/2018/12/25/167e4f395d227c1c?w=1331&h=629&f=png&s=354107)

![](https://user-gold-cdn.xitu.io/2018/12/25/167e4f476b7704c3?w=1322&h=863&f=png&s=514663)
vue里边怎么操作的呢？ vue observer

![](https://user-gold-cdn.xitu.io/2018/12/25/167e5628d501d795?w=1448&h=1050&f=png&s=328558)
![](https://user-gold-cdn.xitu.io/2018/12/25/167e562da66ec86c?w=1484&h=1026&f=png&s=633148)
![](https://user-gold-cdn.xitu.io/2018/12/25/167e5655db9b62fd?w=1942&h=1416&f=png&s=770576)
3. watcher

![](https://user-gold-cdn.xitu.io/2018/12/26/167e872b0a3c9b6e?w=2692&h=1616&f=png&s=2037332)

![](https://user-gold-cdn.xitu.io/2018/12/26/167e872e57d2fb75?w=1291&h=783&f=png&s=454055)

4. Dep

![](https://user-gold-cdn.xitu.io/2018/12/26/167e873239090019?w=1245&h=834&f=png&s=363098)

5. Directive

![](https://user-gold-cdn.xitu.io/2018/12/26/167e873708747731?w=1128&h=636&f=png&s=125588)

![](https://user-gold-cdn.xitu.io/2018/12/26/167e874b0597ec03?w=1886&h=1282&f=png&s=673401)
![](https://user-gold-cdn.xitu.io/2018/12/26/167e874d75d87419?w=1872&h=1268&f=png&s=479581)

![](https://user-gold-cdn.xitu.io/2018/12/26/167e875302561d0b?w=1730&h=894&f=png&s=572293)

弄明白原理和架构之后，我们来实现一个简单的vue双向数据绑定

![](https://user-gold-cdn.xitu.io/2018/12/26/167e87a4862bb96a?w=2468&h=1446&f=png&s=308069)
## 1.这个Vue是从哪里来的呢？

![](https://user-gold-cdn.xitu.io/2018/12/26/167e87ba423e0cae?w=2592&h=726&f=png&s=215990)
是通过上述方法实例化的一个对象；但是里边有两个未知生物 observe ？ Compile?
![](https://user-gold-cdn.xitu.io/2018/12/26/167e87ce1cbfc36d?w=2570&h=1526&f=png&s=404437)
**observe中写的是双向绑定的核心原理就是Object.defineProperty**

通过set，get来设置值与获取值

把text属性绑定到vue实例上面去使用

那其中的Dep又是什么呢？

![](https://user-gold-cdn.xitu.io/2018/12/26/167e88037d38d1a5?w=2040&h=860&f=png&s=204825)
添加订阅者跟通知订阅更新

再来看一下Compile中写的什么吧
```
function Compile(node, vm) {
  if (node) {
    this.$frag = this.nodeToFragment(node, vm);
    return this.$frag;
  }
}
Compile.prototype = {
  nodeToFragment: function (node, vm) {
    var self = this;
    var frag = document.createDocumentFragment(); // 创建一段html文档片段
    var child;

    while (child = node.firstChild) {
      self.compileElement(child, vm);
      frag.append(child); // 将所有子节点添加到fragment中
    }
    return frag;
  },
  compileElement: function (node, vm) {
    var reg = /\{\{(.*)\}\}/;

    //节点类型为元素
    if (node.nodeType === 1) {
      var attr = node.attributes;
      // 解析属性
      for (var i = 0; i < attr.length; i++) {
        if (attr[i].nodeName == 'v-model') {
          var name = attr[i].nodeValue; // 获取v-model绑定的属性名
          node.addEventListener('input', function (e) {
            // 给相应的data属性赋值，进而触发该属性的set方法
            // 触发set vm[name]
            vm[name] = e.target.value;
          });
          // node.value = vm[name]; // 将data的值赋给该node
          new Watcher(vm, node, name, 'value');
        }
      };
    }
    //节点类型为text
    if (node.nodeType === 3) {
      if (reg.test(node.nodeValue)) {
        var name = RegExp.$1; // 获取匹配到的字符串
        name = name.trim();
        // node.nodeValue = vm[name]; // 将data的值赋给该node
        new Watcher(vm, node, name, 'nodeValue');
      }
    }
  },
}
```

哦，原来Compile中是渲染html的啊。其中的Watcher是不是监控节点变化，然后给Dep通知的呢？

```
function Watcher(vm, node, name, type) {
    Dep.target = this;
    this.name = name; //text
    this.node = node; // 节点
    this.vm = vm; // vue实例
    this.type = type; //nodeValue 当前节点的值
    this.update();
    Dep.target = null;
}

Watcher.prototype = {
    update: function() {
        this.get();
        var batcher = new Batcher();
        batcher.push(this);
        // this.node[this.type] = this.value; // 订阅者执行相应操作
    },
    cb:function(){
        this.node[this.type] = this.value; // 订阅者执行相应操作
    },
    // 获取data的属性值
    get: function() {
        this.value = this.vm[this.name]; //触发相应属性的get
    }
}

```
哎呦，咱们猜对了呢，这样双向数据绑定马上就要完成了,只剩一个Vue.nextTick()的地方了
```
/**
 * 批处理构造函数
 * @constructor
 */
function Batcher() {
    this.reset();
}

/**
 * 批处理重置
 */
Batcher.prototype.reset = function () {
    this.has = {};
    this.queue = [];
    this.waiting = false;
};

/**
 * 将事件添加到队列中
 * @param job {Watcher} watcher事件
 */
Batcher.prototype.push = function (job) {
    if (!this.has[job.name]) {
        this.queue.push(job);
        this.has[job.name] = job;
        if (!this.waiting) {
            this.waiting = true;
            setTimeout(() => {
                this.flush();
            });
        }
    }
};

/**
 * 执行并清空事件队列
 */
Batcher.prototype.flush = function () {
    this.queue.forEach((job) => {
        job.cb();
    });
    this.reset();
};
```
看完后是不是觉得超简单呢？

vue3版本将做出巨大的变化，把Dep跟Watcher都干掉了，html直接跟数据进行绑定，等vue3出来后，在写一篇关于vue的文章吧
