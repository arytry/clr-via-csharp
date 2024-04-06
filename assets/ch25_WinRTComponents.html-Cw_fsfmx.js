import{_ as t,a}from"./25_2-CD1rjLUU.js";import{_ as r,r as l,o as c,c as o,a as e,d as n,b as d,e as i}from"./app-IxoMmWNN.js";const u={},v=i('<h1 id="第-25-章-与-winrt-组件互操作" tabindex="-1"><a class="header-anchor" href="#第-25-章-与-winrt-组件互操作"><span>第 25 章 与 WinRT 组件互操作</span></a></h1><p>本章内容：</p><ul><li><a href="#25_1">CLR 投射与 WinRT 组件类型系统规则</a></li><li><a href="#25_2">框架投射</a></li><li><a href="#25_3">用 C# 定义 WinRT 组件</a></li></ul><p>Windows 8/8.1 带来了一个新类库，应用程序可通过它访问操作系统功能。类库正式名称是 <strong>Windows 运行时</strong>(Windows Runtime， WinRT)，其组件通过 WinRT 类型系统访问。首次发布时， WinRT 的许多目标都和 CLR 相同，例如简化应用程序开发，以及允许代码用不同编程语言实现以简化互操作。特别是，Microsoft 支持在原生 C/C++、JavaScript(通过 Microsoft 的 “Chakra” JavaScript 虚拟机)和 C#/Visual Basic(通过 CLR)中使用 WinRT 组件。</p><p>图 25-1 展示了 Windows 的 WinRT 组件所公开的功能，以及可以访问它们的 Microsoft 语言。对于原生 C/C++ 实现的应用程序，开发人员必须为每种 CPU 架构(x86，x64 和 ARM)单独编译代码。相比之下，.NET 开发人员只需编译一次(编译成 IL，CLR 自行将其编译成与主机 CPU 对应的本机代码)。JavaScript 应用程序则自带了源代码，“Chakra”虚拟机解析这些源代码，把它编译成与主机 CPU 对应的本机代码。其他公司也可制作能与 WinRT 组件互操作的语言和环境。</p><p><img src="'+t+'" alt="25_1"></p><p>图 25-1 Windows 的 WinRT 组件所公开的功能，以及访问它们的各种语言</p><p>Windows Store 应用和桌面应用程序可通过 WinRT 组件来利用操作系统的功能。Windows 配套提供的 WinRT 组件数量比 .NET Framework 类库小多了。但设计就是这样的，组件的目的是公开操作系统最擅长的事情，也就是对硬件和跨应用程序的功能进行抽象。所以，大多数 WinRT 组件都只是公开了功能，比如存储、联网、图形、媒体、安全性、线程处理等。而其他核心语言服务(比如字符串操作)和较复杂的框架(比如 LINQ)不是由操作系统提供，而是由访问 WinRT 组件的语言提供。</p><p>WinRT 组件内部作为“组件对象模型”(Component Object Model，COM)组件来实现，后者是 Microsoft 1993 年推出的技术。COM 当年被认为过于复杂，规则过于难解，是一个很让人头疼的编程模型。当 COM 实际是有许多亮点的。多年来，Microsoft 对其进行了大量修订，显著地进行了简化。Microsoft 对 WinRT 组件进行了一个很大的调整，不是使用类库来描述 COM 组件的 API，而是使用元数据。你没有看错，WinRT 组件使用由 ECMA 协会标准化的 .NET 元数据格式(ECMA-335)来描述其API。</p><p>这个元数据格式正是本书一直在讨论的。元数据比类库更有表现力，而且 CLR 已经对元数据有了全面理解。此外，CLR 一开始就通过<strong>运行时可调用包装器</strong>(Runtime Callable Wrapper，RCW)和<strong>COM 可调用包装器</strong>(COM Callable Wrapper，CCW)实现了与 COM 组件的互操作。这使在 CLR 顶部运行的语言(如 C#)能无缝地与 WinRT 类型和组件进行互操作。</p><p>在 C# 中引用 WinRT 对象，实际获得的是对一个 RCW 的引用，RCW 内部引用了 WinRT 组件。类似地，将一个 CLR 对象传给 WinRT API，实际传递的是一个 CCW 引用，CCW 内部容纳了对 CLR 对象的引用。</p><p>WinRT 组件将元数据嵌入扩展名为 .winmd 的文件中(winmd 代表 Windows MetaData)。Windows 搭载的 WinRT 组件将元数据存储到各种 Windows.*.winmd 文件中，这些文件可在 %WinDir%\\System32\\WinMetadata 目录中找到。生成应用时要引用安装到以下目录的 Windows.winmd 文件<sup>①</sup>：</p><blockquote><p>① 针对 Windows 8.1。————译注</p></blockquote><p><code>%ProgramFiles(x86)%\\Windows Kits\\8.1\\References\\CommonConfiguration\\Neutral\\Windows.winmd</code></p><p>Windows Runtime 类型系统的一个主要设计目标是使开发人员能使用他们擅长的技术、工具、实践以及约定写应用。为此，有的 WinRT 功能被投射<sup>②</sup>成对应的开发技术。针对.NET Framework 开发人员主要有两种投射：</p><blockquote><p>② 本章所说的投射(projection)和映射(mapping)是一回事。 ———— 译注</p></blockquote><ul><li><p><strong>CLR 投射</strong><br> CLR 投射由 CLR 隐式执行，通常和元数据的重写解释有关。下一节会讨论 WinRT 组件类型系统规则以及 CLR 如何将这些规则投射给 .NET Framework 开发人员。</p></li><li><p><strong>Framework 投射</strong><br> Framework 投射由你的代码显式执行，这是通过 FCL 新引入的 API 来执行的。如果 WinRT 类型系统和 CLR 类型系统差异太大，造成 CLR 不能隐式地投射，就需要用到 Framework 投射。本章稍后会讨论这种投射。</p></li></ul><h2 id="_25-1-clr-投射与-winrt-组件类型系统规则" tabindex="-1"><a class="header-anchor" href="#_25-1-clr-投射与-winrt-组件类型系统规则"><span><a name="25_1">25.1 CLR 投射与 WinRT 组件类型系统规则</a></span></a></h2>',18),m={href:"http://msdn.microsoft.com/en-us/library/windows/apps/hh995050.aspx",target:"_blank",rel:"noopener noreferrer"},b=i('<h3 id="winrt-类型系统的核心概念" tabindex="-1"><a class="header-anchor" href="#winrt-类型系统的核心概念"><span>WinRT 类型系统的核心概念</span></a></h3><p>WinRT 类型系统在功能上不如CLR 类型系统丰富。下面总结了 WinRT 类型系统的核心概念以及 CLR 如何投射它们。</p><ul><li><p><strong>文件名和命名空间</strong><br> .winmd 文件本身的名称必须和包含 WinRT 组件的命名空间匹配。例如，Wintellect.WindowsStore.winmd 文件必须在 <code>Wintellect.WindowsStore</code> 命名空间或者它的子命名空间中定义 WinRT 组件。由于 Windows 系统区分大小写，所以仅大小写不同的命名空间是不允许的。另外，WinRT 组件不能与命名空间同名。</p></li><li><p><strong>通用基类型</strong><br> WinRT 组件不同享一个通用基类。CLR 投射一个 WinRT 类型时，感觉 WinRT 就像是从 <code>System.Object</code> 派生，因此所有 WinRT 类型都会继承所有公共方法，包括 <code>ToString</code>、<code>GetHashCode</code>、<code>Equals</code> 和 <code>GetType</code>。所以，在通过 C# 使用 WinRT 对象时，对象看起来是从 <code>System.Object</code> 派生，可在代码中到处传递 WinRT 对象而不会出任何问题。还可调用 “继承” 的方法，例如 <code>ToString</code>。</p></li><li><p><strong>核心数据类型</strong><br> WinRT 类型系统支持核心数据类型，包括 Boolean，无符号字节、16/32/64 位有符号和无符号整数、单精度和双精度浮点数、16位字符、字符串和 void<sup>①</sup>。和 CLR 一样，其他所有数据类型都由这些核心数据类型合成。</p></li></ul><blockquote><p>① WinRT 不支持有符号字节。</p></blockquote><ul><li><strong>类</strong><br> WinRT 是面向对象的类型系统，这意味着 WinRT 组件支持数据抽象、继承和多态<sup>②</sup>。但有的语言(如 JavaScript)不支持类型继承。为了迎合这些语言，几乎没有 WinRT 组件会利用继承。这意味着它们也没有利用多态。事实上，只有除 JavaScript 之外的其他语言所用的 WinRT 组件才会利用继承和多态。在随 Windows 发布的 WinRT 组件中，只有 XAML 组件(用于创建 UI)才利用了继承和多态。用 JavaScript 写的应用程序使用 HTML 和 CSS 来创建 UI。</li></ul><blockquote><p>② 数据抽象实际是被强制的，因为 WinRT 类不允许有公共字段。</p></blockquote><ul><li><strong>结构</strong><br> WinRT 支持结构(值类型)，它们的实例跨越 COM 互操作边界按值封送。和 CLR 的值类型不同，WinRT 结构只能包含核心数据类型或其他 WinRT 结构类型的公共字段<sup>①</sup>。另外，WinRT 结构不能有任何构造器或辅助方法(helper method)。为方便起见，CLR 将某些操作系统 WinRT 结构投射成原生 CLR 类型，后者确实提供了构造器和辅助方法。CLR 开发人员会觉得这些投射的类型更亲切。例子包括 <code>Windows.Foundation</code> 命名空间定义的 <code>Point</code>、<code>Rect</code>、<code>Size</code> 和 <code>TimeSpan</code> 结构。</li></ul><blockquote><p>① 枚举也可以，但枚举本质上是 32 位整数。</p></blockquote><ul><li><p><strong>可空结构</strong><br> WinRT API 可公开可空结构(值类型)。CLR 将 WinRT 的 <code>Windows.Foundation.IReferencce&lt;T&gt;</code> 接口投射成 CLR 的 <code>System.Nullable&lt;T&gt;</code>类型。</p></li><li><p><strong>枚举</strong><br> 枚举值作为有符号或无符号 32 位整数传递。用 C# 定义枚举类型，基础类型要么是 <code>int</code>，要么是 <code>uint</code>。另外，有符号 32 位枚举被看成是离散值，而无符号 32 位枚举被看成是可以 OR 到一起的标志值。</p></li><li><p><strong>接口</strong><br> 对于 WinRT 接口的成员，其参数和返回类型只能是 WinRT 兼容的类型。</p></li><li><p><strong>方法</strong><br> WinRT 提供了对方法重载的有限支持。具体地说，由于 JavaScript 使用动态类型，所以它分辨不了仅参数类型由区别的方法。例如，JavaScript 允许向原本期待字符串的方法传递数字。但 JavaScript 确实能区分获取一个参数和获取两个参数的方法。此外，WinRT 不支持操作符重载方法和默认参数值。另外，实参只能在封送进入或外出(marshal in or out)之间选择一个，永远都不能两者同时进行(marshal in and out)。这意味着不能向方法实参应用 <code>ref</code>，但应用 <code>out</code> 就是可以的。欲知详情，请参考下个列表的&quot;数组&quot;项目。</p></li><li><p><strong>属性</strong><br> WinRT 属性的数据类型只能指定 WinRT 兼容类型。WinRT 不支持有参属性或只写属性。</p></li><li><p><strong>委托</strong><br> WinRT 委托类型只能为参数类型和返回类型执行 WinRT 组件。向 WinRT 组件传递一个委托时，委托对象会用一个 CCW 包装，在使用它的 WinRT 组件释放 CCW 之前，该委托对象不会被垃圾回收。WinRT 委托无 <code>BeginInvoke</code> 和 <code>EndInvoke</code> 方法。</p></li><li><p><strong>事件</strong><br> WinRT 组件可通过一个 WinRT 委托类型公开事件。由于大多数 WinRT 组件都密封(无继承)，WinRT 定义了一个 <code>TypedEventHandler</code> 委托，其 <code>sender</code> 参数是泛型类型(而不是 <code>System.Object</code>)。<br><code>public delegate void TypedEventHandler&lt;TSender, TResult&gt;(TSender sender, TResult args);</code><br> 还有一个 <code>Windows.Foundation.EventHandler&lt;T&gt;</code> WinRT 委托类型，CLR 把它投射成你熟悉的 .NET Framework的 <code>System.EventHandler&lt;T&gt;</code>委托类型。</p></li><li><p><strong>异常</strong><br> 和 COM 组件一样，WinRT 组件幕后用 HRESULT 值(具有特殊语义的32位整数)指明其状态。CLR 将 <code>Windows.Foundation.HResult</code> 类型的 WinRT 值投射成异常对象。WinRT API 返回已知的、代表错误的 <code>HRESULT</code> 值时，CLR 会抛出对应的 <code>Exception</code> 派生类实例。例如，<code>HRESULT 0x8007000e(E_OUTOFMEMORY)</code> 映射成 System.OutOfMemoryException。其他 <code>HRESULT</code> 值造成 CLR 抛出 System.Exception 对象，其 HResult 属性将包含 HRESULT 值。用 C# 实现的 WinRT 组件可以直接抛出所需类型的异常，CLR 会把它自动转换成恰当的 HRESULT 值。要获得对 HRESULT 值的完全控制，可构造异常对象，将你想要的 HRESULT 值赋给对象的 HResult 属性，再抛出对象。</p></li><li><p><strong>字符串</strong><br> 当然可以在 WinRT 和 CLR 类型系统之间传递不可变的字符串。但 WinRT 类型系统不允许字符串为 <code>null</code> 值。向 WinRT API 的字符串参数传递 null，CLR 会检测到这个动作并抛出 <code>ArgumentNullException</code>。相反，应该用 <code>String.Empty</code> 向 WinRT API 传递空字符串。字符串以传引用的方式传给 WinRT API；传入时被固定(pinned)，返回时解除固定(unpinned)。从 WinRT API 时，会生成包含其所有字符串元素的数组拷贝。传入或返回的是这个拷贝。</p></li><li><p><strong>日期和时间</strong><br> WinRT <code>Windows.Foundation.DateTime</code> 结构代表的是一个 UTC 日期/时间。CLR 将 WinRT <code>DateTime</code> 结构投射成 .NET Framework 的 <code>System.DateTimeOffset</code> 结构，这是因为 <code>DateTimeOffset</code> 优于 .NET Framework 的 System.DateTime 结构。在生成的 DateTimeOffset 实例中，CLR 将从 WinRT 组件返回的 UTC 时间/日期转换成本地时间。相反，CLR 将一个 <code>DateTimeOffset</code>作为 UTC 时间传给 WinRT API。</p></li><li><p><strong>URI</strong><br> CLR 将 WinRT <code>Windows.Foudation.Uri</code> 类型投射成 .NET Framework 的 <code>System.Uri</code> 类型。向 WinRT API 传递一个 .NET Framework URI 时，CLR 发现它是相对 URI 会抛出一个 <code>ArgumentException</code>。WinRT 只支持绝对 URI。URI 总是跨越互操作边界进行拷贝。</p></li><li><p><strong><code>IClosable/IDisposable</code></strong><br> CLR 将 WinRT <code>Windows.Foundation.IClosable</code> 接口(仅有一个 Close 方法)投射成.NET Framework 的 <code>System.IDisposable</code> 接口(及其 <code>Dispose</code> 方法)。注意，执行 I/O 操作的所有 WinRT API 都是异步实现的。由于 IClosable 接口的方法称为 <code>Close</code> 而不是 <code>CloseAsync</code>，所以 <code>Close</code> 方法绝对不能执行任何 I/O 操作。这在语义上有别于 .NET Framework 的 <code>Dispose</code> 方法。对于 .NET Framework 实现的类型，调用 Dispose 是可以执行 I/O 操作的。而且事实上，它经常导致先将缓冲数据写入再关闭设备。但 C# 代码在某个 WinRT 类型上调用 <code>Dispose</code> 时，I/O(比如将缓冲数据写入)是不会执行的，所以有丢失数据的风险。这一点务必引起重视。写包装了输出流的 WinRT 组件时，必须显式调用方法来防止数据丢书。例如，使用 <code>DataWriter</code> 时必须记得调用它的 <code>StoreAsync</code> 方法。</p></li><li><p><strong>数组</strong><br> WinRT API 支持一维零基数组。WinRT 能将数组元素封送进入方法，或者从方法中封送出去(marshal in or out)，永远不能两者同时进行(marshal in and out)。所以，不能将数组传入 WinRT API，让 API 修改数组元素，再在 API 返回后访问修改的元素。<sup>①</sup>但我说的只是一个应该遵守的协定。该协定没有得到强制贯彻，所以有的投射可能同时封送传入传出数组内容。这一般是为了改善性能。例如，如果数组包含结构，CLR 会直接固定(pin)数组，把它传给 WinRT API，返回后再解除固定(unpin)。在这个过程中，实际是传入数组内容，由 WinRT API 修改内容，然后返回修改的内容。但在这个例子中，WinRT API违反了协定，其行为是得不到保证的。事实上，在进程外运行的一个 WinRT 组件上调用 API 就肯定行不通。</p></li></ul><blockquote><p>① 这意味着无法实现像 <code>System.Array</code> 的 <code>sort</code> 方法这样的 API。有趣的是，所有语言(C，C++，C#，Visual Basic 和 JavaScript)都支持传入和传出数组元素，但 WinRT 类型系统就是不允许。</p></blockquote><ul><li><p><strong>集合</strong><br> 向 WinRT API 传递集合时，CLR 用一个 CCW 来包装集合对象，然后将 CCW 引用传给 WinRT API。WinRT 代码在 CCW 上调用一个成员时，调用线程要跨越互操作边界，造成一定的性能损失。和数组不同，这意味着将集合传给 WinRT API后，API可以现场操作集合，不会创建结婚元素的拷贝。表 25-1 总结了 WinRT 集合接口以及 CLR 如何把它们投射到 .NET 应用程序代码。</p><p>表 25-1 WinRT 结婚接口和投射的 CLR 集合类型</p><table><thead><tr><th>WinRT 集合类型(<code>Windows.Foundation.Collections</code> 命名空间)</th><th>投射的 CLR 集合类型(<code>System.Collections.Generic</code> 命名空间)</th></tr></thead><tbody><tr><td><code>IIterable&lt;T&gt;</code></td><td><code>IEnumerable&lt;T&gt;</code></td></tr><tr><td><code>IVector&lt;T&gt;</code></td><td><code>IList&lt;T&gt;</code></td></tr><tr><td><code>IVectorView&lt;T&gt;</code></td><td><code>IReadOnlyList&lt;T&gt;</code></td></tr><tr><td><code>IMap&lt;K, V&gt;</code></td><td><code>IDictonary&lt;TKey, TValue&gt;</code></td></tr><tr><td><code>IMapView&lt;K, V&gt;</code></td><td><code>IReadOnlyDictionary&lt;TKey, TValue&gt;</code></td></tr><tr><td><code>IKeyValuePair&lt;K, V&gt;</code></td><td><code>KeyValuePair&lt;TKey, TValue&gt;</code></td></tr></tbody></table></li></ul><p>从上述列表可以看出，CLR 团队进行了大量工作，尽量保证了 WinRT 类型系统和 CLR 类型系统之间的无缝互操作，使托管代码的开发人员能在代码中更好地利用 WinRT 组件。<sup>①</sup></p>',12),p={href:"http://msdn.microsoft.com/en-us/library/windows/apps/hh995050.aspx",target:"_blank",rel:"noopener noreferrer"},T=i(`<h2 id="_25-2-框架投射" tabindex="-1"><a class="header-anchor" href="#_25-2-框架投射"><span><a name="25_2">25.2 框架投射</a></span></a></h2><p>在 CLR 不能将一个 WinRT 类型隐式投射给 .NET Framework 开发人员的时候，开发人员就必须显式使用框架投射。主要有三种需要进行框架投射的技术：异步编程、WinRT流和 .NET Framework 流之间的互操作以及需要在 CLR 和 WinRT API 之间传输数据块的时候。后续的小节将分别讨论这三种框架投射。由于许多应用程序都要使用这些技术，所以有必要很好地理解和高效地使用它们。</p><h3 id="_25-2-1-从-net-代码中调用异步-winrt-api" tabindex="-1"><a class="header-anchor" href="#_25-2-1-从-net-代码中调用异步-winrt-api"><span>25.2.1 从 .NET 代码中调用异步 WinRT API</span></a></h3><p>线程以同步方式执行 I/O 操作时，线程可能阻塞不确定的时间。GUI 线程等待一个同步 I/O 操作时，应用程序 UI 会停止响应用户的输入，比如触摸、鼠标和手写笔事件，造成用户对应用程序感到厌烦。为了防止应用程序出现不响应的情况，执行 I/O 操作的 WinRT 组件通过异步 API 公开其功能。事实上，凡是 CPU 计算时间可能超过 50 毫秒的功能，WinRT 组件都通过异步 API 来公开该功能。本书第 V 部分“线程处理”将详细讨论如何构建响应灵敏的应用程序。</p><p>由于如此多的 WinRT API 都是异步的，所以为了高效地使用它们，你需要理解如何通过 C#与它们互操作。例如以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public void WinRTAsyncIntro() {
  IAsyncOperation&lt;StorageFile&gt; asyncOp = KnownFolders.MusicLibrary.GetFileAsync(&quot;Song.mp3&quot;);
  asyncOp.Completed = OpCompleted;
  // 可选：在以后某个时间调用 asyncOp.Cancel()
}

// 注意：回调方法通过 GUI 或线程池线程执行
private void OpCompleted(IAsyncOperation&lt;StorageFile&gt; asyncOp, AsyncStatus status) {
  switch (status) {
    case AsyncStatus.Completed: // 处理结果
      StorageFile file = asyncOp.GetResults(); /* Completed... */ break;

    case AsyncStatus.Canceled: // 处理取消
      /* Canceled... */ break;

    case AsyncStatus.Error: // 处理异常
      Exception exception = asyncOp.ErrorCode; /* Error... */ break;
  }
  asyncOp.Close();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>WinRTAsyncIntro</code> 方法调用 WinRT <code>GetFileAsync</code> 方法在用户的音乐中查找文件。执行异步操作的所有 WinRT API 名称都要以<code>Async</code> 结尾，而且都要返回类型实现了 WinRT <code>IAsyncXxx</code> 接口的对象；本例使用的接口是 <code>IAsyncOperation&lt;TResult&gt;</code>，其中 <code>TResult</code> 是 WinRT <code>StorageFile</code> 类型。我将对该对象的引用放到名为 <code>asyncOp</code> 的变量中，代表等待进行的异步操作。代码必须通过某种方式接收操作完成通知。为此，必须实现一个回调方法(本例是 <code>OpCompleted</code>)，创建对它的委托，并将委托赋给 <code>asyncOp</code> 的 <code>Completed</code> 属性。现在，一旦操作结束，就会由某个线程(不一定是 GUI 线程)调用回调方法。如果操作在将委托赋给 <code>Completed</code> 属性之前便结束了，系统会尽快安排对回调方法的调用。换言之，这里发生了竞态条件(race condition)，但实现 <code>IAsyncXxx</code> 接口的对象帮你解决了竞态，确保代码能正常工作。</p><p>就像 <code>WinRTAsyncIntro</code> 方法最后的注释所说的，要取消正在等待进行的操作，可选择调用所有 <code>IAsyncXxx</code> 接口都有提供的 <code>Cancel</code> 方法。所有异步操作结束都是因为三个原因之一：操作成功完成，操作被显式取消，或者操作出错。异步操作因为上述任何原因而结束时，系统都会调用回调方法，向其传递和原始 <code>XxxAsync</code> 方法返回的一样的对象引用，同时传递一个 <code>AsyncStatus</code>。在 <code>OpCompleted</code> 方法中，我检查 <code>status</code> 参数，分别处理成功完成、显式取消和出错的情况<sup>①</sup>。还要注意，处理好操作因为各种原因而结束的情况之后，应该调用 <code>IAsyncXxx</code> 接口对象的 <code>Close</code> 方法进行清理。</p><blockquote><p>① <code>IAsyncInfo</code> 接口提供了一个 <code>Status</code> 属性，其中包含的值和传给回调方法的 <code>status</code> 参数的值是一样的。但由于参数以传值方式传递，所以访问参数的速度比查询 <code>IAsyncInfo</code> 的 <code>Status</code> 属性快(查询属性要求通过一个 RCW 来调用 WinRT API)。</p></blockquote><p>图 25-2 展示了各种 WinRT <code>IAsyncXxx</code> 接口。主要的 4 个接口都从 <code>IAsyncInfo</code> 接口派生。其中，两个 <code>IAsyncAction</code> 接口使你知道操作在什么时候结束，但这些操作没有返回值(<code>GetReults</code> 的返回类型是 <code>void</code>)。而两个 <code>IAsyncOperation</code> 接口不仅使你知道操作在什么时候结束，还能获取它们的返回值(<code>GetResults</code> 方法具有泛型 <code>TResult</code> 返回类型)。</p><p><img src="`+a+`" alt="25_2"></p><p>图 25-2 和执行异步 I/O 与计算操作有关的 WinRT 接口</p><p>两个 <code>IAsyncXxxWithProgress</code> 接口允许代码接收异步操作期间的定期进度更新。大多数异步操作都不提供进度更新，但有的会(比如后台下载和上传)。接收定时进度更新要求定义另一个回调方法，创建引用它的委托，并将委托赋给 <code>IAsyncXxxWithProgress</code> 对象的 <code>Progress</code> 属性。回调方法被调用时，会向其传递类型与泛型 <code>TProgress</code> 类型匹配的实参。</p><p>.NET Framework 使用 <code>System.Threading.Tasks</code> 命名空间的类型来简化异步操作。我将在第 27 章“计算限制的异步操作”解释这些类型以及如何用它们执行计算操作，在第 28 章“I/O 限制的异步操作”解释如何用它们执行 I/O 操作。除此之外，C# 提供了 <code>async</code> 和 <code>await</code> 关键字，允许使用顺序编程模型来执行异步操作，从而大幅简化了编码。</p><p>以下代码重写了之前的 <code>WinRTAsyncIntro</code> 方法。这个版本利用了 .NET Framework 提供的一些扩展方法，将 WinRT 异步编程模型转变成更方便的 C# 编程模型。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System; // 为了使用 WindowsRuntimeSystemExtensions 中的扩展方法，
              // 这些扩展方法称为框架投射扩展方法
.
.
.
public async void WinRTAsyncIntro() {
  try {
    StorageFile file = await KnownFolders.MusicLibrary.GetFileAsync(&quot;Song.mp3&quot;);
    /* Completed... */
  }
  catch (OperationCanceledException) { /* Canceled... */ }
  catch (SomeOtherException ex) { /* Error... */ }
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>C# 的 <code>await</code> 操作符导致编译器在 <code>GetFileAsync</code> 方法返回的 <code>IAsyncOperation&lt;StorageFile&gt;</code> 接口上查找 <code>GetAwaiter</code> 方法。该接口没有提供 <code>GetAwaiter</code> 方法，所以编译器查找扩展方法。幸好，.NET Framework 团队在 System.Runtime.WindowsRuntime.dll 中提供了能在任何一个 WinRT <code>IAsyncXxx</code> 接口上调用的大量扩展方法。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System { 
  public static class WindowsRuntimeSystemExtensions {
    public static TaskAwaiter GetAwaiter(this IAsyncAction source);
    public static TaskAwaiter GetAwaiter&lt;TProgress&gt;(this IAsyncActionWithProgress&lt;TProgress&gt; source);
    public static TaskAwaiter&lt;TResult&gt; GetAwaiter&lt;TResult&gt;(this IAsyncOperation&lt;TResult&gt; source);
    public static TaskAwaiter&lt;TResult&gt; GetAwaiter&lt;TResult, TProgress&gt;(
      this IAsyncOperationWithProgress&lt;TResult, TProgress&gt; source);
 }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所有这些方法都在内部构造一个 <code>TaskCompletionSource</code>，并告诉 <code>IAsyncXxx</code> 对象在异步操作结束后调用一个回调方法来设置 <code>TaskCompletionSource</code> 的最终状态。这些扩展方法返回的 <code>TaskAwaiter</code> 对象才是 C# 最终所等待的。异步操作结束后，<code>TaskAwaiter</code> 对象通过与原始线程关联的 <code>SynchronizationContext</code>(第 28 章讨论)确保代码继续执行。然后，线程执行 C# 编译器生成的代码。这些代码查询 <code>TaskCompletionSource</code> 的 <code>Task</code> 的 <code>Result</code> 属性来返回结果(本例是一个 <code>StorageFile</code>)，在取消的情况下抛出 <code>OperationCanceledException</code>，或在出错的情况下抛出其他异常。要了解这些方法的内部工作过程，请参考本节末尾的代码。</p><p>刚才展示的只是调用异步 WinRT API 并发现其结果的一般情况。我展示了如何知道发生了取消，但没有展示如何真正地取消操作，也没有展示如何处理进度更新。为了正确处理取消和进度更新，不要让编译器自动调用某个 <code>GetAwaiter</code> 扩展方法，而要显式调用同样在 <code>WindowsRuntimeSystemExtensions</code> 类中定义的某个 <code>AsTask</code> 扩展方法。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System {
  public static class WindowsRuntimeSystemExtensions {
    public static Task AsTask&lt;TProgress&gt;(this IAsyncActionWithProgress&lt;TProgress&gt; source,
      CancellationToken cancellationToken, IProgress&lt;TProgress&gt; progress);

    public static Task&lt;TResult&gt; AsTask&lt;TResult, TProgress&gt;(
      this IAsyncOperationWithProgress&lt;TResult, TProgress&gt; source,
      CancellationToken cancellationToken, IProgress&lt;TProgress&gt; progress);
    //未显示更简单的重载
  }
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在就可以对程序进行最后的完善了。下面展示了如何调用异步 WinRT API，并在需要的时候正确使用取消和进度更新功能。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;           // 为了 WindowsRuntimeSystemExtensions 的 AsTask
using System.Threading; // 为了 CancellationTokenSource
internal sealed class MyClass {
  private CancellationTokenSource m_cts = new CancellationTokenSource();

  // 注意：如果由 GUI 线程调用，所有代码都通过 GUI 线程执行
  private async void MappingWinRTAsyncToDotNet(WinRTType someWinRTObj) {
    try {
      // 假定 XxxAsync 返回 IAsyncOperationWithProgress&lt;IBuffer, UInt32&gt;
      IBuffer result = await someWinRTObj.XxxAsync(...)
        .AsTask(m_cts.Token, new Progress&lt;UInt32&gt;(ProgressReport));
      /* Completed... */
    }
    catch (OperationCanceledException) { /* Canceled... */ }
    catch (SomeOtherException) { /* Error... */ }
  }

  private void ProgressReport(UInt32 progress) { /* Update progress... */ }

  public void Cancel() { m_cts.Cancel(); } // 以后某个时间调用
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有的读者想知道这些 <code>AsTask</code> 方法内部如何将一个 WinRT <code>IAsyncXxx</code> 转换成最终可以等待一个 .NET Framework <code>Task</code>。以下代码展示了最复杂的 <code>AsTask</code> 方法在内部如何实现。当然，更简单的重载实现起来更简单。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static Task&lt;TResult&gt; AsTask&lt;TResult, TProgress&gt;(
  this IAsyncOperationWithProgress&lt;TResult, TProgress&gt; asyncOp,
  CancellationToken ct = default(CancellationToken),
  IProgress&lt;TProgress&gt; progress = null) {

  // 在 CancellationTokenSource 取消时取消异步操作
  ct.Register(() =&gt; asyncOp.Cancel());

  // 在异步操作报告进度时，报告给进度回调
  asyncOp.Progress = (asyncInfo, p) =&gt; progress.Report(p);

  // 这个 TaskCompletionSource 监视异步操作结束
  var tcs = new TaskCompletionSource&lt;TResult&gt;();

  // 在异步操作结束时通知 TaskCompletionSource ①
  // 届时，正在等待 TaskCompletionSource 的代码重新获取控制权
  asyncOp.Completed = (asyncOp2, asyncStatus) =&gt; {
    switch (asyncStatus) {
      case AsyncStatus.Completed: tcs.SetResult(asyncOp2.GetResults()); break;
      case AsyncStatus.Canceled: tcs.SetCanceled(); break;
      case AsyncStatus.Error: tcs.SetException(asyncOp2.ErrorCode); break;
    }
  };

  // 调用代码等待这个返回的 Task 时，它调用 GetAwaiter，后者
  // 用一个 SynchronizationContext 包装 Task，确保异步操作
  // 在 SynchronizationContext 对象的上下文中结束
  return tcs.Task;
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>① 或者说向这个 <code>TaskCompletionSource</code> 发信号。 ———— 译注</p></blockquote><h3 id="_25-2-2-winrt-流和-net-流之间的互操作" tabindex="-1"><a class="header-anchor" href="#_25-2-2-winrt-流和-net-流之间的互操作"><span>25.2.2 WinRT 流和 .NET 流之间的互操作</span></a></h3><p>许多 .NET Framework 类都要求操作 <code>System.IO.Stream</code> 派生类型，包括序列化和 LINQ to XML 等。只有使用 <code>System.IO.WindowsRuntimeStorageExtensions</code> 类定义的扩展方法，实现了 WinRT <code>IStorageFile</code> 或 <code>IStorageFolder</code> 接口的 WinRT 对象才能和要求 <code>Stream</code> 派生类型 .NET Framework 类一起使用。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System.IO { // 在 System.Runtime.WindowsRuntime.dll 中定义
  public static class WindowsRuntimeStorageExtensions {
    public static Task&lt;Stream&gt; OpenStreamForReadAsync(this IStorageFile file);
    public static Task&lt;Stream&gt; OpenStreamForWriteAsync(this IStorageFile file);

    public static Task&lt;Stream&gt; OpenStreamForReadAsync(this IStorageFolder rootDirectory,
      String relativePath);
    public static Task&lt;Stream&gt; OpenStreamForWriteAsync(this IStorageFolder rootDirectory,
      String relativePath, CreationCollisionOption creationCollisionOption);
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下例使用扩展方法打开一个 WinRT <code>StorageFile</code>，将内容读入一个 .NET Framework <code>XElement</code> 对象。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>async Task&lt;XElement&gt; FromStorageFileToXElement(StorageFile file) {
  using (Stream stream = await file.OpenStreamForReadAsync()) {
    return XElement.Load(stream);
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后，<code>System.IO.WindowsRuntimeStreamExtensions</code> 类提供了一些扩展方法能将 WinRT 流接口(例如 <code>IRandomAccessStream</code>，<code>IInputStream</code> 和 <code>IOutputStream</code>)“转型”为 .NET Framework 的 <code>Stream</code> 类型，或者反向转换。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System.IO { // 在 System.Runtime.WindowsRuntime.dll 中定义
  public static class WindowsRuntimeStreamExtensions {
    public static Stream AsStream(this IRandomAccessStream winRTStream);
    public static Stream AsStream(this IRandomAccessStream winRTStream, Int32 bufferSize);

    public static Stream AsStreamForRead(this IInputStream winRTStream);
    public static Stream AsStreamForRead(this IInputStream winRTStream, Int32 bufferSize);

    public static Stream AsStreamForWrite(this IOutputStream winRTStream);
    public static Stream AsStreamForWrite(this IOutputStream winRTStream, Int32 bufferSize);

    public static IInputStream AsInputStream (this Stream clrStream);
    public static IOutputStream AsOutputStream(this Stream clrStream);
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下例使用扩展方法将一个 WinRT <code>IInputStream</code> “转型” 为 .NET Framework <code>Stream</code> 对象。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>XElement FromWinRTStreamToXElement(IInputStream winRTStream) {
  Stream netStream = winRTStream.AsStreamForRead(); 
  return XElement.Load(netStream);
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，.NET Framework 提供的“转型”扩展方式幕后不仅仅是执行转型。具体地说，将 WinRT 流转换成 .NET Framework 流时，会在托管堆中为 WinRT 流隐式创建一个缓冲区。结果是大多数操作都向这个缓冲区写入，不需要跨越互操作边界，这提升了性能。涉及大量小的 I/O 操作(比如解析 XML 文档)时，性能的提升尤其明显。</p><p>使用 .NET Framework 流投射的好处是，在同一个 WinRT 流实例上多次执行一个 <code>AsStreamXxx</code> 方法，不用担心会创建多个相互没有连接的缓冲区，造成向一个缓冲区写入的数据在另一个那里看不见。.NET Framework 的 API 确保每个流对象都有唯一的适配器实例，所有用户共享同一个缓冲区。</p><p>虽然默认缓冲区大多数时候都能在性能与内存使用之间获得较好的平衡，但有时还是希望调用缓冲区的大小(而不是默认的 16 KB)。这时可以使用 <code>AsStreamXxx</code> 方法的重载版本来达到目的。例如，如果知道要长时间操作一个很大的文件，同时不会使用其他太多的缓冲流，就可为自己的流请求一个很大的缓冲区来获得进一步的性能提升。相反，有的应用程序要求低网络延迟，这时可能希望确保除非应用程序显式请求，否则不要从网络读取更多的字节。这时可考虑完全禁用缓冲区。为 <code>AsStreamXxx</code> 方法指定零字节的缓冲区，就不会创建缓冲区对象了。</p><h3 id="_25-2-3-在-clr-和-winrt-之间传输数据块" tabindex="-1"><a class="header-anchor" href="#_25-2-3-在-clr-和-winrt-之间传输数据块"><span>25.2.3 在 CLR 和 WinRT 之间传输数据块</span></a></h3><p>要尽量使用上一节讨论的框架投射，因为它们有不错的性能。但有时需要在 CLR 和 WinRT 组件之间传递原始数据块(raw blocks)。例如，WinRT 的文件和套接字流组就要求读写原始数据块。另外，WinRT 的加密组件要对数据块进行加密和解密，位图像素也要用原始数据块来维护。</p><p>.NET Framework 获取数据块的方式一般是通过字节数组(<code>Byte[]</code>)，或者通过流(比如在使用 <code>MemoryStream</code> 类的时候)。当然，字节数组和 <code>MemoryStream</code> 对象都不能直接传给 WinRT 组件。所以，WinRT 定义了 <code>IBuffer</code> 接口，实现该接口的对象代表可传给 WinRT API 的原始数据块。WinRt <code>IBuffer</code> 接口是这样定义的：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace Windows.Storage.Streams {
  public interface IBuffer {
    UInt32 Capacity { get; }    // 缓冲区最大大小(以字节为单位)
    UInt32 Length { get; set; } // 缓冲区当前使用的字节数
  } 
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如你所见，<code>IBuffer</code> 对象定义了缓冲区的最大大小和实际长度。但奇怪的是，它没有提供实际在缓冲区中读写数据的方式。这主要是由于 WinRT 类型不能在其数据中表示指针，因为指针不能很好地映射到部分语言(比如 JavaScript 和 安全 C# 代码)。所以，<code>IBuffer</code> 对象实际只是在 CLR 和 WinRT API 之间传递内存地址对的一种方式。为了访问内存地址处的字节，需要使用一个名为 <code>IBufferByteAccess</code> 的内部 COM 接口。注意这是 COM 接口(因为返回指针)而不是 WinRT 接口。.NET Framework 团队为这个 COM 接口定义了一个内部 RCW，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System.Runtime.InteropServices.WindowsRuntime {
  [Guid(&quot;905a0fef-bc53-11df-8c49-001e4fc686da&quot;)]
  [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  [ComImport]
  internal interface IBufferByteAccess {
    unsafe Byte* Buffer { get; }
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>CLR 内部获取 <code>IBuffer</code> 对象，查询其 <code>IBufferByteAccess</code> 接口，再查询 <code>Buffer</code> 属性获来得指向缓冲区中的字节数据的不安全指针。利用该指针就能直接访问字节。</p><p>为防止开发人员写不安全代码来操作指针，FCL 包含一个 <code>WindowsRuntimeBufferExtensions</code> 类，它定义了大量扩展方法，.NET Framework 开发人员可显式调用这些方法在 CLR 字节数组和传给 WinRT <code>IBuffer</code> 对象的流之间的传递数据块。调用这些扩展方法要求在源代码中添加 <code>using System.Runtime.InteropServices.WindowsRuntime;</code> 指令。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System.Runtime.InteropServices.WindowsRuntime {
  public static class WindowsRuntimeBufferExtensions {
    public static IBuffer AsBuffer(this Byte[] source);
    public static IBuffer AsBuffer(this Byte[] source, Int32 offset, Int32 length);
    public static IBuffer AsBuffer(this Byte[] source, Int32 offset, Int32 length, Int32 capacity);
    public static IBuffer GetWindowsRuntimeBuffer(this MemoryStream stream);
    public static IBuffer GetWindowsRuntimeBuffer(this MemoryStream stream, Int32 position, Int32 length);
  }
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，要将一个 <code>Byte[]</code> 传给需要一个 <code>IBuffer</code> 的 WinRT API，只需在 <code>Byte[]</code> 数组上调用 <code>AsBuffer</code>。这实际是将对 <code>Byte[]</code> 的引用包装到实现了 <code>IBuffer</code> 接口的对象中；<code>Byte[]</code> 数组的内部不会被复制，所以效率很高。类似地，对于包装了公共 <code>Byte[]</code> 数组缓冲区的一个 <code>MemoryStream</code> 对象，只需在它上面调用 <code>GetWindowsRuntimeBuffer</code> 就可以将对 <code>MemoryStream</code> 的缓冲区的引用包装到一个实现了 <code>IBuffer</code> 接口的对象中。缓冲区内容同样不会被复制，所有效率很高。以下方法演示了这两种情况。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private async Task ByteArrayAndStreamToIBuffer(IRandomAccessStream winRTStream, Int32 count) 
{
  Byte[] bytes = new Byte[count];
  await winRTStream.ReadAsync(bytes.AsBuffer(), (UInt32)bytes.Length, InputStreamOptions.None);
  Int32 sum = bytes.Sum(b =&gt; b); // 访问从 Byte[] 读取的字节

  using (var ms = new MemoryStream())
  using (var sw = new StreamWriter(ms)) {
    sw.Write(&quot;This string represents data in a stream&quot;);
    sw.Flush();
    UInt32 bytesWritten = await winRTStream.WriteAsync(ms.GetWindowsRuntimeBuffer());
  }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>WinRT 的 <code>ITandomAccessStream</code> 接口实现了 WinRT 的 <code>IInputStream</code> 接口。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace Windows.Storage.Streams {
  public interface IInputStream : IDisposable {
    IAsyncOperationWithProgress&lt;IBuffer, UInt32&gt; ReadAsync(
      IBuffer buffer, 
      uint count, 
      InputStreamOption options);
  }
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在代码中调用 <code>AsBuffer</code> 或 <code>GetWindowsRuntimeBuffer</code> 扩展方法时，这些方法将来源对象包装到实现了 <code>IBuffer</code> 接口的一个类的对象中。然后，CLR 为该对象创建一个 CCW，并将 CCW 传给 WinRT API。一旦 WinRT API 查询 <code>IBufferByteAccess</code> 接口的 <code>Buffer</code> 属性，获取指向基础字节数组的指针，字节数组就会被固定(pinned)，其地址返回给 WinRT API 以便访问数据。一旦 WinRT API 内部在 <code>IBufferByteAccess</code> 接口上调用 COM 的 <code>Release</code> 方法，字节数组就会解除固定(unpinned)。</p><p>调用返回一个 <code>IBuffer</code> 的 WinRT API 时，数据本身可能在本机(native)内存中，需要以某种方式从托管代码中访问这些数据。这时需要借助于 <code>WindowsRuntimeBufferExtensions</code> 类定义的其他扩展方法。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>namespace System.Runtime.InteropServices.WindowsRuntime {
  public static class WindowsRuntimeBufferExtensions {
    public static Stream AsStream(this IBuffer source);
    public static Byte[] ToArray(this IBuffer source);
    public static Byte[] ToArray(this IBuffer source, UInt32 sourceIndex, Int32 count);

    // 未显示：CopyTo 方法在一个 IBuffer 和一个 Byte[] 之间传输字节
    // 未显示：GetByte, IsSameData 方法
  }
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>AsStream</code> 方法创建包装了来源 <code>IBuffer</code> 的一个 <code>Stream</code> 派生对象。调用 <code>Stream</code> 的 <code>Read</code>、<code>Write</code> 和其他类似的方法，即可访问该 <code>IBuffer</code> 的数据。<code>ToArray</code> 方法在内部分配一个 <code>Byte[]</code>，将来源 <code>IBuffer</code> 中的所有字节复制到 <code>Byte[]</code> 中；注意该扩展方法可能会占用大量内存和 CPU 时间。</p><p><code>WindowsRuntimeBufferExtensions</code> 类还提供了 <code>CopyTo</code> 方法的几个重载版本，能在一个 <code>IBuffer</code> 和一个 <code>Byte[]</code> 之间复制数据。还提供了一个 <code>GetByte</code> 方法，能每次从 <code>IBuffer</code> 中获取一个字节。<code>IsSameData</code> 方法则比较两个 <code>IBuffer</code> 对象的内容，判断内容是否完全一样。大多数应用程序都不需要调用这些方法。</p><p>.NET Framework 定义了一个 <code>System.Runtime,InteropServices.WindowsRuntimeBuffer</code> 类，允许创建字节在托管堆中的 <code>IBuffer</code> 对象。对应地，WinRT 组件 <code>Windows.Storage.Streams.Buffer</code> 允许创建字节在本机(native)堆中的 <code>IBuffer</code> 对象。大多数 .NET Framework 开发人员都不需要在代码中显式使用这两个类。</p><h2 id="_25-3-用-c-定义-winrt-组件" tabindex="-1"><a class="header-anchor" href="#_25-3-用-c-定义-winrt-组件"><span><a name="25_3">25.3 用 C# 定义 WinRT 组件</a></span></a></h2><p>本章一直在讲述如何在 C# 中使用现有的 WinRT 组件。但也可定义自己的 WinRT 组件，以便原生 C/C++、C#/Visual Basic、JavaScript 和其他语言使用这些组件。但有的时候是不为也，非不能也。例如，如果唯一的使用者就是在 CLR 顶部运行的其他托管语言，那么用 C# 定义的 WinRT 组件就没有什么意义。这是由于 WinRT 类型系统功能少得多，相比 CLR 的类型系统限制太大。</p><p>用 C# 定义能由原生 C/C++ 代码使用的 WinRT 组件也没有多大意义。一般情况下，应用程序关心性能和内存消耗时才会用原生 C/C++ 来实现。这时不太可能使用由托管代码实现的 WinRT 组件，否则就要被迫在进程中加载 CLR，增大内存消耗和降低性能(因为要进行垃圾回收和 JIT 编译)。所以，大多数 WinRT 组件(比如随同 Windows 提供的那些)都是用原生代码实现的。当然，如果原生 C++ 应用的某些部分对性能不敏感，就可考虑利用 .NET Framework 的功能来提高开发效率。例如，必应地图 Bing Maps 用原生 C++ 和 DirectX 绘制 UI，但业务逻辑用 C# 实现。</p><p>所以，我认为用 C# 实现的 WinRT 组件最佳应用场合就是：Windows Store 应用的开发人员用 HTML 和 CSS 构建 UI。然后，使用 JavaScript 代码将 UI 和用 C# WinRT 组件实现的业务逻辑“粘合”起来。还有一个应用场合是在 HTML/JavaScript 应用中使用现有的 FCL 功能(比如 WCF)。HTML/JavaScript 开发人员已习惯了浏览器引擎造成的性能损失和内存消耗，所以基本上能接受使用 CLR 造成的额外性能损失和内存消耗。</p><p>用 C# 定义 WinRT 组件首先要在 Microsoft Visual Studio 中创建“Windows 运行时组件”项目。创建的其实是一个普通的类库项目，但 C# 编译器会自动添加 <code>t/:winmdobj</code> 命令行开关来生成 .winmdobj 文件。文件中会插入一些和平时不同的 IL 代码。例如，WinRT 组件采用和 CLR 不同的方式为事件添加和删除委托。所以，如果指定了这个编译器开关，编译器就会为事件的添加和删除方法生成不同的代码。本节稍后会展示如何显式地实现事件的添加和删除方法。</p><p>编译器生成 .winmdobj 文件后将启动 WinMD 实用程序(WinMDExp.exe)<sup>①</sup>，向它传递由编译器生成的 .winmdobj，.pdb 和 .xml(doc)文件。WinMDExp.exe 实用程序检查文件的元数据，确保你的类型符合本章开头讨论的 WinRT 类型系统的各种规则。实用程序还会修改 .winmdobj 文件中的元数据；它一点儿都不会碰 IL 代码。具体地说，实用程序只能将 CLR 类型映射到等价的 WinRT 类型。例如，对 .NET Framework <code>IList&lt;String&gt;</code> 类型的引用被更改为 WinRT 的 <code>IVector&lt;String&gt;</code> 类型。WinMDExp.exe 输出的是可供其他语言使用的 .winmd 文件。</p><blockquote><p>① WinMDExp 是 Windows Metadata Exporter 的简称。 ———— 译注</p></blockquote><p>可用 .NET Framework 的 IL 反汇编器工具(ILDasm.exe)检查.winmd文件的内容。ILDasm.exe 默认显示文件的原始内容。但它支持用<code>/project</code>命令行开关显示将 WinRT 类型投射成 .NET Framework 等价类型之后的元数据。</p><blockquote><p>重要提示 托管代码使用同样托管代码携程的 WinRT 组件时，CLR 将其视为普通的托管组件。也就是说，CLR 不会创建 CCW 和 RCW，不通过这些包装器来调用 WinRT API。这显著曾倩了性能。但在测试组件时，API 的调用方式有别于从其他语言(如原生 C/C++或 JavaScript)调用时的方式。所以，除了性能和内存消耗不能反映实际情况，托管代码还能向要求一个 <code>String</code> 的 WinRT API 传递 <code>null</code> 而不引发 <code>ArgumentNullException</code>。另外，用托管代码实现的 WinRT API 可操作传入的数组，调用者能在 API 返回时看到更改过的数组内容。而一般情况下，WinRT 类型系统禁止修改传给 API 的数组。还有其他未列出的差异，所以务必小心。</p></blockquote><p>以下代码演示了如何用 C# 实现各种 WinRT 组件。组件利用了本章讨论的许多功能，我用大量注释解释了具体发生的事情。用 C# 实现 WinRT 组件时，建议把它作为模板使用。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>/******************************************************************************
Module: WinRTComponents.cs
Notices: Copyright (c) 2012 by Jeffrey Richter 
******************************************************************************/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Metadata;

// The namespace MUST match the assembly name and cannot be &quot;Windows&quot;
namespace Wintellect.WinRTComponents {
    // [Flags] // Must not be present if enum is int; required if enum is uint
    public enum WinRTEnum : int { // Enums must be backed by int or uint
        None,
        NotNone
    }


    // Structures can only contain core data types, String, &amp; other structures; no ctors or methods
    public struct WinRTStruct {
        public Int32 ANumber;
        public String AString;
        public WinRTEnum AEnum; // Really just a 32-bit integer
    }

    // Delegates must have WinRT-compatible types in the signature (no BeginInvoke/EndInvoke)
    public delegate String WinRTDelegate(Int32 x);

    // Interfaces can have methods, properties, &amp; events but cannot be generic.
    public interface IWinRTInterface {
        // Nullable&lt;T&gt; marshals as IReference&lt;T&gt;
        Int32? InterfaceProperty { get; set; }
    }

    // Members without a [Version(#)] attribute default to the class&#39;s
    // version (1) and are part of the same underlying COM interface
    // produced by WinMDExp.exe.
    [Version(1)]
    // Class must be derived from Object, sealed, not generic,
    // implement only WinRT interfaces, &amp; public members must be WinRT types
    public sealed class WinRTClass : IWinRTInterface {
        // Public fields are not allowed

        #region Class can expose static methods, properties, and events
        public static String StaticMethod(String s) { return &quot;Returning &quot; + s; }
        public static WinRTStruct StaticProperty { get; set; }

        // In JavaScript &#39;out&#39; parameters are returned as objects with each
        // parameter becoming a property along with the return value
        public static String OutParameters(out WinRTStruct x, out Int32 year) {
            x = new WinRTStruct { AEnum = WinRTEnum.NotNone, ANumber = 333, AString = &quot;Jeff&quot; };
            year = DateTimeOffset.Now.Year;
            return &quot;Grant&quot;;
        }
        #endregion

        // Constructor can take arguments but not out/ref arguments
        public WinRTClass(Int32? number) { InterfaceProperty = number; }

        public Int32? InterfaceProperty { get; set; }

        // Only ToString is allowed to be overridden
        public override String ToString() {
            return String.Format(&quot;InterfaceProperty={0}&quot;,
            InterfaceProperty.HasValue ? InterfaceProperty.Value.ToString() : &quot;(not set)&quot;);
        }

        public void ThrowingMethod() {
            throw new InvalidOperationException(&quot;My exception message&quot;);
            
            // To throw a specific HRESULT, use COMException instead
            //const Int32 COR_E_INVALIDOPERATION = unchecked((Int32)0x80131509);
            //throw new COMException(&quot;Invalid Operation&quot;, COR_E_INVALIDOPERATION);
        }

        #region Arrays are passed, returned OR filled; never a combination
        public Int32 PassArray([ReadOnlyArray] /* [In] implied */ Int32[] data) {
            // NOTE: Modified array contents MAY not be marshaled out; do not modify the array
            return data.Sum();
        }

        public Int32 FillArray([WriteOnlyArray] /* [Out] implied */ Int32[] data) {
            // NOTE: Original array contents MAY not be marshaled in;
            // write to the array before reading from it
            for (Int32 n = 0; n &lt; data.Length; n++) data[n] = n;
            return data.Length;
        }

        public Int32[] ReturnArray() {
            // Array is marshaled out upon return
            return new Int32[] { 1, 2, 3 };
        }
        #endregion

        // Collections are passed by reference
        public void PassAndModifyCollection(IDictionary&lt;String, Object&gt; collection) {
            collection[&quot;Key2&quot;] = &quot;Value2&quot;; // Modifies collection in place via interop
        }

        #region Method overloading
        // Overloads with same # of parameters are considered identical to JavaScript
        public void SomeMethod(Int32 x) { }

        [Windows.Foundation.Metadata.DefaultOverload] // Makes this method the default overload
        public void SomeMethod(String s) { }
        #endregion

        #region Automatically implemented event
        public event WinRTDelegate AutoEvent;

        public String RaiseAutoEvent(Int32 number) {
            WinRTDelegate d = AutoEvent;
            return (d == null) ? &quot;No callbacks registered&quot; : d(number);
        }
        #endregion

        #region Manually implemented event
        // Private field that keeps track of the event&#39;s registered delegates
        private EventRegistrationTokenTable&lt;WinRTDelegate&gt; m_manualEvent = null;

        // Manual implementation of the event&#39;s add and remove methods
        public event WinRTDelegate ManualEvent {
            add {
                // Gets the existing table, or lazily creates a new one if the table is not yet initialized
                return EventRegistrationTokenTable&lt;WinRTDelegate&gt;
                  .GetOrCreateEventRegistrationTokenTable(ref m_manualEvent).AddEventHandler(value);
            }
            remove {
                EventRegistrationTokenTable&lt;WinRTDelegate&gt;
                  .GetOrCreateEventRegistrationTokenTable(ref m_manualEvent).RemoveEventHandler(value);
            }
        }

        public String RaiseManualEvent(Int32 number) {
            WinRTDelegate d = EventRegistrationTokenTable&lt;WinRTDelegate&gt;
            .GetOrCreateEventRegistrationTokenTable(ref m_manualEvent).InvocationList;
            return (d == null) ? &quot;No callbacks registered&quot; : d(number);
        }
        #endregion

        #region Asynchronous methods
        // Async methods MUST return IAsync[Action|Operation](WithProgress)
        // NOTE: Other languages see the DataTimeOffset as Windows.Foundation.DateTime
        public IAsyncOperationWithProgress&lt;DateTimeOffset, Int32&gt; DoSomethingAsync() {
            // Use the System.Runtime.InteropServices.WindowsRuntime.AsyncInfo&#39;s Run methods to
            // invoke a private method written entirely in managed code
            return AsyncInfo.Run&lt;DateTimeOffset, Int32&gt;(DoSomethingAsyncInternal);
        }

        // Implement the async operation via a private method using normal managed code technologies
        private async Task&lt;DateTimeOffset&gt; DoSomethingAsyncInternal(
          CancellationToken ct, IProgress&lt;Int32&gt; progress) {
            
            for (Int32 x = 0; x &lt; 10; x++) {
                // This code supports cancellation and progress reporting
                ct.ThrowIfCancellationRequested();
                if (progress != null) progress.Report(x * 10);
                await Task.Delay(1000); // Simulate doing something asynchronously
            }
            return DateTimeOffset.Now; // Ultimate return value
        }

        public IAsyncOperation&lt;DateTimeOffset&gt; DoSomethingAsync2() {
            // If you don&#39;t need cancellation &amp; progress, use System.WindowsRuntimeSystemExtensions&#39;
            // AsAsync[Action|Operation] Task extension methods (these call AsyncInfo.Run internally)
            return DoSomethingAsyncInternal(default(CancellationToken), null).AsAsyncOperation();
        }
        #endregion

        // After you ship a version, mark new members with a [Version(#)] attribute
        // so that WinMDExp.exe puts the new members in a different underlying COM
        // interface. This is required since COM interfaces are supposed to be immutable.
        [Version(2)]
        public void NewMethodAddedInV2() { }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下 JavaScript 代码演示了如何访问前面的所有 WinRT 组件和功能。</p><div class="language-JavaScript line-numbers-mode" data-ext="JavaScript" data-title="JavaScript"><pre class="language-JavaScript"><code>function () {
  // Make accessing the namespace more convenient in the code
  var WinRTComps = Wintellect.WinRTComponents;

  // NOTE: The JavaScript VM projects WinRT APIs via camel casing

  // Access WinRT type&#39;s static method &amp; property
  var s = WinRTComps.WinRTClass.staticMethod(null); // NOTE: JavaScript pass &quot;null&quot; here!
  var struct = { anumber: 123, astring: &quot;Jeff&quot;, aenum: WinRTComps.WinRTEnum.notNone };
  WinRTComps.WinRTClass.staticProperty = struct;
  s = WinRTComps.WinRTClass.staticProperty; // Read it back

  // If the method has out parameters, they and the return value are returned as an object&#39;s properties
  var s = WinRTComps.WinRTClass.outParameters();
  var name = s.value; // Return value
  var struct = s.x; // an &#39;out&#39; parameter
  var year = s.year; // another &#39;out&#39; parameter

  // Construct an instance of the WinRT component
  var winRTClass = new WinRTComps.WinRTClass(null);
  s = winRTClass.toString(); // Call ToString()

  // Demonstrate throw and catch
  try { winRTClass.throwingMethod(); }
  catch (err) { }

  // Array passing
  var a = [1, 2, 3, 4, 5];
  var sum = winRTClass.passArray(a);

  // Array filling
  var arrayOut = [7, 7, 7]; // NOTE: fillArray sees all zeros!
  var length = winRTClass.fillArray(arrayOut); // On return, arrayOut = [0, 1, 2]

  // Array returning
  a = winRTClass.returnArray(); // a = [ 1, 2, 3]

  // Pass a collection and have its elements modified
  var localSettings = Windows.Storage.ApplicationData.current.localSettings;
  localSettings.values[&quot;Key1&quot;] = &quot;Value1&quot;;
  winRTClass.passAndModifyCollection(localSettings.values);
  // On return, localSettings.values has 2 key/value pairs in it

  // Call overloaded method
  winRTClass.someMethod(5); // Actually calls SomeMethod(String) passing &quot;5&quot;

  // Consume the automatically implemented event
  var f = function (v) { return v.target; };
  winRTClass.addEventListener(&quot;autoevent&quot;, f, false);
  s = winRTClass.raiseAutoEvent(7);

  // Consume the manually implemented event
  winRTClass.addEventListener(&quot;manualevent&quot;, f, false);
  s = winRTClass.raiseManualEvent(8);

  // Invoke asynchronous method supporting progress, cancelation, &amp; error handling
  var promise = winRTClass.doSomethingAsync();
  promise.then(
    function (result) { console.log(&quot;Async op complete: &quot; + result); },
    function (error) { console.log(&quot;Async op error: &quot; + error); },
    function (progress) {
      console.log(&quot;Async op progress: &quot; + progress);
      //if (progress == 30) promise.cancel(); // To test cancelation
    });
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,70);function R(g,C){const s=l("ExternalLinkIcon");return c(),o("div",null,[v,e("p",null,[n("就像 CLR 强制遵循一个类型系统，WinRT 组件也遵循自己的类型系统。CLR 看到一个 WinRT 类型时，通常允许通过 CLR 的一般化 COM 互操作技术来使用该类型。但有时 CLR 会隐藏 WinRT 类型(将其动态设为私有)。然后，CLR 通过一个不同的类型来公开该类型。在内部，CLR 会查找特定的类型(通过元数据)，然后将这些类型映射成 FCL 的类型。要获得 CLR 隐式投射到 FCL 类型的完整 WinRT 类型列表，请访问 "),e("em",null,[e("a",m,[n("http://msdn.microsoft.com/en-us/library/windows/apps/hh995050.aspx"),d(s)])]),n("。")]),b,e("blockquote",null,[e("p",null,[n("① 欲知详情，请访问 "),e("em",null,[e("a",p,[n("http://msdn.microsoft.com/en-us/library/windows/apps/hh995050.aspx"),d(s)])]),n(" 并下载 CLRandtheWindowsRuntime.docx 文档。")])]),T])}const y=r(u,[["render",R],["__file","ch25_WinRTComponents.html.vue"]]),S=JSON.parse('{"path":"/zh/chapters/ch25_WinRTComponents.html","title":"第 25 章 与 WinRT 组件互操作","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"25.1 CLR 投射与 WinRT 组件类型系统规则","slug":"_25-1-clr-投射与-winrt-组件类型系统规则","link":"#_25-1-clr-投射与-winrt-组件类型系统规则","children":[{"level":3,"title":"WinRT 类型系统的核心概念","slug":"winrt-类型系统的核心概念","link":"#winrt-类型系统的核心概念","children":[]}]},{"level":2,"title":"25.2 框架投射","slug":"_25-2-框架投射","link":"#_25-2-框架投射","children":[{"level":3,"title":"25.2.1 从 .NET 代码中调用异步 WinRT API","slug":"_25-2-1-从-net-代码中调用异步-winrt-api","link":"#_25-2-1-从-net-代码中调用异步-winrt-api","children":[]},{"level":3,"title":"25.2.2 WinRT 流和 .NET 流之间的互操作","slug":"_25-2-2-winrt-流和-net-流之间的互操作","link":"#_25-2-2-winrt-流和-net-流之间的互操作","children":[]},{"level":3,"title":"25.2.3 在 CLR 和 WinRT 之间传输数据块","slug":"_25-2-3-在-clr-和-winrt-之间传输数据块","link":"#_25-2-3-在-clr-和-winrt-之间传输数据块","children":[]}]},{"level":2,"title":"25.3 用 C# 定义 WinRT 组件","slug":"_25-3-用-c-定义-winrt-组件","link":"#_25-3-用-c-定义-winrt-组件","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/ch25_WinRTComponents.md"}');export{y as comp,S as data};
