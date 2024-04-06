import{_ as e,o as l,c as n,e as d}from"./app-IxoMmWNN.js";const i={},a=d(`<h1 id="第-19-章-可空值类型" tabindex="-1"><a class="header-anchor" href="#第-19-章-可空值类型"><span>第 19 章 可空值类型</span></a></h1><p>本章内容</p><ul><li><a href="#19_1">C# 对可空值类型的支持</a></li><li><a href="#19_2">C# 的空接合操作符</a></li><li><a href="#19_3">C# 对可空值类型的特殊支持</a></li></ul><p>我们知道值类型的变量永远不会为 <code>null</code>；它总是包含值类型的值本身。事实上，这正是“值类型”一次的由来。遗憾的是，这在某些情况下会成为问题。例如，设计数据库时，可将一个列的数据类型定义成一个 32 位整数，并映射到 FCL(Framework Class Library)的 <code>Int32</code> 数据类型。但是，数据库中的一个列可能允许值为空；也就是说，该列在某一行上允许没有任何值。用 Microsoft .NET Framework 处理数据库数据可能变得很困难，因为在 CLR 中，没有办法将 <code>Int32</code> 值表示成 <code>null</code>。</p><blockquote><p>注意 Microsoft ADO.NET 的表适配器(table adapter)确实支持可空类型。遗憾的是 <code>System.Data.SqlTypes</code> 命名空间中的类型没有用可空类型替换，部分原因是类型之间没有“一对一”的对应关系。例如，<code>SqlDecimal</code> 类型最大允许 38 位数，而普通的 <code>Decimal</code> 类型最大允许 38 位数，而普通的 <code>Decimal</code> 类型最大只允许 29 位数。此外， <code>SqlString</code> 类型支持它自己的本地化和比较选项，而普通的 <code>String</code> 类型并不支持这些。</p></blockquote><p>下面是以另一个例子：Java 的 <code>java.util.Date</code> 类是引用类型，所以该类型的变量能设为 <code>null</code>。但 CLR 的 <code>System.DateTime</code> 是值类型，<code>DateTime</code> 变量永远不能设为 <code>null</code>。如果用 Java 写的一个应用程序想和运行 CLR 的 Web 服务交流日期/时间，那么一旦 Java 程序发送 <code>null</code>，就会出问题，因为 CLR 不知道如何表示 <code>null</code>，也不知道如何操作它。</p><p>为了解决这个问题， Microsoft 在 CLR 中引入了<strong>可空值类型</strong>的概念。为了理解它们是如何工作的，先来看看 FCL 中定义的 <code>System.Nullable&lt;T&gt;</code>结构。以下是<code>System.Nullable&lt;T&gt;</code>定义的逻辑表示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.Runtime.InteropServices;

[Serializable, StructLayout(LayoutKind.Sequential)]
public struct Nullable&lt;T&gt; where T : struct {
    // 这两个字段表示状态
    private Boolean hasValue = false;       // 假定 null
    internal T value = default(T);          // 假定所有位都为零

    public Nullable(T value) {
        this.value = value;
        this.hasValue = true;
    }

    public Boolean HasValue { get { return hasValue; } }

    public T Value {
        get {
            if (!hasValue) {
                throw new InvalidOperationException(&quot;Nullable object must have a value.&quot;);
            }
            return value;
        }
    }

    public T GetValueOrDefault() { return value; }

    public T GetValueOrDefault(T defaultValue) {
        if (!HasValue) return defaultValue;
        return value;
    }

    public override Boolean Equals(object other) {
        if (!HasValue) return (other == null);
        if (other == null) return false;
        return value.Equals(other);
    }

    public override int GetHashCode() {
        if (!HasValue) return 0;
        return value.GetHashCode();
    }

    public override string ToString() {
        if (!HasValue) return &quot;&quot;;
        return value.ToString();
    }

    public static implicit operator Nullable&lt;T&gt;(T value) {
        return new Nullable&lt;T&gt;(value);
    }

    public static explicit operator T(Nullable&lt;T&gt; value) {
        return value.Value;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看出，该结构能表示可为 <code>null</code> 的值类型。由于 <code>Nullable&lt;T&gt;</code> 本身是值类型，所以它的实例仍然是“轻量级”的。也就是说，实例仍然可以在栈上，而且实例的大小和原始值类型基本一样，只是多了一个 <code>Boolean</code> 字段。注意 <code>Nullable</code> 的类型参数 <code>T</code> 被约束为<code>struct</code>。这是由于引用类型的变量本来就可以为 <code>null</code>，所以没必要再去照顾它。</p><p>现在，要在代码中使用一个可空的 <code>Int32</code>，就可以像下面这样写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Nullable&lt;Int32&gt; x = 5;
Nullable&lt;Int32&gt; y = null;
Console.WriteLine(&quot;x: HasValue={0}, Value={1}&quot;, x.HasValue, x.Value);
Console.WriteLine(&quot;y: HasValue={0}, Value={1}&quot;, y.HasValue, y.GetValueOrDefault());
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译并运行上述代码，将获得以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>x: HasValue=True, Value=5
y: HasValue=False, Value=0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_19-1-c-对可空值类型的支持" tabindex="-1"><a class="header-anchor" href="#_19-1-c-对可空值类型的支持"><span><a name="19_1">19.1 C#对可空值类型的支持</a></span></a></h2><p>C# 允许使用相当简单的语法初始化上述两个 <code>Nullable&lt;Int32&gt;</code> 变量 <code>x</code> 和 <code>y</code>。事实上，C# 开发团队的目的是将可空值类型集成到 C# 语言中，使之成为 “一等公民”。为此，C# 提供了更清新的语法来处理可空值类型。C# 允许用问号表示法来声明并初始化 <code>x</code> 和 <code>y</code> 变量：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Int32? x = 5;
Int32? y = null;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>在 C#中， <code>Int32?</code> 等价于 <code>Nullable&lt;Int32&gt;</code>。但 C# 在此基础上更进一步，允许开发人员在可空实例上执行转换和转型<sup>①</sup>。C# 还允许向可空实例应用操作符。以下代码对此进行了演示：</p><blockquote><p>① 作者在这里区分了转换和转型。例如，从 <code>Int32</code> 的可空版本到非可空版本(或相反)，称为“转换”。但是，涉及不同基元类型的转换，就称为“转型”或“强制类型转换”。 ———— 译注</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void ConversionsAndCasting() {
    // 从非可空 Int32 隐式转换为 Nullable&lt;Int32&gt;
    Int32? a = 5;

    // 从 &#39;null&#39; 隐式转换为 Nullable&lt;Int32&gt;
    Int32? b = null;

    // 从 Nullable&lt;Int32&gt; 显式转换为非可空 Int32
    Int32 c = (Int32) a;

    // 在可空基元类型之间转型
    Double? d = 5;      // Int32 转型为 Double? (d 是 double 值 5.0)
    Double? e = b;      // Int32?转型为 Double? (e 是 null)
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>C# 还允许向可空实例应用操作符，例如：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void Operators() {
    Int32? a = 5;
    Int32? b = null;

    // 一元操作符 (+ ++ - -- ! ~)
    a++;            // a = 6
    b = -b;         // b = null

    // 二元操作符 (+ - * / % &amp; | ^ &lt;&lt; &gt;&gt;)
    a = a + 3;      // a = 9;
    b = b * 3;      // b = null;

    // 相等性操作符 ((== !=)
    if (a == null) { /* no */   } else { /* yes */ }
    if (b == null) { /* yes */  } else { /* no  */ }
    if (a != b) { /* yes */     } else { /* no  */ }

    // 比较操作符 (&lt; &gt; &lt;= &gt;=)
    if (a &lt; b)          { /* no */ } else { /* yes */ }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下面总结了 C# 如何解析操作符。</p><ul><li><p><strong>一元操作符(<code>+</code>，<code>++</code>，<code>-</code>，<code>--</code>，<code>!</code>，<code>~</code>)</strong> 操作数是 <code>null</code>，结果就是 <code>null</code>。</p></li><li><p><strong>二元操作符(<code>+</code>，<code>-</code>，<code>*</code>，<code>/</code>，<code>%</code>，<code>&amp;</code>，<code>|</code>，<code>^</code>，<code>&lt;&lt;</code>，<code>&gt;&gt;</code>))</strong> 两个操作数任何一个是 <code>null</code>，结果就是 <code>null</code>。但有一个例外，它发生在将<code>&amp;</code>和<code>|</code>操作符应用于 <code>Boolean?</code>操作数的时候。在这种情况下，两个操作符的行为和 SQL 的三值逻辑一样。对于这两个操作符，如果两个操作数都不是<code>null</code>，那么操作符和平常一样工作。如果连个操作数都是<code>null</code>，结果就是<code>null</code>。特殊行为仅在其中之一为<code>null</code>时发生。下表列出了针对操作数的<code>true</code>，<code>false</code> 和 <code>null</code>三个值的各种组合，两个操作符的求值情况。</p><table><thead><tr><th style="text-align:center;">操作数 1 → <br> 操作数2 ↑</th><th style="text-align:center;">true</th><th style="text-align:center;">false</th><th style="text-align:center;">null</th></tr></thead><tbody><tr><td style="text-align:center;">true</td><td style="text-align:center;">&amp; = true <br>| =ture</td><td style="text-align:center;">&amp; = false <br> | = true</td><td style="text-align:center;">&amp; = null <br> | = true</td></tr><tr><td style="text-align:center;">false</td><td style="text-align:center;">&amp; = false <br> | = true</td><td style="text-align:center;">&amp; = false <br> | = false</td><td style="text-align:center;">&amp; = false <br> | = null</td></tr><tr><td style="text-align:center;">null</td><td style="text-align:center;">&amp; = null <br> | = true</td><td style="text-align:center;">&amp; = false <br>| = null</td><td style="text-align:center;">&amp; = null <br>| = null</td></tr></tbody></table></li><li><p><strong>相等性操作符(<code>==</code>，<code>!=</code>)</strong> 两个操作数都是 <code>null</code>，两者相等。一个操作数是 <code>null</code>，两者不相等。两个操作数都不是 <code>null</code>，就比较值来判断是否相等。</p></li><li><p><strong>关系操作符(<code>&lt;</code>，<code>&gt;</code>，<code>&lt;=</code>，<code>&gt;=</code>)</strong> 两个操作数任何一个是 <code>null</code>，结果就是 <code>false</code>。两个操作数都不是 <code>null</code>，就比较值。</p></li></ul><p>注意，操作可空实例会生成大量代码。例如以下方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Int32? NullableCodeSize(Int32? a, Int32? b) {
    return (a + b);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译这个方法会生成相当多的 IL 代码，而且操作可空类型的速度慢于非可空类型。编译器生成的 IL 代码等价于以下 C# 代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Nullable&lt;Int32&gt; NullableCodeSize(Nullable&lt;Int32&gt; a, Nullable&lt;Int32&gt; b) {
    Nullable&lt;Int32&gt; nullable1 = a;
    Nullable&lt;Int32&gt; nullable2 = a;
    if (!(nullable1.HasValue &amp; nullable2.HasValue)) {
        return new Nullable&lt;Int32&gt;();
    }
    return new Nullable&gt;&lt;Int32&gt; (nullable1.GetvalueOrDefault() + nullable2.GetValueOrDefault());
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后要说明的是，可定义自己的值类型来重载上述各种操作符符。8.4 节 “操作符重载方法”已对此进行了讨论。使用自己的值类型的可空实例，编译器能正确识别它并调用你重载的操作符(方法)。以下 <code>Point</code> 值类型重载了 <code>==</code> 和 <code>!=</code> 操作符：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

internal struct Point {
    private Int32 m_x, m_y;
    public Point(Int32 x, Int32 y) { m_x = x; m_y = y; }

    public static Boolean operator == (Point p1, Point p2) {
        return (p1.m_x == p2.m_x) &amp;&amp; (p1.m_y == p2.m_y);
    }

    public static Boolean operator != (Point p1, Point p2) {
        return !(p1 == p2);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后可以使用 <code>Point</code> 类型的可空实例，编译器能自动调用你重载的操作符(方法):</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Are points equal? False
Are points not equal? True
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_19-2-c-的空接合操作符" tabindex="-1"><a class="header-anchor" href="#_19-2-c-的空接合操作符"><span><a name="19_2">19.2 C#的空接合操作符</a></span></a></h2><p>C# 提供了一个“空接合操作符”(null-coalescing operator)，即<code>??</code>操作符，它要获取两个操作数。假如左边的操作数不为 <code>null</code>，就返回这个操作数的值。如果左边的操作数为 <code>null</code>，就返回右边的操作数的值。利用空接合操作符，可以方便地设置变量的默认值。</p><p>空接合操作符的一个好处在于，它既能用于引用类型，也能用于可空值类型。以下代码演示了如何使用 <code>??</code> 操作符：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void NullCoalescingOperator() {
    Int32? b = null;

    // 下面这行等价于：
    // x = (b.HasValue) ? b.Value : 123
    Int32 x = b ?? 123;
    Console.WriteLine(x);           // &quot;123&quot;

    // 下面这行等价于：
    // String temp = GetFilename();
    // filename = (temp != null) ? temp : &quot;Untitled&quot;;
    String filename = GetFilename() ?? &quot;Untitled&quot;;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>有人争辩说 <code>??</code> 操作符不过是 <code>?:</code>操作符的“语法糖”而已，所以C#编译器团队不应该将这个操作符添加到语言中。实际上，<code>??</code> 提供了重大的语法上的改进。第一个改进是<code>??</code>操作符能更好地支持表达式：</p><p><code>Func&lt;String&gt; f = () =&gt; SomeMthod() ?? &quot;Untitled&quot;;</code></p><p>相比下一行代码，上述代码更容易阅读和理解。下面这行代码要求进行变量赋值，而且用一个语句还搞不定：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Func&lt;String&gt; f = () =&gt; { var temp = SomeMethod();
    return temp != null ? temp : &quot;Untitled&quot;; };
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>第二个改进是 <code>??</code> 在复合情形中更好用。例如，下面这行代码：</p><p><code>String s = SomeMethod1() ?? SomeMethod2() ?? &quot;Untitled&quot;;</code></p><p>它比下面这一堆代码更容易阅读和理解：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>String s;
var sm1 = SomeMethod1();
if (sm1 != null ) s = sm1;
else {
    var sm2 = SomeMethod2();
    if (sm2 != null ) s = sm2;
    else s = &quot;Untitled&quot;;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_19-3-clr-对可空值类型的特殊支持" tabindex="-1"><a class="header-anchor" href="#_19-3-clr-对可空值类型的特殊支持"><span><a name="19_3">19.3 CLR 对可空值类型的特殊支持</a></span></a></h2><p>CLR 内建对可空值类型的支持。这个特殊的支持是针对装箱、拆箱、调用 <code>GetType</code> 和调用接口方法提供的，它使可空类型能无缝地集成到 CLR 中，而且使它们具有更自然的行为，更符合大多数开发人员的预期。下面深入研究一下 CLR 对可空类型的特殊支持。</p><h3 id="_19-3-1-可空值类型的装箱" tabindex="-1"><a class="header-anchor" href="#_19-3-1-可空值类型的装箱"><span>19.3.1 可空值类型的装箱</span></a></h3><p>假定有一个逻辑设为 <code>null</code> 的 <code>Nullable&lt;Int32&gt;</code> 变量。将其传给期待一个 <code>Object</code> 的方法，就必须对其进行装箱，并将对已装箱<code>Nullable&lt;Int32&gt;</code> 的引用传给方法。但对表面上为 <code>null</code>的值进行装箱不符合直觉————即使<code>Nullable&lt;Int32&gt;</code>变量本身非 <code>null</code>，它只是在逻辑上包含了 <code>null</code>。为了解决这个问题，CLR 会在装箱可空变量时执行一些特殊代码，从表面上维持可空类型的“一等公民”地位。</p><p>具体地说，当 CLR 对 <code>Nullable&lt;T&gt;</code> 实例进行装箱时，会检查它是否为 <code>null</code>。如果是，CLR 不装箱任何东西，直接返回 <code>null</code>。如果可空实例不为 <code>null</code>，CLR 从可空实例中取出值并进行装箱。也就是说，一个值为 5 的 <code>Nullable&lt;Int32&gt;</code> 会装箱成值为 5 的已装箱 <code>Int32</code>。以下代码演示了这一行为：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 对 Nullable&lt;T&gt; 进行装箱，要么返回 null，要么返回一个已装箱的 T
Int32？ n = null;
Object o = n;       // o 为 null
Console.WriteLine(&quot;o is null={0}&quot;, o == null);   // &quot;True&quot;

n = 5;
o = n;   // o 引用一个已装箱的 Int32
Console.WriteLine(&quot;o&#39;s type={0}&quot;, o.GetType()); // &quot;System.Int32&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_19-3-2-可空值类型的拆箱" tabindex="-1"><a class="header-anchor" href="#_19-3-2-可空值类型的拆箱"><span>19.3.2 可空值类型的拆箱</span></a></h3><p>CLR 允许将已装箱的值类型 <code>T</code> 拆箱为一个 <code>T</code> 或者 <code>Nullable&lt;T&gt;</code>。如果对已装箱类型的引用是 <code>null</code>，而且要把它拆箱为一个 <code>Nullable&lt;T&gt;</code>，那么 CLR 会将 <code>Nullable&lt;T&gt;</code>的值设为 <code>null</code>。以下代码演示了这个行为：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建已装箱的 Int32
Object o = 5;

// 
Int32? a = (Int32?) o;  // a = 5
Int32 b = (Int32) o;    // b = 5

// 创建初始化为 null 的一个引用
o = null;

// 把它“拆箱”为一个 Nullable&lt;Int32&gt; 和一个 Int32
a = (Int32?) o;     // a = null
b = (Int32) o;      // NullReferenceException
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_19-3-3-通过可空值类型调用-gettype" tabindex="-1"><a class="header-anchor" href="#_19-3-3-通过可空值类型调用-gettype"><span>19.3.3 通过可空值类型调用 GetType</span></a></h3><p>在 <code>Nullable&lt;T&gt;</code> 对象上调用 <code>GetType</code>，CLR实际会“撒谎”说类型是 <code>T</code>，而不是 <code>Nullable&lt;T&gt;</code>。以下代码演示了这一行为：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Int32? x = 5;
// 下面这行会显示 &quot;System.Int32&quot;，而非“System.Nullable&lt;Int32&gt;”
Console.WriteLine(x.GetType());
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_19-3-4-通过可空值类型调用接口方法" tabindex="-1"><a class="header-anchor" href="#_19-3-4-通过可空值类型调用接口方法"><span>19.3.4 通过可空值类型调用接口方法</span></a></h3><p>以下代码将 <code>Nullable&lt;Int32&gt;</code> 类型的变量 <code>n</code> 转型为接口类型 <code>IComparable&lt;Int32&gt;</code>。<code>Nullable&lt;T&gt;</code> 不像 <code>Int32</code> 那样实现了 <code>IComparable&lt;Int32&gt;</code> 接口，但 C# 编译器允许这样的代码通过编译，而且 CLR 的校验器也认为这样的代码可验证，从而允许使用更简洁的语法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Int32? n = 5;
Int32 result = ((IComparable) n).CompareTo(5);      // 能顺利编译和运行
Console.WriteLine(result);                          // 0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>假如 CLR 不提供这一特殊支持，要在可空值类型上调用接口方法，就必须写很繁琐的代码。首先要转型为已拆箱的值类型，然后才能转型为接口以出发调用：</p><p><code>Int32 result = ((IComparable) (Int32) n).CompareTo(5); // 很繁琐</code></p>`,60),s=[a];function t(c,u){return l(),n("div",null,s)}const o=e(i,[["render",t],["__file","ch19_NullableValueTypes.html.vue"]]),v=JSON.parse('{"path":"/zh/chapters/ch19_NullableValueTypes.html","title":"第 19 章 可空值类型","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"19.1 C#对可空值类型的支持","slug":"_19-1-c-对可空值类型的支持","link":"#_19-1-c-对可空值类型的支持","children":[]},{"level":2,"title":"19.2 C#的空接合操作符","slug":"_19-2-c-的空接合操作符","link":"#_19-2-c-的空接合操作符","children":[]},{"level":2,"title":"19.3 CLR 对可空值类型的特殊支持","slug":"_19-3-clr-对可空值类型的特殊支持","link":"#_19-3-clr-对可空值类型的特殊支持","children":[{"level":3,"title":"19.3.1 可空值类型的装箱","slug":"_19-3-1-可空值类型的装箱","link":"#_19-3-1-可空值类型的装箱","children":[]},{"level":3,"title":"19.3.2 可空值类型的拆箱","slug":"_19-3-2-可空值类型的拆箱","link":"#_19-3-2-可空值类型的拆箱","children":[]},{"level":3,"title":"19.3.3 通过可空值类型调用 GetType","slug":"_19-3-3-通过可空值类型调用-gettype","link":"#_19-3-3-通过可空值类型调用-gettype","children":[]},{"level":3,"title":"19.3.4 通过可空值类型调用接口方法","slug":"_19-3-4-通过可空值类型调用接口方法","link":"#_19-3-4-通过可空值类型调用接口方法","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/ch19_NullableValueTypes.md"}');export{o as comp,v as data};
