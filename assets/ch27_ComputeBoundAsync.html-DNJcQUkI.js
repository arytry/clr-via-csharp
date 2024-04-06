import{_ as o}from"./27_1-DSHF0XYN.js";import{_ as l,r as a,o as s,c as t,a as e,d as n,b as i,e as c}from"./app-IxoMmWNN.js";const r={},u=c(`<h1 id="第-27-章-计算限制的异步操作" tabindex="-1"><a class="header-anchor" href="#第-27-章-计算限制的异步操作"><span>第 27 章 计算限制的异步操作</span></a></h1><p>本章内容：</p><ul><li><a href="#27_1">CLR 线程池基础</a></li><li><a href="#27_2">执行简单的计算限制操作</a></li><li><a href="#27_3">执行上下文</a></li><li><a href="#27_4">协作式取消和超时</a></li><li><a href="#27_5">任务</a></li><li><a href="#27_6"><code>Parallel</code> 的静态 <code>For</code>，<code>ForEach</code> 和 <code>Invoke</code>方法</a></li><li><a href="#27_7">并行语言集成查询(PLINQ)</a></li><li><a href="#27_8">执行定时的计算限制操作</a></li><li><a href="#27_9">线程池如何管理线程</a></li></ul><p>本章将讨论以异步方式操作的各种方式。异步的计算限制操作要用其他线程执行，例子包括编译代码、拼写检查、语法检测、电子表格重计算、音频或视频数据转码以及生成图像的缩略图。在金融和工程应用程序中，计算限制的操作也是十分普遍的。</p><p>大多数应用程序都不会花太多时间处理内存数据或执行计算。要验证这一点，可以打开“任务管理器”，选择“性能”标签。如果 CPU 利用率不到 100%(大多数时候都如此)，就表明当前运行的进程没有使用由计算机的 CPU 内核提供的全部计算能力。CPU 利用率低于 100% 时，进程中的部分(但不是全部)线程根本没有运行。相反，这些线程正在等待某个输入或输出操作。例如，这些线程可能正在等待一个计时器到期<sup>①</sup>；等待在数据库/Web服务器/文件/网络/其他硬件设备中读取或写入数据；或者等待按键、鼠标移动或鼠标点击等。执行 I/O 限制的操作时，Microsoft Windows 设备驱动程序让硬件设备为你“干活儿”，但 CPU 本身“无所事事”。由于线程不在 CPU 上运行，所以“任务管理器”说 CPU 利用率很低。</p><blockquote><p>① 计时器“到期”(come due)的意思是还有多久触发它。</p></blockquote><p>但是，即使 I/O 限制非常严重的应用程序也要对接收到的数据执行一些计算，而并行执行这些计算能显著提升应用程序的吞吐能力。本章首先介绍 CLR 的线程池，并解释了和它的工作和使用有关的一些基本概念。这些信息非常重要。为了设计和实现可伸缩的、响应灵敏和可靠的应用程序和组件，线程池是你必须采用的核心技术。然后，本章展示了通过线程池执行计算限制操作的各种机制。</p><h2 id="_27-1-clr-线程池基础" tabindex="-1"><a class="header-anchor" href="#_27-1-clr-线程池基础"><span><a name="27_1">27.1 CLR 线程池基础</a></span></a></h2><p>如第 26 章所述，创建和销毁线程时一个昂贵的操作，要耗费大量时间。另外，太多的线程会浪费内存资源。由于操作系统必须调度可运行的线程并执行上下文切换，所以太多的线程还对性能不利。为了改善这个情况，CLR 包含了代码来管理它自己的<strong>线程池</strong>(thread pool)。线程池是你的应用程序能使用的线程集合。每 CLR 一个线程池；这个线程池由 CLR 控制的所有 AppDomain 共享。如果一个进程中加载了多个 CLR，那么每个 CLR 都有它自己的线程池。</p><p>CLR 初始化时，线程池中是没有线程的。在内部，线程池维护了一个操作请求队列。应用程序执行一个异步操作时，就调用某个方法，将一个记录项(entry)追加到线程池的队列中。线程池的代码从这个队列中提取记录项，将这个记录项派发(dispatch)给一个线程池线程。如果线程池中没有线程，就创建一个新线程。创建线程会造成一定的性能损失(前面已讨论过了)。然而，当线程池线程完成任务后，线程不会被销毁。相反，线程会返回线程池，在那里进入空闲状态，等待响应另一个请求。由于线程不销毁自身，所以不再产生额外的性能损失。</p><p>如果你的应用程序向线程池发出许多请求，线程池会尝试只用这一个线程来服务所有请求。然而，如果你的应用程序发出请求的速度超过了线程池线程处理它们的速度，就会创建额外的线程。最终，你的应用程序的所有请求都能由少量线程处理，所以线程池不必创建大量线程。</p><p>如果你的应用程序停止向线程池发出请求，池中会出现大量什么都不做的线程。这是对内存资源的浪费。所以，当一个线程池线程闲着没事儿一段时间之后(不同版本的 CLR 对这个时间的定义不同)，线程会自己醒来终止自己以释放资源。线程终止自己会产生一定的性能损失。然而，线程终止自己是因为它闲的慌，表明应用程序本身就么有做太多的事情，所以这个性能损失关系不大。</p><p>线程池可以只容纳少量线程，从而避免浪费资源；也可以容纳更多的线程，以利用多处理器、超线程处理器和多核处理器。它能在这两种不同的状态之间从容地切换。线程池是启发式的。如果应用程序需要执行许多任务，同时有可能的 CPU，那么线程池会创建更多的线程。应用程序负载减轻，线程池线程就终止它们自己。</p><h2 id="_27-2-执行简单的计算限制操作" tabindex="-1"><a class="header-anchor" href="#_27-2-执行简单的计算限制操作"><span><a name="27_2">27.2 执行简单的计算限制操作</a></span></a></h2><p>要将一个异步的计算限制操作放到线程池的队列中，通常可以调用 <code>ThreadPool</code> 类定义的以下方法之一：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>static bool QueueUserWorkItem(WaitCallback callBack);
static bool QueueUserWorkItem(WaitCallback callBack, Object state);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这些方法向线程池的队列添加一个“工作项”(work item)以及可选的状态数据。然后，所有方法会立即返回。工作项其实就是由 <code>callBack</code> 参数标识的一个方法，该方法将由线程池线程调用。可向方法传递一个 <code>state</code> 实参(状态数据)。无 <code>state</code> 参数的那个版本的 <code>QueueUserWorkItem</code> 则向回调方法传递<code>null</code>。最终，池中的某个线程会处理工作项，造成你指定的方法被调用。你写的回调方法必须匹配 <code>System.Threading.WaitCallback</code>委托类型，后者的定义如下：</p><p><code>delegate void WaitCallback(Object state);</code></p><blockquote><p>注意 <code>WaitCallback</code> 委托、<code>TimerCallback</code> 委托(参见本章 27.8 节“执行定时计算限制操作”的讨论)和 <code>ParameterizedThreadStart</code> 委托(在第 26 章“线程基础” 中讨论)签名完全一致。定义和该签名匹配的方法后，使用 <code>ThreadPool.QueueUserWorkItem</code>、<code>System.Threading.Timer</code> 和 <code>System.Threading.Thread</code> 对象都可调用该方法。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.Threading;

public static class Program {
    public static void Main() {
        Console.WriteLine(&quot;Main thread: queuing an asynchronous operation&quot;);
        ThreadPool.QueueUserWorkItem(ComputeBoundOp, 5);
        Console.WriteLine(&quot;Main thread: Doing other work here...&quot;);
        Thread.Sleep(10000);    // 模拟其他工作(10秒)
        Console.WriteLine(&quot;Hit &lt;Enter&gt; to end this program...&quot;);
        Console.ReadLine();
    }

    private static void ComputeBoundOp(Object state) {
        // 这个方法由一个线程池线程执行

        Console.WriteLine(&quot;In ComputeBoundOp: state={0}&quot;, state);
        Thread.Sleep(1000);             // 模拟其他工作(1秒)

        // 这个方法返回后，线程回到池中，等待另一个任务
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译并运行上述代码得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Main thread: queuing an asynchronous operation
Main thread: Doing other work here...
In ComputeBoundOp: state=5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有时也得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Main thread: queuing an asynchronous operation
In ComputeBoundOp: state=5
Main thread: Doing other work here...
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>之所以输出行的顺序会发生变化，是因为两个方法相互之间是异步运行的。Windows 调度器决定先调度哪一个线程。如果应用程序在多核机器上运行，可能同时调度它们。</p><blockquote><p>注意 一旦回调方法抛出未处理的异常，CLR 会终止进程(除非宿主强加了它自己的策略)。未处理异常的详情已在第 20 章“异常和状态管理”进行了讨论。</p></blockquote><blockquote><p>注意 对于 Windows Store 应用，<code>System.Threading.ThreadPool</code> 类是没有公开的。但在使用 <code>System.Threading.Tasks</code> 命名空间中的类型时，这个类被间接地使用(详情参见本章稍后的 27.5 节“任务”)。</p></blockquote><h2 id="_27-3-执行上下文" tabindex="-1"><a class="header-anchor" href="#_27-3-执行上下文"><span><a name="27_3">27.3 执行上下文</a></span></a></h2><p>每个线程都关联了一个执行上下文数据结构。<strong>执行上下文</strong>(execution context)包括的东西有安全设置(压缩栈、<code>Thread</code> 的 <code>Principal</code>属性和 Windows 身份)、宿主设置(参见 <code>System.Threading.HostExecutionContextManager</code>)以及逻辑调用上下文数据(参见<code>System.Runtime.Remoting.Messaging.CallContext</code> 的 <code>LogicalSetData</code> 和 <code>LogicalGetData</code>方法)。线程执行它的代码时，一些操作会受到线程执行上下文设置(尤其是安全设置)的影响。理想情况下，每当一个线程(初始线程)使用另一个线程(辅助线程)执行任务时，前者的执行上下文应该流向(复制到)辅助线程。这就确保了辅助线程执行的任何操作使用的是相同的安全设置和宿主设置。还确保了再初始线程的逻辑调用上下文中存储的任何数据都适用于辅助线程。</p><p>默认情况下，CLR 自动造成初始线程的执行上下文“流向”任何辅助线程。这造成将上下文信息传给辅助线程，但这会对性能造成一定影响。这是因为执行上下文中包含大量信息，而收集所有这些信息，再把它们复制到辅助线程，要耗费不少时间。如果辅助线程又采用了更多的辅助线程，还必须创建和初始化更多的执行上下文数据结构。</p><p><code>System.Threading</code>命名空间有一个 <code>ExecutionContext</code> 类，它允许你控制线程的执行上下文如何从一个线程“流”向另一个。下面展示了这个类的样子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class ExecutionContext : IDisposable, ISerializable {
    [SecurityCritical] public static AsyncFlowControl SuppressFlow();
    public static void RestoreFlow();
    public static Boolean IsFlowSuppressed();

    // 为列出不常用的方法
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可用这个类阻止执行上下文流动以提升应用程序的性能。对于服务器应用程序，性能的提升可能非常显著。但客户端应用程序的性能提升不了多少。另外，由于 <code>SuppressFlow</code> 方法用 <code>[SecurityCritical]</code> 特性进行了标识，所以在某些客户端应用程序(比如 Silverlight)中是无法调用的。当然，只有在辅助线程不需要或者不访问上下文信息时，才应阻止执行上下文的流动。当然，只有在辅助线程不需要或者不访问上下文信息时，才应阻止执行上下文的流动。如果初始线程的执行上下文不流向辅助线程，辅助线程会使用上一次和它关联的任意执行上下文。在这种情况下，辅助线程不应执行任何要依赖于执行上下文状态(不如用户的 Windows 身份)的代码。</p><p>下例展示了向 CLR 的线程池队列添加一个工作项的时候，如何通过阻止执行上下文的流动来影响线程逻辑调用上下文中的数据<sup>①</sup>：</p><blockquote><p>① 添加到逻辑调用上下文的项必须是可序列化的，详情参见第 24 章“运行时序列化”。对于包含了逻辑调用上下文数据项的执行上下文，让它流动起来可能严重损害性能，因为为了捕捉执行上下文，需要对所有数据项进行序列化和反序列化。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    // 将一些数据放到 Main 线程的逻辑调用上下文中
    CallContext.LogicalSetData(&quot;Name&quot;, &quot;Jeffrey&quot;);

    // 初始化要由一个线程池线程做的一些工作
    // 线程池线程能访问逻辑调用上下文数据
    ThreadPool.QueueUseWorkItem(
        state =&gt; Console.WriteLine(&quot;Name={0}&quot;, CallContext.LogicalGetData(&quot;Name&quot;)));

    // 现在，阻止 Main 线程的执行上下文的流动
    ExecutionContext.SuppressFlow();

    // 初始化要由线程池线程做的工作，
    // 线程池线程不能访问逻辑调用上下文数据
    ThreadPool.QueueUserWorkItem(state =&gt; Console.WriteLine(&quot;Name={0}&quot;, CallContext.LogicalGetData(&quot;Name&quot;)));

    // 恢复 Main 线程的执行上下文的流动，
    // 以免将来使用更多的线程池线程
    ExecutionContext.RestoreFlow();
    ...
    Console.ReadLine();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译并运行上述代码得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Name=Jeffrey
Name=
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_27-4-协作式取消和超时" tabindex="-1"><a class="header-anchor" href="#_27-4-协作式取消和超时"><span><a name="27_4">27.4 协作式取消和超时</a></span></a></h2><p>Microsoft .NET Framework 提供了标准的<strong>取消操作</strong>模式。这个模式是<strong>协作式</strong>的，意味着要取消的操作必须显式支持<strong>取消</strong>。换言之，无论执行操作的代码，还是试图取消操作的代码，还是试图取消操作的代码，都必须使用本节提到的类型。对于长时间运行的计算限制操作，支持取消是一件很“棒”的事情。所以，你应该考虑为自己的计算限制操作添加取消能力。本节将解释具体如何做。但首先解释一下作为标准协作式取消模式一部分的两个 FCL 类型。</p><p>取消操作首先要创建一个 <code>System.Threading.CancellationTokenSource</code> 对象。这个类看起来像下面这样：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class CancellationTokenSource : IDisposable {  // 一个引用类型
    public CancellationTokenSource();
    public void Dispose();          // 释放资源(比如 WaitHandle)

    public Boolean IsCancellationRequested { get; }
    public CancellationToken Token { get; }

    public void Cancel();   // 内部调用 Cancel 并传递 false
    public void Cancel(Boolean throwOnFirstException);
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个对象包含了和管理取消有关的所有状态。构造好一个 <code>CancellationTokenSource</code>(一个引用类型)之后，可从它的 <code>Token</code> 属性获得一个或多个<code>CancellationToken</code>(一个值类型)实例，并传给你的操作，使操作可以取消。以下是 <code>CancellationToken</code> 值类型最有用的成员：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public struct CancellationToken {           // 一个值类型
    public static CancellationToken None { get;	}       // 很好用

    public Boolean IsCancellationRequested { get; }     // 由非通过 Task 调用的操作调用
    public void ThrowIfCancellationRequested();         // 由通过 Task 调用的操作调用

    // CancellationTokenSource 取消时，WaitHandle 会收到信号
    public WaitHandle WaitHandle { get; }
    // GetHashCode，Equals，operator== 和 operator!= 成员未列出

    public bool CanBeCanceled { get; } // 很少使用

    public CancellationTokenRegistration Register(Action&lt;Object&gt; callback, Object state, Boolean useSynchronizationContext);        // 未列出更简单的重载版本
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>CancellationToken</code> 实例是轻量级值类型，包含单个私有字段，即对其 <code>CancellationTokenSource</code> 对象的引用。在计算限制操作的循环中，可定时调用 <code>CancellationToken</code> 的 <code>IsCancellationRequested</code> 属性，了解循环是否应该提前终止，从而终止计算限制的操作。提前终止的好处在于，CPU 不需要再把时间浪费在你对结果不感兴趣的操作上。以下代码将这些概念全部梳理了一遍：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal static class CancellationDemo {
    public static void Go() {
        CancellationTokenSource cts = new CancellationTokenSource();

        // 将 CancellationToken 和 “要数到的数” (number-to-count-to)传入操作
        ThreadPool.QueueUserWorkItem(o =&gt; Count(cts.Token, 1000));

        Console.WriteLine(&quot;Press &lt;Enter&gt; to cancel the operation.&quot;);
        Console.ReadLine();
        cts.Cancel();   // 如果 Count 方法已返回，Cancel 没有任何效果
        // Cancel 立即返回，方法从这里继续运行...

        Console.ReadLine();
    }

    private static void Count(CancellationToken token, Int32 countTo) {
        for (Int32 count = 0; count &lt; countTo; count++) {
            if (token.IsCancellationRequested) {
                Console.WriteLine(&quot;Count is cancelled&quot;);
                break;  // 退出循环以停止操作
            }
            Console.WriteLine(count);
            Thread.Sleep(200);      // 出于演示目的而浪费一些时间
        }
        Console.WriteLine(&quot;Count is done&quot;);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 要执行一个不允许被取消的操作，可向该操作传递通过调用<code>CancellationToken</code>的静态<code>None</code>属性而返回的<code>CancellationToken</code>。该属性返回一个特殊的<code>CancellationToken</code>实例，它不和任何<code>CancellationTokenSource</code>对象关联(实例的私有字段为<code>null</code>)。由于没有<code>CancellationTokenSource</code>，所以没有代码能调用 <code>Cancel</code>。一个操作如果查询这个特殊 <code>CancellationToken</code> 的<code>IsCancellationRequested</code>属性，将总是返回<code>false</code>。使用某个特殊<code>CancellationToken</code>实例查询<code>CancellationToken</code>的<code>CanBeCanceled</code>属性，属性会返回<code>false</code>。相反，对于通过查询<code>CancellationTokenSource</code>对象的<code>Token</code>属性而获得的其他所有<code>CancellationToken</code>实例，该属性(<code>CancellationToken</code>)都会返回<code>true</code>。</p></blockquote><p>如果愿意，可调用 <code>CancellationTokenSource</code> 的 <code>Register</code> 方法登记一个或多个在取消一个 <code>CancellationTokenSource</code> 时调用的方法。要向方法传递一个 <code>Action&lt;Object&gt;</code> 委托；一个要通过委托传给回到(方法)的状态值；以及一个<code>Boolean</code>值(名为<code>useSynchronizationContext</code>)，该值指明是否要使用调用线程的 <code>SynchronizationContext</code> 来调用委托。如果为 <code>useSynchronizationContext</code> 参数传递 <code>false</code>，那么调用<code>Cancel</code> 的线程会顺序调用已登记的所有方法。为 <code>useSynchronizationContext</code> 参数传递 <code>true</code>，则回调(方法)会被 send(而不是post<sup>①</sup>)给已捕捉的 <code>SynchronizationContext</code> 对象，后者决定由哪个线程调用回调(方法)。<code>SynchronizationContext</code> 类的详情将在 28.9 节“应用程序及其线程处理模型”讨论。</p><blockquote><p>① 简单地说，如果执行 send 操作，要等到在目标线程哪里处理完毕之后才会返回。在此期间，调用线程会被阻塞。这相当于同步调用。而如果执行 post 操作，是指将东西 post 到一个队列中便完事儿，调用线程立即返回，相当于异步调用。————译注</p></blockquote><blockquote><p>注意 向被取消的 <code>CancellationTokenSource</code> 登记一个回调方法，将由调用 <code>Register</code> 的线程调用回调方法(如果为 <code>useSynchronizationContext</code> 参数传递了 <code>true</code> 值，就可能要通过调用线程的 <code>SynchronizationContext</code> 进行)。</p></blockquote><p>多次调用 <code>Register</code>，多个回调方法都会调用。这些回调方法可能抛出未处理的异常。如果调用 <code>CancellationTokenSource</code> 的 <code>Cancel</code> 方法，向它传递 <code>true</code>，那么抛出了未处理异常的第一个回调方法会阻止其他回调方法的执行，抛出的异常也会从 <code>Cancel</code> 中抛出。如果调用 <code>Cancel</code> 并向它传递 <code>false</code>，那么登记的所有回调方法都会调用。所有未处理的异常都会添加到一个集合中。所有回调方法都执行好后，其中任何一个抛出了未处理的异常，<code>Cancel</code> 就会抛出一个 <code>AggregateException</code>，该异常实例的 <code>InnerExceptions</code> 属性被设为已抛出的所有异常对象的集合。如果登记的所有回调方法都没有抛出未处理的异常，那么 <code>Cancel</code> 直接返回，不抛出任何异常。</p><blockquote><p>重要提示 没有办法将 <code>AggregateException</code> 的 <code>InnerExceptions</code> 集合中的一个异常对象和特的操作对应起来；你只知道某个操作出错，并通过异常类型知道出了什么错。要跟踪错误的具体位置，需要检查异常对象的 <code>StackTrace</code> 属性，并手动扫描你的源代码。</p></blockquote><p><code>CancellationToken</code> 的 <code>Register</code> 方法返回一个 <code>CancellationTokenRegistration</code>，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public readonly struct CancellationTokenRegistration : 
    IEquatable&lt;CancellationTokenRegistration&gt;, IDisposable {
    public void Dispose();
    // GetHashCode, Equals, operator== 和 operator!=成员未列出
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以调用 <code>Dispose</code> 从关联的 <code>CancellationTokenSource</code> 中删除已登记的回调；这样一来，在调用 <code>Cancel</code> 时，便不会再调用这个回调。以下代码演示了如何向一个 <code>CancellationTokenSource</code> 登记两个回调：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>var cts = new CancellationTokenSource();
cts.Token.Register(() =&gt; Console.WriteLine(&quot;Canceled 1&quot;));
cts.Token.Register(() =&gt; Console.WriteLine(&quot;Canceled 2&quot;));

// 出于测试的目的，让我们取消它，以便执行 2 个回调
cts.Cancel();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行上述代码，一旦调用 <code>Cancel</code> 方法，就会得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Canceled 2
Canceled 1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>最后，可以通过链接另一组 <code>CancellationTokenSource</code> 来新建一个 <code>CancellationTokenSource</code> 对象。任何一个链接的 <code>CancellationTokenSource</code> 被取消，这个新的 <code>CancellationTokenSource</code> 对象就会被取消。以下代码对此进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建一个 CancellationTokenSource
var cts1 = new CancellationTokenSource();
cts1.Token.Register(() =&gt; Console.WriteLine(&quot;cts1 canceled&quot;));

// 创建另一个 CancellationTokenSource
var cts2 = new CancellationTokenSource();
cts2.Token.Register(() =&gt; Console.WriteLine(&quot;cts2 canceled&quot;));

// 创建一个新的 CancellationTokenSource，它在 cts1 或 cts2 取消时取消
var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cts1.Token, cts2.Token);
linkedCts.Token.Register(() =&gt; Console.WriteLine(&quot;linkedCts canceled&quot;));

// 取消其中一个 CancellationTokenSource 对象(我选择cts2)
cts2.Cancel();

// 显示哪个 CancellationTokenSource 对象被取消了
Console.WriteLine(&quot;cts1 canceled={0}, cts2 canceled={1}, linkedCts={2}&quot;,
    cts1.IsCancellationRequested, cts2.IsCancellationRequested, linkedCts.IsCancellationRequested);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行上述代码得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>linkedCts canceled
cts2 canceled
cts1 canceled=False, cts2 canceled=True, linkedCts=True
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在很多情况下，我们需要在过一段时间之后才取消操作。例如，服务器应用程序可能会根据客户端的请求而开始计算。但必须在 2 秒钟之内有响应，无论此时工作是否已经完成。有的时候，与其等待漫长时间获得一个完整的结果，还不如在短时间内报错，或者用部分计算好的结果进行响应。幸好，<code>CancellationTokenSource</code> 提供了在指定时间后自动取消的机制。为了利用这个机制，要么用接受延时参数的构造构造一个 <code>CancellationTokenSource</code> 对象，要么调用 <code>CancellationTokenSource</code> 的 <code>CancelAfter</code> 方法。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class CancellationTokenSource : IDisposable {
    public CancellationTokenSource(int millisecondsDelay);
    public CancellationTokenSource(TimeSpan delay);
    public void CancelAfter(int millisecondsDelay);
    public void CancelAfter(TimeSpan delay);
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_27-5-任务" tabindex="-1"><a class="header-anchor" href="#_27-5-任务"><span><a name="27_5">27.5 任务</a></span></a></h2><p>很容易调用 <code>ThreadPool</code> 的 <code>QueueUserWorkItem</code> 方法发起一次异步的计算限制操作。但这个技术有许多限制。最大的问题是没有内建的机制让你知道操作在什么时候完成，也没有机制在操作完成时获得返回值。为了克服这些限制(并解决其他一些问题)，Microsoft 引入了 <strong>任务</strong>的概念。我们通过 <code>System.Threading.Tasks</code> 命名空间中的类型来使用任务。</p><p>所以，不是调用 <code>ThreadPool</code> 的 <code>QueueUserWorkItem</code> 方法，而是用任务来做相同的事情：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>ThreadPool.QueueUserWorkItem(ComputeBoundOp, 5);    // 调用 QueueUserWorkItem
new Task(ComputeBoundOp, 5).Start();                // 用 Task 来做相同的事情
Task.Run(() =&gt; ComputeBoundOp(5));                  // 另一个等价的写法
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第二行代码创建 <code>Task</code> 对象并立即调用 <code>Start</code> 来调度任务。当然，也可先创建好 <code>Task</code> 对象再调用 <code>Start</code>。例如，可以创建一个 <code>Task</code> 对象再调用<code>Start</code> 来调度任务。由于创建 <code>Task</code> 对象并立即调用 <code>Start</code> 是常见的编程模式，所以可以像最后一行代码展示的那样调用 <code>Task</code> 的静态 <code>Run</code> 方法。</p><p>为了创建一个 <code>Task</code>，需要调用构造器并传递一个 <code>Action</code> 或 <code>Action&lt;Object&gt;</code> 委托。这个委托就是你想执行的操作。如果传递的是期待一个<code>Object</code> 的方法，还必须向 <code>Task</code> 的构造器传递最终要传给操作的实参。调用 <code>Run</code> 时可以传递一个 <code>Action</code> 或 <code>Func&lt;TResult&gt;</code> 委托来指定想要执行的操作。无论调用构造器还是<code>Run</code>，都可选择传递一个 <code>CancellationToken</code>，它使 <code>Task</code> 能在调度前取消(详情参见稍后的 27.5.2 节“取消任务”)。</p><p>还可选择向构造器传递一些 <code>TaskCreationOptions</code> 标志来控制 <code>Task</code> 的执行方式。<code>TaskCreationOptions</code> 枚举类型定义了一组可按位 OR 的标志。定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>[Flags, Serializable]
public enum TaskCreationOptions {
	None           = 0x0000,      // 默认
	
    // 提议 TaskScheduler 你希望该任务尽快执行
	PreferFairness = 0x0001,
	
    // 提议 TaskScheduler 应尽可能地创建线程池线程
	LongRunning    = 0x0002,
	
    // 该提议总是被采纳：将一个 Task 和它的父 Task 关联(稍后讨论)
	AttachedToParent = 0x0004,
	
    // 该提议总是被采纳：如果一个任务试图和这个父任务连接，它就是一个普通任务，而不是子任务
	DenyChildAttach = 0x0008,
	
    // 该提议总是被采纳：强迫子任务使用默认调度器而不是父任务的调度器
	HideScheduler = 0x0010
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有的标志只是“提议”，<code>TaskScheduler</code> 在调度一个 <code>Task</code> 时，可能会、也可能不会采纳这些提议。不过，<code>AttachedToParent</code>，<code>DenyChildAttach</code> 和<code>HideScheduler</code> 总是得以采纳，因为它们和 <code>TaskScheduler</code> 本身无关。<code>TaskScheduler</code> 对象的详情将在 27.5.7 节“任务调度器”讨论。</p><h3 id="_27-5-1-等待任务完成并获取结果" tabindex="-1"><a class="header-anchor" href="#_27-5-1-等待任务完成并获取结果"><span>27.5.1 等待任务完成并获取结果</span></a></h3><p>可等待任务完成并获取结果。例如，以下 <code>Sum</code> 方法在 <code>n</code> 值很大的时候会执行较长时间：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Int32 Sum(Int32 n) {
    Int32 sum = 0;
    for (; n &gt; 0; n--)
        checked { sum += n; }       // 如果 n 太大，会抛出 System.OverflowException
    return sum;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在可以构造一个 <code>Task&lt;TResult&gt;</code>对象(派生自 <code>Task</code>)，并为泛型 <code>TResult</code> 参数传递计算限制操作的返回类型。开始任务之后，可等待它完成并获得结果，如以下代码所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建一个 Task(现在还没有开始运行)
Task&lt;Int32&gt; t = new Task&lt;Int32&gt;(n =&gt; Sum((Int32)n), 1000000000);

// 可以后再启动任务
t.Start();

// 可选择显式等待任务完成
t.Wait();   // 注意：还有一些重载的版本能接受 timeout/CancellationToken 值

// 可获得结果(Result 属性内部会调用 Wait)
Console.WriteLine(&quot;The Sum is: &quot; + t.Result);   // 一个 Int32 值
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果计算限制的任务抛出未处理的异常，异常会被“吞噬”并存储到一个集合中，而线程池线程可以返回到线程池中。调用 <code>Wait</code> 方法或者 <code>Result</code> 属性时，这些成员会抛出一个 <code>System.AggregateException</code> 对象。</p><blockquote><p>重要提示 线程调用 <code>Wait</code> 方法时，系统检查线程要等待的 <code>Task</code> 是否已开始执行。如果是，调用 <code>Wait</code> 的线程来执行 <code>Task</code>。在这种情况下，调用<code>Wait</code> 的线程不会阻塞；它会执行 <code>Task</code> 并立即返回。好处在于，没有线程会被阻塞，所以减少了对资源的占用(因为不需要创建一个线程来替代被阻塞的线程)，并提升了性能(因为不需要花时间创建线程，也没有上下文切换)。不好的地方在于，假如线程在调用 <code>Wait</code> 前已获得了一个线程同步锁，而 <code>Task</code> 试图获取同一个锁，就会造成死锁的线程！</p></blockquote><p><code>AggregateException</code> 类型封装了异常对象的一个集合(如果父任务生成了多个子任务，而多个子任务都抛出了异常，这个集合便可能包含多个异常)。该类型的 <code>InnerExceptions</code> 属性返回一个 <code>ReadOnlyCollection&lt;Exception&gt;</code> 对象。不要混淆 <code>InnerExceptions</code> 属性和 <code>InnerException</code> 属性，后者是<code>AggregateException</code> 类从 <code>System.Exception</code> 基类继承的，在本例中，<code>AggregateException</code> 的 <code>InnerExceptions</code> 属性的元素 <code>0</code> 将引用由计算限制方法(<code>Sum</code>)抛出的实际 <code>System.OverflowException</code> 对象。</p><p>为方便编码，<code>AggregateException</code> 重写了 <code>Exception</code> 的 <code>GetBaseException</code> 方法，返回作为问题根源的最内层的 <code>AggregateException</code>(假定集合只有一个最内层的异常)。<code>AggregateException</code> 还提供了一个 <code>Flatten</code> 方法，它创建一个新的 <code>AggregateException</code>， 其 <code>InnerExceptions</code> 属性包含一个异常列表，其中的异常是通过遍历原始 <code>AggregateException</code> 的内层异常层次结构而生成的。最后，<code>AggregateException</code> 还提供了一个 <code>Handle</code> 方法，它为 <code>AggregateException</code> 中包含的每个异常都调用一个回调方法。然后，回调方法可以为每个异常决定如何对其进行处理：回调返回 <code>true</code> 表示异常已处理；返回 <code>false</code> 表示未处理。调用 <code>Handle</code> 后，如果至少有一个异常没有被处理，就创建一个新的 <code>AggregateException</code> 对象，其中只包含未处理的异常，并抛出这个新的 <code>AggregateException</code> 对象。本章以后会展示使用了 <code>Flatten</code> 和 <code>Handle</code> 方法的例子。</p><blockquote><p>重要提示 如果一致不调用 <code>Wait</code> 或 <code>Result</code>，或者一直不查询 <code>Task</code> 的 <code>Exception</code> 属性，代码就一直注意不到这个异常的发生。这当然不好，因为程序遇到了未预料到的问题，而你居然没注意到。为了帮助你检测没有被注意到。为了帮助你检测没有被注意到的异常，可以向 <code>TaskScheduler</code> 的静态 <code>UnobservedTaskException</code> 事件登记一个回调方法。每次放一个 <code>Task</code> 被垃圾回收时，如果存在一个没有被注意到的异常，CLR 的终结器线程就会引发这个事件。一旦引发，就会向你的事件处理方法传递一个 <code>UnobservedTaskExceptionEventArgs</code> 对象，其中包含你没有注意到的 <code>AggregateException</code>。</p></blockquote><p>除了等待单个任务，<code>Task</code> 类还提供了两个静态方法，允许线程等待一个 <code>Task</code> 对象数组。其中，<code>Task</code> 的静态 <code>WaitAny</code> 方法会阻塞调用线程，直到数组中的任何 <code>Task</code> 对象完成。方法返回 <code>Int32</code> 数组索引值，指明完成的是哪个 <code>Task</code> 对象。方法返回后，线程被唤醒并继续运行。如果发生超时，方法将返回 <code>-1</code>。如果 <code>WaitAny</code> 通过一个 <code>CancellationToken</code> 取消，会抛出一个 <code>OperationCanceledException</code>。</p><p>类似地，<code>Task</code> 类还有一个静态 <code>WaitAll</code> 方法，它阻塞调用线程，直到数组中的所有 <code>Task</code> 对象完成。如果所有 <code>Task</code> 对象都完成，<code>WaitAll</code> 方法返回<code>true</code>。发生超时则返回 <code>false</code>。如果 <code>WaitAll</code> 通过一个 <code>CancellationToken</code>取消，会抛出一个 <code>OperationCanceledException</code>。</p><h3 id="_27-5-2-取消任务" tabindex="-1"><a class="header-anchor" href="#_27-5-2-取消任务"><span>27.5.2 取消任务</span></a></h3><p>可用一个 <code>CancellationTokenSource</code> 取消 <code>Task</code>。首先必须修订前面的 <code>Sun</code> 方法，让它接受一个 <code>CancellationToken</code>：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Int32 Sum(CancellationToken ct, Int32 n) {
    Int32 sum = 0;
    for (; n &gt; 0; n--) {

        // 在取消标志引用的 CancellationTokenSource 上调用 Cancel，
        // 下面这行代码就会抛出 OperationCanceledException
        ct.ThrowIfCancellationRequested();

        checked { sum += n; }  // 如果 n 太大，会抛出 System.OverflowException
    }    
    return sum;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>循环(负责执行计算限制的操作)中调用 <code>CancellationToken</code> 的 <code>ThrowIfCancellationRequested</code> 方法定时检查操作是否已取消。这个方法与<code>CancellationToken</code> 的 <code>IsCancellationRequested</code> 属性相似(27.4 节“协作式取消和超时”已经讨论过这个属性)。但如果 <code>CancellationTokenSource</code> 已经取消，<code>ThrowIfCancellationRequested</code> 会抛出一个 <code>OperationCanceledException</code>。之所以选择抛出异常，是因为和 <code>ThreadPool</code> 的 <code>QueueUserWorkItem</code> 方法初始化的工作项不同，任务有办法表示完成，任务甚至能返回一个值。所以，需要采取一种方式将已完成的任务和出错的任务区分开。而让任务抛出异常，就可以知道任务没有一直运行到结束。</p><p>现在像下面这样创建 <code>CancellationTokenSource</code> 和 <code>Task</code> 对象：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>CancellationTokenSource cts = new CancellationTokenSource();
Task&lt;Int32&gt; t = Task.Run(() =&gt; Sum(cts.Token, 1000000000), cts.Token);

// 在之后的某个时间，取消 CancellationTokenSource 以取消 Task
cts.Cancel();       // 这是异步请求，Task 可能已经完成了

try {
    // 如果任务已取消，Request 会抛出一个 AggregateException
    Console.WriteLine(&quot;The sum is: &quot; + t.Result);   // 一个 Int32 值
}
catch (AggregateException x) {
    // 将任何 OperationCanceledException 对象都视为已处理。
    // 其他任何异常都造成抛出一个新的 AggregateException，
    // 其中只包含未处理的异常
    x.Handle(e =&gt; e is OperationCanceledException);
    // 所有异常都处理好之后，执行下面这一行
    Console.WriteLine(&quot;Sum was canceled&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可在创建 <code>Task</code> 时将一个 <code>CancellationToken</code> 传给构造器(如上例所示)，从而将两者关联。如果 <code>CancellationToken</code> 在 <code>Task</code> 调度前取消，<code>Task</code>会被取消，永远都不执行<sup>①</sup>。但如果 <code>Task</code> 已调度(通过调用 <code>Start</code> 方法<sup>②</sup>)，那么<code>Task</code>的代码只有显示支持取消，其操作才能在执行期间取消。遗憾的是，虽然 <code>Task</code> 对象关联了一个 <code>CancellationToken</code>，但却没有办法访问它。因此，必须在<code>Task</code> 的代码中获得创建<code>Task</code> 对象时的同一个<code>CancellationToken</code>。为此，最简单的办法就是使用一个 lambda 表达式，将 <code>CancellationToken</code> 作为闭包变量“传递”(就像上例那样)。</p><blockquote><p>① 顺便说一句，如果一个任务还没有开始就试图取消它，会抛出一个 <code>InvalidOperationException</code>。 ② 调用静态 <code>Run</code> 方法会自动创建 <code>Task</code>对象并立即调用<code>Start</code>。 ———— 译注</p></blockquote><h3 id="_27-5-3-任务完成时自动启动新任务" tabindex="-1"><a class="header-anchor" href="#_27-5-3-任务完成时自动启动新任务"><span>27.5.3 任务完成时自动启动新任务</span></a></h3><p>伸缩性好的软件不应该使线程阻塞。调用 <code>Wait</code>，或者在任务尚未完成时查询任务的 <code>Result</code> 属性<sup>③</sup>，极有可能造成线程池创建新线程，这增大了资源的消耗，也不利于性能和伸缩性。幸好，有更好的办法可以知道一个任务在什么时候结束运行。任务完成时可启动另一个任务。下面重写了之前的代码，它不阻塞任何线程：</p><blockquote><p>③ <code>Result</code> 属性内部会调用 <code>Wait</code>。 ———— 译注</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建并启动一个 Task，继续另一个任务
Task&lt;Int32&gt; t = Task.Run(() =&gt; Sum(CancellationToken.None, 1000));

// ContinueWith 返回一个 Task，但一般都不需要再使用该对象(下例的 cwt)
Task cwt = t.ContinueWith(task =&gt; Concole.WriteLine(&quot;The sum is: &quot; + task.Result));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在，执行 <code>Sum</code> 的任务完成时会启动另一个任务(也在某个线程池线程上)以显示结果。执行上述代码的线程不会进入阻塞状态并等待这两个任务中的任何一个完成。相反，线程可以执行其他代码。如果线程本身就是一个线程池线程，它可以返回池中以执行其他操作。注意，执行 <code>Sum</code> 的任务可能在调用 <code>ContinueWith</code> 之前完成。但这不是一个问题，因为 <code>ContinueWith</code> 方法会看到 <code>Sum</code> 任务已经完成，会立即启动显示结果的任务。</p><p>注意， <code>ContinueWith</code> 返回对新 <code>Task</code> 对象的引用(我的代码是将该引用放到 <code>cwt</code> 变量中)。当然，可以用这个 <code>Task</code> 对象调用各种成员(比如 <code>Wait</code>，<code>Result</code>，甚至 <code>ContinueWith</code>)，但一般都忽略这个 <code>Task</code> 对象，不再用变量保存对它的引用。</p><p>另外，<code>Task</code> 对象内部包含了 <code>ContinueWith</code> 任务的一个集合。所以，实际可以用一个 <code>Task</code> 对象来多次调用 <code>ContinueWith</code>。任务完成时，所有<code>ContinueWith</code> 任务都会进入线程池的队列中。此外，可在调用 <code>ContinueWith</code> 时传递对一组 <code>TaskContinuationOptions</code> 枚举值进行按位 OR 运算的结果。前 6 个标志(<code>None</code>，<code>PreferFairness</code>，<code>LongRunning</code>，<code>AttachedToParent</code>，<code>DenyChildAttach</code> 和 <code>HideScheduler</code>)与之前描述的 <code>TaskCreationOptions</code> 枚举类型提供的标志完全一致。下面是 <code>TaskContinuationOptions</code> 类型的定义：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>[Flags, Serializable]
public enum TaskContinuationOptions
{
    None                    = 0x0000,  // 默认

    // 提议 TaskScheduler 你希望该任务尽快执行.
    PreferFairness          = 0x0001,
    // 提议 TaskScheduler 应尽可能地创建池线程线程
    LongRunning             = 0x0002,
    
    // 该提议总是被采纳：将一个 Task 和它的父 Task 关联(稍后讨论) 
    AttachedToParent        = 0x0004,

    // 任务试图和这个父任务连接将抛出一个 InvalidOperationException
    DenyChildAttach         = 0x0008,

    // 强迫子任务使用默认调度器而不是父任务的调度器
    HideScheduler           = 0x0010,

    // 除非前置任务(antecedent task)完成，否则禁止延续任务完成(取消)
    LazyCancellation        = 0x0020,

    // 这个标志指出你希望由执行第一个任务的线程执行
    // ContinueWith 任务。第一个任务完成后，调用
    // ContinueWith 的线程接着执行 ContinueWith 任务 ①
    ExecuteSynchronously    = 0x80000,

    // 这些标志指出在什么情况下运行 ContinueWith 任务
    NotOnRanToCompletion    = 0x10000,
    NotOnFaulted            = 0x20000,
    NotOnCanceled           = 0x40000,

    // 这些标志是以上三个标志的便利组合
    OnlyOnRanToCompletion   = NotOnRanToCompletion | NotOnFaulted, //0x60000,
    OnlyOnFaulted           = NotOnRanToCompletion | NotOnCanceled,// 0x50000,
    OnlyOnCanceled          = NotOnFaulted | NotOnCanceled,// 0x30000
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>① <code>ExecuteSynchronously</code> 是指同步执行。两个任务都在使用同一个线程一前一后地执行，就称为同步执行。 ————译注</p></blockquote><p>调用 <code>ContinueWith</code> 时，可用 <code>TaskContinuationOptions.OnlyOnCanceled</code> 标志指定新任务只有在第一个任务被取消时才执行。类速地，<code>TaskContinuationOptions.OnlyOnFaulted</code> 标志指定新任务只有在第一个任务抛出未处理的异常时才执行。当然，还可使用 <code>TaskContinuationOptions.OnlyOnRanToCompletion</code> 标志指定新任务只有在第一个任务顺利完成(中途没有取消，也没有抛出未处理异常)时才执行。默认情况下，如果不指定上述任何标志，则新任务无论如何都会运行，不管第一个任务如何完成。一个 <code>Task</code> 完成时，它的所有未运行的延续任务都被自动取消<sup>②</sup>。下面用一个例子来演示所有这些概念。</p><blockquote><p>② 未运行是因为不满足前面说的各种条件。 ———— 译注</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建并启动一个 Task，它有多个延续任务 
Task&lt;Int32&gt; t = Task.Run(() =&gt; Sum(10000)); 

// 每个 ContinueWith 都返回一个 Task， 但这些 Task 一般都用不着了
t.ContinueWith(task =&gt; Console.WriteLine(&quot;The sum is: &quot; + task.Result), 
 TaskContinuationOptions.OnlyOnRanToCompletion); 
t.ContinueWith(task =&gt; Console.WriteLine(&quot;Sum threw: &quot; + task.Exception.InnerException), 
 TaskContinuationOptions.OnlyOnFaulted); 
t.ContinueWith(task =&gt; Console.WriteLine(&quot;Sum was canceled&quot;), 
 TaskContinuationOptions.OnlyOnCanceled); 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_27-5-4-任务可以启动子任务" tabindex="-1"><a class="header-anchor" href="#_27-5-4-任务可以启动子任务"><span>27.5.4 任务可以启动子任务</span></a></h3><p>最后，任务支持父/子关系，如以下代码所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Task&lt;Int32[]&gt; parent = new Task&lt;int[]&gt;(() =&gt; {
    var results = new Int32[3];     // 创建一个数组来存储结果

    // 这个任务创建并启动 3 个子任务
    new Task(() =&gt; results[0] = Sum(10000), TaskCreationOptions.AttachedToParent).Start();
    new Task(() =&gt; results[1] = Sum(20000), TaskCreationOptions.AttachedToParent).Start();
    new Task(() =&gt; results[2] = Sum(30000), TaskCreationOptions.AttachedToParent).Start();

    // 返回对数组的引用(即使数组元素可能还没有初始化)
    return results;
});

// 付任务及其子任务运行完成后，用一个延续任务显示结果
var cwt = parent.ContinueWith(parentTask =&gt; Array.ForEach(parentTask.Result, Console.WriteLine));

// 启动父任务，便于它启动它的子任务
parent.Start();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在本例中，父任务闯将并启动三个 <code>Task</code> 对象。一个任务创建的一个或多个 <code>Task</code> 对象默认是顶级任务，它们与创建它们的任务无关。但 <code>TaskCreationOptions.AttachedToParent</code> 标志将一个 <code>Task</code> 和创建它的 <code>Task</code> 关联，结果是除非所有子任务(以及子任务的子任务)结束运行，否则创建任务(父任务)不认为已经结束。调用 <code>ContinueWith</code> 方法创建 <code>Task</code> 时，可指定 <code>TaskCreationOptions.AttachedToParent</code> 标志将延续任务指定成子任务。</p><h3 id="_27-5-5-任务内部揭秘" tabindex="-1"><a class="header-anchor" href="#_27-5-5-任务内部揭秘"><span>27.5.5 任务内部揭秘</span></a></h3><p>每个 <code>Task</code> 对象都有一组字段，这些字段构成了任务的状态。其中包括一个 <code>Int32 ID</code>(参见<code>Task</code>的只读<code>Id</code>属性)、代表<code>Task</code> 执行状态的一个<code>Int32</code>、对父任务的引用、对<code>Task</code>创建时指定的 <code>TaskScheduler</code> 的引用、对回调方法的引用、对要传给回调方法的对象的引用(可通过<code>Task</code>的只读<code>AsyncState</code>属性查询)、对 <code>ExecutionContext</code> 的引用以及对 <code>ManualResetEventSlim</code> 对象的引用。另外，每个 <code>Task</code> 对象都有对根据需要创建的补充状态的引用。补充状态包含一个 <code>CancellationToken</code> 、一个 <code>ContinueWithTask</code> 对象集合、为抛出未处理异常的子任务而准备的一个 <code>Task</code> 对象集合等。说了这么多，重点不需要任务的附加功能，那么使用 <code>ThreadPool.QueueUserWorkItem</code> 能获得更好的资源利用率。</p><p><code>Task</code> 和 <code>Task&lt;TResult&gt;</code> 类实现了 <code>IDisposable</code> 接口，允许在用完 <code>Task</code> 对象后调用 <code>Dispose</code>。如今，所有 <code>Dispose</code> 方法所做的都是关闭 <code>ManualResetEventSlim</code> 对象。但可定义从 <code>Task</code> 和 <code>Task&lt;TResult&gt;</code> 派生的类，在这些类中分配它们自己的资源，并在它们重写的 <code>Dispose</code> 方法中释放这些资源。我建议不要在代码中为 <code>Task</code> 对象显式调用 <code>Dispose</code>；相反，应该让垃圾回收器自己清理任何不再需要的资源。</p><p>每个 <code>Task</code> 对象都包含代表 <code>Task</code> 唯一 ID 的 <code>Int32</code> 字段。创建 <code>Task</code> 对象时该字段初始化为零。首次查询 <code>Task</code> 的只读 <code>Id</code> 属性时，属性将一个唯一的 <code>Int32</code> 值分配给该字段，并返回该值。任务 ID 从 1 开始，没分配一个 ID 都递增 1。在 Microsoft Visual Studio 调试器中查看 <code>Task</code> 对象，会造成调试器显示 <code>Task</code> 对象，会造成调试器显示 <code>Task</code> 的 ID，从而造成为 <code>Task</code> 分配 ID。</p><p>该 ID 的意义在于每个 <code>Task</code> 都可用唯一值进行标识。事实上，Visual Studio 会在“并行任务” 和 “并行堆栈” 窗口中显示这些任务 ID。但由于不能在自己的代码中分配 ID，所以几乎不可能将 ID 和代码正在做的事情联系起来。运行任务的代码时，可查询 <code>Task</code> 的静态 <code>CurrentId</code> 属性来返回一个可空<code>Int32(Int32?)</code>。调试期间，可在 Visual Studio 的“监视”或“即使”窗口中调用它，获得当前正在调试的代码的 ID。然后，可在“并行任务”或“并行堆栈”窗口中找到自己的任务。如果当前没有任务正在执行，查询 <code>CurrentId</code> 属性会返回 <code>null</code>。</p><p>在一个 <code>Task</code> 对象的存在期间，可查询 <code>Task</code> 的只读 <code>Status</code> 属性了解它在其生存期的什么位置。该属性返回一个 <code>TaskStatus</code> 值，定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public enum TaskStatus {
	// 这些标志指出一个 Task 在其生命期内的状态
	Created,                // 任务已显示创建：可以手动 Start() 这个任务
	WaitingForActivation,   // 任务已隐式创建：会自动开始
	
    WaitingToRun,           // 任务已调度，但尚未运行
	Running,                // 任务正在运行

    // 任务正在等待他的子任务完成，子任务完成后它才完成
	WaitingForChildrenToComplete,

    // 任务的最终状态是一下三个之一：
	RanToCompletion,
	Canceled,
	Faulted
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首次构造 <code>Task</code> 对象时，它的状态是 <code>Created</code>。以后，当任务启动时，它的状态变成 <code>WaitingToRun</code>。<code>Task</code> 实际在一个线程上运行时，它的状态变成 <code>Running</code>。任务停止运行，状态变成 <code>WaitingForChildrenToComplete</code>。任务完成时进入一下状态之一：<code>RanToCompletion</code>(运行完成)，<code>Canceled</code>(取消)或<code>Faulted</code>(出错)。如果运行完成，可通过 <code>Task&lt;TResult&gt;</code> 的 <code>Result</code> 属性来查询任务结果。<code>Task</code> 或 <code>Task&lt;TResult&gt;</code> 出错时，可查询 <code>Task</code> 的 <code>Exception</code> 属性来获得任务抛出的未处理异常；该属性总是返回一个 <code>AggregateException</code> 对象，对象的 <code>InnerException</code> 集合包含了所有未处理的异常。</p><p>为简化编码，<code>Task</code> 提供了几个只读 <code>Boolean</code> 属性，包括 <code>IsCanceled</code>，<code>IsFaulted</code> 和 <code>IsCompleted</code>。注意当 <code>Task</code> 处于 <code>RanToCompletion</code>，<code>Canceled</code> 或 <code>Faulted</code> 状态时，<code>IsCompleted</code> 返回 <code>true</code>。判断一个 <code>Task</code> 是否成功完成最简单的办法是使用如下所示的代码：</p><p><code>if (task.Status == TaskStatus.RanToCompletion) ...</code></p><p>调用 <code>ContinueWith</code>，<code>ContinueWhenAll</code>，<code>ContinueWhenAny</code> 或 <code>FromAsync</code> 等方法来创建的 <code>Task</code> 对象处于 <code>WaitingForActivation</code> 装填。该状态意味着 <code>Task</code> 的调度由任务基础结构控制。例如，不可显式启动通过调用 <code>ContinueWith</code> 来创建的对象，该 <code>Task</code> 在它的前置任务(antecedent task)执行完毕后自动启动。</p><h3 id="_27-5-6-任务工厂" tabindex="-1"><a class="header-anchor" href="#_27-5-6-任务工厂"><span>27.5.6 任务工厂</span></a></h3><p>有时需要创建一组共享相同配置的 <code>Task</code> 对象。为避免机械地将相同的参数传给每个 <code>Task</code> 的构造器，可创建一个任务工厂来封装通用的配置。<code>System.Threading.Tasks</code> 命名空间定义了一个 <code>TaskFactory</code> 类型和一个 <code>TaskFactory&lt;TResult&gt;</code> 类型。两个类型都派生自 <code>System.Object</code>；也就是说，它们是平级的。</p><p>要创建一组返回 <code>void</code> 的任务，就构造一个 <code>TaskFactory</code>；要创建一组具有特定返回类型的任务，就构造一个 <code>TaskFactory&lt;TResult&gt;</code>，并通过泛型 <code>TResult</code> 实参传递任务的返回类型。创建上述任何工厂类时，要向构造器传递工厂创建的所有任务都具有的默认值。具体地说，要向任务工厂传递希望任务具有的 <code>CancellationToken</code>，<code>TaskScheduler</code>，<code>TaskCreationOptions</code> 和 <code>TaskContinuationOptions</code> 设置。</p><p>以下代码演示了如何使用一个 <code>TaskFactory</code>：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Task parent = new Task(() =&gt; {
    var cts = new CancellationTokenSource();
    var tf = new TaskFactory&lt;Int32&gt;(cts.Token,
        TaskCreationOptions.AttachedToParent,
        TaskContinuationOptions.ExecuteSynchronously,
        TaskScheduler.Default);

    // 这个任务创建并启动 3 个子任务
    var childTasks = new[] {
        tf.StartNew(() =&gt; Sum(cts.Token, 10000)),
        tf.StartNew(()=&gt; Sum(cts.Token, 20000)),
        tf.StartNew(()=&gt; Sum(cts.Token, Int32.MaxValue)) // 太大，抛出 OverflowException
    };

    // 任何子任务抛出异常，就取消其余子任务
    for (Int32 task = 0; task &lt; childTasks.Length; task++)
        childTasks[task].ContinueWith(
            t =&gt; cts.Cancel(), TaskContinuationOptions.OnlyOnFaulted);

    // 所有子任务完成后，从未出错/未取消的任务获取返回的最大值，
    // 然后将最大值传给另一个任务来显示最大结果
    tf.ContinueWhenAll(
        childTasks,
        completedTasks =&gt; completedTasks.Where(t =&gt; !t.IsFaulted &amp;&amp; !t.IsCanceled).Max(t =&gt; t.Result),
        CancellationToken.None)
            .ContinueWith(t =&gt; Console.WriteLine(&quot;The maximum is: &quot; + t.Result),
                TaskContinuationOptions.ExecuteSynchronously);                        
});

// 子任务完成后，也显示任何未处理的异常
parent.ContinueWith(p =&gt; {
    // 我将所有文本放到一个 StringBuilder 中，并只调用 Console.WriteLine 一次，
    // 因为这个任何可能和上面的任务并行执行，而我不希望任务的输出变得不连续
    StringBuilder sb = new StringBuilder(
        &quot;The following exception(s) occurred:&quot; + Environment.NewLine);

    foreach (var e in p.Exception.Flatten().InnerExceptions)
        sb.AppendLine(&quot; &quot; + e.GetType().ToString());
    Console.WriteLine(sb.ToString());
}, TaskContinuationOptions.OnlyOnFaulted);

// 启动父任务，使它能启动子任务
parent.Start();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我通过上述代码创建了一个 <code>TaskFactory&lt;Int32&gt;</code> 对象。该任务工厂创建 3 个 <code>Task</code> 对象。我希望所有子任务都以相同方式配置：每个 <code>Task</code> 对象都共享相同的 <code>CancellationTokenSource</code> 标记，任务都被视为其父任务的子任务，<code>TaskFactory</code> 创建的所有延续任务都以同步方式执行，而且 <code>TaskFactory</code> 创建的所有 <code>Task</code> 对象都使用默认 <code>TaskScheduler</code>。</p><p>然后创建包含 3 个子任务对象的数组，所有子任务都调用 <code>TaskFactory</code> 的 <code>StartNew</code> 方法来创建。使用该方法可以很方便地创建并启动子任务。我通过一个循环告诉每个子任务，如果抛出未处理的异常，就取消其他仍在运行的所有子任务。最后，我在 <code>TaskFactory</code> 上调用 <code>ContinueWhenAll</code>，它创建在所有子任务都完成后启动的一个 <code>Task</code>。由于这个任务是用 <code>TaskFactory</code> 创建的，所以它仍被视为父任务的一个子任务，会用默认 <code>TaskScheduler</code> 同步执行。但我希望即使其他子任务被取消，也要运行这个任务，所以我通过传递 <code>CancellationToken.None</code> 来覆盖 <code>TaskFactory</code> 的 <code>CancellationToken</code>。这使该任务不能取消。最后，当处理所有结果的任务完成后，我创建另一个任务来显示从所有子任务中返回的最大值。</p><blockquote><p>注意 调用 <code>TaskFactory</code> 或 <code>TaskFactory&lt;TResult&gt;</code>的静态 <code>ContinueWhenAll</code> 和 <code>ContinueWhenAny</code> 方法时，以下<code>TaskContinuationOption</code> 标志是非法的：<code>NotOnRanToCompletion</code>，<code>NotOnFaulted</code> 和 <code>NotOnCanceled</code>。当然，基于这些标志组合起来的标志(<code>OnlyOnCanceled</code>，<code>OnlyOnFaulted</code> 和 <code>OnlyOnRanToCompletion</code>)也是非法的。也就是说，无论前置任务是如何完成的，<code>ContinueWhenAll</code> 和 <code>ContinueWhenAny</code> 都会执行延续任务。</p></blockquote><h3 id="_27-5-7-任务调度器" tabindex="-1"><a class="header-anchor" href="#_27-5-7-任务调度器"><span>27.5.7 任务调度器</span></a></h3><p>任务基础结构非常灵活，其中 <code>TaskScheduler</code> 对象功不可没。<code>TaskScheduler</code> 对象负责执行被调度的任务，同时向 Visual Studio 调试器公开任务信息。FCL 提供了两个派生自 <code>TaskScheduler</code> 的类型：线程池任务调度器(thread pool task scheduler)，和同步上下文任务调度器(synchronization context task scheduler)。默认情况下，所有应用程序使用的都是线程池任务调度器。这个任务调度器将任务调度给线程池的工作者线程，将在本章后面的 27.9 节“线程池如何管理线程”进行更详细的讨论。可查询 <code>TaskScheduler</code> 的静态 <code>Default</code> 属性来获得对默认任务调度器的引用。</p><p>同步上下文任务调度器适合提供了图形用户界面的应用程序，例如 Windows 窗体、Windows Presentation Foundation(WPF)、Silverlight 和 Windows Store 应用程序。它将所有任务都调度给应用程序的 GUI 线程，使所有任务代码都能成功更新 UI 组件(按钮、菜单项等)。该调度器不使用线程池。可执行 <code>TaskScheduler</code> 的静态 <code>FromCurrentSynchronizationContext</code> 方法来获得对同步上下文任务调度器的引用。</p><p>下面这个简单的 Windows 窗体应用程序演示了如何使用同步上下文任务调度器。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class MyForm : Form {
    private readonly TaskScheduler m_syncContextTaskScheduler;
    public MyForm() {
        // 获得对一个同步上下文任务调度器的引用
        m_syncContextTaskScheduler = TaskScheduler.FromCurrentSynchronizationContext();

        Text = &quot;Synchronization Context Task Scheduler Demo&quot;;
        Visible = true; Width = 400; Height = 100;
    }


    private CancellationTokenSource m_cts;

    protected override void OnMouseClick(MouseEventArgs e) {
        if (m_cts != null) {    // 一个操作正在进行，取消它
            m_cts.Cancel();
            m_cts = null;
        } else {    // 操作没有开始，启动它
            // 操作没有开始，启动它
            Text = &quot;Operation running&quot;;
            m_cts = new CancellationTokenSource();

            // 这个任务使用默认任务调度器，在一个线程池线程上执行
            Task&lt;Int32&gt; t = Task.Run(() =&gt; Sum(m_cts.Token, 20000), m_cts.Token);

            // 这些任务使用同步上下文任务调度器，在 GUI 线程上执行
            t.ContinueWith(task =&gt; Text = &quot;Result: &quot; + task.Result,
                CancellationToken.None, TaskContinuationOptions.OnlyOnRanToCompletion, m_syncContextTaskScheduler);

            t.ContinueWith(task =&gt; Text = &quot;Operation canceled&quot;,
                CancellationToken.None, TaskContinuationOptions.OnlyOnCanceled, m_syncContextTaskScheduler);

            t.ContinueWith(task =&gt; Text = &quot;Operation faulted&quot;,
                CancellationToken.None, TaskContinuationOptions.OnlyOnFaulted, m_syncContextTaskScheduler);
        }
        base.OnMouseClick(e);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>单击窗体的客户区域，就会在一个线程池线程上启动一个计算限制的任务。使用线程池线程很好，因为 GUI 线程在此期间不会被阻塞，能响应其他 UI 操作。但线程池线程执行的代码不应尝试更新 UI 组件，否则会抛出 <code>InvalidOperationException</code>。</p><p>计算限制的任务完成后执行三个延续任务之一。它们由与 GUI 线程对应的同步上下文任务调度器来调度。任务调度器将任务放到 GUI 线程的队列中，使它们的代码能成功更新 UI 组件。所有任务都通过继承的 <code>Text</code> 属性来更新窗体的标题。</p><p>由于计算限制的工作(<code>Sum</code>)在线程池线程上运行，所以用户可以和 UI 交互来取消操作。在这个简单的例子中，我允许用户在操作进行期间单击窗体的客户区域来取消操作。</p>`,136),v=e("code",null,"TaskScheduler",-1),m={href:"http://code.msdn.microsoft.com/ParExtSamples",target:"_blank",rel:"noopener noreferrer"},b=c(`<ul><li><p><code>IOTaskScheduler</code><br> 这个任务调度器将任务排队给线程池的 I/O 线程而不是工作者线程。</p></li><li><p><code>LimitedConcurrencyLevelTaskScheduler</code><br> 这个任务调度器不允许超过 <em>n</em>(一个构造器参数)个任务同时执行</p></li><li><p><code>OrderedTaskScheduler</code><br> 这个任务调度器一次只允许一个任务执行。这个类派生自 <code>LimitedConcurrencyLevelTaskScheduler</code>，为 <em>n</em> 传递 1。</p></li><li><p><code>PrioritizingTaskScheduler</code><br> 这个任务调度器将任务送入 CLR 线程池队列。之后，可调用 <code>Prioritize</code> 指出一个 <code>Task</code> 应该在所有普通任务之前处理(如果它还没有处理的话)。可以调用 <code>Deprioritize</code> 使一个 <code>Task</code> 在所有普通任务之后处理。</p></li><li><p><code>ThreadPerTaskScheduler</code><br> 这个任务调度器为每个任务创建并启动一个单独的线程；他完全不使用线程池。</p></li></ul><h2 id="_27-6-parallel-的静态-for-foreach-和-invoke方法" tabindex="-1"><a class="header-anchor" href="#_27-6-parallel-的静态-for-foreach-和-invoke方法"><span><a name="27_6">27.6 <code>Parallel</code> 的静态 <code>For</code>，<code>ForEach</code> 和 <code>Invoke</code>方法</a></span></a></h2><p>一些常见的编程情形可通过任务提升性能。为简化编程，静态 <code>System.Threading.Tasks.Parallel</code> 类封装了这些情形，它内部使用 <code>Task</code> 对象。例如，不要像下面这样处理集合中的所有项：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 一个线程顺序执行这个工作(每次迭代调用一次 DoWork)
for (Int32 i = 0; i &lt; 1000; i++) DoWork(i);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>而要使用 <code>Parallel</code> 类的 <code>For</code> 方法，用多个线程池线程辅助完成工作：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 线程池的线程并行处理工作
Parallel.For(0, 1000, i =&gt; DoWork(i));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>类似地，如果有一个集合，那么不要像这样写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 一个线程顺序执行这个工作(每次迭代调用一次 DoWork)
foreach (var item in collection) DoWork(item);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>而要像这样写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 线程池的线程并行处理工作
Parallel.ForEach(collection, item =&gt; DoWork(item));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>如果既可以使用 <code>For</code>， 也可以使用 <code>ForEach</code>， 那么建议使用 <code>For</code>，因为它执行得更快。</p><p>最后，如果要执行多个方法，那么既可像下面这样顺序执行：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 一个线程顺序执行所有方法
Method1();
Method2();
Method3();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>也可并行执行，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 线程池的线程并行执行方法
Parallel.Invoke(
    () =&gt; Method1(),
    () =&gt; Method2(),
    () =&gt; Method3());
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Parallel</code> 的所有方法都让调用线程参与处理。从资源利用的角度说，这是一件好事，因为我们不希望调用线程停下来(阻塞)，等线程池线程做完所有工作才能继续。然而，如果调用线程在线程池线程完成自己额那一部分工作之前完成工作，调用线程会将自己挂起，直到所有工作完成工作。这也是一件好事，因为这提供了和使用普通<code>for</code> 或 <code>foreach</code> 循环时相同的语义：线程要在所有工作完成后才继续运行。还要注意，如果任何操作抛出未处理的异常，你调用的 <code>Parallel</code> 方法最后会抛出一个 <code>AggregateException</code>。</p><p>但这并不是说需要对自己的源代码进行全文替换，将 <code>for</code> 循环替换成对 <code>Parallel.For</code> 的调用，将 <code>foreach</code> 循环替换成对 <code>Parallel.ForEach</code> 的调用。调用 <code>Parallel</code> 的方法时有一个很重要的前提条件：工作项必须能并行执行！所以，如果工作必须顺序执行，就不要使用 <code>Parallel</code> 的方法。另外，要避免会修改任何共享数据的工作项，否则多个线程同时处理可能会损坏数据。解决这个问题一般的办法是围绕数据访问添加线程同步锁。但这样一次就只能有一个线程访问数据，无法享受并行处理多个项所带来的好处。</p><p>另外，<code>Parallel</code> 的方法本身也有开销；委托对象必须分配，而针对每个工作项都要调用一次这些委托。如果有大量可由多个线程处理的工作项，那么也许能获得性能的提升。另外，如果每一项都涉及大量工作，那么通过委托来调用所产生的性能损失是可以忽略不计的。但如果只为区区几个工作项使用 <code>Parallel</code> 的方法，或者为处理得非常快的工作项使用 <code>Parallel</code> 的方法，就会得不偿失，反而降低性能。</p><p>注意 <code>Parallel</code> 的 <code>For</code>， <code>ForEach</code> 和 <code>Invoke</code> 方法都提供了接受一个 <code>ParallelOptions</code> 对象的重载版本。这个对象的定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class ParallelOptions {
    public ParallelOptions();

    // 允许取消操作
    public CancellationToken CancellationToken { get; set; }  // 默认为 CancellationToken.None

    // 允许指定可以并发操作的最大工作项数目
    public Int32 MaxDegreeOfParallelism { get; set; }  // 默认为 -1 (可用 CPU 数)

    // 允许指定要使用那个 TaskScheduler
    public TaskSchedulerTaskScheduler { get; set; }   // 默认为 TakScheduler.Default
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除此之外，<code>For</code> 和 <code>ForEach</code> 方法有一些重载版本允许传递 3 个委托。</p><ul><li><p>任务局部初始化委托(localInit)，为参与工作的每个任务都调用一次该委托。这个委托是在任务被要求处理一个工作项之前调用的。</p></li><li><p>主体委托(body)，为参与工作的各个线程所处理的每一项都调用一次该委托。</p></li><li><p>任务局部终结委托(localFinally)，为参与工作的每一个任务都调用一次该委托。这个委托是在任务处理好派发给它的所有工作项之后调用的。即使主体委托代码引发一个未处理的异常，也会调用它。</p></li></ul><p>以下代码演示如何利用这三个委托计算一个目录中的所有文件的字节长度。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Int64 DirectoryBytes(String path, String searchPattern, SearchOption searchOption) {
    var files = Directory.EnumerateFiles(path, searchPattern, searchOption);
    Int64 masterTotal = 0;

    ParallelLoopResult result = Parallel.ForEach&lt;String, Int64&gt;(
        files,

        () =&gt; { // localInit: 每个任务开始之前调用一次
            // 每个任务开始之前，总计值都初始化为 0
            return 0;   // 将 taskLocalTotal 初始值设为 0
        },

        (file, loopState, index, taskLocalTotal) =&gt; { // body:每个工作项调用一次
            // 获得这个文件的大小，把它添加到这个任务的累加值上
            Int64 fileLength = 0;
            FileStream fs = null;
            try {
                fs = File.OpenRead(file);
                fileLength = fs.Length;
            }
            catch (IOException) { /* 忽略拒绝访问的任何文件 */ }
            finally { if (fs != null) fs.Dispose(); }
            return taskLocalTotal + fileLength;
        },

        taskLocalTotal =&gt; {  // localFinally: 每个任务完成时调用一次
            // 将这个任务的总计值(taskLocalTotal)加到总的总计值(masterTotal)上
            Interlocked.Add(ref masterTotal, taskLocalTotal);
        });

    return masterTotal;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每个任务都通过 <code>taskLocalTotal</code> 变量为分配给它的文件维护它自己的总计值。每个任务在完成工作之后，都通过调用 <code>Interlocked.Add</code> 方法(参见第 29 章“基元线程同步构造”)，以一种线程安全的方式更新总的总计值(master total)。由于每个任务都有自己的总计值，所以在一个工作项处理期间，无需进行线程同步。由于线程同步会造成性能的损失，所以不需要线程同步是好事。只有在每个任务返回之后，<code>masterTotal</code> 才需要以一种线程安全的方式更新 <code>masterTotal</code> 变量。所以，因为调用 <code>Interlocked.Add</code> 而造成的性能损失每个任务只发生一次，而不会每个工作项都发生。</p><p>注意，我们向主体委托传递了一个 <code>ParallelLoopState</code> 对象，它的定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class ParallelLoopState {
	public void Stop ();
    public Boolean IsStopped { get; }

    public void Break ();
    public Int64? LowestBreakIteration { get; }

	public Boolean IsExceptional { get; }
    public Boolean ShouldExitCurrentIteration { get; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参与工作的每个任务都获得它自己的 <code>ParallelLoopState</code> 对象，并可通过这个对象和参与工作的其他任务进行交互。<code>Stop</code> 方法告诉循环停止处理任何更多的工作，未来对 <code>IsStopped</code> 属性的查询会返回 <code>true</code>。 <code>Break</code> 方法告诉循环不再继续处理当前项之后的项。例如，假如 <code>ForEach</code> 被告知要处理 100 项，并在处理第 5 项时调用了 <code>Break</code>，那么循环会确保前 5 项处理好之后，<code>ForEach</code> 才返回。但要注意，这并不是说在这 100 项中，只有前 5 项才会被处理，第 5 项之后的项可能在以前已经处理过了。<code>LowestBreakIteration</code> 属性返回在处理过程中调用过 <code>Break</code> 方法的最低的项。如果从来没有调用过 <code>Break</code>，<code>LowestBreakIteration</code> 属性会返回 <code>null</code>。</p><p>处理任何一项时，如果造成未处理的异常，<code>IsException</code> 属性会返回 <code>true</code>。处理一项时花费太长时间，代码可查询 <code>ShouldExitCurrentIteration</code> 属性看它是否应该提前退出。如果调用过 <code>Stop</code>，调用过 <code>Break</code>，取消过 <code>CancellationTokenSource</code>(由 <code>ParallelOption</code> 的 <code>CancellationToken</code> 属性引用)，或者处理一项时造成了未处理的异常，这个属性就会返回 <code>true</code>。</p><p><code>Parallel</code> 的 <code>For</code> 和 <code>ForEach</code> 方法都返回一个 <code>ParallelLoopResult</code> 实例，它看起来像下面这样：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public struct ParallelLoopResult {
    // 如果操作提前终止，以下方法返回 false
    public Boolean IsCompleted { get; }
    public Int64? LowestBreakIteration { get; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可检查属性来了解循环的结果。如果 <code>IsCompleted</code> 返回 <code>true</code>，表明循环运行完成，所有项都得到了处理。如果 <code>IsCompleted</code> 为 <code>false</code>，而且 <code>LowestBreakIteration</code> 为 <code>null</code>，表明参与工作的某个线程调用了 <code>Stop</code> 方法。如果 <code>IsCompleted</code> 返回<code>false</code>，而且<code>LowestBreakIteration</code> 不为 <code>null</code>，表明参与工作的某个线程调用了 <code>Break</code> 方法，从 <code>LowestBreakIteration</code> 返回的 <code>Int64</code> 值是保证得到处理的最低一项的索引。如果抛出异常，应捕捉 <code>AggregateException</code> 来得体地恢复。</p><h2 id="_27-7-并行语言集成查询-plinq" tabindex="-1"><a class="header-anchor" href="#_27-7-并行语言集成查询-plinq"><span><a name="27_7">27.7 并行语言集成查询(PLINQ)</a></span></a></h2><p>Microsoft 的语言集成查询(Language Integrated Query，LINQ)功能提供了一个简捷的语法来查询数据集合。可用 LINQ 轻松对数据项进行筛选、排序、投射等操作。使用 LINQ to Objects 时，只有一个线程顺序处理数据集合中的所有项；我们称之为<strong>顺序查询</strong>(sequential query)。要提高处理性能，可以使用<strong>并行 LINQ</strong>(Parallel LINQ)，它将顺序查询转换成并行查询，在内部使用任务(排队给默认 <code>TaskScheduler</code>)，将集合中的数据项的处理工作分散到多个 CPU 上，以便并发处理多个数据项。和 <code>Parallel</code> 的方法相似，要同时处理大量项，或者每一项的处理过程都是一个耗时的计算限制的操作，那么能从并行 LINQ 获得最大的收益。</p><p>静态 <code>System.Linq.ParallelEnumerable</code> 类(在 System.Core.dll 中定义)实现了 PLINQ 的所有功能，所以必须通过 C# 的 <code>using</code> 指令将<code>System.Linq</code> 命名空间导入你的源代码。尤其是这个类公开了所有标准 LINQ 操作符(<code>Where</code>，<code>Select</code>，<code>SelectMany</code>，<code>GroupBy</code>，<code>Join</code>，<code>OrderBy</code>，<code>Skip</code>，<code>Take</code>等)的并行版本。所有这些方法都是扩展了 <code>System.Linq.ParallelQuery&lt;T&gt;</code> 类型的扩展方法。要让自己的 LINQ to Objects 查询调用这些方法的并行版本，必须将自己的顺序查询(基于 <code>IEnumerable</code> 或者 <code>IEnumerable&lt;T&gt;</code>)转换成并行查询(基础 <code>ParallelQuery</code> 或者 <code>ParallelQuery&lt;T&gt;</code>)，这是用 <code>ParallelEnumerable</code> 的 <code>AsParallel</code> 扩展方法来实现的<sup>①</sup>，如下所示：</p><blockquote><p>① <code>ParallelQuery&lt;T&gt;</code> 类派生自 <code>ParallelQuery</code> 类。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static ParallelQuery&lt;TSource&gt; AsParallel&lt;TSource&gt;(this IEnumerable&lt;TSource&gt; source)
public static ParallelQuery          AsParallel(this IEnumerable source)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>下面是将顺序查询转换成并行查询的例子。查询返回的是一个程序集中定义的所有过时(obsolete)方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void ObsoleteMethods(Assembly assembly) {
    var query = 
        from type in assembly.GetExportedTypes().AsParallel()

        from method in type.GetMethods(BindingFlags.Public |
            BindingFlags.Instance | BindingFlags.Static)

        let obsoleteAttrType = typeof(ObsoleteAttribute)

        where Attribute.IsDefined(method, obsoleteAttrType)

        orderby type.FullName

        let obsoleteAttrObj = (ObsoleteAttribute)
            Attribute.GetCustomAttribute(method, obsoleteAttrType)

        select String.Format(&quot;Type={0}\\nMethod={1}\\nMessage={2}\\n&quot;,
                type.FullName, method.ToString(), obsoleteAttrObj.Message);

    // 显示结果
    foreach (var result in query) Console.WriteLine(result);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>虽然不太常见，但在一个查询中，可以从执行并行操作切换回执行顺序操作，这是通过调用 <code>ParallelEnumerable</code> 的 <code>AsSequential</code> 方法做到的：</p><p><code>public static IEnumerable&lt;TSource&gt; AsSequential&lt;TSource&gt;(this ParallelQuery&lt;TSource&gt; source)</code></p><p>该方法将一个 <code>ParallelQuery&lt;T&gt;</code> 转换回一个 <code>IEnumerable&lt;T&gt;</code>。这样一来，在调用了 <code>AsSequential</code> 之后执行的操作将只由一个线程执行。</p><p>通过，一个 LINQ 查询的结果数据是让某个线程执行一个 <code>foreach</code> 语句来计算获得的，就像前面展示的那样。这意味着只有一个线程遍历查询的所有结果。如果希望以并行方式处理查询的结果，就应该使用 <code>ParallelEnumerable</code> 的 <code>ForAll</code> 方法处理查询：</p><p><code>static void ForAll&lt;TSource&gt;(this ParallelQuery&lt;TSource&gt; source, Action&lt;TSource&gt; action)</code></p><p>这个方法允许多个线程同时处理结果。可修改前面的代码来使用该方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 显示结果
query.ForAll(Console.WriteLine);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>然而，让多个线程同时调用 <code>Console.WriteLine</code> 反而会损害性能，因为 <code>Console</code> 类内部会对线程进行同步，确保每次只有一个线程能访问控制台窗口，避免来自多个线程的文本在最后显示时乱成一团。希望为每个结果都执行计算时，才使用 <code>ForALl</code> 方法。</p><p>由于 PLINQ 用多个线程处理数据项，所以数据项被并发处理，结果被无序地返回。如果需要让 PLINQ 保持数据项的顺序，可调用 <code>ParallelEnumerable</code> 的 <code>AsOrdered</code> 方法。调用这个方法时，线程会成组处理数据项。然后，这些组被合并回去，同时保持顺序。这样会损害性能。以下操作符生成不排序的操作：<code>Distinct</code>，<code>Except</code>，<code>Intersect</code>，<code>Union</code>，<code>Join</code>，<code>GroupBy</code>，<code>GroupJoin</code> 和 <code>ToLookup</code>。在这些操作符之后要再次强制排序，只需调用<code>AsOrdered</code> 方法。</p><p>以下操作符生成排序的操作：<code>OrderBy</code>，<code>OrderByDescending</code>，<code>ThenBy</code> 和 <code>ThenByDescending</code>。在这些操作符之后，要再次恢复不排序的处理，只需调用 <code>AsUnordered</code> 方法。</p><p>PLINQ 提供了一些额外的 <code>ParallelEnumerable</code> 方法，可调用它们来控制查询的处理方式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static ParallelQuery&lt;TSource&gt; WithCancellation&lt;TSource&gt;(
    this ParallelQuery&lt;TSource&gt; source, CancellationToken cancellationToken)

public static ParallelQuery&lt;TSource&gt; WithDegreeOfParallelism&lt;TSource&gt;(
    this ParallelQuery&lt;TSource&gt; source, Int32 degreeOfParallelism)

public static ParallelQuery&lt;TSource&gt; WithExecutionMode&lt;TSource&gt;(
    this ParallelQuery&lt;TSource&gt; source, ParallelExecutionMode executionMode)

public static ParallelQuery&lt;TSource&gt; WithMergeOptions&lt;TSource&gt;(
    this ParallelQuery&lt;TSource&gt; source, ParallelMergeOptions mergeOptions)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>显然，<code>WithCancellation</code> 方法允许传递一个 <code>CancellationToken</code>，使查询处理能提前停止。<code>WithDegreeOfParallelism</code> 方法指定最多允许多少个线程处理查询。但不是说指定多少个它就创建多少个。它是有原则的，不需要的不会创建。你一般不用调用该方法。另外，默认是没个内核用一个线程执行查询。但如果想空出一些内核做其他工作，可调用 <code>WithDegreeOfParallelism</code> 并传递小于可用内核数的一个数字。另外，如果查询要执行同步I/O 操作，还可传递比内核数大的一个数字，因为线程会在这些操作期间阻塞。这虽然会浪费更多线程，但可以用更少的时间生成最终结果。同步 I/O 操作在客户端应用程序中没什么问题，但我强烈建议不要再服务器应用程序中执行同步 I/O 操作。</p><p>PLINQ 分析一个查询，然后决定如何最好地处理它。有的时候，顺序处理一个查询可以获得更好的性能，尤其是在使用以下任何操作时：<code>Concat</code>，<code>ElementAt(OrDefault)</code>，<code>First(OrDefault)</code>，<code>Last(OrDefault)</code>，<code>Skip(While)</code>，<code>Take(While)</code>或<code>Zip</code>。使用 <code>Select(Many)</code> 或 <code>Where</code> 的重载版本，并向你的 <code>selector</code> 或 <code>predicate</code> 委托传递一个位置索引时也是如此。然而，可以调用 <code>WithExecutionMode</code>， 向它传递某个 <code>ParallelExecutionMode</code> 标志，从而强迫查询以并行方式处理：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public enum ParallelExecutionMode {
    Default = 0,            // 让并行 LINQ 决定处理查询的最佳方式
    ForceParallelism = 1    // 强迫查询以其并行方式处理
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如前所述，并行 LINQ 让多个线程处理数据项，结果必须再合并回去。可调用 <code>WithMergeOptions</code>，向它传递以下某个 <code>ParallelMergeOptions</code> 标志，从而控制这些结果的缓冲与合并方式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public enum ParallelMergeOptions {
    Default       = 0,      // 目前和 AutoBuffered 一样(将来可能改变)
    NotBuffered   = 1,      // 结果一但就绪就开始处理
    AutoBuffered  = 2,      // 每个线程在处理前缓冲一些结果
    FullyBuffered = 3       // 每个线程在处理前缓冲所有结果
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些选项使你能在某种程度上平衡执行速度和内存消耗。<code>NotBuffered</code> 最省内存，但处理速度慢一些。<code>FullyBuffered</code> 消费较多的内存，<code>AutoBuffered</code> 介于 <code>NotBuffered</code> 和 <code>FullyBuffered</code> 之间。说真的，要想知道应该为一个给定的查询选择哪个并行合并选项，最好的办法就是亲自试验所有选项，并对比其性能。也可以“无脑”地接受默认值，它对于许多查询来说都工作得非常好。请参见以下博客文章，进一步了解 PLIQ 如何在 CPU 内核之间分配工作：</p>`,57),p={href:"http://blogs.msdn.com/pfxteam/archive/2009/05/28/9648672.aspx",target:"_blank",rel:"noopener noreferrer"},C={href:"http://blogs.msdn.com/pfxteam/archive/2009/06/13/9741072.aspx",target:"_blank",rel:"noopener noreferrer"},T=c(`<h2 id="_27-8-执行定时的计算限制操作" tabindex="-1"><a class="header-anchor" href="#_27-8-执行定时的计算限制操作"><span><a name="27_8">27.8 执行定时的计算限制操作</a></span></a></h2><p><code>System.Threading</code> 命名空间定义了一个 <code>Timer</code> 类，可用它让一个线程池线程定时调用一个方法。构造 <code>Timer</code> 类的实例相当于告诉线程池：在将来某个时间(具体由你指定)回调你的一个方法。<code>Timer</code> 类提供了几个相似的构造器：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Timer : MarshalByRefObject, IDisposable {
    public Timer(TimerCallback callback, Object state, Int32    dueTime, Int32 period);
    public Timer(TimerCallback callback, Object state, UInt32   dueTime, UInt32 period);
    public Timer(TimerCallback callback, Object state, Int64    dueTime, Int64 period);
    public Timer(TimerCallback callback, Object state, TimeSpan dueTime, TimeSpan period)
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4 个构造器以完全一致的方式构造 <code>Timer</code> 对象。<code>callback</code> 参数标识希望由一个线程池线程回调的方法。当然，你写的回调方法必须和<code>System.Threading.TimerCallback</code> 委托类型匹配，如下所示：</p><p><code>delegate void TimerCallback(Object state);</code></p><p>构造器的 <code>state</code> 参数允许在每次调用回调方法时都向它传递状态数据；如果没有需要传递的状态数据，可以传递 <code>null</code>。<code>dueTime</code>参数告诉CLR 在首次调用回调方法之前要等待多少毫秒。可以使用一个有符号或无符号的 32 位值、一个有符号的 64 位值或者一个 <code>TimeSpan</code> 值指定毫秒数。如果希望回调方法立即调用，为 <code>dueTime</code> 参数指定 <code>0</code> 即可。最后一个参数 <code>(period)</code> 指定了以后每次调用回调方法之前要等多少毫秒。如果为这个参数传递 <code>Timeout.Infinite(-1)</code>，线程池线程只调用回调方法一次。</p><p>在内部，线程池为所有 <code>Timer</code> 对象只使用了一个线程。这个线程知道下一个 <code>Timer</code> 对象在什么时候到期(计时器还有多久触发)。下一个 <code>Timer</code> 对象到期时，线程就会唤醒，在内部调用 <code>ThreadPool</code> 的 <code>QueueUserWorkItem</code>， 将一个工作项添加到线程池的队列中，使你的回调方法得到调用。如果回调方法的执行时间很长，计时器可能(在上个回调还没有完成的时候)再次触发。这可能造成多个线程池线程同时执行你的回调方法。为解决这个问题，我的建议是：构造 <code>Timer</code> 时，为 <code>period</code> 参数指定 <code>Timeout.Infinite</code>。这样，计时器就只触发一次。然后，在你的回调方法中，调用 <code>Change</code> 方法来指定一个新的 <code>dueTime</code>，并再次为 <code>period</code> 参数指定 <code>Timeout.Infinite</code>。以下是 <code>Change</code> 方法的各个重载版本：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Timer : MarshalByRefObject, IDisposable {
    public bool Change(Int32    dueTime, Int32    period);
    public bool Change(UInt32   dueTime, UInt32   period);
    public bool Change(Int64    dueTime, Int64    period);
    public bool Change(TimeSpan dueTime, TimeSpan period);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Timer</code> 类还提供了一个 <code>Dispose</code> 方法，允许完全取消计时器，并可在当时处于 pending 状态的所有回调完成之后，向 <code>notifyObject</code> 参数标识的内核对象发出信号。以下是 <code>Dispose</code> 方法的各个重载版本：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Timer : MarshalByRefObject, IDisposable {
    public void Dispose();
    public bool Dispose(WaitHandle notifyObject);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>重要提示 <code>Timer</code> 对象被垃圾回收时，它的终结代码告诉线程池取消计时器，使它不再触发。所以，使用 <code>Timer</code> 对象时，要确定有一个变量在保持 <code>Timer</code> 对象的存活，否则对你的回调方法的调用就会停止。21.1.3 节“垃圾回收与调试”对此进行了详细讨论和演示。</p></blockquote><p>以下代码演示了如何让一个线程池线程立即调用回调方法，以后每 2 秒调用一次：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal static class TimerDemo {
    private static Timer s_timer;

    public static void Main() {
        Console.WriteLine(&quot;Checking status every 2 seconds&quot;);

        // 创建但不启动计时器。确保 s_timer 在线程池线程调用 Status 之前引用该计时器
        s_timer = new Timer(Status, null,Timeout.Infinite, Timeout.Infinite);

        // 现在 s_timer 已被赋值，可以启动计时器了
        // 现在在 Status 中调用 Change，保证不会抛出 NullReferenceException
        s_timer.Change(0, Timeout.Infinite);

        Console.ReadLine();  // 防止进程终止
    }

    // 这个方法的签名必须和 TimerCallback 委托匹配
    private static void Status(Object state) {
        // 这个方法由一个线程池线程执行
        Console.WriteLine(&quot;In Status at {0}&quot;, DateTime.Now);
        Thread.Sleep(1000);         // 模拟其他工作(1 秒)

        // 返回前让 Timer 在 2 秒后再次触发
        s_timer.Change(2000, Timeout.Infinite);

        // 这个方法返回后，线程回归池中，等待下一个工作项
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果有需要定时执行的操作，可利用 <code>Task</code> 的静态 <code>Delay</code> 方法和 C# 的 <code>async</code> 和 <code>await</code> 关键字(第 28 章讨论)来编码。下面重写了前面的代码。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal static class DelayDemo {
    public static void Main() {
        Console.WriteLine(&quot;Checking status every 2 seconds&quot;);
        Status();
        Console.ReadLine();     // 防止进程终止
    }

    // 该方法可获取你想要的任何参数
    private static async void Status() {
        while (true) {
            Console.WriteLine(&quot;Checking status at {0}&quot;, DateTime.Now);
            // 要检查的代码放到这里...

            // 在循环末尾，在不阻塞喜爱能成的前提下延迟 2 秒
            await Task.Delay(2000);     // await 允许线程返回
            // 2 秒之后，某个线程会在 await 之后介入并继续循环
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>计时器太多，时间太少</strong></p><p>遗憾的是，FCL 事实上提供了几个计时器，大多数程序员都不清楚它们有什么独特之处。让我试着解释一下。</p><ul><li><p><code>System.Threading</code> 的 <code>Timer</code><br> 这是上一节讨论的计时器。要在一个线程池线程上执行定时的(周期性发生的)后台任务，它是最好的计时器。</p></li><li><p><code>System.Windows.Forms</code> 的 <code>Timer</code> 类<br> 构造这个类的实例，相当于告诉 Windows 将一个计时器和调用线程关联(参见 Win32 <code>SetTimer</code> 函数)。当这个计时器触发时，Windows 将一条计时器消息(<code>WM_TIMER</code>)注入线程的消息队列。线程必须执行一个消息泵来提取这些消息，并把它们派发给需要的回调方法。注意，所有这些工作都只由一个线程完成 ———— 设置计时器的线程保证就是执行回调方法的线程。还意味着计时器方法不会由多哥线程并发执行。</p></li><li><p><code>System.Windows.Threading</code> 的 <code>DispatcherTimer</code>类<br> 这个类是 <code>System.Windows.Forms</code> 的 <code>Timer</code> 类在 Silverlight 和 WPF 应用程序中的等价物。</p></li><li><p><code>Windows.UI.Xaml</code> 的 <code>DispatcherTimer</code> 类<br> 这个类是 <code>System.Windows.Forms</code> 的 <code>Timer</code> 类在 Windows Store 应用中的等价物。</p></li><li><p><code>System.Timers</code> 的 <code>Timer</code> 类<br> 这个计时器本质上是 <code>System.Threading</code> 的 <code>Timer</code> 类的包装类。计时器到期(触发)会导致 CLR 将事件放到线程池队列中。<code>System.Timers.Timer</code> 类派生自 <code>System.ComponentModel</code> 的 <code>Component</code> 类，允许在 Visual Studio 中将这些计时器对象放到设计平面(design surface)上。另外，它还公开了属性和事件，使它在 Visual Studio 的设计器中更容易使用。这个类是在好几年前，Microsoft 还没有理清线程处理和计时器的时候添加到 FCL 中的。这个类完全应该删除，强迫每个人都改为使用 <code>System.Threading.Timer</code> 类。事实上，我个人从来不用 <code>System.Timers.Timer</code> 类，建议你也不要用它，除非真的想在设计平面上添加一个计时器。</p></li></ul><h2 id="_27-9-线程池如何管理线程" tabindex="-1"><a class="header-anchor" href="#_27-9-线程池如何管理线程"><span><a name="27_9">27.9 线程池如何管理线程</a></span></a></h2><p>现在讨论一下线程池代码如何管理工作者线程和 I/O 线程。但我不打算讲太多细节，因为在这么多年的时间里，随着 CLR 的每个版本的发布，其内容的实现已发生了显著变化。未来的版本还会继续变化。最好是将线程池看成一个黑盒。不要拿单个应用程序去衡量它的性能，因为它不是针对某个单独的应用程序而设计的。相反，作为一个常规用途的线程调度技术，它面向的是大量应用程序；它对某些应用程序的效果要好于对其他应用程序。目前，它的工作情况非常理想，我强烈建议你信任它，因为你很难搞出一个比 CLR 自带的更好的线程池。另外，随着时间的推移，线程池代码内部会更改它管理线程的方式，所以大多数应用程序的性能会变得越来越好。</p><h3 id="_27-9-1-设置线程池限制" tabindex="-1"><a class="header-anchor" href="#_27-9-1-设置线程池限制"><span>27.9.1 设置线程池限制</span></a></h3><p>CLR 允许开发人员设置线程池要创建的最大线程数。但实践证明，线程池永远都不应该设置线程数上限，因为可能发生饥饿或死锁。假定队列中有 1000 个工作项，但这些工作项全都因为一个事件而阻塞。等第 1001 个工作项发出信号才能解除阻塞。如果设置最大 1000 个线程，第 1001 个工作项就不会执行，全部 1000 个线程会一直阻塞，用户将被迫中止应用程序，并丢失所有未保存的工作。</p><p>事实上，开发人员很少人为限制自己的应用程序使用的资源。例如，你会启动自己的应用程序，并告诉系统你想限制应用程序能使用的内存量，或限制能使用的网络宽带吗？但出于某种心态，开发人员感觉好像有必要限制线程池拥有的线程数量。</p><p>由于存在饥饿和死锁问题，所以 CLR 团队一直都在稳步地增加线程池默认拥有的最大线程数。目前默认值是大约 1000 个线程。这基本上可以看成是不限数量，因为一个 32 位进程最大有 2 GB 的可用地址空间。加载了一组 Win32 和 CLR DLLs，并分配了本地堆和托管堆之后，剩余约 1.5 GB的地址空间。由于每个线程都要为其用户模式栈和线程环境块(TEB)准备超过 1 MB 的内存，所以在一个 32 位进程中，最多能够有大约 1360 个线程。试图创建更多的线程会抛出 <code>OutOfMemoryException</code>。当然，64 位进程提供了 8 TB 的地址空间，所以理论上可以创建千百万个线程。但分配这么多线程纯属浪费，尤其是当理想线程数等于机器的 CPU 数(内核数)的时候。CLR 团队应该做的事情是彻底取消限制，但他们现在还不能这样做，否则预期存在线程池限制的一些应用程序会出错。</p><p><code>System.Threading.ThreadPool</code> 类提供了几个静态方法，可调用它们设置和查询线程池的线程数：<code>GetMaxThreads</code>，<code>SetMaxThreads</code>，<code>GetMinThreads</code>，<code>SetMinThreads</code> 和 <code>GetAvailableThreads</code>。强烈建议不要调用上述任何方法。限制线程池的线程数，一般都只会造成应用程序的性能变得更差，而不是更好。如果认为自己的应用程序需要几百或几千个线程，表明你的应用程序的架构和使用线程的方式已出现严重问题。本章和第 28 章会演示使用线程的正确方式。</p><h3 id="_27-9-2-如何管理工作者线程" tabindex="-1"><a class="header-anchor" href="#_27-9-2-如何管理工作者线程"><span>27.9.2 如何管理工作者线程</span></a></h3><p>图 27-1 展示了构成作为线程池一部分的工作者线程的各种数据结构。<code>ThreadPool.QueueUserWorkItem</code> 方法和 <code>Timer</code> 类总是将工作项放到全局队列中。工作者线程采用一个先入先出(first-in-first-out，FIFO)算法将工作项从这个队列中取出，并处理它们。由于多个工作者线程可能同时从全局队列中拿走工作项，所以所有工作者线程都竞争一个线程同步锁，以保证两个或多个线程不会获取同一个工作项。这个线程同步锁在某些应用程序中可能成为瓶颈，对伸缩性和性能造成某种程度的限制。</p><p><img src="`+o+'" alt="27_1"></p><p>图 27-1 CLR 的线程池</p><blockquote><p><strong>重要提示</strong> 线程池从来不保证排队中的工作项的处理顺序。这是合理的，尤其是考虑到多个线程可能同时处理工作项。但上述副作用使这个问题变得恶化了。你必须保证自己的应用程序对于工作项或 <code>Task</code> 的执行顺序不作任何预设。</p></blockquote><p>现在说一说使用默认 <code>TaskScheduler</code><sup>①</sup>(查询 <code>TaskScheduler</code> 的静态 <code>Default</code> 属性获得)来调度的 <code>Task</code> 对象。非工作者线程调度一个 <code>Task</code> 时，该 <code>Task</code> 被添加到全局队列。但每个工作者线程都有自己的本地队列。工作者线程调度一个 <code>Task</code> 时，该<code>Task</code> 被添加到调用线程的本地队列。</p><blockquote><p>① 其他 <code>TaskScheduler</code> 派生对象的行为可能和我在这里描述的不同。</p></blockquote><p>工作者线程准备好处理工作项时，它总是先检查本地队列来查找一个 <code>Task</code>。存在一个 <code>Task</code>，工作者线程就从本地队列移除 <code>Task</code> 并处理工作项。要注意的是，工作者线程采用后入先出(LIFO)算法将任务从本地队列取出。由于工作者线程是唯一允许访问它自己的本地队列头的线程，所以无需同步锁，而且在队列中添加和删除 <code>Task</code> 的速度非常快。这个行为的副作用是 <code>Task</code> 按照和进入队列时相反的顺序执行。</p><p>如果工作者线程发现它的本地队列变空了，会尝试从另一个工作者线程的本地队列“偷”一个 <code>Task</code>。 这个 <code>Task</code> 是从本地队列的尾部“偷”走的，并要求获取一个线程同步锁，这对性能有少许影响。当然，希望这种“偷盗”行为很少发生，从而很少需要获取锁。如果所有本地队列都变空，那么工作者线程会使用 FIFO 算法，从全局队列提取一个工作项(取得它的锁)。如果全局队列也为空，工作者线程会进入睡眠状态，等待事情的发生。如果睡眠了太长时间，它会自己醒来，并销毁自身，允许系统回收线程使用的资源(内核对象、栈、TEB 等)。</p><p>线程池会快速创建工作者线程，使工作者线程的数量等于传给 <code>ThreadPool</code> 的 <code>SetMinThreads</code> 方法的值。如果从不调用这个方法(也建议你永远不调用这个方法)，那么默认值等于你的进程允许使用的 CPU 数量，这是由进程的 affinity mask(关联掩码)决定的。通常，你的进程允许使用机器上的所有 CPU，所以线程池创建的工作者线程数量很快就会达到机器的 CPU 数。创建了这么多(CPU 数量)的线程后，线程池会监视工作项的完成速度。如果工作项完成的时间太长(具体多长没有正式公布)，线程池会创建更多的工作者线程。如果工作项的完成速度开始变快，工作者线程会被销毁。</p>',35);function g(k,h){const d=a("ExternalLinkIcon");return s(),t("div",null,[u,e("p",null,[n("当然，如果有特殊的任务调度需求，完全可以定义自己的 "),v,n(" 派生类。Microsoft 在 Parallel Extensions Extras 包中提供了大量和任务有关的示例代码，其中包括多个任务调度器源码，下载地址是 "),e("a",m,[n("http://code.msdn.microsoft.com/ParExtSamples"),i(d)]),n("。下面是这个包提供的一部分任务调度器。")]),b,e("ul",null,[e("li",null,[e("p",null,[e("em",null,[e("a",p,[n("http://blogs.msdn.com/pfxteam/archive/2009/05/28/9648672.aspx"),i(d)])])])]),e("li",null,[e("p",null,[e("em",null,[e("a",C,[n("http://blogs.msdn.com/pfxteam/archive/2009/06/13/9741072.aspx"),i(d)])])])])]),T])}const I=l(r,[["render",g],["__file","ch27_ComputeBoundAsync.html.vue"]]),y=JSON.parse('{"path":"/zh/chapters/ch27_ComputeBoundAsync.html","title":"第 27 章 计算限制的异步操作","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"27.1 CLR 线程池基础","slug":"_27-1-clr-线程池基础","link":"#_27-1-clr-线程池基础","children":[]},{"level":2,"title":"27.2 执行简单的计算限制操作","slug":"_27-2-执行简单的计算限制操作","link":"#_27-2-执行简单的计算限制操作","children":[]},{"level":2,"title":"27.3 执行上下文","slug":"_27-3-执行上下文","link":"#_27-3-执行上下文","children":[]},{"level":2,"title":"27.4 协作式取消和超时","slug":"_27-4-协作式取消和超时","link":"#_27-4-协作式取消和超时","children":[]},{"level":2,"title":"27.5 任务","slug":"_27-5-任务","link":"#_27-5-任务","children":[{"level":3,"title":"27.5.1 等待任务完成并获取结果","slug":"_27-5-1-等待任务完成并获取结果","link":"#_27-5-1-等待任务完成并获取结果","children":[]},{"level":3,"title":"27.5.2 取消任务","slug":"_27-5-2-取消任务","link":"#_27-5-2-取消任务","children":[]},{"level":3,"title":"27.5.3 任务完成时自动启动新任务","slug":"_27-5-3-任务完成时自动启动新任务","link":"#_27-5-3-任务完成时自动启动新任务","children":[]},{"level":3,"title":"27.5.4 任务可以启动子任务","slug":"_27-5-4-任务可以启动子任务","link":"#_27-5-4-任务可以启动子任务","children":[]},{"level":3,"title":"27.5.5 任务内部揭秘","slug":"_27-5-5-任务内部揭秘","link":"#_27-5-5-任务内部揭秘","children":[]},{"level":3,"title":"27.5.6 任务工厂","slug":"_27-5-6-任务工厂","link":"#_27-5-6-任务工厂","children":[]},{"level":3,"title":"27.5.7 任务调度器","slug":"_27-5-7-任务调度器","link":"#_27-5-7-任务调度器","children":[]}]},{"level":2,"title":"27.6 Parallel 的静态 For，ForEach 和 Invoke方法","slug":"_27-6-parallel-的静态-for-foreach-和-invoke方法","link":"#_27-6-parallel-的静态-for-foreach-和-invoke方法","children":[]},{"level":2,"title":"27.7 并行语言集成查询(PLINQ)","slug":"_27-7-并行语言集成查询-plinq","link":"#_27-7-并行语言集成查询-plinq","children":[]},{"level":2,"title":"27.8 执行定时的计算限制操作","slug":"_27-8-执行定时的计算限制操作","link":"#_27-8-执行定时的计算限制操作","children":[]},{"level":2,"title":"27.9 线程池如何管理线程","slug":"_27-9-线程池如何管理线程","link":"#_27-9-线程池如何管理线程","children":[{"level":3,"title":"27.9.1 设置线程池限制","slug":"_27-9-1-设置线程池限制","link":"#_27-9-1-设置线程池限制","children":[]},{"level":3,"title":"27.9.2 如何管理工作者线程","slug":"_27-9-2-如何管理工作者线程","link":"#_27-9-2-如何管理工作者线程","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/ch27_ComputeBoundAsync.md"}');export{I as comp,y as data};
