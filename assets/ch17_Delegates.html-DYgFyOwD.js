import{_ as e,a as n,b as d,c as i,d as l,e as a}from"./17_6-CsjYbyYW.js";import{_ as c,o as s,c as o,e as t}from"./app-IxoMmWNN.js";const v={},r=t(`<h1 id="第-17-章-委托" tabindex="-1"><a class="header-anchor" href="#第-17-章-委托"><span>第 17 章 委托</span></a></h1><p>本章内容：</p><ul><li><a href="#17_1">初始委托</a></li><li><a href="#17_2">用委托回调静态方法</a></li><li><a href="#17_3">用委托回调实例方法</a></li><li><a href="#17_4">委托揭秘</a></li><li><a href="#17_5">用委托回调许多方法(委托链)</a></li><li><a href="#17_6">委托定义不要太多(泛型委托)</a></li><li><a href="#17_7">C# 为委托提供的简化语法</a></li><li><a href="#17_8">委托和反射</a></li></ul><p>本章要讨论回调函数。回调函数式一种非常有用的编程机制，它的存在已经有很多年了。Microsoft .NET Framework 通过 <code>委托</code>来提供回调函数机制。不同于其他平台(比如非托管C++)的回调机制，委托的功能要多得多。例如，委托确保回调方法是类型安全的(这是 CLR 最重要的目标之一)。委托还允许顺序调用多个方法，并支持调用静态方法和实例方法。</p><h2 id="_17-1-初始委托" tabindex="-1"><a class="header-anchor" href="#_17-1-初始委托"><span><a name="17_1">17.1 初始委托</a></span></a></h2><p>C “运行时”的 <code>qsort</code> 函数获取指向一个回调函数的指针，以便对数组中的元素进行排序。在 Microsoft Windows 中，窗口过程、钩子过程和异步过程调用等都需要回调函数。在 .NET Framework 中，回调方法的应用更是广泛。例如，可以登记回调方法来获得各种各样的通知，例如未处理的异常、窗口状态变化、菜单项选择、文件系统变化、窗体控件事件和异步操作已完成等。</p><p>在非托管 C/C++ 中，非成员函数的地址只是一个内存地址。这个地址不携带任何额外的信息，比如函数期望收到的参数个数、参数类型、函数返回值类型以及函数的调用协定。简单地说，非托管 C/C++ 回调函数不是类型安全的(不过它们确实是一种非常轻量级的机制)。</p><p>.NET Framework 的回调函数和非托管 Windows 编程环境的回调函数一样有用，一样普遍。但是，.NET Framework 提供了称为<strong>委托</strong>的类型安全机制。为了理解委托，先来看看如何使用它。以下代码<sup>①</sup>演示了如何声明、创建和使用委托：</p><blockquote><p>① 这个程序最好不要通过在 Visual Studio 中新建 “Windows 窗体应用程序”项目来生成。用文本编辑器输入代码，另存为 <em>name.cs</em>。启动“VS2013 开发人员命令提示”，输入 <code>csc name.cs</code> 生成，输入 <code>name</code> 执行。这样可同时看到控制台和消息框的输出。 —— 译注</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.Windows.Forms;
using System.IO;

// 声明一个委托类型，它的实例引用一个方法，
// 该方法获取一个 Int32 参数，返回 void
internal delegate void Feedback(Int32 value);
public sealed class Program {
    public static void Main() {
        StaticDelegateDemo();
        InstanceDelegateDemo();
        ChainDelegateDemo1(new Program());
        ChainDelegateDemo2(new Program());
    }

    private static void StaticDelegateDemo() {
        Console.WriteLine(&quot;----- Static Delegate Demo -----&quot;);
        Counter(1, 3, null);
        Counter(1, 3, new Feedback(Program.FeedbackToConsole));
        Counter(1, 3, new Feedback(FeedbackToMsgBox));          // 前缀 &quot;Program.&quot; 可选
        Console.WriteLine();
    }

    private static void InstanceDelegateDemo() {
        Console.WriteLine(&quot;----- Instance Delegate Demo -----&quot;);
        Program p = new Program();
        Counter(1, 3, new Feedback(p.FeedbackToFile));
        Console.WriteLine();
    }

    private static void ChainDelegateDemo1(Program p) {
        Console.WriteLine(&quot;----- Chain Delegate Demo 1 -----&quot;);
        Feedback fb1 = new Feedback(FeedbackToConsole);
        Feedback fb2 = new Feedback(FeedbackToMsgBox);
        Feedback fb3 = new Feedback(p.FeedbackToFile);

        Feedback fbChain = null;
        fbChain = (Feedback) Delegate.Combine(fbChain, fb1);
        fbChain = (Feedback) Delegate.Combine(fbChain, fb2);
        fbChain = (Feedback) Delegate.Combine(fbChain, fb3);
        Counter(1, 2, fbChain);

        Console.WriteLine();
        fbChain = (Feedback)
            Delegate.Remove(fbChain, new Feedback(FeedbackToMsgBox));
        Counter(1, 2, fbChain);
    }

    private static void ChainDelegateDemo2(Program p) {
        Console.WriteLine(&quot;----- Chain Delegate Demo 2 -----&quot;);
        Feedback fb1 = new Feedback(FeedbackToConsole);
        Feedback fb2 = new Feedback(FeedbackToMsgBox);
        Feedback fb3 = new Feedback(p.FeedbackToFile);

        Feedback fbChain = null;
        fbChain += fb1;
        fbChain += fb2;
        fbChain += fb3;
        Counter(1, 2, fbChain);

        Console.WriteLine();
        fbChain -= new Feedback(FeedbackToMsgBox);
        Counter(1, 2, fbChain);
    }

    private static void Counter(Int32 from, Int32 to, Feedback fb) {
        for (Int32 val = from; val &lt;= to; val++) {
            // 如果指定了任何回调，就调用它们
            if (fb != null)
                fb(val);
        }
    }

    private static void FeedbackToConsole(Int32 value) {
        Console.WriteLine(&quot;Item=&quot; + value);
    }

    private static void FeedbackToMsgBox(Int32 value) {
        MessageBox.Show(&quot;Item=&quot; + value);
    }

    private void FeedbackToFile(Int32 value) {
        using (StreamWriter sw = new StreamWriter(&quot;Status&quot;, true)) {
            sw.WriteLine(&quot;Item=&quot; + value);
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面来看看代码做的事情。在顶部，注意看<code>internal</code>委托<code>Feedback</code>的声明。委托要指定一个回调方法签名。在本例中，<code>Feedback</code>委托指定的方法要获取一个<code>Int32</code>参数，返回<code>void</code>。在某种程度上，委托和非托管 C/C++ 中代表函数地址的<code>typedef</code>很相似。</p><p><code>Program</code>类定义了私有静态方法<code>Counter</code>，它从整数<code>from</code>计数到整数<code>to</code>。方法的<code>fb</code>参数代表<code>Feedback</code>委托对象引用。方法遍历所有整数。对于每个整数，如果<code>fb</code>变量不为<code>null</code>，就调用由<code>fb</code>变量指定的回调方法。传入这个回调方法的是正在处理的那个数据项的值，也就是数据项的编号。设计和实现回调方法时，可选择任何恰当的方式处理数据项。</p><h2 id="_17-2-用委托回调静态方法" tabindex="-1"><a class="header-anchor" href="#_17-2-用委托回调静态方法"><span><a name="17_2">17.2 用委托回调静态方法</a></span></a></h2><p>理解<code>Counter</code>方法的设计及其工作方式之后，再来看看如何利用委托回调静态方法。本节重点是上一节示例代码中的<code>StaticDelegateDemo</code>方法。</p><p>在<code>StaticDelegateDemo</code>方法中第一次调用<code>Counter</code>方法时，为第三个参数(对应于 <code>Counter</code> 的 <code>fb</code>参数)传递的是<code>null</code>。由于<code>Counter</code>的<code>fb</code>参数收到的是<code>null</code>，所以处理每个数据项时都不调用回调方法。</p><p><code>StaticDelegateDemo</code>方法再次调用<code>Counter</code>，为第三个参数传递新构成的<code>Feedback</code>委托对象。委托对象是方法的包装器(wrapper)，使方法能通过包装器来间接回调。在本例中，静态方法的完整名称<code>Program.FeedbackToConsole</code> 被传给 <code>Feedback</code> 委托类型的构造器，这就是要包装的方法。<code>new</code>操作符返回的引用作为<code>Counter</code>的第三个参数来传递。现在，当<code>Counter</code>执行时，会为序列中的每个数据项调用<code>Program</code>类型的静态方法<code>FeedbackToConsole</code>。<code>FeedbackToConsole</code>方法本身的作用很简单，就是向控制台写一个字符串，显示正在进行处理的数据项。</p><blockquote><p>注意 <code>FeedbackToConsole</code>方法被定义成<code>Program</code>类型内部的私有方法，但<code>Counter</code>方法能调用 <code>Program</code> 的私有方法，这明显没有问题，因为<code>Counter</code>和<code>FeedbackToConsole</code>在同一个类型中定义。但即使<code>Counter</code>方法在另一个类型中定义，也不会出问题！简单地说，在一个类型中通过委托来调用另一个类型的私有成员，只要委托对象是由具有足够安全性/可访问性的代码创建的，便没有问题。</p></blockquote><p>在 <code>StaticDelegateDemo</code> 方法中，对 <code>Counter</code> 方法的第三个调用和第二个调用几乎完全一致。唯一的区别在于 <code>Feedback</code> 委托对象包装的是静态方法 <code>Program.FeedbackToMsgBox</code>。<code>FeedbackToMsgBox</code>构造一个字符串来指出正在处理的数据项，然后在消息框中显示该字符串。</p><p>这个例子中的所有操作都是都是类型安全的。例如，在构造<code>Feedback</code>委托对象时，编译器确保<code>Program</code>的 <code>FeedbackToConsole</code> 和<code>FeedbackToMsgBox</code>方法的签名兼容于<code>Feedback</code>委托定义的签名。具体地说，两个方法都要获取一个参数(一个<code>Int32</code>)，而且两者都要有相同的返回类型(<code>void</code>)。将<code>FeedbackToConsole</code>的定义改为下面这样：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Boolean FeedbackToConsole(String value) {
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>C#编译器将不会编译以上代码，并报告以下错误：<code>error CS0123:&quot;FeedbackToConsole&quot;的重载均与委托Feedback&quot;不匹配</code>。</p><p>将方法绑定到委托时，C# 和 CLR 都允许引用类型的<strong>协变性</strong>(covariance)和<strong>逆变性</strong>(contravariance)。协变性是指方法能返回从委托的返回类型派生的一个类型。逆变性是指方法获取的参数可以是委托的参数类型的基类。例如下面这个委托：</p><p><code>delegate Object MyCallback(FileStream s);</code></p><p>完全可以构造该委托类型的一个实例并绑定具有以下原型的方法：</p><p><code>String SomeMethod(Stream s);</code></p><p>在这里，<code>SomeMethod</code> 的返回类型(<code>String</code>)派生自委托的返回类型(<code>Object</code>)；这种协变性是允许的。<code>SomeMethod</code>的参数类型(<code>Stream</code>)是委托的参数类型(<code>FileStream</code>)的基类；这种逆变性是允许的。</p><p>注意，只有引用类型才支持协变性与逆变性，值类型或<code>void</code>不支持。所以，不能把下面的方法绑定到<code>MyCallback</code>委托：</p><p><code>Int32 SomeOtherMethod(Stream s);</code></p><p>虽然<code>SomeOtherMethod</code> 的返回类型(<code>Int32</code>)派生自(<code>MyCallback</code>)的返回类型(<code>Object</code>)，但这种形式的协变性是不允许的，因为<code>Int32</code>是值类型。显然，值类型和 <code>void</code> 之所以不支持，是因为它们的存储结构是变化的，而引用类型的存储结构始终是一个指针。幸好，视图执行不支持的操作，C#编译器会报错。</p><h2 id="_17-3-用委托回调实例方法" tabindex="-1"><a class="header-anchor" href="#_17-3-用委托回调实例方法"><span><a name="17_3">17.3 用委托回调实例方法</a></span></a></h2><p>委托除了能调用静态方法，还能为具体的对象调用实例方法。为了理解如何回调实例方法，先来看看 17.1 节的示例代码中的 <code>InstanceDelegateDemo</code> 方法。</p><p>注意<code>InstanceDelegateDemo</code>方法构造了名为<code>p</code>的<code>Program</code>对象。这个<code>Program</code>对象没有定义任何实例字段或属性；创建它纯粹是为了演示。在<code>Counter</code>方法调用中构造新的<code>Feedack</code>委托对象时，向<code>Feedback</code> 委托类型的构造函数传递的是<code>p.FeedbackToFile</code>。这导致委托包装对<code>FeedbackToFile</code>方法的引用，这是一个实例方法(而不是静态方法)。当<code>Counter</code>调用由其<code>fb</code>实参标识的回调方法时，会调用<code>FeedbackToFile</code>实例方法，新构造的对象<code>p</code>的地址作为隐式的 <code>this</code>参数传给这个实例方法。</p><p><code>FeedbackToFile</code>方法的工作方法类似于<code>FeedbackToConsole</code>和<code>FeedbackToMsgBox</code>，不同的是它会打开一个文件，并将字符串附加到文件末尾。(方法创建的 Status 文件可在与可执行程序相同的目录中找到。)</p><p>再次声明，本例旨在演示委托可以包装对实例方法和静态方法的调用。如果是实例方法，委托要知道方法操作的是具体哪个对象实例。包装实例方法很有用，因为对象内部的代码可以访问对象的实例成员。这意味着对象可以维护一些状态，并在回调方法执行期间利用这些状态信息。</p><h2 id="_17-4-委托揭秘" tabindex="-1"><a class="header-anchor" href="#_17-4-委托揭秘"><span><a name="17_4">17.4 委托揭秘</a></span></a></h2><p>从表面看，委托似乎很容易使用：用 C#的<code>delegate</code>关键字定义，用熟悉的<code>new</code>操作符构造委托实例，用熟悉的方法调用语法来调用回调函数(用引用了委托对象的变量替代方法名)。</p><p>但实际情况比前几个例子演示的要复杂一些。编译器和 CLR 在幕后做了大量工作来隐藏复杂性。本节要解释编译器和 CLR 如何协同工作来实现委托。掌握这些知识有助于加深对委托的理解，并学会如何更高效地使用。另外，还要介绍通过委托来实现的一些附加功能。</p><p>首先重新审视这一行代码：</p><p><code>internal delegate void Feedback(Int32 value);</code></p><p>看到这行代码后，编译器实际会像下面这样定义一个完整的类：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal class Feedback : System.MulticastDelegate {
    // 构造器
    public Feedback(Object @object, IntPtr method);

    // 这个方法的原型和源代码指定的一样
    public virtual void Invoke(Int32 value);

    // 以下方法实现对回调方法的异步问题
    public virtual IAsyncResult BeginInvoke(Int32 value, AsyncCallback callback, Object @object);
    public virtual void EndInvoke(IAsyncResult result);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译器定义的类有 4 个方法：一个构造器、<code>Invoke</code>、<code>BeginInvoke</code>和<code>EndInvoke</code>。本章重点解释构造器和<code>Invoke</code>。<code>BeginInvoke</code>和<code>EndInvoke</code>方法将留到第 27 章讨论。</p><p>事实上，可用 ILDasm.exe 查看生成的程序集，验证编译器真的会自动生成这个类，如果 17-1 所示。</p><p><img src="`+e+`" alt="17_1"></p><p>图 17-1 ILDasm.exe 显示了编译器为委托生成的元数据</p><p>在本例中，编译器定义了 <code>Feedback</code> 类，它派生自 FCL 定义的<code>System.MulticastDelegate</code> 类型(所有委托类型都派生自<code>MulticastDelegate</code>)。</p><blockquote><p>重要提示 <code>System.MulticastDelegate</code>派生自<code>System.Delegate</code>，后者又派生自 <code>System.Object</code>。是历史原因造成有两个委托类。这实在是令人遗憾———— FCL 本该只有一个委托类。没有办法，我们对这两个类都要有所了解。即使创建的所有委托类型都将<code>MulticastDelegate</code>作为基类，个别情况下仍会使用 <code>Delegate</code> 类(而非<code>MulticastDelegate</code>类)定义的方法处理自己的委托类型。例如，<code>Delegate</code>类的两个静态方法<code>Combine</code>和<code>Remove</code>(后文将解释其用途)的签名都指出要获取<code>Delegate</code>参数。由于你创建的委托类型派生自<code>MulticastDelegate</code>，后者又派生自<code>Delegate</code>，所以你的委托类型的实例是可以传给这两个方法的。</p></blockquote><p>这个类的可访问性是<code>private</code>，因为委托在源代码中声明为<code>internal</code>。如果源代码改成使用<code>public</code>可见性，编译器生成的<code>Feedback</code>类也会变成公共类。要注意的是，委托类既可嵌套在一个类型中定义，也可在全局范围中定义。简单地说，由于委托是类，所以凡是能够定义类的地方，都能定义委托。</p><p>由于所有委托类型都派生自<code>MulticastDelegate</code>，所以它们继承了<code>MulticastDelegate</code>的字段、属性和方法。在所有这些成员中，有三个非公共字段是最重要的。表 17-1 总结了这些重要字段。</p><p>表 17-1 <code>MulticastDelegate</code> 的三个重要的非公共字段</p><table><thead><tr><th style="text-align:center;">字段</th><th style="text-align:center;">类型</th><th style="text-align:center;">说明</th></tr></thead><tbody><tr><td style="text-align:center;"><code>_target</code></td><td style="text-align:center;"><code>System.Object</code></td><td style="text-align:center;">当委托对象包装一个静态方法时，这个字段为<code>null</code>。当委托对象包装一个实例方法时，这个字段引用的是回调方法要操作的对象。换言之，这个字段指出要传给实例方法的隐式参数 <code>this</code> 的值</td></tr><tr><td style="text-align:center;"><code>_methodPtr</code></td><td style="text-align:center;"><code>System.IntPtr</code></td><td style="text-align:center;">一个内部的整数值，CLR用它标识要回调的方法</td></tr><tr><td style="text-align:center;"><code>_invocationList</code></td><td style="text-align:center;"><code>System.Object</code></td><td style="text-align:center;">该字段通常为 <code>null</code>。构造委托链时它引用一个委托数组(详情参见下一节)</td></tr></tbody></table><p>注意，所有委托都有一个构造器，它获取两个参数：一个是对象引用，另一个是引用了回调方法的整数。但如果仔细查看前面的源代码，会发现传递的是<code>Program.FeedbackToConsole</code>或<code>p.FeedbackToFile</code>这样的值。根据迄今为止学到的编程知识，似乎没有可能通过编译！</p><p>然而，C# 编译器知道要构造的是委托，所以会分析源代码来确定引用的是哪个对象和方法。对象引用被传给构造器的 <code>object</code> 参数，标识了方法的一个特殊 <code>IntPtr</code> 值(从 <code>MethodDef</code> 或 <code>MemberRef</code> 元数据 token 获得)被传给构造器的 <code>method</code> 参数。对于静态方法，会为 <code>object</code> 参数传递 <code>null</code> 值。在构造器内部，这两个实参分别保存在 <code>_target</code> 和 <code>_methodPtr</code> 私有字段中。除此以外，构造器还将 <code>_invocationList</code> 字段设为<code>null</code>，对这个字段的讨论将推迟到 17.5 节 “用委托回调多个方法(委托链)”进行。</p><p>所以，每个委托对象实际都是一个包装器，其中包装了一个方法和调用该方法时要操作的对象。例如，在执行以下两行代码之后：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Feedback fbStatic = new Feedback(Program.FeedbackToConsole);
Feedback fbInstance = new Feedback(new Program().FeedbackToFile);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><code>fbStatic</code> 和 <code>fbInstance</code> 变量将引用两个独立的、初始化好的 <code>Feedback</code> 委托对象，，如图 17-2 所示。</p><p><img src="`+n+`" alt="17_2"></p><p>图 17-2 在两个变量引用的委托中，一个包装静态方法，另一个包装实例方法</p><p>知道委托对象如何构造并了解其内部结构之后，再来看看回调方法时如何调用的。为方便讨论，下面重复了 <code>Counter</code> 方法的定义：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void Counter(Int32 from, Int32 to, Feedback fb) {
    for (Int32 val = from; val &lt;= to; val++) {
        // 如果指定了任何回调，就调用它们
        if (fb != null)
            fb(val);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意<code>if</code>语句首先检查<code>fb</code>是否为<code>null</code>。不为<code>null</code>就调用<sup>①</sup>回调方法。<code>null</code>检查必不可少，因为<code>fb</code>只是<em>可能</em>引用了<code>Feedback</code>委托对象的变量；它也可能为<code>null</code>。这段代码看上去像是调用了一个名为<code>fb</code>的函数，并向它传递一个参数(<code>val</code>)。但事实上，这里没有名为 <code>fb</code> 的函数。再次提醒你注意注意，因为编译器知道 <code>fb</code> 是引用了委托对象的变量，所以会生成代码调用该委托对象的<code>Invoke</code> 方法。也就是说，编译器在看到以下代码时：</p><blockquote><p>① 这里的“调用”是 <code>invoke</code>，参考 8.6.2 节的译注对 <code>invoke</code> 和 <code>call</code> 的解释。 ———— 译注</p></blockquote><p><code>fb(val);</code></p><p>它将生成以下代码，好像源代码本来就是这么写的一样：</p><p><code>fb.Invoke(val);</code></p><p>为了验证编译器生成代码来调用委托类型的 <code>Invoke</code> 方法，可利用 ILDasm.exe 检查为 <code>Counter</code> 方法创建的 IL 代码。下面列出了 <code>Counter</code> 方法的 IL 代码。IL_0009 处的指令就是对 <code>Feedback</code> 的 <code>Invoke</code> 方法的调用。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>.method private hidebysig static void Counter( int32 from,
                                               int32 &#39;to&#39;,
                                               class Feedback fb) cil managed
{
    // Code size 23 (0x17)
    .maxstack 2
    .locals init (int32 val)
    IL_0000: ldarg.0
    IL_0001: stloc.0
    IL_0002: br.s IL_0012
    IL_0004: ldarg.2
    IL_0005: brfalse.s IL_000e
    IL_0007: ldarg.2
    IL_0008: ldloc.0
    IL_0009: callvirt instance void Feedback::Invoke(int32)
    IL_000e: ldloc.0
    IL_000f: ldc.i4.1
    IL_0010: add
    IL_0011: stloc.0
    IL_0012: ldloc.0
    IL_0013: ldarg.1
    IL_0014: ble.s IL_0004
    IL_0016: ret
} // end of method Program::Counter
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>其实，完全可以修改 <code>Counter</code> 方法来显式调用 <code>Invoke</code> 方法，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void Counter(Int32 from, Int32 to, Feedback fb) {
    for (Int32 val = from; val &lt;= to; val++){
        // 如果指定了任何回调，就调用它们
        if (fb != null)
            fb.Invoke(val);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>前面说过，编译器是在定义 <code>Feedback</code> 类的时候定义 <code>Invoke</code> 的。在 <code>Invoke</code> 被调用时，它使用私有字段 <code>_target</code> 和 <code>_methodPtr</code> 在指定对象上调用包装好的回调方法。注意，<code>Invoke</code>方法的签名和委托的签名匹配。由于<code>Feedback</code>委托要获取一个<code>Int32</code>参数并返回<code>void</code>，所以编译器生成的<code>Invoke</code>方法也要获取一个<code>Int32</code>并返回<code>void</code>。</p><h2 id="_17-5-用委托回调多个方法-委托连" tabindex="-1"><a class="header-anchor" href="#_17-5-用委托回调多个方法-委托连"><span><a name="17_5">17.5 用委托回调多个方法(委托连)</a></span></a></h2><p>委托本身就很有用，再加上对委托链的支持，用处就更大了！委托链是委托对象的集合。可利用委托链调用集合中的委托所代表的全部方法。为了理解这一点，请参考 17.1 节的实例代码中的 <code>ChainDelegateDemo1</code> 方法。在 <code>Console.WriteLine</code> 语句之后，我构造了三个委托对象并让变量 <code>fb1</code>，<code>fb2</code> 和 <code>fb3</code> 分别引用每个对象，如图 17-3 所示。</p><p><img src="`+d+'" alt="17_3"><br> 图 17-3 fb1，fb2 和 fb3 变量引用的委托对象的初始状态</p><p>指向<code>Feedback</code>委托对象的引用变量<code>fbChain</code>旨在引用委托链(或者说委托对象集合)，这些对象包装了可回调的方法。<code>fbChain</code>初始化为<code>null</code>，表明目前没有要回调的方法。使用<code>Delegate</code>类的公共静态方法<code>Combine</code>将委托添加到链中：</p><p><code>fbChain = (Feedback) Delegate.Combine(fbChain, fb1);</code></p><p>执行这行代码时，<code>Combine</code> 方法发现试图合并的是<code>null</code>和<code>fb1</code>。在内部，<code>Combine</code>直接返回<code>fb1</code>中的值，所以<code>fbChain</code>变量现在引用<code>fb1</code>变量所引用的委托对象，如果 17-4 所示。</p><p><img src="'+i+'" alt="17_4"><br> 图 17-4 在委托链中插入第一个委托后委托对象的状态</p><p>再次调用 <code>Combine</code> 方法在链中添加第二个委托：</p><p><code>fbChain = (Feedback) Delegate.Combine(fbChain, fb2);</code></p><p>在内部，<code>Combine</code>方法发现<code>fbChain</code> 已引用了一个委托对象，所以 <code>Combine</code> 会构造一个新的委托对象。新委托对象对它的私有字段 <code>_target</code> 和 <code>_methodPtr</code> 进行初始化，具体的值对于目前的讨论来说并不重要。重要的是，<code>_invocationList</code>字段被初始化为引用一个委托对象数组。数组的第一个元素(索引0)被初始化引用包装了 <code>FeedbackToConsole</code> 方法的委托(也就是 <code>fbChain</code> 目前引用的委托)。数组的第二个元素(索引 1)被初始化为引用包装了<code>FeedbackToMsgBox</code>方法的委托(也就是 <code>fb2</code> 引用的委托)。最后，<code>fbChain</code>被设为引用新建的委托对象，如果 17-5 所示。</p><p><img src="'+l+'" alt="17_5"><br> 图 17-5 在委托链中插入第二个委托之后委托对象的状态</p><p>为了在链中添加第三个委托，我再次调用 <code>Combine</code> 方法。</p><p><code>fbChain = (Feedback) Delegate.Combine(fbChain, fb3);</code></p><p>同样地，<code>Combine</code>方法发现<code>fbChain</code>已引用了一个委托对象，因而又构造一个新的委托对象，如果 17-6 所示。和前面一样，新委托对象对私有字段 <code>_target</code>和<code>_methodPtr</code>进行初始化，具体的值就目前来说并不重要。<code>_invocationList</code>字段被初始化为引用一个委托对象数组。该数组的第一个元素和第二个元素(索引 0 和 1)被初始化为引用 <code>fb1</code> 和 <code>fb2</code> 所引用的委托。数组的第三个元素(索引 2)被初始化为引用包装了<code>FeedbackToFile</code>方法的委托(这是<code>fb3</code>所引用的委托)。最后，<code>fbChain</code>被设为引用这个新建的委托对象。注意，之前新建的委托及其<code>_invocationList</code>字段引用的数组现在可以进行垃圾回收。</p><p>在<code>ChainDelegateDemo1</code>方法中，用于设置委托链的所有代码执行完毕之后，我将<code>fbChain</code>变量传给 <code>Counter</code> 方法：</p><p><code>Counter(1, 2, fbChain);</code></p><p><code>Counter</code>方法内部的代码会在<code>Feedback</code>委托对象上隐式调用<code>Invoke</code>方法，具体已在前面讲述过了。在 <code>fbChain</code>引用的委托上调用<code>Invoke</code>时，该委托发现私有字段<code>_invocationList</code>不为<code>null</code>，所以会执行一个循环来遍历数组中的所有元素，并依次调用每个委托包装的方法。在本例中，<code>FeedbackToConsole</code>首先被调用，随后是<code>FeedbackToMsgBox</code>，最后是<code>FeedbackToFile</code>。</p><p><img src="'+a+`" alt="17_6"></p><p>图 17-6 委托链完成后委托对象的最终状态</p><p>以伪代码的形式，<code>Feedback</code> 的 <code>Invoke</code> 方法基本上是像下面这样实现的：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public void Invoke(Int32 value) {
    Delegate[] delegateSet = _invocationList as Delegate[];
    if (delegateSet != null ) {
        // 这个委托数组指定了应该调用的委托
        foreach (Feedback d in delegates)
            d(value);   // 调用每个委托
    } else {  // 否则就不是委托链
        // 该委托标识了要回调的单个方法，
        // 在指定的目标对象上调用这个回调方法
        _methodPtr.Invoke(_target, value);
        // 上面这行代码接近实际的代码，
        // 实际发生的事情用 C# 是表示不出来的
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，还可调用 <code>Delegate</code> 的公共静态方法 <code>Remove</code> 从链中删除委托。<code>ChainDelegateDemo1</code> 方法在结尾处对此进行了演示。</p><p><code>fbChain = (Feedback) Delegate.Remove(fbChain, new Feedback(FeedbackToMsgBox));</code></p><p><code>Remove</code> 方法被调用时，它扫描第一个实参(本例是<code>fbChain</code>)所引用的那个委托对象内部维护的委托数组(从末尾向索引 0 扫描)。<code>Remove</code>查找的是其<code>_target</code> 和 <code>_methodPtr</code> 字段与第二个实参(本例是新建的<code>Feedback</code>委托)中的字段匹配的委托。如果找到匹配的委托，并且(在删除之后)数组中只剩余一个数据项，就返回那个数据项。如果找到匹配的委托，并且(在删除之后)数组中只剩余一个数据项，就返回那个数据项。如果找到匹配的委托，并且数组中还剩余多个数据项，就新建一个委托对象————其中创建并初始化的 <code>_invocationList</code> 数组中还剩余多个数据项，当然被删除的数据项除外————并返回对这个新建委托对象的引用。如果从链中删除了仅有的一个元素，<code>Remove</code>会返回<code>null</code>。注意，每次 <code>Remove</code> 方法调用只能从链中删除一个委托，它不会删除有匹配的<code>_target</code> 和 <code>_methodPtr</code> 字段的所有委托。</p><p>前面展示的例子中，委托类型 <code>Feedback</code> 的返回值都是 <code>void</code>。但完全可以像下面这样定义 <code>Feedback</code> 委托：</p><p><code>public delegate Int32 Feedback(Int32 value);</code></p><p>如果是这样定义的，那么该委托的 <code>Invoke</code> 方法就应该像下面这样(又是伪代码形式)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public Int32 Invoke(Int32 value) {
    Int32 result;
    Delegate[] delegateSet = _invocationList as Delegate[];

    if(delegateSet != null) {
        // 这个委托数组指定了应该调用的委托
        foreach (Feedback d in delegateSet)
            result = d(value);      // 调用每个委托
    } else {  // 否则就不是委托链
        // 该委托标识了要回调的单个方法，
        // 在指定的目标对象上调用这个回调方法
        result = _methodPtr.Invoke(_target, value);
        // 上面这行代码接近实际的代码
        // 实际发生的事情用 C# 是表示不出来的
    }
    return result;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>数组中的每个委托被调用时，其返回值被保存到 <code>result</code> 变量中。循环完成后，<code>result</code> 变量只包含调用的最后一个委托的结果(前面的返回值会被丢弃)，该值返回给调用 <code>Invoke</code> 的代码。</p><h3 id="_17-5-1-c-对委托链的支持" tabindex="-1"><a class="header-anchor" href="#_17-5-1-c-对委托链的支持"><span>17.5.1 C# 对委托链的支持</span></a></h3><p>为方便 C# 开发人员，C# 编译器自动为委托类型的实例重载了 <code>+=</code> 和 <code>-=</code>操作符。这些操作符分别调用 <code>Delegate.Combine</code> 和 <code>Delegate.Remove</code>。可用这些操作符简化委托链的构造。在 17.1 节的示例代码中，<code>ChainDelegateDemo1</code> 和 <code>ChainDelegateDemo2</code> 方法生成的 IL 代码完全一样。唯一的区别是 <code>ChainDelegateDemo2</code> 方法利用 C# 的<code>+=</code>和<code>-=</code>操作符简化了源代码。</p><p>要想证明两个方法生成的 IL 代码一样，可利用 ILDasm.exe 查看生成的 IL 代码。会看到 C#编译器用 <code>Delegate</code> 类型的 <code>Combine</code> 和 <code>Remove</code> 公共静态方法调用分别替换了 <code>+=</code> 和 <code>-=</code> 操作符。</p><h3 id="_17-5-2-取得对委托链调用的更多控制" tabindex="-1"><a class="header-anchor" href="#_17-5-2-取得对委托链调用的更多控制"><span>17.5.2 取得对委托链调用的更多控制</span></a></h3><p>此时，想必你以已理解了如何创建委托对象链，以及如何调用链中的所有对象。链中的所有项都会被调用，因为委托类型的<code>Invoke</code>方法包含了对数组中的所有项进行遍历的代码。这是一个很简单的算法。尽管这个简单的算法足以应付很多情形，但也有它的局限性。例如，除了最后一个返回值，其他所有回调方法的返回值都会被丢弃。但局限并不止于此。如果被调用的委托中有一个抛出了异常或阻塞了相当长一段时间，会出现什么情况呢？由于这个简单的算法是顺序调用链中的每一个委托，所以一个委托对象出现问题，链中后续的所有对象都调用不了。显然，这个算法还不够健壮。<sup>①</sup></p><blockquote><p>① 健壮性(鲁棒性)和可靠性是有区别的，两者对应的英文单词分别是 robustness 和 reliability。 健壮性主要描述一个系统对于参数变化的不敏感性，而可靠性主要描述一个系统的正确性，也就是在你固定提供一个参数时，它应该产生稳定的、能预测的输出。例如一个程序，它的设计目标是获取一个参数并输出一个值。假如它能正确完成这个设计目标，就说它是可靠的。但在这个程序执行完毕后，假如没有正确释放内存，或者说系统没有自动帮它释放占用的资源，就认为这个程序及其“运行时”不具备健壮性或者鲁棒性。————译注</p></blockquote><p>由于这个算法有的时候不胜其任，所以 <code>MulticastDelegate</code> 类提供了一个实例方法 <code>GetInvocationList</code>，用于显式调用链中的每一个委托，并允许你使用需要的任何算法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public abstract class MulticastDelegate : Delegate {
    // 创建一个委托数组，其中每个元素都引用链中的一个委托
    public sealed override Delegate[] GetInvocationList();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>GetInvocationList</code> 方法操作从 <code>MulticastDelegate</code> 派生的对象，返回包含 <code>Delegate</code> 引用的一个数组，其中每个引用都指向链中的一个委托对象。在内部，<code>GetInvocationList</code> 构造并初始化一个数组，让它的每个元素都引用链中的一个委托，然后返回对该数组的引用。如果<code>_invaocationList</code>字段为<code>null</code>，返回的数组就只有一个元素，该元素引用链中唯一的委托，即委托实例本身。</p><p>可以很容易地写一个算法来显式调用数组中每个对象。以下代码进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.Reflection;
using System.Text;

// 定义一个 Light(灯) 组件
internal sealed class Light {
    // 该方法返回灯的状态
    public String SwitchPosition() {
        return &quot;The light is off&quot;;
    }
}

// 定义一个 Fan(风扇)组件
internal sealed class Fan {
    // 该方法返回风扇的状态
    public String Speed() {
        throw new InvalidOperationException(&quot;The fan broke due to overheating&quot;);
    }
}

// 定义一个 Speaker(扬声器)组件
internal sealed class Speaker {
    // 该方法返回扬声器的状态
    public String Volume() {
        return &quot;The volume is loud&quot;;
    }
}

public sealed class Program {

    // 定义委托来查询一个组件的状态
    private delegate String GetStatus();

    public static void Main() {
        // 声明空委托链
        GetStatus getStatus = null;

        // 构造 3 个组件，将它们的状态方法添加到委托链中
        getStatus += new GetStatus(new Light().SwitchPosition);
        getStatus += new GetStatus(new Fan().Speed);
        getStatus += new GetStatus(new Speaker().Volume);

        // 显示整理好的状态报告，反映这 3 个组件的状态
        Console.WriteLine(GetComponentStatusReport(getStatus));
    }

    // 该方法查询几个组件并返回状态报告
    private static String GetComponentStatusReport(GetStatus status) {

        // 如果委托链为空，就不进行任何操作
        if (status == null) return null;

        // 用下面的变量来创建状态报告
        StringBuilder report = new StringBuilder();

        // 获得一个数组，其中每个元素都是链中的委托
        Delegate[] arrayOfDelegates = status.GetInvocationList();

        // 遍历数组中的每一个委托
        foreach (GetStatus getStatus in arrayOfDelegates) {

            try {
                // 获得一个组件的状态字符串，把它附加到报告中
                report.AppendFormat(&quot;{0}{1}{1}&quot;, getStatus(), Environment.NewLine);
            }
            catch (InvalidOperationException e) {
                // 在状态报告为该组件生成一个错误记录
                Object component = getStatus.Target;
                report.AppendFormat(&quot;Failed to get status from {1}{2}{0}  Error: {3}{0}{0}&quot;, Environment.NewLine,
                    ((component == null) ? &quot;&quot; : component.GetType() + &quot;.&quot;),
                    getStatus.Method.Name,
                    e.Message);
            }
        }

        // 把整理好的报告返回给调用者
        return report.ToString();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>The light is off

Failed to get status from Fan.Speed
  Error: The fan broke due to overheating

The volume is loud
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_17-6-委托定义不要太多-泛型委托" tabindex="-1"><a class="header-anchor" href="#_17-6-委托定义不要太多-泛型委托"><span><a name="17_6">17.6 委托定义不要太多(泛型委托)</a></span></a></h2><p>许多年前，Microsoft 在刚开始开发 .NET Framework 的时候引入了委托类型。随着时间的推移，他们定义了许多委托。事实上，现在仅仅在 MSCorLib.dll 中，就有接近 50 个委托类型。下面只列出其中少数几个：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public delegate void TryCode(Object userData);
public delegate void WaitCallback(Object state);
public delegate void TimerCallback(Object state);
public delegate void ContextCallback(Object state);
public delegate void SendOrPostCallback(Object state);
public delegate void ParameterizedThreadStart(Object obj);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发现这几个委托的共同点了吗？它们其实都是一样的：这些委托类型的变量所引用的方法都是获取一个 <code>Object</code>，并返回 <code>void</code>。没理由定义这么多委托类型，留一个就可以了！</p><p>事实上， .NET Framework 现在支持泛型，所以实际只需几个泛型委托(在 <code>System</code> 命名空间中定义)就能表示需要获取多达 16 个参数的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public delegate void Action();   // OK，这个不是泛型
public delegate void Action&lt;T&gt;(T obj);
public delegate void Action&lt;T1, T2&gt;(T1 arg1, T2 arg2);
public delegate void Action&lt;T1, T2, T3&gt;(T1 arg1, T2 arg2, T3 arg3);
...
public delegate void Action&lt;T1, ..., T16&gt;(T1 arg1, ..., T16 arg16);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，.NET Framework 现在提供了 17 个 <code>Action</code> 委托，它们从无参数到最多 16 个参数。如需获取 16 个以上的参数，就必须定义自己的委托类型，但这种情况极其罕见。除了 <code>Action</code> 委托，.NET Framework 还提供了 17 个 <code>Func</code> 函数，允许回调方法返回值：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public delegate TResult Func&lt;TResult&gt;();
public delegate TResult Func&lt;T, TResult&gt;(T1 arg1, T2 arg2);
public delegate TResult Func&lt;T1, T2, TResult&gt;(T1 arg1, T2 arg2, T3 arg3);
public delegate TResult Func&lt;T1, T2, T3, TResult&gt;(T1 arg1, T2 arg2, T3 arg3);
...
public delegate TResult Func&lt;T1,..., T16, TResult&gt;(T1 arg1, ..., T16 arg16);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>建议尽量使用这些委托类型，而不是在代码中定义更多的委托类型。这样可减少系统中的类型数量，同时简化编码。然而，如需使用<code>ref</code>或<code>out</code>关键字以传引用的方式传递参数，就可能不得不定义自己的委托：</p><p><code>delegate void Bar(ref Int32 z);</code></p><p>如果委托要通过 C#的 <code>params</code> 关键字获取数量可变的参数，要为委托的任何参数指定默认值，或者要对委托的泛型类型参数进行约束，也必须定义自己的委托类型。</p><p>获取泛型实参并返回值的委托支持逆变和协变，而且建议总是利用这些功能，因为它们没有副作用，而且使你的委托适用于更多情形。欲知逆变和协变的详情，请参见 12.5 节“委托和接口的逆变和协变泛型类型实参”。</p><h2 id="_17-7-c-为委托提供的简化语法" tabindex="-1"><a class="header-anchor" href="#_17-7-c-为委托提供的简化语法"><span><a name="17_7">17.7 C#为委托提供的简化语法</a></span></a></h2><p>许多程序员因为语法奇怪而对委托有抗拒感。例如下面这行代码：</p><p><code>button1.Cilck += new EventHandler(button1_Click);</code></p><p>其中的<code>button1_CLick</code>是方法，看起来像下面这样：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>void button1_Click(Object sender, EventArgs e) {
    // 按钮单击后要做的事情...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一行代码的思路是向按钮控件登记 <code>button1_Click</code> 方法的地址，以便在按钮被单击时调用方法。许多程序员认为，仅仅为了指定 <code>button1_Click</code> 方法的地址，就构造一个<code>EventHandler</code> 委托对象，这显得有点儿不可思议。然而，构造 <code>EventHandler</code> 委托对象是 CLR 要求的，因为这个对象提供了一个包装器，可确保(被包装的)方法只能以类型安全的方式调用。这个包装器还支持调用实例方法和委托链。遗憾的是，很多程序员并不想仔细研究这些细节。程序员更喜欢像下面这样写代码：</p><p><code>button1.Click += button1_Click;</code></p><p>幸好，Microsoft C# 编译器确实为程序员提供了用于处理委托的一些简化语法。本节将讨论所有这些简化语法。本节将讨论所有这些简化语法。但开始之前我要声明一点，后文描述的基本上只是 C# 的 <strong>语法糖</strong><sup>①</sup>，这些简化语法为程序员提供了一种更简单的方式生成 CLR 和其他编程语言处理委托时所必须的 IL 代码。这些简化语法是 C# 特有的，其他编译器可能还没有提供额外的委托简化语法。</p><blockquote><p>① 一般而言，越是高级的语言，提供的简化语法越多，以方便写程序，这就是所谓的 “语法糖”。————译注</p></blockquote><h3 id="_17-7-1-简化语法-1-不需要构造委托对象" tabindex="-1"><a class="header-anchor" href="#_17-7-1-简化语法-1-不需要构造委托对象"><span>17.7.1 简化语法 1： 不需要构造委托对象</span></a></h3><p>如前所述，C# 允许指定回调方法的名称，不必构造委托对象包装器。例如：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    public static void CallbackWithoutNewingADelegateObject() {
        ThreadPool.QueueUserWorkItem(SomeAsyncTask, 5);
    }

    private static void SomeAsyncTask(Object o) {
        Console.WriteLine(o);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>ThreadPool</code>类的静态<code>QueueUserWorkItem</code>方法期待一个<code>WaitCallback</code>委托对象引用，委托对象中包装的是对<code>SomeAsyncTask</code>方法的引用。由于 C#编译器能自己进行推断，所以可以省略构造<code>WaitCallback</code>委托对象的代码，使代码的可读性更佳，也更容易理解。当然，当代码编译时，C# 编译器还是会生成 IL 代码来新建 <code>WaitCallback</code> 委托对象———— 只是语法得到了简化而已。</p><h3 id="_17-7-2-简化语法2-不需要定义回调方法-lambda-表达式" tabindex="-1"><a class="header-anchor" href="#_17-7-2-简化语法2-不需要定义回调方法-lambda-表达式"><span>17.7.2 简化语法2：不需要定义回调方法(lambda 表达式)</span></a></h3><p>在前面的代码中，回调方法名称 <code>SomeAsyncTask</code> 传给 <code>ThreadPool</code> 的 <code>QueueUserWorkItem</code> 方法。C# 允许以内联(直接嵌入)的方式写回调方法的代码，不必在它自己的方法中写。例如，前面的代码可以这样重写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    public static void CallbackWithoutNewingADelegateObject() {
        ThreadPool.QueueUserWorkItem( obj =&gt; Console.WriteLine(obj), 5);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，传给 <code>QueueUserWorkItem</code> 方法的第一个实参是代码(我把它倾斜显示了)！更正式地说，这是一个 C# lambada 表达式，可通过 C# lambda 表达式操作符 =&gt; 来轻松识别。lambda 表达式可在编译器语句会看到一个委托的地方使用。编译器看到这个 lambda 表达式之后，会在类(本例是 <code>AClass</code>)中自定义一个新的私有方法。这个新方法称为<strong>匿名函数</strong>，因为方法名称由编译器自动创建，而且你一般不知道这个名称。<sup>①</sup>但可利用 ILDasm.exe 这样的工具检查编译器生成的代码。写完前面的代码并编译之后，我通过 ILDasm.exe 看到 C# 编译器将该方法命名为 <code>&lt;CallbackWithoutNewingADelegateObject&gt;b__0</code>，它获取一个 <code>Object</code>，返回<code>void</code>。</p><blockquote><p>① 作者在这里故意区分了匿名函数和匿名方法。一般情况下，两者可以互换着使用。如果非要区分，那么编译器生成的全都是“匿名函数”，这是最开始的叫法。从 C# 2.0 开始引入了“匿名方法”功能，它的作用就是简化生成匿名函数而需要写的代码。在新的 C#版本中(3.0 和以后)，更是建议用 lambda 表达式来进一步简化语法，不再推荐使用 C# 2.0 引入的“匿名方法”。但归根结底，所有这些语法糖都会为了更简单地生成匿名函数。————译注</p></blockquote><p>编译器选择的方法名以下<code>&lt;</code>符号开头，这是因为在 C# 中，标识符是不能包含<code>&lt;</code>符号的；这就确保了你不会碰巧定义一个编译器自动选择的名称。顺便说一句，虽然 C# 禁止标识符包含<code>&lt;</code>符号，但 CLR 允许，这是为什么不会出错的原因。还要注意，虽然可将方法名作为字符串来传递，通过反射来访问方法，但 C#语言规范指出，编译器生成名称的方法是没有任何保证的。例如，每次编译代码，编译器都可能为方法生成一个不同的名称。</p><p>注意C# 编译器向方法应用了 <code>System.Runtime.CompilerServices.CompilerGeneratedAttribute</code>特性，指出该方法由编译器生成，而非程序员写的。<code>=&gt;</code>操作符右侧的代码被放入编译器生成的方法中。</p><blockquote><p>注意 写 lambda 表达式时没有办法向编译器生成的方法应用定制特性。此外，不能向方法应用任何方法修饰符(比如 <code>unsafe</code>)。但这一般不会有什么问题，因为编译器生成的匿名函数总是私有方法，而且方法要么是静态的，要么是非静态的，具体取决于方法是否访问了任何实例成员。所以，没必要向方法应用<code>public</code>，<code>protected</code>，<code>internal</code>，<code>virtual</code>，<code>sealed</code>，<code>override</code>或<code>abstract</code>之类的修饰符。</p></blockquote><p>最后，如果写前面的代码并编译，C# 编译器会将这些代码改写为下面这样(注释是我自己添加的)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    // 创建该私有字段是为了缓存委托对象
    // 优点：CallbackWithoutNewingADelegateObject 不会每次调用都新建一个对象
    // 缺点：缓存的对象永远不会被垃圾回收
    [CompilerGenerated]
    private static WaitCallback &lt;&gt;9__CachedAnonymousMethodDelegate1;

    public static void CallbackWithoutNewingADelegateObject() {
        if (&lt;&gt;9__CachedAnonymousMethodDelegate1 == null) {
            // 第一次调用时，创建委托对象，并缓存它
            &lt;&gt;9__CachedAnonymousMethodDelegate1 = 
                new WaitCallback(&lt;CallbackWithoutNewingADelegateObject&gt;b__0);
        }
        ThreadPool.QueueUserWorkItem(&lt;&gt;9__CachedAnonymousMethodDelegate1, 5);
    }

    [CompilerGenerated]
    private static void &lt;CallbackWithoutNewingADelegateObject&gt;b__0(Object obj) {
        Console.WriteLine(obj);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>lambda 表达式必须匹配 <code>WaitCallback</code> 委托：获取一个 <code>Object</code> 并返回 <code>void</code>。但在指定参数名称时，我简单地将<code>obj</code>放在<code>=&gt;</code>操作符的左侧。在<code>=&gt;</code>操作符右侧，<code>Console.WriteLine</code> 碰巧本来就返回 <code>void</code>。然而，如果在这里放一个返回值不为<code>void</code>的表达式，编译器生成的代码会直接忽略返回值，因为编译器生成的方法必须用 <code>void</code> 返回类型来满足 <code>WaitCallback</code> 委托。</p><p>另外还要注意，匿名函数被标记为 <code>private</code>，禁止非类型内定义的代码(尽管反射能揭示出方法确实存在)。另外，匿名函数被标记为<code>static</code>，因为代码没有访问任何实例成员(也不能访问，因为 <code>CallbackWithoutNewingADelegateObject</code> 本身是静态方法)。不过，代码可引用类中定义的任何静态字段或静态方法。下面是一个例子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    private static String sm_name;  // 一个静态字段

    public static void CallbackWithoutNewingADelegateObject() {
        ThreadPool.QueueUserWorkItem(
            // 回调代码可引用静态成员
            obj =&gt; Console.WriteLine(sm_name + &quot;: &quot; + obj), 5);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果 <code>CallbackWithoutNewingADelegateObject</code> 方法不是静态的，匿名函数的代码就可以包含对实例成员的引用。不包含实例成员引用，编译器仍会生成静态匿名函数，因为它的效率比实例方法高。之所以更高效，是因为不需要额外的<code>this</code>参数。但是，如果匿名函数的代码确实引用了实例成员，编译器就会生成非静态匿名函数：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    private String m_name;      // 一个实例字段

    // 一个实例方法
    public void CallbackWithoutNewingADelegateObject() {
        ThreadPool.QueueUserWorkItem(
            // 回调代码可以引用实例成员
            obj =&gt; Console.WriteLine(m_name + &quot;: &quot; + obj), 5);
        )
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>=&gt;</code>操作符左侧供指定传给 lambda 表达式的参数的名称。下例总结了一些规则：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 如果委托不获取任何参数，就使用 ()
Func&lt;String&gt; f = () =&gt; &quot;Jeff&quot;;

// 如果委托获取 1 个或更多参数，编译器可推断类型
Func&lt;Int32, String&gt; f2 = (Int32 n) =&gt; n.ToString();
Func&lt;Int32, Int32, String&gt; f3 = (Int32 n1, Int32 n2) =&gt; (n1 + n2).ToString();

// 如果委托获取 1 个或更多参数，编译器可推断类型
Func&lt;Int32, String&gt; f4 = (n) =&gt; n.ToString();
Func&lt;Int32, Int32, String&gt; f5 = (n1, n2) =&gt; (n1 + n2).ToString();

// 如果委托获取 1 个参数，可省略(和)
Func&lt;Int32, String&gt; f6 = n =&gt; n.ToString();

// 如果委托有 ref/out 参数，必须显式指定 ref/out 和类型
Bar b = (out Int32 n) =&gt; n = 5;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于最后一个例子，假定 <code>Bar</code> 的定义如下：</p><p><code>delegate void Bar(out Int32 z);</code></p><p><code>=&gt;</code>操作符右侧供指定匿名函数主体。通常，主体包含要么简单、要么复杂的表达式，并最终返回非<code>void</code>值。刚才的代码为所有 <code>Func</code> 委托变量赋值的都会返回<code>String</code>的 lambda 表达式。匿名函数主体还经常只由一个语句构成。调用 <code>ThreadPool.QueueUserWorkItem</code> 时就是这种情况，我向它传递了调用 <code>Console.WriteLine</code>(返回 <code>void</code>)的一个 lambda 表达式。</p><p>如果主体由两个或多个语句构成，必须用大括号将语句封闭。在用了大括号的情况下，如果委托期待返回值，还必须在主体中添加 <code>return</code> 语句，例如：</p><p><code>Func&lt;Int32, Int32, String&gt; f7 = (n1, n2) =&gt; { Int32 sum = n1 + n2; return sum.ToString(); };</code></p><blockquote><p>重要提示 lambda 表达式的主要优势在于，它从你的源代码中移除了一个“间接层”(a level of indirection)，或者说避免了迂回。正常情况下，必须写一个单独的方法，命名该方法，再在需要委托的地方传递这个方法名。方法名提供了引用代码主体的一种方式，如果要在多个地方引用同一个代码主体，单独写一个方法并命名确实是理想的方案。但如果只需在代码中引用这个主体一次，那么 lambda 表达式允许直接内联那些代码，不必为它分配名称，从而提高了编程效率。</p></blockquote><blockquote><p>注意 C# 2.0 问世时引入了一个称为匿名方法的功能。和 C# 3.0 引入的 lambda 表达式相似，匿名方法描述的也是创建匿名函数的语法。新规范(C#语言规范 7.14 节)建议开发人员使用新的 lambda 表达式语法，而不是使用旧的匿名方法语法，因为 lambda 表达式语法更简洁，代码更容易写、读和维护。当然，Microsoft C# 编译器仍然支持用这两种语法创建匿名函数，以兼容当年为 C# 2.0 写的代码。在本书中，我只解释并使用 lambda 表达式语法。</p></blockquote><h3 id="_17-7-3-简化语法-3-局部变量不需要手动包装到类中即可传给回调方法" tabindex="-1"><a class="header-anchor" href="#_17-7-3-简化语法-3-局部变量不需要手动包装到类中即可传给回调方法"><span>17.7.3 简化语法 3：局部变量不需要手动包装到类中即可传给回调方法</span></a></h3><p>前面展示了回调代码如何引用类中定义的其他成员。但有时还希望回调代码引用存在于定义方法中的局部参数或变量。下面是一个有趣的例子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    public static void UsingLocalVariablesInTheCallbackCode(Int32 numToDo) {
        // 一些局部变量
        Int32[] squares = new Int32[numToDo];
        AutoRestEvent done = new AutoRestEvent(false);

        // 在其他线程上执行一系列任务
        for (Int32 n = 0; n &lt; squares.Length; n++) {
            ThreadPool.QueueUserWorkItem(
                obj =&gt; {
                    Int32 num = (Int32)obj;

                    // 该任务通常更耗时
                    squares[num] = num * num;

                    // 如果是最后一个任务，就让主线程继续运行
                    if (Interlocked.Decrement(ref numToDo) == 0)
                        done.Set();                        
                }, n);
        }

        // 等待其他所有线程结束运行
        done.WaitOne();

        // 显示结果
        for (Int32 n = 0; n &lt; squares.Length; n++) {
            Console.WriteLine(&quot;Index {0}, Square={1}&quot;, n , squares[n]);
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个例子生成地演示了 C# 如何简单地实现一个非常复杂的任务。方法定义了一个参数 <code>numToDo</code> 和两个局部变量 <code>squares</code> 和 <code>done</code>。而且 lambda 表达式的主体引用了这些变量。</p><p>现在，想象 lambda 表达式主体中的代码在一个单独的方法中(确实如此，这是 CLR 要求的)。变量的值如何传给这个单独的方法？唯一的办法是定义一个新的辅助类，这个类要为打算传给回调代码的每个值都定义一个字段。此外，回调代码还必须定义成辅助类中的实例方法。然后， <code>UsingLocalVariablesInTheCallbackCode</code> 方法必须构造辅助类的实例，用方法定义的局部变量的值来初始化该实例中的字段。然后，构造绑定到辅助对象/实例方法的委托对象。</p><blockquote><p>注意 当 lambda 表达式造成编译器生成一个类，而且参数/局部变量被转变成该类的字段后，变量引用的对象的生存期被延长了。正常情况下，在方法找中最后一次使用/局部变量之后，这个参数/局部变量就会“离开作用域”，结束其生命期。但是，将变量转变成字段后，只要包含字段的那个对象不“死”，字段引用的对象也不会“死”。这在大多数应用程序中不是大问题，但有时要注意一下。</p></blockquote><p>这项工作非常单调乏味，而且容易出错。但理所当然地，它们全部由 C# 自动完成。写前面的代码时，C# 编译器实际是像下面这样重写了代码(注释是我添加的):</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class AClass {
    public static void UsingLocalVariablesInTheCallbackCode(Int32 numToDo) {

        // 一些局部变量
        WaitCallback callback1 = null;

        // 构造辅助类的实例
        &lt;&gt;c__DisplayClass2 class1 = new &lt;&gt;c__DisplayClass2();

        // 初始化辅助类的字段
        class1.numToDo = numToDo;
        class1.squares = new Int32[class1.numToDo];
        class1.done = new AutoResetEvent(false);

        // 在其他线程上执行一系列任务
        for (Int32 n = 0; n &lt; class1.squares.Length; n++) {
            if (callback1 == null) {
                // 新建的委托对象绑定到辅助对象及其匿名实例方法
                callback1 = new WaitCallback(
                    class1.&lt;UsingLocalVariablesInTheCallbackCode&gt;b__0);
            }

            ThreadPool.QueueUserWorkItem(callback, n);
        }

        // 等待其他所有线程结束运行
        class1.done.WaitOne();

        // 显示结果
        for (Int32 n = 0; n &lt; class1.squares.Length; n++) 
            Console.WriteLine(&quot;Index {0}, Square={1}&quot;, n, class1.squares[n]);
    }

    // 为避免冲突，辅助类被指定了一个奇怪的名称，
    // 而且被指定为私有的，禁止从 AClass 类外部访问
    [CompilerGenerated]
    private sealed class &lt;&gt;c__DisplayClass2 : Object {

        // 回调代码要使用的每个局部变量都有一个对应的公共字段
        public Int32[] squares;
        public Int32 numToDo;
        public AutoResetEvent done;

        // 公共无参构造器
        public &lt;&gt;c__DisplayClass2 { }

        // 包含回调代码的公共实例方法
        public void &lt;UsingLocalVariablesInTheCallbackCode&gt;b__0(Object obj) {
            Int32 num = (Int32) obj;
            squares[num] = num * num;
            if (Interlocked.Decrement(ref numToDo) == 0)
                done.Set();
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>重要提示 毫无疑问，C# 的 lambda 表达式功能很容易被程序员滥用。我开始使用 lambda 表达式时，绝对是花了一些时间来熟悉它的。毕竟，你在一个方法中写的代码实际不在这个方法中。除了有违直觉，还使调试和单步执行变得比较有挑战性。但事实上，Visual Studio 调试器还是非常不错的。我对自己源代码中的 lambda 表达式进行单步测试时，它处理得相当好。</p></blockquote><blockquote><p>我为自己设定了一个规则：如果需要在回到方法中包含 3 行以上的代码，就不使用 lambda 表达式。相反，我会手动写一个方法，并为其分配自己的名称。但如果使用得当，匿名方法确实能显著提高开发人员的效率和代码的可维护性。在以下代码中，使用 lambda 表达式感觉非常自然。没有它们，这样的代码会很难写、读和维护。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建并初始化一个 String 数组
String[] names = { &quot;Jeff&quot;, &quot;Kristin&quot;, &quot;Aidan&quot;, &quot;Grant&quot; };

// 只获取含有小写字母 &#39;a&#39; 的名字
Char charToFind = &#39;a&#39;;
names = Array.FindAll(names, name =&gt; name.IndexOf(charToFind) &gt;= 0);

// 将每个字符串的字符转换为大写
names = Array.ConvertAll(names, name =&gt; name.ToUpper());

// 显示结果
Array.ForEach(names, Console.WriteLine);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_17-8-委托和反射" tabindex="-1"><a class="header-anchor" href="#_17-8-委托和反射"><span><a name="17_8">17.8 委托和反射</a></span></a></h2><p>本章到目前为止，使用委托都要求开发人员事先知道回调方法的原型。例如，假如 <code>fb</code> 是引用了一个 <code>Feedback</code> 委托的变量(参见本章 17.1 节的示例程序)，那么为了调用这个委托，代码应该像下面这样写：</p><p><code>fb(item); // item 被定义 Int32</code></p><p>可以看出，编码时必须知道回调方法需要多少个参数，以及参数的具体类型。还好，开发人员几乎总是知道这些信息，所以像前面那样写代码是没有问题的。</p><p>不过在个别情况下，这些信息在编译时并不知道。第 11 章“事件”讨论 <code>EventSet</code> 类型时曾展示了一个例子。这个例子用字典来维护一组不同的委托类型。在运行时，为了引发事件，要在字典中查找并调用一个委托。但编译时不可能准确地知道要调用哪个委托，哪些参数必须传给委托的回调方法。</p><p>幸好 <code>System.Delegate.MethodInfo</code> 提供了一个 <code>CreateDelegate</code> 方法，允许在编译时不知道委托的所有必要信息的前提下创建委托。下面是 <code>MethodInfo</code> 为该方法定义的重载：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public abstract class MethodInfo : MethodBase {
    // 构造包装了一个静态方法的委托
    public virtual Delegate CreateDelegate(Type delegateType);

    // 构造包装了一个实例方法的委托： target 引用 “this” 实参
    public virtual Delegate CreateDelegate(Type delegateType, Object target);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建好委托后，用 <code>Delegate</code> 的 <code>DynamicInvoke</code> 方法调用它，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public abstract class Delegate {
    // 调用委托并传递参数
    public Object DynamicInvoke(params Object[] args);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用反射 API(参见第 23 章 “程序集加载和反射”)，首先必须获取引用了回调方法的一个 <code>MethodInfo</code>对象。然后，调用<code>CreateDelegate</code>方法来构造由第一个参数<code>delegateType</code>所标识的<code>Delegate</code>派生类型的对象。如果委托包装了实例方法，还要向<code>CreateDelegate</code>传递一个<code>target</code>参数，指定作为<code>this</code>参数传给实例方法的对象。</p><p><code>System.Delegate</code>的<code>DynamicInvoke</code>方法允许调用委托对象的回调方法，传递一组在运行时确定的参数。调用 <code>DynamicInvoke</code>时，它会在内部保证传递的参数与回调方法期望的参数兼容。如果兼容，就调用回调方法：否则抛出<code>ArgumentException</code>异常。<code>DynamicInvoke</code>返回回调方法所返回的对象。</p><p>以下代码演示了如何使用<code>CreateDelegate</code>方法和<code>DynamicInvoke</code>方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>
using System;
using System.Reflection;
using System.IO;
using System.Linq;

// 下面是一些不同的委托定义
internal delegate Object TwoInt32s(Int32 n1, Int32 n2);
internal delegate Object OneString(String s1);

public static class DelegateReflection {
    public static void Main(String[] args) {
        if (args.Length &lt; 2) {
            String usage =
                @&quot;Usage:&quot; +
                &quot;{0} delType methodName [Arg1] [Arg2]&quot; +
                &quot;{0}    where delType must be TwoInt32s or OneString&quot; +
                &quot;{0}    if delType is TwoInt32s, methodName must be Add or Subtracr&quot; +
                &quot;{0}    if delType is OneString, methodName must be NumChars or Reverse&quot; +
                &quot;{0}&quot; +
                &quot;{0}Examples:&quot; +
                &quot;{0}    {1} TwoInt32s Add 123 321&quot; +
                &quot;{0}    {1} TwoInt32s Subtract 123 321&quot; +
                &quot;{0}    {1} OneString NumChars \\&quot;Hello there\\&quot;&quot; +
                &quot;{0}    {1} OneString Reverse \\&quot;Hello there\\&quot;&quot;;
            Console.WriteLine(usage, Environment.NewLine);
            return;
        }

        // 将 delType 实参转换为委托类型
        Type delType = Type.GetType(args[0]);
        if (delType == null) {
            Console.WriteLine(&quot;Invalid delType argument: &quot; + args[0]);
            return;
        }

        Delegate d;
        try {
            // 将 Arg1 实参转换为方法
            MethodInfo mi = typeof(DelegateReflection).GetTypeInfo().GetDeclaredMethod(args[1]);

            // 创建包装了静态方法的委托对象
            d = mi.CreateDelegate(delType);
        }
        catch (ArgumentException) {
            Console.WriteLine(&quot;Invalid methodName argument: &quot; + args[1]);
            return;
        }

        // 创建一个数组，其中只包含要通过委托对象传给方法的参数
        Object[] callbackArgs = new Object[args.Length - 2];

        if (d.GetType() == typeof(TwoInt32s)) {
            try {
                // 将 String 类型的参数转换为 Int32 类型的参数
                for (Int32 a = 0; a &lt; args.Length; a++)
                    callbackArgs[a - 2] = Int32.Parse(args[a]);
            }
            catch (FormatException) {
                Console.WriteLine(&quot;Parameters must be integers.&quot;);
                return;
            }
        }

        if (d.GetType() == typeof(OneString)) {
            // 只复制 String 参数
            Array.Copy(args, 2, callbackArgs, 0, callbackArgs.Length);
        }

        try {
            // 调用委托并显示结果
            Object result = d.DynamicInvoke(callbackArgs);
            Console.WriteLine(&quot;Result = &quot; + result);
        }
        catch (TargetParameterCountException) {
            Console.WriteLine(&quot;Incorrect number of parameters specified.&quot;);
        }
    }

    // 这个回调方法获取 2 个 Int32 参数
    private static Object Add(Int32 n1, Int32 n2) {
        return n1 + n2;
    }

    // 这个回调方法获取 2 个 Int32 参数
    private static Object Subtract(Int32 n1, Int32 n2) {
        return n1 - n2;
    }

    // 这个回调方法获取 1 个 String 参数
    private static Object NumChars(String s1) {
        return s1.Length;
    }

    // 这个回调方法获取 1 个 String 参数
    private static Object Reverse(String s1) {
        return new String(s1.Reverse().ToArray());
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,184),u=[r];function b(m,p){return s(),o("div",null,u)}const h=c(v,[["render",b],["__file","ch17_Delegates.html.vue"]]),k=JSON.parse('{"path":"/chapters/ch17_Delegates.html","title":"第 17 章 委托","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"17.1 初始委托","slug":"_17-1-初始委托","link":"#_17-1-初始委托","children":[]},{"level":2,"title":"17.2 用委托回调静态方法","slug":"_17-2-用委托回调静态方法","link":"#_17-2-用委托回调静态方法","children":[]},{"level":2,"title":"17.3 用委托回调实例方法","slug":"_17-3-用委托回调实例方法","link":"#_17-3-用委托回调实例方法","children":[]},{"level":2,"title":"17.4 委托揭秘","slug":"_17-4-委托揭秘","link":"#_17-4-委托揭秘","children":[]},{"level":2,"title":"17.5 用委托回调多个方法(委托连)","slug":"_17-5-用委托回调多个方法-委托连","link":"#_17-5-用委托回调多个方法-委托连","children":[{"level":3,"title":"17.5.1 C# 对委托链的支持","slug":"_17-5-1-c-对委托链的支持","link":"#_17-5-1-c-对委托链的支持","children":[]},{"level":3,"title":"17.5.2 取得对委托链调用的更多控制","slug":"_17-5-2-取得对委托链调用的更多控制","link":"#_17-5-2-取得对委托链调用的更多控制","children":[]}]},{"level":2,"title":"17.6 委托定义不要太多(泛型委托)","slug":"_17-6-委托定义不要太多-泛型委托","link":"#_17-6-委托定义不要太多-泛型委托","children":[]},{"level":2,"title":"17.7 C#为委托提供的简化语法","slug":"_17-7-c-为委托提供的简化语法","link":"#_17-7-c-为委托提供的简化语法","children":[{"level":3,"title":"17.7.1 简化语法 1： 不需要构造委托对象","slug":"_17-7-1-简化语法-1-不需要构造委托对象","link":"#_17-7-1-简化语法-1-不需要构造委托对象","children":[]},{"level":3,"title":"17.7.2 简化语法2：不需要定义回调方法(lambda 表达式)","slug":"_17-7-2-简化语法2-不需要定义回调方法-lambda-表达式","link":"#_17-7-2-简化语法2-不需要定义回调方法-lambda-表达式","children":[]},{"level":3,"title":"17.7.3 简化语法 3：局部变量不需要手动包装到类中即可传给回调方法","slug":"_17-7-3-简化语法-3-局部变量不需要手动包装到类中即可传给回调方法","link":"#_17-7-3-简化语法-3-局部变量不需要手动包装到类中即可传给回调方法","children":[]}]},{"level":2,"title":"17.8 委托和反射","slug":"_17-8-委托和反射","link":"#_17-8-委托和反射","children":[]}],"git":{"updatedTime":1712067352000},"filePathRelative":"chapters/ch17_Delegates.md"}');export{h as comp,k as data};
