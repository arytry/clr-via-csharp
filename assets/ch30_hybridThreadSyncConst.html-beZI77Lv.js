import{_ as c}from"./30_1-CYbjjn8s.js";import{_ as s,r as a,o as r,c as o,a as e,d as i,b as l,e as n}from"./app-IxoMmWNN.js";const t={},v=n('<h1 id="第-30-章-混合线程同步构造" tabindex="-1"><a class="header-anchor" href="#第-30-章-混合线程同步构造"><span>第 30 章 混合线程同步构造</span></a></h1><p>本章内容</p><ul><li><a href="#30_1">一个简单的混合锁</a></li><li><a href="#30_2">自旋、线程所有权和递归</a></li><li><a href="#30_3">FCL 中的混合结构</a></li><li><a href="#30_4">著名的双检锁技术</a></li><li><a href="#30_5">条件变量模式</a></li><li><a href="#30_6">异步的同步构造</a></li><li><a href="#30_7">并发集合类</a></li></ul><p>第 29 章“基元线程同步构造”讨论了基元用户模式和内核模式线程同步构造。其他所有线程同步构造都基于它们而构建，而且一般都合并了用户模式和内核模式构造，我们称为<strong>混合线程同步构造</strong>。没有线程竞争时，混合构造提供了基元用户模式构造所具有的性能优势。多个线程竞争一个构造时，混合构造通过基元内核模式的构造来提供不“自旋”的优势(避免浪费 CPU 时间)。由于大多数应用程序的线程都很少同时竞争一个构造，所以性能上的增强可以使你的应用程序表现得更出色。</p>',4),u={href:"http://wintellect.com/Resource-Power-Collections-Library",target:"_blank",rel:"noopener noreferrer"},m=n(`<p>本章末尾展示了如何使用 FCL 的并发集合类来取代混合构造，从而最小化资源使用并提升性能。最后讨论了异步的同步构造，允许以同步方式访问资源，同时不造成任何线程的阻塞，从而减少了资源消耗，并提高了伸缩性。</p><h2 id="_30-1-一个简单的混合锁" tabindex="-1"><a class="header-anchor" href="#_30-1-一个简单的混合锁"><span><a name="30_1">30.1 一个简单的混合锁</a></span></a></h2><p>言归正传，下面是一个混合线程同步锁的例子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class SimpleHybridLock : IDisposable {
    // Int32 由基元用户模式构造 (Interlocked 的方法)使用
    private Int32 m_waiters = 0;

    // AutoResetEvent 是基元内核模式构造
    private readonly AutoResetEvent m_waiterLock = new AutoResetEvent(false);

    public void Enter() {
        // 指出这个线程想要获得锁
        if (Interlocked.Increment(ref m_waiters) == 1)
            return; // 锁可自由使用，无竞争，直接返回
                    
        // 另一个线程拥有锁(发生竞争)，使这个线程等待
        m_waiterLock.WaitOne(); // 这里产生较大的性能影响
        // WaitOne 返回后，这个线程拿到锁了
    }

    public void Leave() {
        // 这个线程准备释放锁
        if (Interlocked.Decrement(ref m_waiters) == 0)
            return; // 没有其他线程正在等待，直接返回

        // 有其他线程正在阻塞，唤醒其中一个
        m_waiterLock.Set(); // 这里产生较大的性能影响
    }

    public void Dispose() { m_waiterLock.Dispose(); }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>SimpleHybridLock</code> 包含两个字段：一个 <code>Int32</code>，由基元用户模式的构造来操作；以及一个 <code>AutoResetEvent</code>，它是一个基元内核模式的构造。为了获得出色的性能，锁要尽量操作 <code>Int32</code>，尽量少操作 <code>AutoResetEvent</code>。每次构造 <code>SimpleHybridLock</code> 对象就会创建 <code>AutoResetEvent</code>；和 <code>Int32</code> 字段相比，它对性能的影响大得多。本章以后会展示混合构造 <code>AutoResetEventSlim</code>；多个线程同时访问锁时，只有在第一次检测到竞争时才会创建 <code>AutoResetEvent</code>，这样就避免了性能损失。<code>Dispose</code> 方法关闭 <code>AutoResetEvent</code>，这也会对性能造成大的影响。</p><p><code>SimpleHybridLock</code> 对象在构造和 dispose 时的性能能提升当然很好，但我们应该将更多精力放在它的 <code>Enter</code> 和 <code>Leave</code> 方法的性能上，因为在对象生存期内，这两个方法要被大量地调用。下面让我们重点关注这些方法。</p><p>调用 <code>Enter</code> 的第一个线程造成 <code>Interlocked.Increment</code> 在 <code>m_waiters</code> 字段上加 <code>1</code>，使它的值变成 <code>1</code>。这个线程发现以前有零个线程正在等待这个锁，所以线程从它的 <code>Enter</code> 调用中返回。值得欣赏的是，线程获得锁的速度非常快。现在，如果另一个线程介入并调用<code>Enter</code>，这个线程将 <code>m_waiters</code> 递增到 <code>2</code>，发现锁在另一个线程那里。所以，这个线程会使用 <code>AutoResetEvent</code> 对象来调用 <code>WaitOne</code>，从而阻塞自身。调用 <code>WaitOne</code> 造成线程的代码转变成内核模式的代码，这会对性能产生巨大影响。但线程反正都要停止运行，所以让线程花点时间来完全停止，似乎也不是太坏。好消息是，线程现在会阻塞，不会因为在 CPU 上“自旋”而浪费 CPU 时间。(29.3.3 节“实现简单的自旋锁”引入的 <code>SimpleSpinLock</code> 的 <code>Enter</code> 方法就会这样“自旋”。)</p><p>再来看看 <code>Leave</code> 方法。一个线程调用 <code>Leave</code> 时，会调用 <code>Interlocked.Decrement</code> 从 <code>m_waiters</code> 字段减 1。 如果 <code>m_waiters</code> 现在是 <code>0</code>，表明没有其他线程在调用 <code>Enter</code> 时发生阻塞，调用 <code>Leave</code> 的线程可以直接返回。同样地，想象以下这有多快：离开一个锁意味着线程从一个 <code>Int32</code> 中减 1，执行快速的 <code>if</code> 测试，然后返回！另一方面，如果调用 <code>Leave</code> 的线程发现 <code>m_waiters</code> 不为 0，线程就知道现在存在一个竞争，另外至少有一个线程在内核中阻塞。这个线程必须唤醒一个(而且只能是一个)阻塞的线程。唤醒线程是通过在 <code>AutoResetEvent</code> 上调用 <code>Set</code> 来实现的。这会造成性能上的损失，因为线程必须转换成内核模式代码，再转换回来。但这个转换只有在发生竞争时才会发生。当然，<code>AutoResetEvent</code> 确保只有一个阻塞的线程被唤醒；在 <code>AutoResetEvent</code> 上阻塞的其他所有线程会继续阻塞，直到新的、解除了阻塞的线程最终调用 <code>Leave</code>。</p><blockquote><p>注意 在实际应用中，任何线程可以在任何时间调用 <code>Leave</code>， 因为 <code>Enter</code> 方法没有记录哪一个线程成功获得了锁。很容易添加字段和代码来维护这种信息，但会增大锁对象自身需要的内存，并损害 <code>Enter</code> 和 <code>Leave</code> 方法的性能，因为它们现在必须操作这个字段。我情愿有一个性能高超的锁，并确保我的代码以正确方式使用它。你会注意到，事件和信号量都没有维护这种信息，只有互斥体才有维护。</p></blockquote><h2 id="_30-2-自旋、线程所有权和递归" tabindex="-1"><a class="header-anchor" href="#_30-2-自旋、线程所有权和递归"><span><a name="30_2">30.2 自旋、线程所有权和递归</a></span></a></h2><p>由于转换为内核模式会造成巨大的性能损失，而且线程占有锁的时间通常都很短，所以为了提升应用程序的总体性能，可以让一个线程在用户模式中“自旋”一小段时间，再让线程转换为内核模式。如果线程正在等待的锁在线程“自旋”期间变得可用，就能避免向内核模式的转换了。</p><p>此外，有的锁限制只能由获得锁的线程释放锁。有的锁允许当前拥有它的线程递归地拥有锁(多次拥有)，<code>Mutex</code> 锁就是这样一个例子。<sup>①</sup>可通过一些别致的逻辑构建支持自旋、线程所有权和递归的一个混合锁，如下所示：</p><blockquote><p>① 线程在 <code>Mutex</code> 对象上等待时不会“自旋”，因为 <code>Mutex</code> 的代码在内核中。这意味着线程必须转换成内核模式才能检查 <code>Mutex</code> 的状态。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AnotherHybridLock : IDisposable {
    // Int32 由基元用户模式构造 (Interlocked 的方法)使用
    private Int32 m_waiters = 0;

    // AutoResetEvent 是基元内核模式构造
    private AutoResetEvent m_waiterLock = new AutoResetEvent(false);

    // 这个字段控制自旋，希望能提升性能
    private Int32 m_spincount = 4000; // 随便选择的一个计数

    // 这些字段指出哪个线程拥有锁，以及拥有了它多少次
    private Int32 m_owningThreadId = 0, m_recursion = 0;

    public void Enter() {
        // 如果调用线程已经拥有锁，递增递归计数并返回
        Int32 threadId = Thread.CurrentThread.ManagedThreadId;
        if (threadId == m_owningThreadId) { m_recursion++; return; }

        // 调用线程不拥有锁，尝试获取它
        SpinWait spinwait = new SpinWait();
        for (Int32 spinCount = 0; spinCount &lt; m_spincount; spinCount++) {
            // 如果锁可以自由使用了，这个线程就获得它；设置一些状态并返回
            if (Interlocked.CompareExchange(ref m_waiters, 1, 0) == 0) goto GotLock;

            // 黑科技：给其他线程运行的机会，希望锁会被释放
            spinwait.SpinOnce();
        }

        // 自旋结束，锁仍未获得，再试一次
        if (Interlocked.Increment(ref m_waiters) &gt; 1) {
            // 仍然是竞态条件，这个线程必须阻塞
            m_waiterLock.WaitOne(); // 等待锁：性能有损失
            // 等这个线程醒来时，它拥有锁；设置一些状态并返回
        }

    GotLock:
        // 一个线程获得锁时，我们记录它的 ID，并
        // 指出线程拥有锁一次
        m_owningThreadId = threadId; m_recursion = 1;
    }

    public void Leave() {
        // 如果调用线程不拥有锁，表明存在 bug
        Int32 threadId = Thread.CurrentThread.ManagedThreadId;
        if (threadId != m_owningThreadId)
            throw new SynchronizationLockException(&quot;Lock not owned by calling thread&quot;);
        
        // 递减递归技术。如果这个线程仍然拥有锁，那么直接返回
        if (--m_recursion &gt; 0) return;

        m_owningThreadId = 0; // 现在没有线程拥有锁
                              
        // 如果没有其他线程在等待，直接返回
        if (Interlocked.Decrement(ref m_waiters) == 0)
            return;

        // 有其他线程正在等待，唤醒其中 1 个
        m_waiterLock.Set(); // 这里有较大的性能损失
    }
    
    public void Dispose() { m_waiterLock.Dispose(); }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看出，为锁添加了额外的行为之后，会增大它拥有的字段数量，进而增大内存消耗。代码还变得更复杂了，而且这些代码必须执行，造成锁的性能的下降。29.4.1 节“Event构造”比较了各种情况下对一个 <code>Int32</code> 进行递增的性能，这些情况分别是：无任何锁，使用基元用户模式构造，以及使用内核模式构造。这里重复了哪些性能测试的结果，并添加了使用 <code>SimpleHybridlock</code> 和 <code>AnotherHybridLock</code> 的结果。结果从快到慢依次是：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Incrementing x: 8                           最快
Incrementing x in M: 69                     慢约 9 倍
Incrementing x in SpinLock: 164             慢约 21 倍
Incrementing x in SimpleHybridlock: 164     慢约 21 倍(类似于 SpinLock)
Incrementing x in AnotherHybridLock: 230    慢约 29 倍(因为所有权/递归)
Incrementing x in SimpleWaitLock: 8854      慢约 1107 倍
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，<code>AnotherHybridLock</code> 的性能不如 <code>SimpleHybridlock</code>。这是因为需要额外的逻辑和错误检查来管理线程所有权和递归行为。如你所见，在锁中添加的每一个行为都会影响它的性能。</p><h2 id="_30-3-fcl-中的混合结构" tabindex="-1"><a class="header-anchor" href="#_30-3-fcl-中的混合结构"><span><a name="30_3">30.3 FCL 中的混合结构</a></span></a></h2><p>FCL 自带了许多混合构造，它们通过一些别致的逻辑将你的线程保持在用户模式，从而增应用程序的性能。有的混合构造直到首次有线程在一个构造上发生竞争时，才会创建内核模式的构造。如果线程一直不在构造说上发生竞争，应用程序就可避免因为创建对象而产生的性能损失，同时避免为对象分配内存。许多构造还支持使用一个 <code>Cancellation Token</code>(参见第 27 章“计算限制的异步操作”)，使一个线程强迫解除可能正在构造上等待的其他线程的阻塞。本节将向你介绍这些混合构造。</p><h3 id="_30-3-1-manualreseteventslim类和-semaphoreslim类" tabindex="-1"><a class="header-anchor" href="#_30-3-1-manualreseteventslim类和-semaphoreslim类"><span>30.3.1 <code>ManualResetEventSlim</code>类和 <code>SemaphoreSlim</code>类</span></a></h3><p>先来看看 <code>System.Threading.ManualResetEventSlim</code> 和 <code>System.Threading.SemaphoreSlim</code> 这两个类。<sup>①</sup>这两个构造的工作方式和对应的内核模式构造完全一致，只是它们都在用户模式中“自旋”，而且都推迟到发生第一次竞争时，才创建内核模式的构造。它们的 <code>Wait</code> 方法允许传递一个超时值和一个 <code>CancellationToken</code>。下面展示了这些类(未列出部分方法的重载版本)：</p><blockquote><p>① 虽然没有一个 <code>AutoResetEventSlim</code> 类，但许多时候都可以构造一个 <code>SemaphoreSlim</code> 对象，并将 <code>maxCount</code> 设为 1.</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class ManualResetEventSlim : IDisposable {
    public ManualResetEventSlim(Boolean initialState, Int32 spinCount);
    public void Dispose();
    public void Reset();
    public void Set();
    public Boolean Wait(Int32 millisecondsTimeout, CancellationToken cancellationToken);

    public Boolean IsSet { get; }
    public Int32 SpinCount { get; }
    public WaitHandle WaitHandle { get; }
}

public class SemaphoreSlim : IDisposable {
    public SemaphoreSlim(Int32 initialCount, Int32 maxCount);
    public void Dispose();
    public Int32 Release(Int32 releaseCount);
    public Boolean Wait(Int32 millisecondsTimeout, CancellationToken cancellationToken);

    // 该特殊的方法用于 async 和 await(参见第 28 章)
    public Task&lt;Boolean&gt; WaitAsync(Int32 millisecondsTimeout, CancellationToken cancellationToken);
    public Int32 CurrentCount { get; }
    public WaitHandle AvailableWaitHandle { get; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_30-3-2-monitor类和同步块" tabindex="-1"><a class="header-anchor" href="#_30-3-2-monitor类和同步块"><span>30.3.2 <code>Monitor</code>类和同步块</span></a></h3><p>或许最常用的混合型线程同步构造就是 <code>Monitor</code> 类，它提供了支持自旋、线程所有权和递归和互斥锁。之所以最常用，是因为它资格最老，C# 有内建的关键字支持它，JIT 编译器对它知之甚详，而且 CLR 自己也在代表你的应用程序使用它。但正如稍后就要讲到的那样，这个构造存在许多问题，用它很容易造成代码中出现 bug。我先解释这个构造，然后指出问题以及解决问题的方法。</p><p>堆中的每个对象都可关联一个名为 <strong>同步块</strong> 的数据结构。同步块包含字段，这些字段和本章前面展示的 <code>AnotherHybridLock</code> 类的字段相似。具体地说，它对内核对象、拥有线程(owning thread)的 ID、递归计数(recursion count)以及等待线程(waiting thread)计数提供了相应的字段。<code>Monitor</code> 是静态类，它的方法接收对任何堆对象的引用。这些方法对指定对象的同步块中的字段进行操作。以下是 <code>Monitor</code> 类最常用的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static class Monitor {
    public static void Enter(Object obj);
    public static void Exit(Object obj);

    // 还可指定尝试进入锁时的超时值(不常用):
    public static Boolean TryEnter(Object obj, Int32 millisecondsTimeout);

    // 稍后会讨论 lockTaken 实参
    public static void Enter(Object obj, ref Boolean lockTaken);
    public static void TryEnter(Object obj, Int32 millisecondsTimeout, ref Boolean lockTaken);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>显然，为堆中每个对象都关联一个同步块数据结构显得很浪费，尤其是考虑到大多数对象的同步块都从不使用。为节省内存，CLR 团队采用一种更经济的方式提供刚才描述的功能。它的工作原理是：CLR 初始化时在堆中分配一个同步块数组。本书第 4 章说过，每当一个对象在堆中创建的时候，都有两个额外的开销字段与它关联。第一个“类型对象指针”，包含类型的“类型对象”的内存地址。第二个是“同步块索引”，包含同步块数组中的一个整数索引。</p><p>一个对象在构造时，它的同步块索引初始化为 -1，表明不引用任何同步块。然后，调用 <code>Monitor.Enter</code> 时，CLR 在数组中找到一个空白同步块，并设置对象的同步块索引，让它引用该同步块。换言之，同步块和对象是动态关联的。调用 <code>Exit</code> 时，会检查是否有其他任何线程正在等待使用对象的同步块。如果没有线程在等待它，同步块就自由了，<code>Exit</code> 将对象的同步块索引设回 <code>-1</code>，自由的同步块将来可以和另一个对象关联。</p><p>图 30-1 展示了堆中的对象、它们的同步块索引以及 CLR 的同步块数组元素之间的关系。Object-A，Object-B 和 Object-C 都将它们的类型对象指针成员设为引用 Type-T(一个类型对象)。这意味着三个对象全都具有相同的类型。如第 4 章所述，类型对象本身也是堆中的一个对象。和其他所有对象一样，类型对象有两个开销成员：同步块索引和类型对象指针。这意味着同步块可以和类型对象关联，而且可以将一个类型对象引用传给 <code>Monitor</code> 的方法。顺便说一句，如有必要，同步块数组能创建更多的同步块。所以，同时同步大量对象时，不必担心系统会用光同步块。</p><p><img src="`+c+`" alt="30_1"></p><p>图 30-1 堆中的对象(包括类型对象)可使其中同步块索引引用 CLR 同步块数组中的记录项</p><p>以下代码演示了 <code>Monitor</code> 类原本的使用方式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Transaction {
    private DateTime m_timeOfLastTrans;

    public void PerformTransaction() {
        Monitor.Enter(this);
        // 以下代码拥有对数据的独占访问权...
        m_timeOfLastTrans = DateTime.Now;
        Monitor.Exit(this);
    }

    public DateTime LastTransaction {
        get {
            Monitor.Enter(this);
            // 以下代码拥有对数据的独占访问权...
            DateTime temp = m_timeOfLastTrans;
            Monitor.Exit(this);
            return temp;
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>表面看很简单，但实际存在问题。现在的问题是，每个对象的同步块索引都隐式为公共的。以下代码演示了这可能造成的影响。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void SomeMethod() {
    var t = new Transaction();
    Monitor.Enter(t); // 这个线程获取对象的公共锁

    // 让一个线程池线程显示 LastTransaction 时间
    // 注意：线程线程会阻塞，直到 SomeMethod 调用了 Monitor.Exit！
    ThreadPool.QueueUserWorkItem(o =&gt; Console.WriteLine(t.LastTransaction));

    // 这里执行其他一些代码...
    Monitor.Exit(t);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，执行 <code>SomeMethod</code> 的线程调用 <code>Monitor.Enter</code>，获取由 <code>Transaction</code> 对象公开的锁。线程池线程查询 <code>LastTransaction</code> 属性时，这个属性也调用 <code>Monitor.Enter</code> 来获取同一个锁，造成线程池线程阻塞，直到执行 <code>SomeMethod</code> 的线程调用<code>Monitor.Exit</code>。有调试器可发现线程池线程在 <code>LastTransaction</code> 属性内部阻塞。但很难判断是另外哪个线程拥有锁。即使真的弄清楚了是哪个线程拥有锁，还必须弄清楚是什么代码造成它取得锁，这就更难了。更糟的是，即使历经千辛万苦，终于搞清楚了是什么带按摩造成线程取得锁，最后却发现那些代码不在你的控制范围之内，或者无法修改它们来修正问题。因此，我的建议是始终坚持使用私有锁。下面展示了如何修正 <code>Transaction</code> 类：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Transaction {
    private readonly Object m_lock = new Object(); // 现在每个 Transaction 对象都有私有锁
    private DateTime m_timeOfLastTrans;

    public void PerformTransaction() {
        Monitor.Enter(m_lock);  // 进入私有锁
        // 以下代码拥有对数据的独占访问权...
        m_timeOfLastTrans = DateTime.Now;
        Monitor.Exit(m_lock);  // 退出私有锁
    }

    public DateTime LastTransaction {
        get {
            Monitor.Enter(m_lock);  // 进入私有锁
            // 以下代码拥有对数据的独占访问权...
            DateTime temp = m_timeOfLastTrans;
            Monitor.Exit(m_lock);   // 退出私有锁
            return temp;
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果 <code>Transaction</code> 的成员是静态的，只需将 <code>m_lock</code> 字段也变成静态字段，即可确保静态成员的线程安全性。</p><p>通过以上讨论，一个很明显的结论是：<code>Monitor</code> 根本就不该实现成静态类；它应该像其他所有同步构造那样实现。也就是说，应该是一个可以实例化并在上面调用实例方法的类。事实上，正因为 <code>Monitor</code> 被设计成一个静态类，所以它还存在其他许多问题。下面对这些额外的问题进行了总结。</p><ul><li><p>变量能引用一个代理对象————前提是变量引用的那个对象的类型派生自 <code>System</code>，<code>MarshalByRefObject</code> 类(参见第 22 章“CLR寄宿和 AppDomain”)。调用 <code>Monitor</code> 的方法时，传递对代理对象的引用，锁定的是代理对象而不是代理引用的实际对象。</p></li><li><p>如果线程调用 <code>Monitor.Enter</code>，向它传递对类型对象的引用，而且这个类型对象是以 “AppDomain 中立”的方式加载的<sup>①</sup>，线程就会跨越进程中的所有 AppDomain 在那个类型上获取锁。这是 CLR 一个已知的 bug，它破坏了 AppDomain 本应提供的隔离能力。这个 bug 很难在保证高性能的前提下修复，所以它一直没有修复。我的建议是，永远都不要向 <code>Monitor</code> 的方法传递类型对象引用。</p></li></ul><blockquote><p>① 参考 22.2 节“AppDomain”。————译注</p></blockquote><ul><li>由于字符串可以留用(参见 14.2.2 节“字符串是不可变的”)，所以两个完全独立的代码段可能在不知情的情况下获取对内存中的一个 <code>String</code> 对象的引用。如果将这个 <code>String</code> 对象引用传给 <code>Monitor</code> 的方法，两个独立的代码段现在就会在不知情的情况下以同步方式执行<sup>②</sup>。</li></ul><blockquote><p>② 强调一下，同步执行意味着不能同时访问一个资源，只有在你用完了之后，我才能接着用。在多线程编程中，“同步”(Synchronizing)的定义是：当两个或更多的线程需要存取共同的资源时，必须确定在同一时间点只有一个线程能存取共同的资源，而实现这个目标的过程就称为“同步”。————译注</p></blockquote><ul><li><p>跨越 AppDomain 边界传递字符串时，CLR 不创建字符串的副本；相反，它只是将对字符串的一个引用传给其他 AppDomain。这增强了性能，理论上也是可行的，因为 <code>String</code> 对象本来就不可变(不可修改)。但和其他所有对象一样，<code>String</code> 对象关联了一个同步索引块，这个索引是可变的(可修改)，使不同 AppDomain 中的线程在不知情的情况下开始同步。这是 CLR 的 AppDomain 隔离存在的另一个 bug。我的建议是永远不要将 <code>String</code> 引用传给 <code>Monitor</code> 的方法。</p></li><li><p>由于 <code>Monitor</code> 的方法要获取一个 <code>Object</code>，所以传递值类型会导致值类型被装箱，造成线程在已装箱对象上个获取锁。每次调用 <code>Monitor.Enter</code> 都会在一个完全不同的对象上获取锁，造成完全无法实现线程同步。</p></li><li><p>向方法应用 <code>[MethodImpl(MethodImplOptions.Synchronized)]</code>特性，会造成 JIT 编译器用 <code>Monitor.Entrer</code> 和 <code>Monitor.Exit</code> 调用包围方法的本机代码。如果方法是实例方法，会将 <code>this</code> 传给 <code>Monitor</code> 的这些方法，锁定隐式公共的锁。如果方法时静态的，对类型的类型对象的引用会传给这些方法，造成锁定“AppDomain 中立”的类型。我的建议是永远不要使用这个特性。</p></li><li><p>调用类型的类型构造器时(参见 8.3 节“类型构造器”)，CLR 要获取类型对象上的一个锁，确保只有一个线程初始化类型对象及其静态字段。同样地，这个类型可能以 “AppDomain 中立”的方式加载，所以会出问题。例如，假定类型构造器的代码进入死循环，进程中的所有 AppDomain 都无法使用该类型。我的建议是尽量避免使用类型构造器，或者至少保持它们的短小和简单。</p></li></ul><p>遗憾的是，除了前面说的这些，还可能出现更糟糕的情况。由于开发人员习惯在一个方法中获取一个锁，做一些工作，然后释放锁，所以 C# 语言通过 <code>lock</code> 关键字来提供了一个简化的语法。假定你要写下面这样的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private void SomeMethod() {
    lock (this) {
        // 这里的代码拥有对数据的独占访问权...
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>它等价于像下面这样写方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private void SomeMethod() {
    Boolean lockTaken = false;
    try {
       // 这里可能发生异常(比如 ThreadAbortException)...
       Monitor.Enter(this, ref lockTaken);
       // 这里的代码拥有对数据的独占访问权... 
    }
    finally {
        if (lockTaken) Monitor.Exit(this);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一个问题是，C# 团队认为他们在 <code>finally</code> 块中调用 <code>Monitor.Exit</code> 是绑了你一个大忙。他们的想法是，这样一来，就可确保锁总是得以释放，无论 <code>try</code> 块中发生了什么。但这只是他们一厢情愿的想法。在 <code>try</code> 块中，如果在更改状态时发生异常，这个状态就会处于损坏状态。锁在 <code>finally</code> 块中退出时，另一个线程可能开始操作损坏的状态。显然，更好的解决方法时让应用程序挂起，而不是让它带着损坏的状态继续运行。这样不仅结果难以预料，还有可能引发安全隐患。第二个问题是，进入和离开 <code>try</code> 块会影响方法的性能。有的 JIT 编译器不会内联含有 <code>try</code> 块的方法，造成性能进一步下降。所以最终结果是，不仅代码的速度变慢了，还会造成线程访问损坏的状态。<sup>①</sup>我的建议是杜绝使用 C# 的 <code>lock</code> 语句。</p><blockquote><p>① 顺便说一句，虽然仍然会对性能造成影响，但假如 <code>try</code> 块的代码只是对状态执行读取操作，而不是试图修改它，那么在 <code>finally</code> 块中释放锁是安全的。</p></blockquote><p>现在终于可以开始讨论 <code>Boolean lockTaken</code> 变量了。下面是整个变量试图解决的问题。假定一个线程进入 <code>try</code> 块，但在调用 <code>Monitor.Enter</code> 之前退出(参见第 22 章)。现在，<code>finally</code> 块会得到调用，但它的代码不应退出锁。<code>lockTaken</code> 变量就是为了解决这个问题而设计的。它初始化为<code>false</code>，假定现在还没有进入锁(还没有获得锁)。然后，如果调用 <code>Monitor.Enter</code>，而且成功获得锁，<code>Enter</code>方法就会将 <code>lockTaken</code> 设为 <code>true</code>。<code>finally</code> 块通过检查 <code>lockTaken</code> ，便知道到底要不要调用 <code>Monitor.Exit</code>。顺便说一句，<code>SpinLock</code> 结构也支持这个 <code>lockTaken</code>模式。</p><h3 id="_30-3-3-readerwriterlockslim-类" tabindex="-1"><a class="header-anchor" href="#_30-3-3-readerwriterlockslim-类"><span>30.3.3 <code>ReaderWriterLockSlim</code> 类</span></a></h3><p>我们经常都希望让一个线程简单地读取一些数据的内容。如果这些数据被一个互斥锁(比如 <code>SimpleSpinLock</code>，<code>SimpleWaitLock</code>，<code>SimpleHybridLock</code>，<code>AnotherHybridLock</code>，<code>Mutex</code> 或者 <code>Monitor</code>)保护，那么当多个线程同时试图访问这些数据时，只有一个线程才会运行，其他所有线程都会阻塞。这会造成应用程序伸缩性和吞吐能力的急剧下降。如果所有线程都希望以只读方式访问数据，就根本没有必要阻塞它们；应该允许它们并发地访问数据。另一方面，如果一个线程希望修改数据，这个线程就需要对数据的独占式访问。<code>ReaderWriterLockSlim</code> 构造封装了解决这个问题的逻辑。具体地说，这个构造像下面这样控制线程。</p><ul><li><p>一个线程向数据写入时，请求访问的其他所有线程都被阻塞。</p></li><li><p>一个线程从数据读取时，请求读取的其他线程允许继续执行，但请求写入的线程仍被阻塞。</p></li><li><p>向线程写入的线程结束后，要么解除一个写入线程(<code>writer</code>)的阻塞，使它能向数据写入。如果没有线程被阻塞，锁就进入可以自由使用的状态，可供下一个 <code>reader</code> 或 <code>writer</code> 线程获取。</p></li></ul><p>下面展示了这个类(未列出部分方法的重载版本)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class ReaderWriterLockSlim : IDisposable{
    public ReaderWriterLockSlim(LockRecursionPolicy recursionPolicy);
    public void Dispose();

    public void     EnterReadLock();
    public Boolean  TryEnterReadLock(Int32 millisecondsTimeout);
    public void     ExitReadLock();

    public void     EnterWriteLock();
    public Boolean  TryEnterWriteLock(Int32 millisecondsTimeout);
    public void     ExitWriteLock();

    // 大多数应用程序从不查询一下任何属性
    public Boolean IsReadLockHeld               { get; }
    public Boolean IsWriteLockHeld              { get; }
    public Int32 CurrentReadCount               { get; }
    public Int32 RecursiveReadCount             { get; }
    public Int32 RecursiveWriteCount            { get; }
    public Int32 WaitingReadCount               { get; }
    public Int32 WaitingWriteCount              { get; }
    public LockRecursionPolicy RecursionPolicy  { get; }
    // 未列出和 reader 升级到 writer 有关的成员
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下代码演示了这个构造的用法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Transaction : IDisposable {
    private readonly ReaderWriterLockSlim m_lock =
        new ReaderWriterLockSlim(LockRecursionPolicy.NoRecursion);
    private DateTime m_timeOfLastTrans;

    public void PerformTransaction() {
        m_lock.EnterWriteLock();
        // 以下代码拥有对数据的独占访问权...
        m_timeOfLastTrans = DateTime.Now;
        m_lock.ExitWriteLock();
    }

    public DateTime LastTransaction {
        get {
            m_lock.EnterReadLock();
            // 以下代码拥有对数据的共享访问权...
            DateTime temp = m_timeOfLastTrans;
            m_lock.ExitReadLock();
            return temp;
        }
    }
    public void Dispose() { m_lock.Dispose(); }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个构造有几个概念要特别留意。首先，<code>ReaderWriterLockSlim</code> 的构造器允许传递一个 <code>LockRecurionsPolicy</code> 标志，它的定义如下：</p><p><code>public enum LockRecursionPolicy { NoRecursion, SupportsRecursion }</code></p><p>如果传递 <code>SupportsRecursion</code> 标志，锁就支持线程所有权和递归行为。如同本章早些时候讨论的那样，这些行为对锁的性能有负面影响。所以，建议总是向构造器传递 <code>LockRecursionPolicy.NoRecursion</code>(就像本例)。reader-writer 锁支持线程所有权和递归的代价非常高昂，因为锁必须跟踪蹭允许进入锁的所有 reader 线程，同时为每个线程都单独维护递归计数。事实上，为了以线程安全的方式维护所有这些信息，<code>ReaderWriterLockSlim</code> 内部要使用一个互斥的“自旋锁”，我不是在开玩笑！</p><p><code>ReaderWriterLockSlim</code> 类提供了一些额外的方法(前面没有列出)允许一个 reader 线程升级为 writer 线程。以后，线程可以把自己降级回 reader 线程。设计者的思路是，一个线程刚开始的时候可能是读取数据。然后，根据数据的内容，线程可能想对数据进行修改。为此，线程要把它自己从 reader 升级为 writer。锁如果支持这个行为，性能会大打折扣。而且我完全不觉得这是一个有用的功能。线程并不是直接从 reader 变成 writer 的。当时可能还有其他线程正在读取，这些线程必须完全退出锁。在此之后，尝试升级的线程才允许成为 writer。这相当于先让 reader 线程退出锁，再立即获取这个锁以进行写入。</p><blockquote><p>注意 FCL 还提供了一个 <code>ReaderWriterLock</code> 构造，它是在 Microsoft .NET Framework 1.0 中引入的。这个构造存在许多问题，所以Microsoft 在 .NET Framework 3.5 中引入了 <code>ReaderWriterLockSlim</code> 构造。团队没有对原先的 <code>ReaderWriterLock</code> 构造进行改进，因为它们害怕失去和那些正在使用它的应用程序的兼容性。下面列举了 <code>ReaderWriterLock</code> 存在的几个问题。首先，即使不存在线程竞争，它的速度也非常慢。其次，线程所有权和递归行为是这个构造强加的，完全取消不了，这使锁变得更慢。最后，相比 writer 线程，它更青睐于 reader 线程，所以 writer 线程可能排起好长的队，却很少有机会获得服务，最终造成 “拒绝服务”(DoS)问题。</p></blockquote><h3 id="_30-3-4-onemanylock-类" tabindex="-1"><a class="header-anchor" href="#_30-3-4-onemanylock-类"><span>30.3.4 <code>OneManyLock</code> 类</span></a></h3><p>我自己创建了一个 reader-writer 构造，它的速度比 FCL 的 <code>ReaderWriterLockSlim</code> 类快。<sup>①</sup>该类名为 <code>OneManyLock</code>，因为它要么允许一个 writer 线程访问，要么允许多个 reader 线程访问。下面展示了这个类：</p><blockquote><p>① 参见本书源代码文件 Ch30-1-HybridThreadSync.cs。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class OneManyLock : IDisposable{
    public OneManyLock();
    public void Dispose();

    public void Enter(Boolean exclusive);
    public void Leave();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在，让我讲解一下这个类是如何工作的。在内部，类定义了一个 <code>Int64</code> 字段来存储锁的状态、一个供 reader 线程阻塞的 <code>Semaphore</code> 对象以及一个供 writer 线程阻塞的 <code>AutoResetEvent</code> 对象。<code>Int64</code> 状态字段分解成以下 4 个子字段。</p><ul><li><p>4 位代表锁本身的状态。<code>0=Free, 1=OwnedByWriter, 2=OwnedByReaders, 3=OwnedByReadersAndWriterPending, 4=ReservedForWriter</code>。 其他值未使用。</p></li><li><p>20 位(0~1048575 的一个数)代表锁当前允许进入的、正在读取的 reader 线程的数量(RR)。</p></li><li><p>20 位代表锁当前正在等待进入锁的 reader 线程的数量(RW)。这些线程在自动重置事件对象(<code>AutoResetEvent</code>)上阻塞。</p></li><li><p>20 位代表正在等待进入锁的 writer 线程的数量(WW)。这些线程在其他信号量对象(<code>Semaphore</code>)上阻塞。</p></li></ul><p>由于与锁有关的全部信息都在单个 <code>Int64</code> 字段中，所以可以使用 <code>Interlocked</code> 类的方法来操纵这个字段，这就使锁的速度非常快，而且线程只有在竞争的时候才会阻塞。</p><p>下面说明了线程进入一个锁进行共享访问时发生的事情。</p><ul><li><p>如果锁的状态是 <code>Free</code>：将状态设为 <code>OwnedByReaders,RR=1</code>，返回。</p></li><li><p>如果锁的状态是 <code>OwnedByReaders: RR++</code>，返回。</p></li><li><p>否则：<code>RW++</code> ，阻塞 reader 线程。线程醒来时，循环并重试。</p></li></ul><p>下面说明了进行共享访问的一个线程离开锁时发生的事情。</p><ul><li><p><code>RR--</code>。</p></li><li><p>如果 <code>RR &gt; 0:</code> 返回。</p></li><li><p>如果 <code>WW &gt; 0:</code> 将状态设为 <code>ReservedForWriter, WW--</code>，释放 1 个阻塞的 writer 线程，返回。</p></li><li><p>如果 <code>RW == 0 &amp;&amp; WW == 0:</code> 将状态设为 Free，返回。</p></li></ul><p>下面说明了一个线程进入锁进行独占访问时发生的事情。</p><ul><li><p>如果锁的状态为 <code>Free:</code> 将状态设为 <code>OwnedByWriter</code>，返回。</p></li><li><p>如果锁的状态为 <code>ReservedForWriter:</code> 将状态设为 <code>OwnedByWriter</code>，返回。</p></li><li><p>如果锁的状态为 <code>OwnedByWriter: WW++</code>，阻塞 writer 线程。线程醒来时，循环并重试。</p></li><li><p>否则：将状态设为 <code>OwnedByReadersAndWriterPending, WW++</code>，阻塞 writer 线程。线程醒来时，循环并重试。</p></li></ul><p>下面说明了进行独占访问的一个线程离开锁时发生的事情。</p><ul><li><p>如果 <code>WW==0 &amp;&amp; RW == 0:</code>将状态设为 Free，返回。</p></li><li><p>如果 <code>WW&gt;0:</code> 将状态设为 <code>ReservedForWriter, WW--</code>，释放 1 个阻塞的 writer 线程，返回。</p></li><li><p>如果 <code>WW==0 &amp;&amp; RW&gt;0:</code> 将状态设为 <code>Free, RW=0</code>，唤醒所有阻塞的 reader 线程，返回。</p></li></ul><p>假定当前有一个线程(reader)正在锁中进行读取操作，另一个线程(writer)想进入锁进行(独占的)写入操作。writer 线程首先检查锁是否为 Free，由于不为 Free，所以线程会继续执行下一项检查。然而，在这个时候，reader 线程可能离开了锁，而且在离开时发现 <code>RR</code> 和 <code>WW</code>都是 0。所以，线程会将锁的状态设为 Free。这便造成了一个问题，因为 writer 线程已经执行过这个测试，并且走开了。简单地说，这里发生的事情是，reader 线程背着 writer 线程改变了 writer 线程访问的状态。我需要解决这个问题，使锁能够正确工作。</p><p>为了解决这个问题，所有这些位操作都要使用 29.3.4 节“Interlocked Anything 模式”描述的技术来执行。这个模式允许将任何操作转换成线程安全的原子操作。正式因为这个原因，才使得这个锁的速度是如此之快，而且其中维护的状态比其他 reader-writer 锁少。比较 <code>OneManyLock</code> 类与 FCL 的 <code>ReaderWriterLockSlim</code> 和 <code>ReaderWriterLock</code> 类的性能，我得到以下结果：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Incrementing x in OneManyLock: 330           最快
Incrementing x in ReaderWriterLockSlim: 554  约慢 1.7 倍
Incrementing x in ReaderWriterLock: 984      约慢 3倍
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然，由于所有 reader-writer 锁都执行比互斥锁更多的逻辑，所以它们的性能可能要稍差一些。但在比较时不要忘记这样一个事实：reader-writer 锁允许多个 reader 线程同时进入锁。</p><p>结束本节的讨论之前，我想指出的是，我的 Power Threading 库提供了这个锁的一个稍微不同的版本，称为 <code>OneManryResourceLock</code>。这个锁和库中的其他锁提供了许多附件的功能，比如死锁检测，开启锁的所有权与递归行为(虽然要付出一定性能代价)，全部锁的统一编码模型，以及观测锁的运行时行为。可供观测的行为包括：一个线程等待获取一个锁的最长时间和一个锁占有的最短和最长时间。</p><h3 id="_30-3-5-countdownevent-类" tabindex="-1"><a class="header-anchor" href="#_30-3-5-countdownevent-类"><span>30.3.5 <code>CountdownEvent</code> 类</span></a></h3><p>下一个结构是 <code>System.Threading.CountdownEvent</code>。这个构造使用了一个 <code>ManualResetEventSlim</code> 对象。这个构造阻塞一个线程，直到它的内部计数器变成 0。从某种角度说，这个构造的行为和 <code>Semaphore</code> 的行为相反。(<code>Semaphore</code> 是在计数为 0 时阻塞线程。)下面展示了这个类(未列出部分方法的重载版本)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class CountdownEvent : IDisposable {
    public CountdownEvent(Int32 initialCount);
    public void Dispose(); 
    public void Reset(Int32 count);                 // 将 CurrentCount 设为 count
    public void AddCount(Int32 signalCount);        // 使 CurrentCount 递增 signalCount
    public Boolean TryAddCount(Int32 signalCount);  // 使 CurrentCount 递增 signalCount
    public Boolean Signal(Int32 signalCount);       // 使 CurrentCount 递减 signameCount
    public Boolean Wait(Int32 millisecondsTimeout, CancellationToken cancellationToken);
    public Int32 CurrentCount { get; }
    public Boolean IsSet { get; }                   // 如果 CurrentCount 为 0，就返回 true
    public WaitHandle WaitHandle { get; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>一旦一个 <code>CountdownEvent</code> 的 <code>CurrentCount</code> 变成 <code>0</code>，它就不能更改了。<code>CurrentCount</code> 为 <code>0</code> 时，<code>AddCount</code> 方法会抛出一个<code>InvalidOperationException</code>。如果 <code>CurrentCount</code> 为 <code>0</code>，<code>TryAddCount</code> 直接返回 <code>false</code>。</p><h3 id="_30-3-6-barrier-类" tabindex="-1"><a class="header-anchor" href="#_30-3-6-barrier-类"><span>30.3.6 <code>Barrier</code> 类</span></a></h3><p><code>System.Threading.Barrier</code> 构造用于解决一个非常稀有的问题，平时一般用不上。<code>Barrier</code> 控制的一系列线程需要并行工作，从而在一个算法的不同阶段推进。或许通过一个例子更容易立即：当 CLR 使用它的垃圾回收器(GC)的服务器版本时，GC算法为每个内核都创建一个线程。这些线程在不同应用程序线程的栈汇总向上移动，并发标记堆中的对象。每个线程完成了它自己的那一部分工作之后，必须停下来等待其他线程完成。所有线程都标记好对象后，线程就可以并发地压缩(compact)堆的不同部分。每个线程都完成了对它的那一部分的堆的压缩之后，所有线程都要在应用程序的线程的栈中上行，对根进行修正，使之引用因为压缩而发生了移动的对象的新位置。只有在所有线程都完成这个工作之后，垃圾回收器的工作才算正真完成，应用程序的线程现在可以恢复执行了。</p><p>使用 <code>Barrier</code> 类可轻松应付像这样的情形。下面展示了这个类(未列出部分方法的重载版本)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class Barrier : IDisposable {
    public Barrier(Int32 participantCount, Action&lt;Barrier&gt; postPhaseAction);
    public void Dispose();
    public Int64 AddParticipants(Int32 participantCount);   // 添加参与者
    public void RemoveParticipants(Int32 participantCount); // 减去参与者
    public Boolean SignalAndWait(Int32 millisecondsTimeout, 
        CancellationToken cancellationToken);
    
    public Int64 CurrentPhaseNumber { get; }    // 指出进行到哪一个阶段(从 0 开始)
    public Int32 ParticipantCount { get; }      // 参与者数量
    public Int32 ParticipantsRemaining { get; } // 需要调用 SignalAndWait 的线程数
    SignalAndWait
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>构造 <code>Barrier</code> 时要告诉它有多少个线程准备参与工作，还可传递一个 <code>Action&lt;Barrier&gt;</code> 委托来引用所有参与者完成一个阶段的工作后要调用的代码。可以调用 <code>AddParticipant</code> 和 <code>RemoveParticipant</code> 方法在 <code>Barrier</code> 中动态添加和删除参与线程。但在实际应用中，人们很少这样做。每个线程完成它的阶段性工作后，应代用 <code>SignalAndWait</code>，告诉 <code>Barrier</code> 线程已经完成一个阶段的工作，而 <code>Barrier</code> 会阻塞线程(使用一个 <code>ManualResetEventSlim</code>)。所有参与者都调用了 <code>SignalAndWait</code> 后，<code>Barrier</code> 将调用指定的委托(由最后一个调用 <code>SignalAndWait</code> 的线程调用)，然后解除正在等待的素有线程的阻塞，使它们开始下一阶段。</p><h3 id="_30-3-7-线程同步构造小结" tabindex="-1"><a class="header-anchor" href="#_30-3-7-线程同步构造小结"><span>30.3.7 线程同步构造小结</span></a></h3><p>我的建议是，代码尽量不要阻塞任何线程。执行异步计算或 I/O 操作时，将数据从一个线程交给另一个线程时，应避免多个线程同时访问数据。如果不能完全做到这一点，请尽量使用 <code>Volatile</code> 和 <code>Interlocked</code> 的方法，因为它们的速度很快，而且绝不阻塞线程。遗憾的是，这些方法只能操作简单类型。但可以像 29.3.4 节“Interlocked Anything 模式” 描述的那样在这些类型上执行丰富的操作。</p><p>主要在以下两种情况下阻塞线程。</p><ul><li><p><strong>线程模型很简单</strong><br> 阻塞线程虽会牺牲一些资源和性能，但可顺序地写应用程序代码，无需使用回调方法。不过，C# 的异步方法功能现在提供了不阻塞线程的简化编程模型。</p></li><li><p><strong>线程有专门用途</strong><br> 有的线程时特定任务专用的。最好的例子就是应用程序的主线程。如果应用程序的主线程没有阻塞，它最终就会返回，造成整个进程终止。其他例子还有应用程序的 GUI 线程。Windows 要求一个窗口或控件总是由创建它的线程操作。因次，我们有时写代码阻塞一个 GUI 线程，直到其他某个操作完成。然后，GUI 线程根据需要对窗口和控件进行更新。当然，阻塞 GUI 线程会造成应用程序挂起，使用户体验变差。</p></li></ul><p>要避免阻塞线程，就不要刻意地为线程打上标签。例如，不要创建一个拼写检查线程、一个语法检查线程、一个处理特定客户端请求的线程等。为线程打上标签，其实是在告诫自己该线程不能做其他任何事情。但由于线程是如此昂贵，所以不能把它们专门用于某个目的。相反，应通过线程池将线程出租短暂时间。所以正确方式是一个线程池线程开始拼写检查，再改为语法检查，再代表一个客户端请求执行工作，以此类推。</p><p>如果一定要阻塞线程，为了同步在不同 AppDomain 或进程中运行的线程，请使用内核对象构造。要在一系列操作中原子性地操纵状态，请使用带有私有字段的 <code>Monitor</code> 类。<sup>①</sup>另外，可以使用 reader-writer 锁代替 <code>Monitor</code>。reader-writer 锁通常比 <code>Monitor</code>慢，但它们允许多个线程并发执行，这提升了总体性能，并将阻塞线程的机率将至最低。</p><blockquote><p>① 可用 SpinLock 代替 Monitor，因为 SpinLock 稍快一些。但 SpinLock 比较危险，因为它可能浪费 CPU 时间。而且在我看来，它还没有快到非用不可的地步。</p></blockquote><p>此外，避免使用递归锁(尤其是递归的 reader-writer 锁)，因为它们会损害性能。但 <code>Monitor</code> 是递归的，性能也不错。<sup>②</sup>另外，不要在 <code>finally</code> 块中释放锁，因为进入和离开异常处理块会招致性能损失。如果在更改状态时抛出异常，状态就会损坏，操作这个状态的其他线程会出现不可预料的行为，并可能引入安全隐患。</p><blockquote><p>② 部分是由于 Monitor 用本机代码(而非托管代码)来实现。</p></blockquote><p>当然，如果写代码来占有锁，注意时间不要太长，否则会增大线程阻塞的机率。后面的 30.6 节 “异步的同步构造”会展示如何利用集合类防止长时间占有锁。</p><p>最后，对于计算限制的工作，可以使用任务(参见第 27.5 节“任务”)避免使用大量线程同步构造。我喜欢的一个设计是，每个任务都关联一个或多个延续任务。某个操作完成后，这些任务将通过某个线程池线程继续执行。这比让一个线程阻塞并等待某个操作完成好得多。对于 I/O 限制的工作，调用各种 <code>XxxAsync</code> 方法将造成你的代码在 I/O 操作完成后继续；这其实类似于任务的延续任务。</p><h2 id="_30-4-著名的双检锁技术" tabindex="-1"><a class="header-anchor" href="#_30-4-著名的双检锁技术"><span><a name="30_4">30.4 著名的双检锁技术</a></span></a></h2><p>双检锁(Double-Check Locking)是一个非常著名的技术，开发人员用它将单实例(singleton)对象的构造推迟到应用程序首次请求该对象时进行。这有时也称为<strong>延迟初始化</strong>(lazy Initialization)。如果应用程序永远不请求对象，对象就永远不会构造，从而节省了时间和内存。但当多个线程同时请求单实例对象时就可能出问题。这个时候必须使用一些线程同步机制确保单实例对象只被构造一次。</p>`,106),b={href:"http://www.cs.umd.edu/~pugh/java/memoryModel/DoubleCheckedLocking,html",target:"_blank",rel:"noopener noreferrer"},p=n(`<p>无论如何，一个好消息是，CLR 很好地支持双检锁技术，这应该归功于 CLR 的内存模型以及 <code>volatile</code> 字段访问(参见第 29 章)。以下代码演示了如何用 C# 实现双检锁技术<sup>③</sup>：</p><blockquote><p>③ 两个 if 语句即是两次检查。 ———— 译注</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Singleton {
    // s_lock 对象是实现线程安全所需要的。定义这个对象时，我们假设创建单实例对象的
    // 代价高于创建一个 System.Object 对象，并假设可能根本不需要创建单实例对象、
    // 否则，更经济、更简单的做法是在一个类构造器中创建单实例对象、
    private static readonly Object s_lock = new Object();

    // 这个字段引用一个单实例对象
    private static Singleton s_value = null;

    // 私有构造器阻止这个类外部的任何代码创建实例
    private Singleton() {
        // 把初始化单实例对象的代码放在这里...
    }

    // 以下公共静态方法返回单实例对象(如果必要就创建它)
    public static Singleton GetSingleton() {
        // 如果单实例对象已经创建，直接返回它(这样速度很快)
        if (s_value != null) return s_value;

        Monitor.Enter(s_lock); // 还没有创建，让一个线程创建它
        if (s_value == null) {
            // 仍未创建，创建它
            Singleton temp = new Singleton();

            // 将引用保存到 s_value 中(参见正文的详细讨论)
            Volatile.Write(ref s_value, temp);
        }
        Monitor.Exit(s_lock);

        // 返回对单实例对象的引用
        return s_value;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>双检锁技术背后的思路在于，对 <code>GetSingleton</code> 方法的一个调用可以快速地检查 <code>s_value</code> 字段，判断对象是否创建。如果是，方法就返回对它的引用。这里的妙处在于，如果对象已经构造好，就不需要线程同步；应用程序会运行得非常快。另一方面，如果调用 <code>GetSingleton</code> 方法的第一个线程发现对象还没有创建，就会获取一个线程同步锁来确保只有一个线程构造单实例对象。这意味着只有线程第一次查询单实例对象时，才会出现性能上的损失。</p><p>现在，让我解释一下为什么这个模式在 Java 中出了问题。Java 虚拟机(JVM)在 <code>GetSingleton</code> 方法开始的时候将 <code>s_value</code> 的值读入 CPU 寄存器。然后，对第二个 <code>if</code> 语句求值时，它直接查询寄存器，造成第二个 <code>if</code> 语句总是求值为 <code>true</code>，结果就是多个线程都会创建<code>Singleton</code> 对象。当然，只有多个线程恰好同时调用 <code>GetSingleton</code> 才会发生这种情况。在大多数应用程序中，发生这种情况的概率都是极低的。这正是该问题在 Java 中长时间都没有被发现的原因。</p><p>在 CLR 中，对任何锁方法的调用都构成了一个完整的内存栅栏，在栅栏之前写入的任何变量必须在栅栏之前完成；在栅栏之后的任何变量读取都必须在栅栏之后开始。对于 <code>GetSingleton</code> 方法，这意味着 <code>s_value</code> 字段的值必须在调用了 <code>Monitor.Enter</code> 之后重新读取；调用前缓存到寄存器中的东西作不了数。</p><p><code>GetSingleton</code> 内部有一个 <code>Volatile.Write</code> 调用。下面让我解释一下它解决的是什么问题。假定第二个 <code>if</code> 语句中包含的是下面这行代码：</p><p><code>s_value = new Singleton(); // 你极有可能这样写</code></p><p>你的想法是让编译器生成代码为一个 <code>Singleton</code> 分配内存，调用构造器来初始化字段，再将引用赋给 <code>s_value</code> 字段。使一个值对其他线程可见称为<strong>发布</strong>(publishing)。但那只是你一厢情愿的想法，编译器可能这样做：为 <code>Singleton</code> 分配内存，将引用发布到(赋给)<code>s_value</code>，再代用构造器。从单线程的角度出发，像这样改变顺序是无关紧要的。但在将引用发布给 <code>s_value</code> 之后，并在调用构造器之前，如果另一个线程调用了 <code>GetSingleton</code> 方法，那么会发生什么？这个线程会发现 <code>s_value</code> 不为 <code>null</code>，所以会开始使用 <code>Singleton</code> 对象，但对象的构造器还没有结束执行呢！这是一个很难追踪的 bug，尤其是它完全是由于计时而造成的。</p><p>对 <code>Volatile.Write</code> 的调用修正了这个问题。它保证 <code>temp</code> 中的引用只有在构造器结束执行之后，才发布到 <code>s_value</code>中。解决这个问题的另一个办法是使用 C# 的 <code>volatile</code> 关键字来标记 <code>s_value</code> 字段。这使向 <code>s_value</code> 的写入变得具有“易变性”。同样，构造器必须在写入发生前结束运行。但遗憾的是，这同时会使所有读取操作具有“易变性”<sup>①</sup>，这是完全没必要的。因此，使用 <code>volatile</code> 关键字，会使性能无谓地受到损害。</p><blockquote><p>① 所以对字段的读取也要同步了。 ————译注</p></blockquote><p>本节开头指出双检锁技术无关有趣。在我看来，是开发人员把它捧得太高，在许多不该使用它的时候也在用它。大多数时候，这个技术实际会损害效率。下面是 <code>Singleton</code> 类的一个简单得多的版本，它的行为和上一个版本相同。这个版本没有使用“著名”的双检锁技术：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Singleton {
    private static Singleton s_value = new Singleton();

    // 私有构造器防止这个类外部的任何代码创建一个实例
    private Singleton() {
        // 将初始化单实例对象的代码放在这里...
    }
    // 以下公共静态方法返回单实例对象 (如有必要就创建它)
    public static Singleton GetSingleton() { return s_value; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于代码首次访问类的成员时，CLR 会自动调用类型的类构造器，所以首次有一个线程查询 <code>Singleton</code> 的 <code>GetSingleton</code> 方法时，CLR 就会自动调用类构造器，从而创建一个对象实例。此外，CLR 已保证了对类构造器的调用是线程安全的。我已在 8.3 节“类型构造器”对此进行了解释。这种方式对的缺点在于，首次访问类的任何成员都会调用类型构造器。所以，如果 <code>Singleton</code> 类型定义了其他静态成员，就会在访问其他任何静态成员时创建 <code>Singleton</code> 对象。有人通过定义嵌套类来解决这个问题。</p><p>下面展示了生成 <code>Singleton</code> 对象的第三种方式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class Singleton {
    private static Singleton s_value = null;

    // 私有构造器防止这个类外部的任何代码创建实例
    private Singleton() {
        // 将初始化单实例对象的代码放在这里...
    }

    // 以下公共静态方法返回单实例对象 (如有必要就创建它)
    public static Singleton GetSingleton() {
        if (s_value != null) return s_value;

        // 创建一个新的单实例对象，并把它固定下来(如果另一个线程还没有固定它的话)
        Singleton temp = new Singleton();
        Interlocked.CompareExchange(ref s_value, temp, null);

        // 如果这线程竞争失败，新建的第二个单实例对象会被垃圾回收
        return s_value; // 返回对单实例对象的引用
    } 
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果多个线程同时调用 <code>GetSingleton</code>，这个版本可能创建两个(或更多)<code>Singleton</code> 对象。然而，对 <code>Interlocked.CompareExchange</code> 的调用确保只有一个引用才会发布到 <code>s_value</code> 字段中。没有通过这个字段固定下来的任何对象<sup>①</sup>会在以后被垃圾回收。由在大多数应用程序都很少发生多个线程同时调用 <code>GetSingleton</code> 的情况，所以不太可能同时创建多个 <code>Singleton</code> 对象。</p><blockquote><p>① 称为不可达对象。 ———— 译注</p></blockquote><p>虽然可能创建多个 <code>Singleton</code> 对象，但上述代码由多方面的优势。首先，它的速度非常快。其次，它永不阻塞线程。相反，如果一个线程池线程在一个 <code>Monitor</code> 或者其他任何内核模式的线程同步构造上阻塞，线程池就会创建另一个线程来保持 CPU 的“饱和”。因此，会分配并初始化更多的内存，而且所有 DLL 都会收到一个线程连接通知。使用 <code>CompareExchange</code> 则永远不会发生这种情况。当然，只有在构造器没有副作用的时候才能使用这个技术。</p><p>FCL 有两个类型封装了本书描述的模式。下面是泛型 <code>Syste.Lazy</code> 类(有的方法没有列出)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class Lazy&lt;T&gt; {
    public Lazy(Func&lt;T&gt; valueFactory, LazyThreadSafetyMode mode);
    public Boolean IsValueCreated { get; }
    public T Value { get; }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下代码演示了它是如何工作的：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    // 创建一个“延迟初始化”包装器，它将 DateTime 的获取包装起来
    Lazy&lt;String&gt; s = new Lazy&lt;String&gt;(() =&gt; 
        DateTime.Now.ToLongTimeString(), true);

    Console.WriteLine(s.IsValueCreated);    // 还没有查询 Value，所以返回 false
    Console.WriteLine(s.Value);             // 现在调用委托
    Console.WriteLine(s.IsValueCreated);    // 已经查询了 Value，所以返回 true
    Thread.Sleep(10000);                    // 等待 10 秒，再次显示时间
    Console.WriteLine(s.Value);             // 委托没有调用；显示相同结果
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在我的机器上运行，得到以下结果：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>False
2:40:42 PM
True
2:40:42 PM  ←   注意，10秒之后，时间未发生改变 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码构造 <code>Lazy</code> 类的实例，并向它传递某个 <code>LazyThreadSafetyMode</code> 标志。下面总结了这些标志：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public enum LazyThreadSafetyMode {
    None,                       // 完全没有用线程安全支持 (适合 GUI 应用程序)
    ExecutionAndPublication,    // 使用双检锁技术
    PublicationOnly             // 使用 Interlocked.CompareExchange 技术
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>内存有限可能不想创建 <code>Lazy</code> 类的实例。这时可调用 <code>System.Threading.LazyInitializer</code> 类的静态方法。下面展示了这个类：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static class LazyInitializer {
    // 这两个方法在内部使用了 Interlocked.CompareExchange:
    public static T EnsureInitialized&lt;T&gt;(ref T target) where T : class;
    public static T EnsureInitialized&lt;T&gt;(ref T target, Func&lt;T&gt; valueFactory) where T : class;

    // 这两个方法在内部将同步锁(syncLock)传给 Monitor 的 Enter 和 Exit方法
    public static T EnsureInitialized&lt;T&gt;(ref T target, ref Boolean initialized,
        ref Object syncLock);
    public static T EnsureInitialized&lt;T&gt;(ref T target, ref Boolean initialized,
        ref Object syncLock, Func&lt;T&gt; valueFactory);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外，为 <code>EnsureInitialized</code> 方法的 <code>syncLock</code> 参数显式指定同步对象，可以用同一个锁保护多个初始化函数和字段。下面展示了如何使用这个类的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    String name = null;
    // 由于 name 是 null，所以委托执行并初始化 name
    LazyInitializer.EnsureInitialized(ref name, () =&gt; &quot;Jeffrey&quot;);
    Console.WriteLine(name); // 显示 &quot;Jeffrey&quot;
                                
    // 由于 name 已经不为 null, 所以委托不运行：name 不改变
    LazyInitializer.EnsureInitialized(ref name, () =&gt; &quot;Richter&quot;);
    Console.WriteLine(name); // 还是显示 &quot;Jeffrey&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_30-5-条件变量模式" tabindex="-1"><a class="header-anchor" href="#_30-5-条件变量模式"><span><a name="30_5">30.5 条件变量模式</a></span></a></h2><p>假定一个线程希望在一个复合条件为 <code>true</code> 时执行一段代码。一个选项是让线程连续“自旋”，反复测试条件。但这会浪费 CPU 时间，也不可能对构成复合条件的多个变量进行原子性的测试。幸好，有一个模式允许线程根据一个复合条件来同步它们的操作，而且不会浪费资源。这个模式称为条件变量(condition variable)模式，我们通过 <code>Monitor</code> 类中定义的以下方法来使用该模式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static class Monitor {
    public static Boolean Wait(Object obj);
    public static Boolean Wait(Object obj, Int32 millisecondsTimeout);

    public static void Pulse(Object obj);
    public static void PulseAll(Object obj);
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面展示了这个模式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class ConditionVariablePattern {
    private readonly Object m_lock = new Object();
    private Boolean m_condition = false;

    public void Thread1() {
        Monitor.Enter(m_lock);      // 获取一个互斥锁
                               
        // 在锁中，“原子性”地测试复合条件
        while (!m_condition) {
            // 条件不满足，就等待另一个线程更改条件
            Monitor.Wait(m_lock);   // 临时释放锁，使其他线程能获取它
        }

        // 条件满足，处理数据...

        Monitor.Exit(m_lock);       // 永久释放锁
    }

    public void Thread2() {
        Monitor.Enter(m_lock);      // 获取一个互斥锁
                               
        // 处理数据并修改条件...
        m_condition = true;

        // Monitor.Pulse(m_lock);   // 锁释放之后唤醒一个正在等待的线程
        Monitor.PulseAll(m_lock);   // 锁释放之后唤醒所有正在等待的线程

        Monitor.Exit(m_lock);       // 释放锁
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，执行 <code>Thread1</code> 方法的线程进入一个互斥锁，然后对一个条件进行测试。在这里，我只是检查一个 <code>Boolean</code> 字段，但它可以是任意复合条件。例如，可以检查是不是三月的一个星期二，同时一个特定的集合对象是否包含 10 个元素。如果条件为 <code>false</code>，你希望线程在条件上 “自旋”。但自旋会浪费 CPU 时间，所以线程不是自旋，而是调用 <code>Wait</code>。<code>Wait</code> 释放锁，使另一个线程能获得它并阻塞调用线程。</p><p><code>Thread2</code> 方法展示了第二个线程执行的代码。它调用 <code>Enter</code> 来获取锁的所有权，处理一些数据，造成一些状态的改变，再调用 <code>Plus</code> 或 <code>PlusAll</code>，从而解除一个线程因为调用 <code>Wait</code> 而进入的阻塞状态。注意，<code>Plus</code> 只解除等待最久的线程(如果有的话)的阻塞，而 <code>PlusAll</code> 解除所有正在等待的线程(如果有的话)的阻塞。但所有未阻塞的线程还没有醒来。执行 <code>Thread2</code> 的线程必须调用 <code>Monitor.Exit</code>，允许锁由另一个线程拥有。另外，如果调用的是 <code>PlusAll</code>，其他线程不会同时解除阻塞。调用 <code>Wait</code> 的线程解除阻塞后，它成为锁的所有者。由于这是一个互斥锁。所以一次只能有一个线程拥有它。其他线程只有在锁的所有者调用了 <code>Wait</code> 或 <code>Exit</code> 之后才能得到它。</p><p>执行 <code>Thread1</code> 的线程醒来时，它进行下一次循环迭代，再次对条件进行测试。如果条件仍为 <code>false</code>，它就再次调用 <code>Wait</code>。如果条件为 <code>true</code>，它就处理数据，并最终调用 <code>Exit</code>。这样就会将锁释放，使其他线程能得到它。这个模式的妙处在于，可以使用简单的同步逻辑(只是一个锁)来测试构成一个复合条件的几个变量，而且多个正在等待的线程可以全部解除阻塞，而不会造成任何逻辑错误。唯一的缺点就是解除线程的阻塞可能浪费一些 CPU 时间。</p><p>下面展示了一个线程安全的队列，它允许多个线程在其中对数据项(item)进行入队和出队操作。注意，除非有了一个可供处理的数据项，否则试图出队一个数据项的线程会一直阻塞。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class SynchronizedQueue&lt;T&gt; {
    private readonly Object m_lock = new Object();
    private readonly Queue&lt;T&gt; m_queue = new Queue&lt;T&gt;();

    public void Enqueue(T item) {       // 入队
        Monitor.Enter(m_lock);

        // 一个数据项入队后，就唤醒任何/所有正在等待的线程
        m_queue.Enqueue(item);
        Monitor.PulseAll(m_lock);
        Monitor.Exit(m_lock);
    }

    public T Dequeue() {                // 出队
        Monitor.Enter(m_lock);
        
        // 队列为空(这是条件)就一直循环
        while (m_queue.Count == 0)
            Monitor.Wait(m_lock);

        // 使一个数据项出队，返回它供处理
        T item = m_queue.Dequeue();
        Monitor.Exit(m_lock);
        return item;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_30-6-异步的同步构造" tabindex="-1"><a class="header-anchor" href="#_30-6-异步的同步构造"><span><a name="30_6">30.6 异步的同步构造</a></span></a></h2><p>任何使用了内核模式基元的线程同步构造，我都不是特别喜欢。因为所有这些基元都会阻塞一个线程的运行。创建线程的代价很大。创建了不用，这于情于理都说不通。下面这个例子能很好地说明这个问题。</p><p>假定客户端向网站发出请求。客户端请求到达时，一个线程池线程开始处理客户端请求。假定这个客户端想以线程安全的方式修改服务器中的数据，所以它请求一个 reader-writer 锁来进行写入(这使线程成为一个 writer 线程)。假定这个锁被长时间占有。在锁被占有期间，另一个客户端请求到达了，所以线程池为这个请求创建新线程。然后，线程阻塞，尝试获取 reader-writer 锁来进行读取(这使线程成为一个 reader 线程)。事实上，随着越来越多的客户端请求到达，线程池会创建越来越多的线程，所有这些线程都傻傻地在锁上面阻塞。服务器把它的所有时间都花在创建线程上面，而目的仅仅是让它们停止运行！这样的服务器完全没有伸缩性可言。</p><p>更糟的是，当 writer 线程释放锁时，所有 reader 线程都同时解除阻塞并开始执行。现在，又变成了大量线程试图在相对数量很少的 CPU 上运行。所以，Windows 开始在线程之间不停地进行上下文切换。由于上下文切换产生了大量开销，所以真正的工作反正没有得到很快的处理。</p><p>观察本章介绍的所有构造，你会发现这些构造向要解决的许多问题其实最好都是用第 27 章讨论的 <code>Task</code> 类来完成。拿 <code>Barrier</code> 类来说：可以生成几个 <code>Task</code> 对象来处理一个阶段。然后，当所有这些任务完成后，可以用另外一个或多个 <code>Task</code> 对象继续。和本章展示的大量构造相比，任务具有下述许多优势。</p><ul><li><p>任务使用的内存比线程少得多，创建和销毁所需的时间也少得多。</p></li><li><p>线程池根据可用 CPU 数量自动伸缩任务规模。</p></li><li><p>每个任务完成一个阶段后，运行任务的线程回到线程池，在哪里能接受新任务。</p></li><li><p>每个任务完成一个阶段后，运行任务的线程回到线程池，在哪里能接受新任务。</p></li><li><p>线程池是站在整个进程的高度观察任务。所以，它能更好地调度这些任务，减少进程中的线程数，并减少上下文切换。</p></li></ul><p>锁很流行，但长时间拥有会带来巨大的伸缩性问题。如果代码能通过异步的同步构造指出它想要一个锁，那么会非常有用。在这种情况下，如果线程得不到锁，可直接返回并执行其他工作，而不必在那里傻傻地阻塞。以后当锁可用时，代码可恢复执行并访问锁所保护的资源。我当年在为客户解决一个重大的伸缩性问题时有了这个思路，并与 2009 年将专利权卖给了 Microsoft，专利号是 7603502.</p><p><code>SemaphoreSlim</code> 类通过 <code>WaitAsync</code> 方法实现了这个思路，下面是该方法的最复杂的重载版本的签名。</p><p><code>public Task&lt;Boolean&gt; WaitAsync(Int32 millisecondsTimeout, CancellationToken cancellationToken);</code></p><p>可用它异步地同步对一个资源的访问(不阻塞任何线程)。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static async Task AccessResourceViaAsyncSynchronization(SemaphoreSlim asyncLock) 
{
    // TODO: 执行你想要的任何代码...

    await asyncLock.WaitAsync(); // 请求获得锁来获得对资源的独占访问
    // 执行到这里，表明没有别的线程正在访问资源
    // TODO: 独占地访问资源...

    // 资源访问完毕就放弃锁，使其他代码能访问资源
    asyncLock.Release();

    // TODO: 执行你想要的任何代码...
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>SemaphoreSlim</code> 的 <code>WaitAsync</code>方法很有用，但它提供的是信号量语义。一般创建最大计数为 1 的<code>SemaphoreSlim</code>，从而对<code>SemaphoreSlim</code>保护的资源进行互斥访问。所以，这和使用 <code>Monitor</code> 时的行为相似，只是 <code>SemaphoreSlim</code> 不支持线程所有权和递归语义(这是好事)。</p><p>但 reader-writer 语义呢？.NET Framework 提供了 <code>ConcurrentExclusiveSchedulerPair</code> 类。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class ConcurrentExclusiveSchedulerPair {
    public ConcurrentExclusiveSchedulerPair();

    public TaskScheduler ExclusiveScheduler { get; }
    public TaskScheduler ConcurrentScheduler { get; } 

    // 未列出其他方法...
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个类的实例带有两个 <code>TaskScheduler</code> 对象，它们在代用任务时负责提供 reader/writer 语义。只要当前没有运行使用 <code>ConcurrentScheduler</code> 调度的任务，使用 <code>ExclusiveScheduler</code> 调度的任何任务将独占式地运行(一次只能运行一个)。另外，只要当前没有运行使用 <code>ExclusiveScheduler</code> 调度的任务，使用 <code>ConcurrentScheduler</code> 调度的任务就可同时运行(一次运行多个)。以下代码演示了该类的使用。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void ConcurrentExclusiveSchedulerDemo() {
    var cesp = new ConcurrentExclusiveSchedulerPair();
    var tfExclusive = new TaskFactory(cesp.ExclusiveScheduler);
    var tfConcurrent = new TaskFactory(cesp.ConcurrentScheduler);

    for (Int32  operation = 0; operation &lt; 5; operation++) {
        var exclusive = operation &lt; 2; // 出于演示的目的，我建立了 2 个独占和 3 个并发

        (exclusive ? tfExclusive : tfConcurrent).StartNew(() =&gt; {
            Console.WriteLine(&quot;{0} access&quot;, exclusive ? &quot;exclusive&quot; : &quot;concurrent&quot;);
            // TODO: 在这里进行独占写入或并发读取操作...
        });
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>遗憾的是，.NET Framework 没有提供具有 reader-writer 语义的异步锁。但我构建了这样的一个类，称为 <code>AsyncOneManyLock</code>。它的用法和 <code>SemaphoreSlim</code> 一样。下面是一个例子。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static async Task AccessResourceViaAsyncSynchronization(AsyncOneManyLock asyncLock) {
    // TODO: 执行你想要的任何代码...

    // 为想要的并发访问传递 OneManyMode.Exclusive 或 OneManyMode.Shared
    await asyncLock.AcquireAsync(OneManyMode.Shared); // 要求共享访问
    // 如果执行到这里，表明没有其他线程在向资源写入；可能有其他线程在读取
    // TODO: 从资源读取...
    
    // 资源访问完毕就放弃锁，使其他代码能访问资源
    asyncLock.Release();

    // TODO: 执行你想要的任何代码...
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面展示了 <code>AsyncOneManyLock</code> 类。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public enum OneManyMode { Exclusive, Shared }

public sealed class AsyncOneManyLock {
    #region 锁的代码
    private SpinLock m_lock = new SpinLock(true); // 自旋锁不要用 readonly
    private void Lock() { Boolean taken = false; m_lock.Enter(ref taken); }
    private void Unlock() { m_lock.Exit(); }
    #endregion

    #region 锁的状态和辅助方法
    private Int32 m_state = 0;
    private Boolean IsFree { get { return m_state == 0; } }
    private Boolean IsOwnedByWriter { get { return m_state == -1; } }
    private Boolean IsOwnedByReaders { get { return m_state &gt; 0; } }
    private Int32 AddReaders(Int32 count) { return m_state += count; }
    private Int32 SubtractReader() { return --m_state; }
    private void MakeWriter() { m_state = -1; }
    private void MakeFree() { m_state = 0; }
    #endregion

    // 目的是在非竞态条件时增强性能和减少内存消耗
    private readonly Task m_noContentionAccessGranter;

    // 每个等待的 writer 都通过它们在这里排队的 TaskCompletionSource 来唤醒
    private readonly Queue&lt;TaskCompletionSource&lt;Object&gt;&gt; m_qWaitingWriters =
        new Queue&lt;TaskCompletionSource&lt;Object&gt;&gt;();

    // 一个 TaskCompletionSource 收到信号，所有等待的 reader 都唤醒
    private TaskCompletionSource&lt;Object&gt; m_waitingReadersSignal =
        new TaskCompletionSource&lt;Object&gt;();
    private Int32 m_numWaitingReaders = 0;

    public AsyncOneManyLock() {
        m_noContentionAccessGranter = Task.FromResult&lt;Object&gt;(null);
    }

    public Task WaitAsync(OneManyMode mode) {
        Task accressGranter = m_noContentionAccessGranter; // 假定无竞争

        Lock();
        switch (mode) {
            case OneManyMode.Exclusive:
                if (IsFree) {
                    MakeWriter(); // 无竞争
                } else {
                    // 有竞争：新的 writer 任务进入队列，并返回它使 writer 等待
                    var tcs = new TaskCompletionSource&lt;Object&gt;();
                    m_qWaitingWriters.Enqueue(tcs);
                    accressGranter = tcs.Task;
                }
                break;

            case OneManyMode.Shared:
                if (IsFree || (IsOwnedByReaders &amp;&amp; m_qWaitingWriters.Count == 0)) {
                    AddReaders(1); // 无竞争
                } else { // 有竞争
                    // 竞争：递增等待的 reader 数量，并返回 reader 任务使 reader 等待
                    m_numWaitingReaders++;
                    accressGranter = m_waitingReadersSignal.Task.ContinueWith(t =&gt; t.Result);
                }
                break;
        }
        Unlock();

        return accressGranter;
    }

    public void Release() {
        TaskCompletionSource&lt;Object&gt; accessGranter = null; // 假定没有代码被释放

        Lock();
        if (IsOwnedByWriter) MakeFree(); // 一个 writer 离开
        else SubtractReader(); // 一个 reader 离开

        if (IsFree) {
            // 如果自由，唤醒 1 个等待的 writer 或所有等待的 readers
            if (m_qWaitingWriters.Count &gt; 0) {
                MakeWriter();
                accessGranter = m_qWaitingWriters.Dequeue();
            } else if (m_numWaitingReaders &gt; 0) {
                AddReaders(m_numWaitingReaders);
                m_numWaitingReaders = 0;
                accessGranter = m_waitingReadersSignal;

                // 为将来需要等待的 readers 创建一个新的 TCS
                m_waitingReadersSignal = new TaskCompletionSource&lt;Object&gt;();
            }
        }
        Unlock();

        // 唤醒锁外面的 writer/reader，减少竞争机率以提高性能
        if (accessGranter != null) accessGranter.SetResult(null);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如同我说过的一样，上述代码永远不会阻塞线程。原因是我在内部没有使用任何内核构造。这里确实使用了一个 <code>SpinLock</code>，它在内部使用了用户模式的构造。但第 29 章讨论自旋锁的时候说过，只有执行时间很短的代码段才可以用自旋锁来保护。查看我的 <code>WaitAsync</code> 方法，会发现我用锁保护的只是一些整数计算和比较，以及构造一个 <code>TaskCompletionSource</code> 并把它添加到对列的动作，这花不了多少时间，所以能保证锁只是短时间被占有。</p><p>类似地，查看我的 <code>Release</code> 方法，会发现做的事情不外乎一些整数计算、一个比较以及将一个 <code>TaskCompletionSource</code> 出队或者构造一个 <code>TaskCompletionSource</code>。这同样花不了多少时间。使用一个 <code>SpinLock</code> 来保护对 <code>Queue</code> 的访问，我感觉非常自在。线程在使用这种锁时永远不会阻塞，使我能构建响应灵敏的、可伸缩的软件。</p><h2 id="_30-7-并发集合类" tabindex="-1"><a class="header-anchor" href="#_30-7-并发集合类"><span><a name="30_7">30.7 并发集合类</a></span></a></h2><p>FCL 自带 4 个线程安全的集合类，全部在 <code>System.Collections.Concurrent</code> 命名空间中定义。它们是 <code>ConcurrentQueue</code>，<code>ConcurrentStack</code>，<code>ConcurrentDictionary</code> 和 <code>ConcurrentBag</code>。以下是它们最常用的一些成员。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 以先入先出(FIFO)的顺序处理数据项
public class ConcurrentQueue&lt;T&gt; : IProducerConsumerCollection&lt;T&gt;,
    IEnumerable&lt;T&gt;, ICollection, IEnumerable {

    public ConcurrentQueue();
    public void Enqueue(T item);
    public Boolean TryDequeue(out T result);
    public Int32 Count { get; }
    public IEnumerator&lt;T&gt; GetEnumerator();
}

// 以后入先出(LIFO)的方式处理数据项
public class ConcurrentStack&lt;T&gt; : IProducerConsumerCollection&lt;T&gt;,
    IEnumerable&lt;T&gt;, ICollection, IEnumerable {

    public ConcurrentStack();
    public void Push(T item);
    public Boolean TryPop(out T result);
    public Int32 Count { get; }
    public IEnumerator&lt;T&gt; GetEnumerator();
}

// 一个无序数据项集合，允许重复
public class ConcurrentBag&lt;T&gt; : IProducerConsumerCollection&lt;T&gt;,
    IEnumerable&lt;T&gt;, ICollection, IEnumerable {

    public ConcurrentBag();
    public void Add(T item);
    public Boolean TryTake(out T result);
    public Int32 Count { get; }
    public IEnumerator&lt;T&gt; GetEnumerator();
}

// 一个无序 key/value 集合
public class ConcurrentDictionary&lt;TKey, TValue&gt; : IDictionary&lt;TKey, TValue&gt;,
    ICollection&lt;KeyValuePair&lt;TKey, TValue&gt;&gt;, IEnumerable&lt;KeyValuePair&lt;TKey, TValue&gt;&gt;,
    IDictionary, ICollection, IEnumerable {

    public ConcurrentDictionary();
    public Boolean TryAdd(TKey key, TValue value);
    public Boolean TryGetValue(TKey key, out TValue value);
    public TValue this[TKey key] { get; set; }
    public Boolean TryUpdate(TKey key, TValue newValue, TValue comparisonValue);
    public Boolean TryRemove(TKey key, out TValue value);
    public TValue AddOrUpdate(TKey key, TValue addValue, 
        Func&lt;TKey, TValue&gt; updateValueFactory);
    public TValue GetOrAdd(TKey key, TValue value);
    public Int32 Count { get; }
    public IEnumerator&lt;KeyValuePair&lt;TKey, TValue&gt;&gt; GetEnumerator();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所有这些集合类都是 “非阻塞” 的。换言之，如果一个线程试图提取一个不存在的元素(数据项)，线程会立即返回；线程不会阻塞在那里，等着一个元素的出现。正是由于这个原因，所以如果获取了一个数据项，像 <code>TryDequeue</code>，<code>TryPop</code>，<code>TryTake</code> 和 <code>TryGetValue</code> 这样的方法全都返回<code>true</code>；否则返回 <code>false</code>。</p><p>一个集合“非阻塞”，并不意味着它就就不需要锁了。<code>ConcurrentDictionary</code> 类在内部使用了 <code>Monitor</code>。 但是，对集合中的项进行操作时，锁只被占有极短的时间。<code>ConcurrentQueue</code> 和 <code>ConcurrentStack</code> 确实不需要锁；它们两个在内部都使用 <code>Interlocked</code> 的方法来操纵集合。一个 <code>ConcurrentBag</code> 对象(一个 bag)由大量迷你集合对象构成，每个线程一个。线程将一个项添加到 bag 中时，就用 <code>Interlocked</code> 的方法将这个项添加到调用线程的迷你集合中。一个线程试图从 bag 中提取一个元素时，bag 就检查调用线程的迷你集合，试图从中取出数据项。如果数据项在那里，就用一个 <code>Interlocked</code> 方法提取这个项。如果不在，就在内部获取一个 <code>Monitor</code>，以便从另一个线程的迷你集合提取一个项。这称为一个线程从另一个线程“窃取”一个数据项。</p><p>注意，所有并发集合类都提供了 <code>GetEnumerator</code> 方法，它一般用于 C# 的 <code>foreach</code> 语句，但也可用于 LINQ。对于 <code>ConcurrentStack</code>，<code>ConcurrentQueue</code>和<code>ConcurrentBag</code>类，<code>GetEnumerator</code>方法获取集合内容的一个“快照”，并从这个快照返回元素；实际集合的内容可能在使用快照枚举时发生改变。<code>ConcurrentDictionary</code> 的 <code>GetEnumerator</code> 方法不获取它的内容的快照。因此，在枚举字典期间，字典的内容可能改变；这一点务必注意。还要注意的是，<code>Count</code> 属性返回的是查询时集合中的元素数量。如果其他线程同时正在集合中增删元素，这个计数可能马上就变得不正确了。</p><p><code>ConcurrentStack</code>，<code>ConcurrentQueue</code> 和 <code>ConcurrentBag</code> 这三个并发集合类都实现了 <code>IProducerConsumerCollection</code> 接口。接口定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public interface IProducerConsumerCollection&lt;T&gt; : IEnumerable&lt;T&gt;, ICollection, IEnumerable {
    Boolean TryAdd(T item);
    Boolean TryTake(out T item);
    T[] ToArray();
    void CopyTo(T[] array, Int32 index);
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实现了这个接口的任何类都能转变成一个阻塞集合。如果集合已满，那么负责生产(添加)数据项的线程会阻塞；如果集合已空，那么负责消费(移除)数据项的线程会阻塞。当然，我会尽量不使用这种阻塞集合，因为它们生命的全部意义就是阻塞线程。要将非阻塞的集合转变成阻塞集合，需要构造一个 <code>System.Collecitons.Concurrent.BlockingCollection</code> 类，向它的构造器传递对非阻塞集合的引用。<code>BlockingCollection</code> 类看起来像下面这样(有的方法未列出)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public class BlockingCollection&lt;T&gt; : IEnumerable&lt;T&gt;, ICollection, IEnumerable, IDisposable {
    public BlockingCollection(IProducerConsumerCollection&lt;T&gt; collection,
        Int32 boundedCapacity);

    public void Add(T item);
    public Boolean TryAdd(T item, Int32 msTimeout, CancellationToken cancellationToken);
    public void CompleteAdding();

    public T Take();
    public Boolean TryTake(out T item, Int32 msTimeout, CancellationToken cancellationToken);

    public Int32 BoundedCapacity { get; }
    public Int32 Count { get; }
    public Boolean IsAddingCompleted { get; } // 如果调用了 CompleteAdding ，则为 true
    public Boolean IsCompleted { get; } // 如果 IsAddingComplete 为 true，而且 Count==0，则返回 true

    public IEnumerable&lt;T&gt; GetConsumingEnumerable(CancellationToken cancellationToken);

    public void CopyTo(T[] array, int index);
    public T[] ToArray();
    public void Dispose();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>构造一个 <code>BlockingCollection</code> 时，<code>boundedCapacity</code> 参数指出你想在集合中最多容纳多少个数据项。在基础集合已满的时候，如果一个线程调用<code>Add</code>，生产线程就会阻塞。如果愿意，生产线程可调用 <code>TryAdd</code>，传递一个超时值(以毫秒为单位)和/或一个 <code>CancellationToken</code>，使线程一直阻塞，直到数据项成功添加、超时到期或者 <code>CancellationToken</code> 被取消(对 <code>CancellationToken</code> 类的讨论请参见第 27 章)。</p><p><code>BlockingCollection</code> 类实现了 <code>IDisposable</code> 接口。调用 <code>Dispose</code> 时，这个 <code>Dispose</code> 会调用基础集合的 <code>Dispose</code>。它还会对类内部用于阻塞生产者和消费者的两个 <code>SemaphoreSlim</code> 对象进行清理。</p><p>生产者不再向集合添加更多的项时，生产者应调用 <code>CompleteAdding</code> 方法。这会向消费者发出信号，让它们知道不会再生产更多的项了。具体地说，这会造成正在使用 <code>GetConsumingEnumerable</code> 的一个 <code>foreach</code> 循环终止。下例演示了如何设置一个生产者/消费者环境，以及如何在完成数据项的添加之后发出通知：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    var bl = new BlockingCollection&lt;Int32&gt;(new ConcurrentQueue&lt;Int32&gt;());

    // 由一个线程池线程执行“消费”
    ThreadPool.QueueUserWorkItem(ConsumeItems, bl);

    // 在集合中添加 5 个数据项
    for (Int32 item = 0; item &lt; 5; item++) {
        Console.WriteLine(&quot;Producing: &quot; + item);
        bl.Add(item);
    }

    // 告诉消费线程(可能有多个这样的线程)，不会在集合中添加更多的项了
    bl.CompleteAdding();

    Console.ReadLine(); // 这一行代码是出于测试的目的(防止 Main 返回)
}

private static void ConsumeItems(Object o) {
    var bl = (BlockingCollection&lt;Int32&gt;) o;
    // 阻塞，直到出现一个数据项。出现后就处理它
    foreach (var item in bl.GetConsumingEnumerable()) {
        Console.WriteLine(&quot;Consuming: &quot; + item);
    }

    // 集合空白，没有更多的项进入其中
    Console.WriteLine(&quot;All items have been consumed&quot;);
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在我自己的机器上执行上述代码，得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Producing: 0
Producing: 1
Producing: 2
Producing: 3
Producing: 4
Consuming: 0
Consuming: 1
Consuming: 2
Consuming: 3
Consuming: 4
All items have been consumed 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你自己执行上述代码时，“Producing” 和 “Consuming” 行可能交错出现。但 “All times have been consumed” 这一行必然最后出现。</p><p><code>BlockingCollection</code> 类还提供了静态 <code>AddToAny</code>，<code>TryAddToAny</code>，<code>TakeFromAny</code> 和 <code>TryTakeFromAny</code> 方法。所有这些方法都获取一个<code>BlockingCollection&lt;T&gt;[]</code>，以及一个数据项、一个超时值以及一个 <code>CancellationToken</code>。<code>(Try)AddToAny</code> 方法遍历数组中的所有集合，直到发现因为容量还没有到达(还没有满)，而能够接受数据项的一个集合。<code>(Try)TakeFromAny</code> 方法则遍历数组中的所有集合，直到发现一个能从中移除一个数据项的集合。</p>`,81);function g(C,k){const d=a("ExternalLinkIcon");return r(),o("div",null,[v,e("p",null,[i("本章首先展示了如何基于构造来构建混合构造。然后展示了 FCL 自带的许多混合构造，描述了它们的行为，并介绍了如何正确使用它们。我还提供了一些我自己创建的构造，它们通过 Wintellect 的 Power Threading 库免费提供给大家使用，请从 "),e("em",null,[e("a",u,[i("http://wintellect.com/Resource-Power-Collections-Library"),l(d)])]),i(" 下载。")]),m,e("p",null,[i("该技术之所以有名，不是因为它非常有趣或有用，而是因为它曾经是人们热烈讨论的话题。该技术曾在 Java 中大量使用，后来有一天，一些人发现 Java 不能保证该技术在任何地方都能正确工作。这个使它出名的网页对问题进行了清楚的说明："),e("em",null,[e("a",b,[i("http://www.cs.umd.edu/~pugh/java/memoryModel/DoubleCheckedLocking,html"),l(d)])]),i("。")]),p])}const y=s(t,[["render",g],["__file","ch30_hybridThreadSyncConst.html.vue"]]),_=JSON.parse('{"path":"/chapters/ch30_hybridThreadSyncConst.html","title":"第 30 章 混合线程同步构造","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"30.1 一个简单的混合锁","slug":"_30-1-一个简单的混合锁","link":"#_30-1-一个简单的混合锁","children":[]},{"level":2,"title":"30.2 自旋、线程所有权和递归","slug":"_30-2-自旋、线程所有权和递归","link":"#_30-2-自旋、线程所有权和递归","children":[]},{"level":2,"title":"30.3 FCL 中的混合结构","slug":"_30-3-fcl-中的混合结构","link":"#_30-3-fcl-中的混合结构","children":[{"level":3,"title":"30.3.1 ManualResetEventSlim类和 SemaphoreSlim类","slug":"_30-3-1-manualreseteventslim类和-semaphoreslim类","link":"#_30-3-1-manualreseteventslim类和-semaphoreslim类","children":[]},{"level":3,"title":"30.3.2 Monitor类和同步块","slug":"_30-3-2-monitor类和同步块","link":"#_30-3-2-monitor类和同步块","children":[]},{"level":3,"title":"30.3.3 ReaderWriterLockSlim 类","slug":"_30-3-3-readerwriterlockslim-类","link":"#_30-3-3-readerwriterlockslim-类","children":[]},{"level":3,"title":"30.3.4 OneManyLock 类","slug":"_30-3-4-onemanylock-类","link":"#_30-3-4-onemanylock-类","children":[]},{"level":3,"title":"30.3.5 CountdownEvent 类","slug":"_30-3-5-countdownevent-类","link":"#_30-3-5-countdownevent-类","children":[]},{"level":3,"title":"30.3.6 Barrier 类","slug":"_30-3-6-barrier-类","link":"#_30-3-6-barrier-类","children":[]},{"level":3,"title":"30.3.7 线程同步构造小结","slug":"_30-3-7-线程同步构造小结","link":"#_30-3-7-线程同步构造小结","children":[]}]},{"level":2,"title":"30.4 著名的双检锁技术","slug":"_30-4-著名的双检锁技术","link":"#_30-4-著名的双检锁技术","children":[]},{"level":2,"title":"30.5 条件变量模式","slug":"_30-5-条件变量模式","link":"#_30-5-条件变量模式","children":[]},{"level":2,"title":"30.6 异步的同步构造","slug":"_30-6-异步的同步构造","link":"#_30-6-异步的同步构造","children":[]},{"level":2,"title":"30.7 并发集合类","slug":"_30-7-并发集合类","link":"#_30-7-并发集合类","children":[]}],"git":{"updatedTime":1712067352000},"filePathRelative":"chapters/ch30_hybridThreadSyncConst.md"}');export{y as comp,_ as data};
