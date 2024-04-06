import{_ as e,o as i,c as d,e as n}from"./app-IxoMmWNN.js";const c={},l=n(`<h1 id="第-9-章-参数" tabindex="-1"><a class="header-anchor" href="#第-9-章-参数"><span>第 9 章 参数</span></a></h1><p>本章内容：</p><ul><li><a href="#9_1">可选参数和命名参数</a></li><li><a href="#9_2">隐式类型的局部变量</a></li><li><a href="#9_3">以传引用的方式向方法传递参数</a></li><li><a href="#9_4">向方法传递可变数量的参数</a></li><li><a href="#9_5">参数和返回类型的设计规范</a></li><li><a href="#9_6">常量性</a></li></ul><p>本章重点在于向方法传递的各种方式，包括如何可选地指定参数，按名称指定参数，按名称指定参数，按引用传递参数，以及如何定义方法来接受可变数量的参数。</p><h2 id="_9-1-可选参数和命名参数" tabindex="-1"><a class="header-anchor" href="#_9-1-可选参数和命名参数"><span><a name="9_1">9.1 可选参数和命名参数</a></span></a></h2><p>设计方法的参数时，可为部分或全部参数分配默认值。然后，调用这些方法的代码可以选择不提供部分实参，使用其默认值。此外，调用方法时刻通过指定参数名称来传递参数。以下代码演示了可选参数和命名参数的用法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
public static class Program {
    private static Int32 s_n = 0;

    private static void M(Int32 x = 9, String s = &quot;A&quot;, 
        DateTime dt = default(DateTime), Guid guid = new Guid()) {

        Console.WriteLine(&quot;x={0}, s={1}, dt={2}, guid={3}&quot;, x, s, dt, guid);
    }

    public static void Main() {
        // 1. 等同于M(9, &quot;A&quot;, default(DateTime), new Guid());
        M();

        // 2. 等同于M(8, &quot;X&quot;, default(DateTime), new Guid());
        M(8, &quot;X&quot;);

        // 3. 等同于M(5, &quot;A&quot;, default(DateTime),Guid.NewGuid());
        M(5, guid: Guid.NewGuid(), dt: DateTime.Now);

        // 4. 等同于M(0, &quot;1&quot;, default(DateTime), new Guid());
        M(s_n++, s_n++.ToString());

        // 5. 等同于以下两行代码：
        // String t1 = &quot;2&quot;; Int32 t2 = 3;
        // M(t2, t1, default(DateTime), new Guid());
        M(s: (s_n++).ToString(), x: s_n++);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行程序得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>x=9, s=A, dt=1/1/0001 12:00:00 AM, guid=00000000-0000-0000-0000-000000000000
x=8, s=X, dt=1/1/0001 12:00:00 AM, guid=00000000-0000-0000-0000-000000000000
x=5, s=A, dt=1/1/2021 3:34:58 PM, guid=372cba1a-01db-4570-945e-33e066882919
x=0, s=1, dt=1/1/0001 12:00:00 AM, guid=00000000-0000-0000-0000-000000000000
x=3, s=2, dt=1/1/0001 12:00:00 AM, guid=00000000-0000-0000-0000-000000000000
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如你所见，如果调用时省略了一个实参，C#编译器会自动嵌入参数的默认值。对 <code>M</code> 的第 3 个和第 5 个调用使用了C# 的命名参数功能。在这两个调用中，我为 <code>x</code> 显式传递了值，并指出要为名为 <code>guid</code> 和 <code>dt</code> 的参数传递实参。</p><p>向方法传递实参时，编译器按从做到右的顺序对实参进行求值。在对 <code>M</code> 的第 4 个调用中，<code>s_n</code> 的当前值<code>(0)</code>传给<code>x</code>，然后<code>s_n</code>递增。随后，<code>s_n</code> 的当前值<code>(1)</code>作为字符串传给<code>s</code>，然后继续递增到<code>2</code>。使用命名参数传递实参时，编译器仍然按从左到右的顺序对实参进行求值。在对<code>M</code> 的第5 个调用中，<code>s_n</code>中当前值<code>(2)</code>被转换成字符串，并保存到编译器创建的临时变量<code>(t1)</code>中。接着，<code>s_n</code>递增到<code>3</code>，这个值保存到编译器创建的另一个临时变量<code>(t2)</code>中。然后，<code>s_n</code>继续递增到<code>4</code>。最后在调用<code>M</code>时，向它传递的实参依次是<code>t2</code>，<code>t1</code>，一个默认<code>DateTime</code>和一个新建的<code>Guid</code>。</p><h3 id="_9-1-1-规则和原则" tabindex="-1"><a class="header-anchor" href="#_9-1-1-规则和原则"><span>9.1.1 规则和原则</span></a></h3><p>如果在方法中为部分参数指定了默认值，请注意以下附加的规则和原则。</p><ul><li><p>可为方法、构造器方法和有参属性(C#索引器)的参数指定默认值。还可以属于委托定义一部分的参数指定默认值。以后调用该委托类型的变量时可省略实参来接受默认值。</p></li><li><p>有默认值的参数必须放在没有默认值的所有参数之后。换言之，一旦定义了有默认值的参数，它右边的所有参数也必须有默认值。例如在前面的<code>M</code>方法定义中，如果删除<code>s</code>的默认值<code>(&quot;A&quot;)</code>，就会出现编译错误。但这个规则有一个例外：“参数数组”<sup>①</sup>这种参数必须放在所有参数(包括有默认值的这些)之后，而且数组本身不能有一个默认值。</p></li></ul><blockquote><p>① 在本章后面 9.4 节“向方法传递可变数量的参数”详细讨论。</p></blockquote><ul><li><p>默认值必须是编译时能确定的常量值。那么，哪些参数能设置默认值？这些参数的类型可以是C# 认定的基元类型(参见第 5 章的表 5-1)。还包括枚举类型，以及能设为<code>null</code>的任何引用类型。值类型的参数可将默认值设为值类型的实例，并让它的所有字段都包含零值。可以用 <code>default</code> 关键字或者 <code>new</code>关键字来表达这个意思；两种语法将生成完全一致的 IL 代码。在 <code>M</code> 方法中设置 <code>dt</code>参数和 <code>guid</code> 参数的默认值时，分别使用的就是这两种语法。</p></li><li><p>不要重命名参数变量，否则任何调用者以传参数名的方式传递实参，它们的代码也必须修改。例如，在前面的<code>M</code>方法声明中，如果将<code>dt</code>变量重命名为<code>dateTime</code>，对<code>M</code>的第三个调用就会造成编译器显示以下消息：<code>error CS1739:&quot;M&quot;的最佳重载没有名为&quot;dt&quot;的参数</code>。</p></li><li><p>如果方法从模块外部调用，更改参数的默认值具有潜在的危险性。call site<sup>①</sup>在它的调用中嵌入默认值。如果以后更改了参数的默认值，但没有重新编译包含 call site 的代码，它在调用你的方法时就会传递旧的默认值。可考虑将默认值<code>0/null</code>作为哨兵值使用，从而指出默认行为。这样一来，即使更改了默认值，也不必重新编译包含了 call site 的全部代码。下面是一个例子：</p><blockquote><p>① call site 是发出调用的地方，可理解成调用了一个目标方法的表达式或代码行。 ——译注</p></blockquote></li></ul><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 不要这样做：
private static String MakePath(String filename = &quot;Untitled&quot;) {
    return String.Format(@&quot;C:\\{0}.txt&quot;, filename);
}

// 而要这样做：
private static String MakePath(String filename = null) {
    // 这里使用了空接合操作符(??)；详情参见第 19 章
    return String.Format(@&quot;C:\\{0}.txt&quot;, filename ?? &quot;Untitled&quot;);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>如果参数用<code>ref</code>或<code>out</code>关键字进行了标识，就不能设置默认值。因为没有办法为这些参数传递有意义的默认值。</li></ul><p>使用可选或命名参数调用方法时，还要注意以下附加的规则和原则。</p><ul><li><p>实参可按任意顺序传递，但命名实参只能出现在实参列表的尾部。</p></li><li><p>可按名称将实参传给没有默认值的参数，但所有必须的实参都必须传递(无论按位置还是按名称)，编译器才能编译代码。</p></li><li><p>C# 不允许省略逗号之间的实参，比如 <code>M(1, , DateTime.Now)</code>。因为这会造成对可读性的影响，程序员将被迫去数逗号。对于有默认值的参数，如果想省略它们的实参，以传参数名的方式传递实参即可。</p></li><li><p>如果参数要求 <code>ref/out</code>，为了以传参数名的方式传递实参，请使用下面这样的语法：</p></li></ul><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 方法声明
private static void M(ref Int32 x) { ... }

// 方法调用：
Int32 a = 5;
M(x: ref a);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 写 C# 代码和 Microsoft Office 的 COM 对象模型进行互操作性时，C# 的可选参数和命名参数功能非常好用。另外，调用 COM 组件时，如果是以传引用的方式传递实参，C# 还允许省略 <code>ref/out</code>，进一步简化编码。但如果调用的不是 COM 组件，C# 就要求必须向实参应用 <code>ref/out</code> 关键字。</p></blockquote><h3 id="_9-1-2-defaultparametervalueattribute-和-optionalattribute" tabindex="-1"><a class="header-anchor" href="#_9-1-2-defaultparametervalueattribute-和-optionalattribute"><span>9.1.2 <code>DefaultParameterValueAttribute</code> 和 <code>OptionalAttribute</code></span></a></h3><p>默认和可选参数的概念要不是 C# 特有的就好了！具有地说，我们希望程序员能用一种编程语言定义一个方法，指出哪些参数是可选的，以及它们的默认值是什么。然后，另一种语言的程序员可以调用该方法。要实现这一点，所选的编译器必须允许调用者忽略一些实参，还必须能确实这些实参的默认值。</p><p>在 C# 中，一旦为参数分配了默认值，编译器就会在内部向该参数应用定制特性<code>System.Runtime.InteropServices.OptionalAttribute</code>。该特性会在最终生成的文件的元数据中持久性地存储下来。此外，编译器向参数应用 <code>System.Runtime.InteropServices.DefaultParameterValueAttribute</code> 特性，并将该属性持久性存储到生成的文件的元数据中。然后，会向 <code>DefaultParameterValueAttribute</code> 的构造器传递你在源代码中指定的常量值。</p><p>之后，一旦编译器发现某个方法调用缺失了部分实参，就可以确定省略的是可选的实参，并从元数据中提取默认值，将值自动嵌入调用中。</p><h2 id="_9-2-隐式类型的局部变量" tabindex="-1"><a class="header-anchor" href="#_9-2-隐式类型的局部变量"><span><a name="9_2">9.2 隐式类型的局部变量</a></span></a></h2><p>C# 能根据初始化表达式的类型推断方法中的局部变量的类型，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static void ImplicitlyTypeLocalVariables() {
    var name = &quot;Jeff&quot;;
    ShowVariableType(name);                         // 显示：System.String

    // var n = null;                                // 错误，不能将 null 赋给隐式类型的局部变量
    var x = (String)null;                           // 可以这样写，但愿意不大
    ShowVariableType(x);                            // 显示：System.String

    var numbers = new Int32[] { 1, 2, 3, 4 };
    ShowVariableType(numbers);                      // 显示：System.Int32[]

    // 复杂类型能少打一些字
    var collection = new Dictionary&lt;String, Single&gt;() { { &quot;Grant&quot;, 4.0f } };

    // System.Collections.Generic.Dictionary\`2[System.String,System.Single]
    ShowVariableType(collection);

    foreach (var item in collection) {
        // 显示：System.Collections.Generic.KeyValuePair\`2[System.String,System.Single]
        ShowVariableType(item);
    }
}

private static void ShowVariableType&lt;T&gt;(T t) {
    Console.WriteLine(typeof(T));
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>ImplicitlyTypeLocalVariables</code> 方法中的第一行代码使用C#的<code>var</code>关键字引入了一个新的局部变量。为了确定<code>name</code>变量的类型，编译器要检查赋值操作符(=)右侧的表达式的类型。由于<code>&quot;Jeff&quot;</code>是字符串，所以编译器推断<code>name</code>的类型是<code>String</code>。为了证明编译器正确推断出类型，我写了<code>ShowVariableType</code> 方法。这个泛型方法推断它的实参的类型并在控制台上显示。为方便阅读，我在 <code>ImplicitlyTypeLocalVariables</code> 方法内以注释形式列出了每次调用<code>ShowVariableType</code>方法的显示结果。</p><p><code>ImplicitlyTypeLocalVariables</code> 方法内部的第二个赋值(被注释掉了)会产生编译错误<code>:error CS0815:无法将“&lt;null&gt;”赋予隐式类型的局部变量</code>。这是由于 <code>null</code> 能隐式转型为任何引用类型或可空值类型。因此，编译器不能推断它的确切类型。但在第三个赋值语句中，我证明只要显式指定了类型(本例是 <code>String</code>)，就可以将隐式类型的局部变量初始化为 <code>null</code>。这样做虽然可行，但意义不大，因为可以写 <code>String x = null;</code>来获得同样效果。</p><p>第 4 个赋值语句反映了 C# “隐式类型局部变量”功能的真正价值。没有这个功能，就不得不在赋值操作符的左右两侧指定 <code>Dictionary&lt;String, Single&gt;</code>。这不仅需要打更多的字，而且以后修改了集合类型或者任何泛型参数类型，赋值操作符两侧的代码也要修改。</p><p>在<code>foreach</code>循环中，我用<code>var</code>让编译器自动推断集合中的元素的类型。这证明了<code>var</code>能很好地用于<code>foreach</code>，<code>using</code>和<code>for</code>语句。还可在验证代码时利用它。例如，可以用方法的返回值初始化隐式类型的局部变量。开发方式时可以灵活更改返回类型。编译器能察觉到返回类型的变化，并自动更改变量的类型！当然，如果使用变量的代码没有相应地进行修改，还是像使用旧类型那样使用它，就可能无法编译。</p><p>在 Microsoft Visual Studio 中，鼠标放到 <code>var</code> 上将显示一条“工具提示”，指出编译器根据表达式推断出来的类型。在方法中使用匿名类型时必须用到C#的隐式类型局部变量，详情参见第 10 章“属性”。</p><p>不能用<code>var</code>声明方法的参数类型。原因显而易见，因为编译器必须根据在call site传递的实参来推断参数类型，但 call site 可能一个都没有，也可能有好多个<sup>①</sup>。除此之外，不能用<code>var</code>声明类型中的字段。C# 的这个限制是出于多方面的考虑。一个原因是字段可以被多个方法访问，而 C# 团队认为这个协定(变量的类型)应该显式陈述。另一个原因是一旦允许，匿名类型(第 10 章)就会泄露到方法的外部。</p><blockquote><p>① 要么一个类型都推断不出来，要么多个推断发生冲突。 ——译注</p></blockquote><blockquote><p>重要提示 不要混淆<code>dynamic</code>和<code>var</code>。用<code>var</code>声明局部变量只有一种简化语法，它要求编译器根据表达式推断具体数据类型。<code>var</code>关键字只能声明方法内部的局部变量，而<code>dynamic</code>关键字适用于局部变量、字段和参数。表达式不能转型为<code>var</code>，但能转型为 <code>dynamic</code>。必须显式初始化用 <code>var</code>声明的变量，但无需初始化用 <code>dynamic</code> 声明的变量。欲知 C# <code>dynamic</code> 类型的详情，请参见 5.5 节 “<code>dynamic</code>基元类型&quot;。</p></blockquote><h2 id="_9-3-以传引用的方式向方法传递参数" tabindex="-1"><a class="header-anchor" href="#_9-3-以传引用的方式向方法传递参数"><span><a name="9_3">9.3 以传引用的方式向方法传递参数</a></span></a></h2><p>CLR 默认所有方法参数都传值。传递引用类型的对象时，对象引用(或者说指向对象的指针)被传给方法。注意引用(或指针)本身是传值的，意味着方法能修改对象，而调用者能看到这些修改。对于值类型的实例，传给方法的是实例的一个副本，意味着方法将获得它专用的一个值类型实例副本，调用者中的实例不受影响。</p><blockquote><p>重要提示 在方法中，必须知道传递的每个参数是引用类型还是值类型，处理参数的代码显著有别。</p></blockquote><p>CLR 允许以传引用而非传值的方式传递参数。C# 用关键字 <code>out</code> 或 <code>ref</code> 支持这个功能。连个关键字都告诉C# 编译器生成元数据来指明该参数是传引用的。编译器将生成代码来传递参数的地址，而非传递参数本身。</p><p>CLR 不区分 <code>out</code> 和 <code>ref</code>，意味着无论用哪个关键字，都会生成相同的 IL 代码。另外，与那数据也几乎完全一致，只有一个 bit 除外，它用于记录声明方法时指定的是 <code>out</code> 还是 <code>ref</code>。但C# 编译器是将这两个关键字区别对待的，而且这个区别决定了由哪个方法负责初始化所引用的对象。如果方法的参数用 <code>out</code> 来标记，表明不指望调用者在调用方法之前初始化好了对象。被调用的方法不能读取参数的值，而且在返回前必须向这个值写入。相反，如果方法的参数用 <code>ref</code> 来标记，调用者就必须在调用该方法前初始化参数的值，被调用的方法可以读取值以及/或者向值写入。</p><p>对于 <code>out</code> 和 <code>ref</code>，引用类型和值类型的行为迥然有异。先看一看为值类型使用 <code>out</code> 和 <code>ref</code>:</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Program {
    public static void Main() {
        Int32 x;                    // x 没有初始化
        GetVal(out x);              // x 不必初始化
        Console.WriteLine(x);       // 显示 &quot;10&quot;
    }

    private static void GetVal(out Int32 v) {
        v = 10;             // 该方法必须初始化 V
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，<code>x</code> 在 <code>Main</code> 的栈桢<sup>①</sup>中声明。然后，<code>x</code>的地址传递给<code>GetVal</code>。<code>GetVal</code>的<code>v</code>是一个指针，指向<code>Main</code> 栈桢中的<code>Int32</code> 值。在<code>GetVal</code>内部，<code>v</code>指向的那个<code>Int32</code>被更改为<code>10</code>。<code>GetVal</code>返回时，<code>Main</code>的<code>x</code>就有了一个为<code>10</code>的值，控制台上回显示<code>10</code>。为大的值类型使用<code>out</code>，可提升代码的执行效率，因为它避免了在进行方法调用时复制值类型实例的字段。</p><blockquote><p>① 栈桢(stack frame)代表当前线程的调用栈中的一个方法调用。在执行线程的过程中进行的每个方法调用都会在调用栈中创建并压入一个 <code>StackFrame</code>。——译注</p></blockquote><p>下例用<code>ref</code>代替了<code>out</code>：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Progarm {
    public static void Main() {
        Int32 x = 5;                // x 已经初始化
        AddVal(ref x);              // x 必须初始化
        Console.WriteLine(x);       // 显示&quot;15&quot;
    }

    private static void AddVal(ref Int32 v) {
        v += 10;        // 该方法可使用 v 的已初始化的值
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，<code>x</code>也在<code>Main</code>的栈桢中声明，并初始化为<code>5</code>。然后，<code>x</code>的地址传给<code>AddVal</code>。<code>AddVal</code>的<code>v</code>是一个指针，指向<code>Main</code>栈桢中的<code>Int32</code>值。在<code>AddVal</code>内部，<code>v</code>指向的那个<code>Int32</code>要求必须是已经初始化的。因此，<code>AddVal</code>可在任何表达式中使用该初始值。<code>AddVal</code>还可更改这个值，新值会“返回”调用者。在本例中，<code>AddVal</code>将<code>10</code>加到初始值上。<code>AddVal</code>返回时，<code>Main</code>的<code>x</code>将包含<code>15</code>，这个值会在控制台上显示出来。</p><p>综上所述，从 IL 和 CLR 的角度看，<code>out</code>和<code>ref</code>是同一码事：都导致传递指向实例的一个指针。但从编译器的角度看，两者是有区别的。根据是<code>out</code>还是<code>ref</code>，编译器会按照不同的标准来验证你写的代码是否正确。以下代码试图向要求 <code>ref</code> 参数的方法传递未初始化的值，结果是编译器报告以下错误：<code>error CS0165：使用了未赋值的局部变量“x”</code>。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Program {
    public static void Main() {
        Int32 x;                   // x 内有初始化

        // 下一行代码无法通过编译，编译器将报告：
        // error CS1065：使用了未赋值的局部变量 &quot;x&quot;
        AddVal(ref x);

        Console.WriteLine(x);
    }

    private static void AddVal(ref Int32 v) {
        v += 10;                    // 该方法可使用 v 的已初始化的值
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>重要提示 经常有人问我，为什么 C# 要求必须在调用方法时指定 <code>out</code>或<code>ref</code>？毕竟，编译器知道被调用的方法需要的是<code>out</code>还是<code>ref</code>，所以应该能正确编译代码。事实上，C# 编译器确实能自动采用正确的操作。但 C# 语言的设计者认为调用者的方法是否需要对传递的变量值进行更改。</p></blockquote><blockquote><p>另外，CLR 允许根据使用的是 <code>out</code> 还是 <code>ref</code>参数对方法进行重载。例如，在 C# 中，以下代码是合法的，可以通过编译：</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Point {
    static void Add(Point p) { ... }
    static void Add(ref Point p) { ... }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>两个重载方法只有<code>out</code>还是<code>ref</code>的区别则不合法，因为两个签名的元数据形式完全相同。所以，不能在上述 <code>Point</code> 类型中再定义以下方法：</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>static void Add(out Point p) { ... }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p>试图在 <code>Point</code> 类型中添加这个 <code>Add</code> 方法，C# 编译器会显示以下消息：<code>CS0663:&quot;Add&quot; 不能定义仅在ref和out上有差别的重载方法</code>。</p></blockquote><p>为值类型使用 <code>out</code> 和 <code>ref</code>，效果等同与以传值的方式传递引用类型。对于值类型，<code>out</code> 和 <code>ref</code> 允许方法操纵单一的值类型实例。调用者必须为实例分配内存(中的内容)。对于引用类型，调用代码为一个指针分配内存(该指针指向一个引用类型的对象)，被调用者则操纵这个指针。正因为如此，仅当方法“返回”对“方法知道的一个对象”的引用时，为引用类型使用 <code>out</code> 和 <code>ref</code>才有意义。以下代码对此进行了演示。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.IO;

public sealed class Program {
    public static void Main() {
        FileStream fs;                  // fs 没初始化

        // 打开第一个待处理的文件
        StartProcessingFiles(out fs);

        // 如果有更多需要处理的文件，就继续
        for (; fs != null; ContinueProcssingFiles(ref fs)) {
            
            // 处理一个文件
            fs.Read(...);
        }
    }

    private static void StartProcessingFiles(out FileStream fs) {
        fs = new FileStream(...);          // fs 必须在这个方法中初始化
    }

    private static void ContinueProcssingFiles(ref FileStream fs) {
        fs.Close();                      // 关闭最后一个操作的文件

        // 打开下一个文件；如果没有更多的文件，就“返回” null
        if (noMoreFilesToProcess) fs = null;
        else fs = new FileStream (...);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看出，上述代码最大的不同就是定义了一些使用了<code>out</code>或<code>ref</code>引用类型参数的方法，并用这些方法构造对象。新对象的指针将“返回”给调用者。还要注意，<code>ContinueProcessingFiles</code> 方法可对传给它的对象进行处理，再“返回”一个新对象。之所以能这样做，是因为参数标记了 <code>ref</code>。上述代码可简化为以下形式：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.IO;

public sealed class Program {
    public static void Main() {
        FileStream fs = null;    // 初始化为 null (必要的操作)

        // 打开第一个待处理的文件
        ProcessFiles(ref fs);

        // 如果有更多需要处理的文件，就继续
        for (; fs != null; ProcessFiles(ref fs)) {
            
            // 处理文件
            fs.Read(...);
        }
    }

    private static void ProcessFiles(ref FileStream fs) {
        // 如果先前的文件是打开的，就将其关闭
        if (fs != null) fs.Close();   // 关闭最后一个操作的文件

        // 打开下一个文件；如果没有更多的文件，就“返回” null
        if (noMoreFilesToProcess) fs = null;
        else fs = new FileStream (...);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>下例演示了如何用 <code>ref</code> 关键字实现一个用于交换两个引用类型的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Swap(ref Object a, ref Object b) {
    Object t = b;
    b = a;
    a = t;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为了交换对两个 <code>String</code> 对象的引用，你或许以为代码能像下面这样写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void SomeMethod() {
    String s1 = &quot;Jeffrey&quot;;
    String s2 = &quot;Richter&quot;;

    Swap(ref s1, ref s2);
    Console.WriteLine(s1);  // 显示 “Richter”
    Console.WriteLine(s2);  // 显示 “Jeffrey”
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>但上述代码无法通过编译。问题在于，对于以传引用的方式传给方法的变量，它的类型必须与方法签名中声明的类型相同，换句话说，<code>Swap</code>预期的是两个<code>Object</code>引用，而不是两个<code>String</code>引用。为了交换两个<code>String</code>引用，代码要像下面这样写：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void SomeMethod() {
    String s1 = &quot;Jeffrey&quot;;
    String s2 = &quot;Richter&quot;;

    // 以传引用的方式传递的变量，
    // 必须和方法预期的匹配
    Object o1 = s1, o2 = s2;
    Swap(ref o1, ref o2);

    // 完事后再将 Object 转型为 String
    s1 = (String) o1;
    s2 = (String) o2;

    Console.WriteLine(s1);  // 显示&quot;Richter&quot;
    Console.WriteLine(s2);  // 显示&quot;Jeffrey&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个版本的 <code>SomeMethod</code> 可以通过编译，并会如预期的一样执行。传递的参数之所以必须与方法预期的参数匹配，原因是保障类型安全。以下代码(幸好不会编译)演示了类型安全型是如何被破坏的：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class SomeType {
    public Int32 m_val;
}

public sealed class Program {
    public static void Main() {
        SomeType st;

        // 以下代码将产生编译错误：
        // error CS1503:参数&quot;1&quot;:无法从&quot;out SomeType&quot;转换为“out object”
        GetAnObject(out st);

        Console.WriteLine(st.m_val);
    }

    private static void GetAnObject(out Object o) {
        o = new String(&#39;X&#39;, 100);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，<code>Main</code> 显然预期 <code>GetAnObject</code> 方法返回一个 <code>SomeType</code> 对象。但是，由于 <code>GetAnObject</code> 的签名表示的是一个 <code>Object</code>引用，所以 <code>GetAnObject</code> 可以将 <code>o</code> 初始化为任意类型的对象。在这个例子中，当 <code>GetAnObject</code> 返回 <code>Main</code> 时，<code>st</code>引用一个 <code>String</code>，显然不是 <code>SomeType</code> 对象，所以对 <code>Console.WriteLine</code> 的调用肯定会失败。幸好，C#编译器不会编译上述代码，因为<code>st</code>是一个<code>SomeType</code>引用，而<code>GetAnObject</code>要求的是一个<code>Object</code>引用。</p><p>可用泛型来修正这些方法，使它们按你的预期来运行。下面修正了前面的<code>Swap</code>方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Swap&lt;T&gt;(ref T a, ref T b) {
    T t = b;
    b = a;
    a = t;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重新了 <code>Swap</code>后，以下代码(和以前展示过的完全相同)就能通过编译了，而且能完美运行：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void SomeMethod() {
    String s1 = &quot;Jeffrey&quot;;
    String s2 = &quot;Richter&quot;;

    Swap(ref s1,ref s2);
    Console.WriteLine(s1);   // 显示 &quot;Richter&quot;
    Console.WriteLine(s2);   // 显示 &quot;Jeffrey&quot;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>要查看用泛型来解决这个问题的其他例子，请参见 <code>System.Threading</code> 命名空间中的 <code>Interlocked</code> 类的 <code>CompareExchange</code> 和 <code>Exchange</code> 方法。</p><h2 id="_9-4-向方法传递可变数量的参数" tabindex="-1"><a class="header-anchor" href="#_9-4-向方法传递可变数量的参数"><span><a name="9_4">9.4 向方法传递可变数量的参数</a></span></a></h2><p>方法有时需要获取可变数量的参数。例如，<code>System.String</code> 类型的一些方法允许连接任意数量的字符串，还有一些方法允许指定一组要统一格式化的字符串。</p><p>为了接受可变数量的参数，方法要像下面这样声明：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>static Int32 Add(params Int32[] values) {
    // 注意：如果愿意，可将 values 数组传给其他方法

    Int32 sum = 0;
    if (values != null) {
        for (Int32 x = 0; x &lt; values.Length; x++)
            sum += values[x];
    }    
    return sum;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了 <code>params</code> 关键字，这个方法的一切对你来说都应该是非常熟悉的。<code>params</code> 只能应用于方法签名中的最后一个参数。暂时忽略 <code>params</code> 关键字，可以明显地看出 <code>Add</code> 方法接受一个 <code>Int32</code> 类型的数组，然后遍历数组，将其中的<code>Int32</code>值加到一起，结果<code>sum</code>返回给调用者。</p><p>显然，可以像下面这样调用该方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    // 显示 &quot;15&quot;
    Console.WriteLine(Add(new Int32[] { 1, 2, 3, 4, 5 } ));
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>数组能用任意数量的一组元素来初始化，再传给 <code>Add</code> 方法进行处理。尽管上述代码可以通过编译并能正确运行，但并不好看。我们当然希望能像下面这样调用<code>Add</code>方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    // 显示 &quot;15&quot;
    Console.WriteLine(Add(1, 2, 3, 4, 5));
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于<code>params</code>关键字的存在，所以的确能这样做。<code>params</code>关键字告诉编译器向参数应用定制特性<code>System.ParamArrayAttribute</code>的一个实例。</p><p>C# 编译器检测到方法调用时，会先检查所有具有指定名称、同时参数没有应用<code>ParamArray</code>特性的方法。找到匹配的方法，就生成调用它所需的代码。没有找到，就直接检查应用了<code>ParamArray</code>特性的方法。找到匹配的方法，编译器先生成代码来构造一个数组，填充它的元素，再生成代码来调用所选的方法。</p><p>上个例子并没有定义可获取 5 个 <code>Int32</code> 兼容实参的 <code>Add</code>方法。但编译器发现在一个<code>Add</code>方法调用中传递了一组<code>Int32</code>值，而且有一个<code>Add</code>方法的<code>Int32</code>数组参数应用了<code>ParamArray</code>特性的方法。找到匹配的方法，编译器先生成代码来构造一个数组，填充它的元素，再生成代码来调用所选的方法。</p><p>只有方法的最后一个参数才可以用<code>params</code>关键字(<code>ParamArrayAttribute</code>)标记。另外，这个参数只能标识一维数组(任意类型)。可为这个参数传递<code>null</code>值，或传递对包含零个元素的一个数组的引用。以下<code>Add</code>调用能正常编译和运行，生成的结果是<code>0</code>(和预期的一样)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    // 以下两行都显示 “0”
    Console.WriteLine(Add());       // 向 Add 传递 new Int32[0]
    Console.WriteLine(Add(null));   // 向 Add 传递 null；更高效(因为不会分配数组)
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>前面所有例子都只是演示了如何写方法来获取任意数量的 <code>Int32</code> 参数。那么，如何写方法来获取任意数量、任意类型的参数呢？答案很简单;只需修改方法原型，让它获取一个<code>Object[]</code>而不是<code>Int32[]</code>。以下方法显示传给它的每个对象的类型：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Program {
    public static void Main() {
        DisplayTypes(new Object(), new Random(), &quot;Jeff&quot;, 5);
    }

    private static void DisplayTypes(params Object[] objects) {
        if (objects != null) {
            foreach (Object o in objects)
                Console.WriteLine(o.GetType());
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码的输出如下：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>System.Object
System.Random
System.String
System.Int32
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>重要提示 注意，调用参数数量可变的方法对性能有所影响(除非显式传递 <code>null</code>)。毕竟，数组对象必须在堆上分配，数组元素必须初始化，而且数组的内存最终需要垃圾回收。要减少对性能的影响，可考虑定义几个没有使用 <code>params</code> 关键字的重载版本。关于这方面的范例，请参考 <code>System.String</code> 类的 <code>Concat</code> 方法，该方法定义了以下重载版本：</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class String : Object, ... {
    public static string Concat(object arg0);
    public static string Concat(object arg0, object arg1);
    public static string Concat(object arg0, object arg1, object arg2);
    public static string Concat(params object[] args);
    public static string Concat(string str0, string str1);
    public static string Concat(string str0, string str1, string str2);
    public static string Concat(string str0, string str1, string str2, string str3);
    public static string Concat(params string[] values);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>如你所见，<code>Concat</code>方法定义了几个没有使用<code>params</code>关键字的重载版本。这是为了改善常规情形下的性能。使用了<code>params</code>关键字的重载则用于不太常见的情形；在这些情形下，性能有一定的损失。但幸运的是，这些情形本来就不常见。</p></blockquote><h2 id="_9-5-参数和返回类型的设计规范" tabindex="-1"><a class="header-anchor" href="#_9-5-参数和返回类型的设计规范"><span><a name="9_5">9.5 参数和返回类型的设计规范</a></span></a></h2><p>声明方法的参数类型时，应尽量指定最弱的类型，宁愿要接口也不要基类。例如，如果要写方法来处理一组数据项，最好是用接口(比如<code>IEnumerable&lt;T&gt;</code>)声明参数，而不是用强数据类型(比如<code>List&lt;T&gt;</code>)或者更强的接口类型(比如<code>ICollection&lt;T&gt;</code>或<code>IList&lt;T&gt;</code>):</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 好： 方法使用弱参数类型
public void ManipulateItems&lt;T&gt;(IEnumerable&lt;T&gt; collection) { ... }

// 不好：方法使用强参数类型
public void ManipulateItems&lt;T&gt;(List&lt;T&gt; collection) { ... }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>原因是调用第一个方法时可以传递数组对象、<code>List&lt;T&gt;</code> 对象、<code>String</code> 对象或者其他对象——只要对象的类型实现了 <code>IEnumerable&lt;T&gt;</code> 接口。相反，第二个方法只允许传递<code>List&lt;T&gt;</code>对象，不接受数组或<code>String</code>对象。显然，第一个方法更好，它更灵活，适合更广泛的情形。</p><p>当然，这里的例子讨论的是集合，是用接口体系结构来设计的。讨论使用基类体系结构设计的类时，概念同样适用。例如，要实现对流中的字节进行处理的方法，可定义以下方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 好: 方法使用弱参数类型
public void ProcessBytes(Stream someStream) { ... }

// 不好：方法使用强参数类型
public void ProcessBytes(FileStream fileStream) { ... }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第一个方法能处理任何流，包括<code>FileStream</code>，<code>NetworkStream</code> 和 <code>MemoryStream</code> 等。第二个只能处理 <code>FileStream</code> 流，这限制了它的应用。</p><p>相反，一般最好是将方法的返回类型声明为最强的类型(防止受限于特定类型)。例如，方法最好返回<code>FileStream</code>而不是<code>Stream</code>对象：</p><p>第一个方法是首选的，它允许方法的调用者将返回对象视为 <code>FileStream</code> 对象或者 <code>Stream</code> 对象。但第二个方法要求调用者只能将返回对象视为 <code>Stream</code> 对象。总之，要确保调用者在调用方法时有尽量的灵活性，使方法的适用范围更大。</p><p>有时需要在不影响调用者的前提下修改方法的内部实现。在刚才的例子中， <code>OpenFile</code> 方法不太可能更改内部实现来返回除 <code>FileStream</code>(或 <code>FileStream</code> 的派生类型)之外的其他对象。但如果方法返回 <code>List&lt;String&gt;</code> 对象，就可能想在未来的某个时候修改它的内部实现来返回一个 <code>String[]</code>。如果想保持一定的灵活性，在将来更改方法返回的东西，请选择一个较弱的返回类型。例如：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 灵活：方法使用较弱的返回类型
public IList&lt;String&gt; GetStringCollection() { ... }

// 不灵活：方法使用较强的返回类型
public List&lt;String&gt; GetStringCollection() { ... }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这个例子中，即使 <code>GetStringCollection</code> 方法在内部使用一个 <code>List&lt;String&gt;</code> 对象并返回它，但最好还是修改方法的原型，使它返回一个 <code>IList&lt;String&gt;</code>。将来， <code>GetStringCollection</code> 方法可更改它的内部集合来使用一个 <code>String[]</code>。与此同时，不需要修改调用者的源代码。事实上，调用者甚至不需要重新编译。注意，这个例子在较弱的类型中选择的是最强的那一个。例如，它没有使用最弱的 <code>IEnumerable&lt;String&gt;</code>，也没有使用较强的 <code>ICollection&lt;String&gt;</code><sup>①</sup>。</p><blockquote><p>① <code>IList</code> 继承自 <code>ICollection</code>， <code>ICollection</code> 继承自 <code>IEnumerable</code>。作者的意思是说，在这三个比 <code>List&lt;String&gt;</code> 都弱的类型中，选择的是最强的 <code>IList</code>。 —— 译注</p></blockquote><h2 id="_9-6-常量性" tabindex="-1"><a class="header-anchor" href="#_9-6-常量性"><span><a name="9_6">9.6 常量性</a></span></a></h2><p>有的语言(比如非托管 C++)允许将方法或参数声明为常量，从而禁止实例方法中的代码更改对象的任何字段，或者更改传给方法的任何对象。CLR 没有提供这个功能，许多程序员因此觉得很遗憾。既然 CLR 都不提供，面向它的任何编程语言(包括 C#)自然也无法提供。</p><p>首先要注意，非托管 C++ 将实例方法或参数声明为 <code>const</code> 只能防止程序员用一般的代码来更改对象或参数。方式内部总是可以更改对象或实参的。这要么是通过强制类型转换来去掉“常量性”，要么通过获取对象/实参的地址，再向那个地址写入。从某种意义上说，非托管 C++ 向程序员撒了一个谎，使他们以为常量对象或实参不能写入(事实上可以)。</p><p>实现类型时，开发人员可以避免写操纵对象或实参的代码。例如，<code>String</code> 类就没有提供任何能更改 <code>String</code> 对象的方法，所以字符串是不可变(immutable)的。</p><p>此外，Microsoft 很难为 CLR 赋予验证常量对象/实参未被更改的能力。CLR 将不得不对每个写入操作进行验证，确定该写入针对的不是常量对象。这对性能影响很大。当然，如果检测到有违反常量性的地方，会造成 CLR 抛出异常。此外，如果支持常量性，还会给开发人员带来大量复杂性。除此之外，在不可变的类型中，字段也必须不可变。</p><p>考虑到这些原因以及其他许多原因，CLR 没有提供对常量对象/实参的支持。</p>`,115),s=[l];function a(o,t){return i(),d("div",null,s)}const v=e(c,[["render",a],["__file","ch09_Parameters.html.vue"]]),u=JSON.parse('{"path":"/chapters/ch09_Parameters.html","title":"第 9 章 参数","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"9.1 可选参数和命名参数","slug":"_9-1-可选参数和命名参数","link":"#_9-1-可选参数和命名参数","children":[{"level":3,"title":"9.1.1 规则和原则","slug":"_9-1-1-规则和原则","link":"#_9-1-1-规则和原则","children":[]},{"level":3,"title":"9.1.2 DefaultParameterValueAttribute 和 OptionalAttribute","slug":"_9-1-2-defaultparametervalueattribute-和-optionalattribute","link":"#_9-1-2-defaultparametervalueattribute-和-optionalattribute","children":[]}]},{"level":2,"title":"9.2 隐式类型的局部变量","slug":"_9-2-隐式类型的局部变量","link":"#_9-2-隐式类型的局部变量","children":[]},{"level":2,"title":"9.3 以传引用的方式向方法传递参数","slug":"_9-3-以传引用的方式向方法传递参数","link":"#_9-3-以传引用的方式向方法传递参数","children":[]},{"level":2,"title":"9.4 向方法传递可变数量的参数","slug":"_9-4-向方法传递可变数量的参数","link":"#_9-4-向方法传递可变数量的参数","children":[]},{"level":2,"title":"9.5 参数和返回类型的设计规范","slug":"_9-5-参数和返回类型的设计规范","link":"#_9-5-参数和返回类型的设计规范","children":[]},{"level":2,"title":"9.6 常量性","slug":"_9-6-常量性","link":"#_9-6-常量性","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"chapters/ch09_Parameters.md"}');export{v as comp,u as data};
