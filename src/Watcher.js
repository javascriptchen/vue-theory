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
