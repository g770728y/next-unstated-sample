# nextjs-unstated-sample

> nextjs 使用 unstated 做本地状态管理的 sample.

## 背景故事

[next.js](https://github.com/zeit/next.js)是最简单的 react ssr 框架,没有之一\
[unstated](https://github.com/jamiebuilds/unstated)是最简单的客户端状态管理库,没有之一\
项目使用了 `apollo graphql`. apollo 也提供了`apollo-link-state`用于管理前端状态, 但是...\
真的太难用了好不? 简单的本地状态管理你让我写 gql???\
果断改用 `unstated`

---

最开始, 非常好用, 直到某一天...\
服务器挂了, 原因是 nextjs 的渲染服务内存泄漏, 然后发现根源在`unstated`上\
于是仔细分析了`unstated`的源码. 不到 200 行的代码, 总结出了这个 sample\
(create-next-app 里的 withUnstated sample 太过简单, 没有参考价值)\
(google 也没有现成答案, 倒是有错误答案)

---

仔细思考, 还有可能出现脏读: 用户 1 读取了 用户 2 的登录信息

- 用户 1 读取登录信息并保存到 authState 全局变量
- 用户 2 读取登录信息并保存到 authState 全局变量, 覆盖上一步的信息
- 用户 1 使用 authState 渲染页面时, 将使用 用户 2 的数据!!!

---

这一切, 都归结于 全局变量的滥用
**注意只是 ssr 项目会出问题! 如果是纯前端项目, 全局变量带来的写法上的简化还是很吸引人的**

## 要点小结

### ssr 时, 不要将 Container 实例作为全局变量!

为了简单, 耍了点小联明, 将 authState 作为全局变量使用\
用起来真的简单, 方法里直接引用 authState, 就拿到了 loginUser\
然而上面的内存泄漏, 根源就在这里

每当我们`<Subscribe to={[authState]}>...</Subscribe>`
整个组件就会被 subscribe 到 authState 上\
在客户端没问题, 但 ssr 时:\
**全局变量是所有请求+所有页面共享的**

- 渲染请求 1 的 index 页面时, 页面会被注册到 authState
- 渲染请求 2 的 index 页面时, 页面会被注册到 authState
- 如此类推
  **这些页面全部不会被回收,因为没有 unsubscribe**\
  (为什么没有 unsubscribe?, 因为 Subscribe 组件的 componentWillUnmount 永不会在服务端远行)

所以, 还是老老实实写成`<Subscribe to={[AuthState]}>...</Subscribe>`吧(注意 AuthState 是 class)

那么, Container 实例有什么用呢?\
你可以在**单个文件**里使用, **不要导出**,这样就没有影响

### next.js 里, 如何初始化 authState?

初始化`authState`的目的, 是保证`authState`同时存在于客户端 + 服务端\
错误的想法: \
重写 unstated, 把状态统一到 store 里,针对 store 进行初始化(仿 redux)\
都准备动手了, 才发现`unstated`提供了另一种做法: 出乎我意料的做法

正确的做法:

    class App extends App {
      static getInitialProps() {
        ...在这里取到loginUser信息
        return {loginUser}
      }

      constructor(props) {
        super(props);
        // 0. 现在authState是一个页面级变量, 不是全局变量, 不会导致内存泄漏
        this.authState = new AuthState(loginUser);
      }

      render() {
        //1. unstated将保存一个map到context里: {AuthState: this.authState}
        <Provider inject={[this.authState]}>
          ...
        </Provider>
      }
    }

    //2. 使用时, 只需这样就可以使用上面定义的loginUser了
    <Subscribe to={[AuthState]}>   <--  这里是大写的class
    {({loginUser}) => ...}
    </Subscribe>

### 备忘: Provider 应当放到\_app.js 里

原因: \
\_app.js 的内容只会在服务端渲染时执行, 避免本地状态丢失 \
如果放到其它组件里, 每当切换页面时(无论 server 还是 client 端), 都会重新复位缓存\
对于本地状态而言, 这显然是不正确的

## 性能测试

完成后, 一定要结合以下命令查看内存占用是否持续增加:

    // 1. 必须在产品模式下才有意义. 开发模式下next.js不会释放缓存
    yarn build

    yarn dev

    ab -n 1000 -c 100 http://localhost:3000/

    // 2. 按资源占用排序
    top

内存占用:30M-400M 之间, 测试完毕后恢复到 30M, 无内存泄漏
