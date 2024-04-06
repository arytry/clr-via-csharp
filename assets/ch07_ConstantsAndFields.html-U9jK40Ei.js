import{_ as e,o as n,c as d,e as i}from"./app-IxoMmWNN.js";const l={},a=i(`<h1 id="第-7-章-常量和字段" tabindex="-1"><a class="header-anchor" href="#第-7-章-常量和字段"><span>第 7 章 常量和字段</span></a></h1><p>本章内容：</p><ul><li><a href="#7_1">常量</a></li><li><a href="#7_2">字段</a></li></ul><p>本章介绍如何向类型添加数据成员，具体就是常量和字段。</p><h2 id="_7-1-常量" tabindex="-1"><a class="header-anchor" href="#_7-1-常量"><span><a name="7_1">7.1 常量</a></span></a></h2><p><strong>常量</strong>是值从不变化的符号。定义常量符号时，它的值必须能在编译时确定。确定后，编译器将常量值保存到程序集元数据中。这意味着只能定义编译器识别的基元类型的常量。在 C# 中，以下类型是基元类型，可用于定义常量：<code>Boolean</code>，<code>Char</code>，<code>Byte</code>，<code>SByte</code>，<code>Int16</code>，<code>UInt16</code>，<code>Int32</code>，<code>Uint32</code>，<code>Int64</code>，<code>UInt64</code>，<code>Single</code>，<code>Double</code>，<code>Decimal</code>和<code>String</code>。然而，C# 也允许定义非基元类型的常量变量(constant variable)，前提是把值设为<code>null</code>:</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public sealed class SomeType {
    // SomeType 不是基元类型，但 C# 允许
    // 值为 null 的这种类型的常量变量
    public const SomeType Empty = null;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于常量值从不变化，所以常量总是被视为类型定义的一部分。换言之，常量总是被视为静态成员，而不是实例成员。定义常量将导致创建元数据。</p><p>代码引用常量符号时，编译器在定义常量的程序集的元数据中查找该符号，提取常量的值，将值签入生成的 IL 代码中。由于常量的值直接嵌入代码，所以在运行时不需要为常量分配任何内存。除此之外，不能获取常量的地址，也不能以传引用的方式传递常量。这些限制意味着常量不能很好地支持跨程序集的版本控制。因此，只有确定一个符号的值从不变化才应定义常量。(将 <code>MaxInt6</code>定义为<code>32767</code>就是一个很好的例子)。下面来演示我刚才所说的内容。首先，请输入以下代码，并将其编译成一个 DLL 程序集。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

pulbic sealed class SomeLibraryType {
    // 注意：C# 不允许为常量指定 static 关键字，
    // 因为常量总是隐式为 static
    public const Int32 MaxEntriesInList = 50;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接着用以下代码生成一个应用程序程序集：</p><blockquote><p>用 csc.exe 的 <code>/r</code> 开关来引用刚才的.dll 文件。</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public sealed class Program {
    public static void Main() {
        Console.WriteLine(&quot;Max entries supported in list: &quot; + SomeLibraryType.MaxEntriesInList);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意代码引用了在 <code>SomeLibraryType</code> 类中定义的 <code>MaxEntriesInList</code> 常量。编译器生成引用程序代码时，会注意到 <code>MaxEntriesInList</code> 是值为 <code>50</code> 的常量符号，所以会将 <code>Int32</code> 值 <code>50</code> 嵌入应用程序的 IL 代码，如下所示。事实上 ，在生成了应用程序程序集之后，运行时根本不会加载 DLL 程序集，可以把它从磁盘上删除。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>.method public hidebysig static void Main() cil managed 
{
    entrypoint 
    // Code size            25 (0x19)

    .maxstack 8 
    IL_0000: nop 
    IL_0001: ldstr          &quot;Max entries supported in list: &quot;
    IL_0006: ldc.i4.s       50
    IL_0008: box            [mscorlib]System.Int32
    IL_000d: call           string [mscorlib]System.String::Concat(object, object)
    IL_0012: call           void [mscorlib]System.Console::WriteLine(string)
    IL_0017: nop 
    IL_0018: ret
} // end of method Program::Main
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个例子清楚地展示了版本控制问题。如果开发人员将常量 <code>MaxEntriesInList</code> 的值更改为 <code>1000</code>，并且只是重写生成 DLL <code>1000</code>，并且只是重写生成 DLL 程序集，那么应用程序集不受任何影响。应用程序集不受任何影响。应用程序要获得新值，也必须重新编译。如果希望在运行时从一个程序集中提取另一个程序集中的值，那么不应该使用常量，而应该使用 <code>readonly</code> 字段，详情参见下一节。</p><h2 id="_7-2-字段" tabindex="-1"><a class="header-anchor" href="#_7-2-字段"><span><a name="7_2">7.2 字段</a></span></a></h2><p><strong>字段</strong>是一种数据成员，其中容纳了一个值类型的实例或者对一个引用类型的引用。表 7-1 总结了可应用于字段的修饰符。</p><p>表 7-1 字段修饰符</p><table><thead><tr><th style="text-align:center;">CLR 术语</th><th style="text-align:center;">C#术语</th><th style="text-align:center;">说明</th></tr></thead><tbody><tr><td style="text-align:center;">Static</td><td style="text-align:center;"><code>static</code></td><td style="text-align:center;">这种字段是类型状态的一部分，而不是对象状态的一部分</td></tr><tr><td style="text-align:center;">Instance</td><td style="text-align:center;">(默认)</td><td style="text-align:center;">这种字段与类型的一个实例关联，而不是类型本身关联</td></tr><tr><td style="text-align:center;">InitOnly</td><td style="text-align:center;"><code>readonly</code></td><td style="text-align:center;">这种字段只能由一个构造器方法中的代码写入</td></tr><tr><td style="text-align:center;">Volatile</td><td style="text-align:center;"><code>volatile</code></td><td style="text-align:center;">编译器、CLR 和硬件不会对访问这种字段的代码执行“线程不安全”的优化措施。只有以下类型才能标记为 <code>volatile</code>：所有引用类型，<code>Single</code>，<code>Boolean</code>，<code>Byte</code>，<code>SBtype</code>，<code>Int16</code>，<code>UInt16</code>，<code>Int32</code>，<code>UInt32</code>，<code>Char</code>，以及基础类型为<code>Byte</code>，<code>SByte</code>，<code>Int16</code>，<code>UInt16</code>，<code>Int32</code>或<code>UInt32</code>的所有枚举类型。<code>volatile</code> 字段将在第 29 章“基元线程同步构造”讨论</td></tr></tbody></table><blockquote><p>文档将 volatile 翻译为“可变”。其实它是“短暂存在”、“易变”的意思，因为可能有多个线程想都对这种字段进行修改，所以“易变”或“易失”更佳。——译注</p></blockquote><p>如表 7-1 所示， CLR 支持类型(静态)字段和实例(非静态)字段。如果是类型字段，容纳字段数据所需的动态内存是在类型对象中分配的，而类型对象是在类型加载到一个 <code>AppDomain</code> 时创建的(参见第 22 章 “CLR 寄宿和 AppDomain”)。那么，什么时候将类型加载到一个 <code>AppDomain</code> 中呢？这通常是在引用了该类型的任何方法首次进行 JIT 斌阿姨的时候，如果是实例字段，容纳字段数据所需的动态内存是在构造类型的实例时分配的。</p><p>由于字段存储在动态内存中，所以它们的值在运行时才能获取。字段还解决了常量存在的版本控制问题。此外，字段可以是任何数据类型，不像常量那样仅仅局限于编译器内置的基元类型。</p><p>CLR 支持 <code>readonly</code> 字段和 <code>read/write</code> 字段。大多数字段都是 <code>read/write</code>字段，意味着在代码执行过程中，字段值可多次改变。但<code>readonly</code> 字段只能在构造器方法中写入。(构造器方法只能调用一次，即对象首次创建时。)编译器和验证机制确保 <code>readonly</code> 字段不会被构造器以外的任何方法写入。注意，可利用反射来修改<code>readonly</code>字段。</p><p>现在，让我们以 7.1 节“常量”的代码为例，使用一个静态 <code>readonly</code> 字段来修正版本控制问题。下面是新版本 DLL 程序集的代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public sealed class SomeLibraryType {
    // 字段和类型关联必须使用 static 关键字
    public static readonly Int32 MaxEntriesInList = 50;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这是唯一需要修改的，应用程序的代码不必修改。但是，为了观察新的行为，必须重新生成它。当应用程序的 <code>Main</code> 方法运行时，CLR 将加载DLL 程序集(现在运行时需要该程序集了)，并从分配给它的动态内存中提取 <code>MaxEntriesInList</code> 字段的值。当然，该值是 <code>50</code>。假设 DLL 程序集的开发人员将 <code>50</code> 改为 <code>1000</code>，并重新生成程序集，当应用程序代码重新执行时，它将自定提取字段的新值 <code>1000</code>。应用程序不需要重新生成，可以直接运行(尽管性能会受到一点影响)。要注意的是，当前假定的是 DLL 程序集的新版本没有进行强命名，而且应用程序的版本策略是让CLR 加载这个新版本。</p><p>下例演示了如何定义一个与类型本身关联的 <code>readonly</code> 静态字段。还定义了 <code>read/write</code> 静态字段，以及 <code>readonly</code> 和 <code>read/write</code> 实例字段。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class SomeType {
    // 这是一个静态 readonly 字段：在运行时对这个类进行初始化时，
    // 它的值会被计算并存储到内存中
    public static readonly Random s_random = new Random();

    // 这是一个静态 read/write 字段
    private static Int32 s_numberOfWrites = 0;

    // 这是一个实例 readonly 字段
    public readonly String Pathname = &quot;Untitled&quot;;

    // 这是一个实例 read/write 字段
    private System.IO.FileStream m_fs;

    public SomeType(String pathname) {
        // 改行修改只读字段 Pathname，
        // 在构造器中可以这样做
        this.Pathname = pathname;
    }

    public String DoSomething() {
        // 该行读写静态 read/write 字段
        s_numberOfWrites = s_numberOfWrites + 1;

        // 改行读取 readonly 实例字段
        return Pathname;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，许多字段都是内联初始化的。C#允许使用这种简便的内联初始化语法来初始化类的常量、<code>read/write</code> 字段和 <code>readonly</code> 字段。第 8 章“方法”会讲到，C# 实际是在构造器中对字段进行初始化的，字段的内联初始化只是一种语法上的简化。另外，在 C# 中初始化字段时，如果使用内联语法，而不是在构造器中赋值，有一些性能问题需要考虑。这些性能问题也将在第 8 章讨论。</p><blockquote><blockquote><p>内联(inline)初始化是指在代码中直接赋值来初始化，而不是将对构造器的调用写出来。——译注</p></blockquote></blockquote><blockquote><p>重要提示 当某个字段是引用类型，并且该字段被标记为 <code>readonly</code> 时，不可改变的是引用，而非字段引用的对象。以下代码对此进行了演示：</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class AType {
    // InvalidChars 总是引用同一个数组对象
    public static readonly Char[] InvalidChars = new Char[] { &#39;A&#39;, &#39;B&#39;, &#39;C&#39; };
}

public sealed class AnotherType {
    public static void M() {
        // 下面三行代码是合法的，可通过编译，并可成功
        // 修改 InvalidChars 数组中的字符
        AType.InvalidChars[0] = &#39;X&#39;;
        AType.InvalidChars[1] = &#39;Y&#39;;
        AType.InvalidChars[2] = &#39;Z&#39;;

        // 下一行代码是非法的，无法通过编译，
        // 因为不能让 InvalidChars 引用别的什么东西
        // A static readonly field cannot be assigned to(except in a static constructor or a variable initializer)
        AType.InvalidChars = new Char[] { &#39;X&#39;, &#39;Y&#39;, &#39;Z&#39; };
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,33),s=[a];function c(t,o){return n(),d("div",null,s)}const v=e(l,[["render",c],["__file","ch07_ConstantsAndFields.html.vue"]]),u=JSON.parse('{"path":"/chapters/ch07_ConstantsAndFields.html","title":"第 7 章 常量和字段","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"7.1 常量","slug":"_7-1-常量","link":"#_7-1-常量","children":[]},{"level":2,"title":"7.2 字段","slug":"_7-2-字段","link":"#_7-2-字段","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"chapters/ch07_ConstantsAndFields.md"}');export{v as comp,u as data};
