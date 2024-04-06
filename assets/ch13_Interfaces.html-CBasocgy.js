import{_ as e,o as i,c as n,e as d}from"./app-IxoMmWNN.js";const l={},s=d(`<h1 id="第-13-章-接口" tabindex="-1"><a class="header-anchor" href="#第-13-章-接口"><span>第 13 章 接口</span></a></h1><p>本章内容：</p><ul><li><a href="#13_1">类和接口继承</a></li><li><a href="#13_2">定义接口</a></li><li><a href="#13_3">继承接口</a></li><li><a href="#13_4">关于调用接口方法的更多探讨</a></li><li><a href="#13_5">隐式和显示接口方法实现(幕后发生的事情)</a></li><li><a href="#13_6">泛型接口</a></li><li><a href="#13_7">泛型和接口约束</a></li><li><a href="#13_8">实现多个具有相同方法名和签名的接口</a></li><li><a href="#13_9">用显式接口方法实现来增强编译时类型安全性</a></li><li><a href="#13_10">谨慎使用显式接口方法实现</a></li><li><a href="#13_11">设计：基类还是接口？</a></li></ul><p>对于多继承(multiple inheritance)的概念，虚度程序员并不陌生，它是指一个类从两个或多个基类派生的能力。例如，假定 <code>TransmitData</code>类的作用是发送数据，<code>ReceiveData</code>类的作用是接收数据。现在要创建<code>SocketPort</code>类，作用是发送和接收数据。在这种情况下，你会希望<code>SocketPort</code>从<code>TransmitData</code>和<code>ReceiveData</code>这两个类继承。</p><p>有的编程语言允许多继承，所以能从<code>TransmitData</code>和<code>ReceiveData</code>这两个基类派生出<code>SocketPort</code>。但 CLR 不支持多继承(因此所有托管编程语言也支持不了)。CLR 只是通过 <strong>接口</strong>提供了“缩水版”的多继承。本章将讨论如何定义和使用接口，还要提供一些指导性原则，以便你判断何时应该使用接口而不是基类。</p><h2 id="_13-1-类和接口继承" tabindex="-1"><a class="header-anchor" href="#_13-1-类和接口继承"><span><a name="13_1">13.1 类和接口继承</a></span></a></h2><p>Microsoft .NET Framework 提供了<code>System.Object</code>类，它定义了 4 个公共实例方法：<code>ToString</code>，<code>Equals</code>，<code>GetHashCode</code> 和<code>GetType</code>。该类是其他所有类的根据或者说终极基类。换言之，所有类都继承了<code>Object</code>的 4 个实例方法。这还意味着只要代码能操作<code>Object</code>类的实例，就能操作任何类的实例。</p><p>由于 Microsoft 的开发团队已实现了 <code>Object</code> 的方法，所以从<code>Object</code>派生的任何类实际都继承了以下内容。</p><ul><li><strong>方法签名</strong><br> 使代码认为自己是在操作<code>Object</code>类的实例，但实际操作的可能是其他类的实例。</li><li><strong>方法实现</strong><br> 使开发人员定义<code>Object</code>的派生类时不必手动实现<code>Object</code>的方法。</li></ul><p>在 CLR 中，任何类都肯定从一个(而且只能是一个)派生类，后者最终从<code>Object</code>派生。这个类称为基类。基类提供了一组方法签名和这些方法的实现。你定义的新类可在将来由其他开发人员用作基类——所有方法签名和方法实现都会由新的派生类继承。</p><p>CLR 还允许开发人员定义接口，它实际只是对一组方法签名进行了统一命名。这些方法不提任何实现。类通过指定接口名称来继承接口，而且必须显式实现接口方法，否则 CLR 会认为此类型定义无效。当然，实现接口方法的过程可能比较烦琐，所以我才在前面说接口继承是实现多继承的一种“缩水版”机制。C#编译器和 CLR 允许一个类继承多个接口。当然，继承的所有接口方法都必须实现。</p><p>我们知道，类继承的一个重要特点是，凡是能使用基类型实例的地方，都能使用派生类型的实例。类似地，接口继承的一个重点特点是，凡是能使用具名接口类型的实例的地方，都能使用实现了接口的一个类型的实例。下面先看看如何定义接口。</p><h2 id="_13-2-定义接口" tabindex="-1"><a class="header-anchor" href="#_13-2-定义接口"><span><a name="13_2">13.2 定义接口</a></span></a></h2><p>如前所述，接口对一组方法签名进行了统一命名。注意，接口还能定义事件、无参属性和有参属性(C# 的索引器)。如前所述，所有这些东西本质上都是方法，它们只是语法上的简化。不过，接口不能定义任何构造器方法，也不能定义任何实例字段。</p><p>虽然 CLR 允许接口定义静态方法、静态字段、常量和静态构造器，但符合 CLS 标准的接口绝不允许，因为有的编程语言不能定义或访问它们。事实上，C#禁止接口定义任何一种这样的静态成员。</p><p>C# 用 <code>Interface</code> 关键字定义接口。要为接口指定名称和一组实例方法签名。下面是 FCL 中的几个接口的定义：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public interface IDisposable {
    void Dispose();
}

public interface IEnumerable {
    IEnumerator GetEnumerator();
}

public interface IEnumerable&lt;T&gt; : IEnumerable {
    new IEnumerator&lt;T&gt; GetEnumerator();
}

public interface ICollection&lt;T&gt; : IEnumerable&lt;T&gt;, IEnumerable {            
    void     Add(T item);
    void     Clear();
    Boolean  Contains(T item);
    void     CopyTo(T[] array, Int32 arrayIndex);
    Boolean  Remove(T item);
    Int32    Count      { get; }  // 只读属性
    Boolean  IsReadOnly { get; }  //只读属性
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在 CLR 看来，接口定义就是类型定义。也就是说，CLR 会为接口类型对象定义内部数据结构，同时可通过反射机制来查询接口类型的功能。和类型一样，接口可在文件范围中定义，也可嵌套在另一个类型中。定义接口类型时，可指定你希望的任何可见性/可访问性(<code>public</code>，<code>protected</code>，<code>internal</code>等)。</p><p>根据约定，接口类型名称以大写字母 <code>I</code> 开头，目的是方便在源代码中辨认接口类型。CLR 支持泛型接口(前面几个例子已进行了演示)和接口中的泛型方法。本章稍后会讨论泛型接口的许多土功能。另外，第 12 章“泛型”已全面讨论了泛型。</p><p>接口定义可从另一个或多个接口“继承”。但“继承”应打上引号，因为它并不是严格的继承。接口继承的工作方式并不完全和类继承一样。我个人倾向于将接口继承看成是将其他接口的协定(contract)包括到新接口中。例如，<code>ICollection&lt;T&gt;</code>接口定义就包含了<code>IEnumerable&lt;T&gt;</code>和<code>IEnumerable</code>两个接口的协定。这有下面两层含义。</p><ul><li>继承<code>ICollection&lt;T&gt;</code>接口的任何类必须实现<code>ICollection&lt;T&gt;</code>，<code>IEnumerable&lt;T&gt;</code>和<code>IEnumerable</code>这三个接口所定义的方法。</li><li>任何代码在引用对象时，如果期待该对象的类型实现了<code>ICollection&lt;T&gt;</code>接口，可以认为该类型还实现了<code>IEnumerable&lt;T&gt;</code>和<code>IEnumerable</code>接口。</li></ul><h2 id="_13-3-继承接口" tabindex="-1"><a class="header-anchor" href="#_13-3-继承接口"><span><a name="13_3">13.3 继承接口</a></span></a></h2><p>本节介绍如何定义实现了接口的类型，然后介绍如何创建该类型的实例，并用这个对象调用接口的方法。C#将这个过程变得很简单，但幕后发生的事情还是有点复杂。本章稍后会详细解释。</p><p>下面是在<code>MSCorLib.dll</code>中定义的 <code>System.IComparable&lt;T&gt;</code>接口：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public interface IComparable&lt;in T&gt; {
    Int32 CompareTo(T other);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下代码展示了如何定义实现了该接口的类型，同时还展示了对两个 <code>Point</code> 对象进行比较的代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

// Point 从 System.Object 派生，并实现了 IComparable&lt;T&gt;
public sealed class Point : IComparable&lt;Point&gt; {
    private Int32 m_x, m_y;

    public Point(Int32 x, Int32 y) {
        m_x = x;
        m_y = y;
    }

    // 该方法为 Point 实现 IComparable&lt;T&gt;.CompareTo()
    public Int32 CompareTo(Point other) {
        return Math.Sign(Math.Sqrt(m_x * m_x + m_y * m_y) - Math.Sqrt(other.m_x * other.m_x + other.m_y * other.m_y));
    }

    public override String ToString() {
        return String.Format(&quot;{0}, {1}&quot;, m_x, m_y);
    }
}

public static class Program {
    public static void Main() {
        Point[] points = new Point[] {
            new Point(3, 3),
            new Point(1, 2)
        };

        // 下面调用由 Point 实现的 IComparable&lt;T&gt; 的 CompareTo 方法
        if (points[0].CompareTo(points[1]) &gt; 0) {
            Point tempPoint = points[0];
            points[0] = points[1];
            points[1] = tempPoint;
        }
        Console.WriteLine(&quot;Points from closest to (0, 0) to farthest:&quot;);
        foreach (Point p in points)
            Console.WriteLine(p);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>C# 编译器要求将实现接口的方法(后文简称为“接口方法”)标记为 <code>public</code>。CLR 要求将接口方法标记为<code>virtual</code>。不将方法显式标记为<code>virtual</code>，编译器会将它们标记为<code>virtual</code>和<code>sealed</code>；这会阻止派生类重写接口方法。将方法显式标记为<code>virtual</code>，编译器就会将该方法标记为<code>virtual</code>(并保持它的非密封状态)，使派生类能重写它。</p><p>派生类不能重写<code>sealed</code>的接口方法。但派生类可重新继承同一个接口，并为接口方法提供自己的实现。在对象上调用接口方法时，调用的是该方法在该对象的类型中的实现。下例对此进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public static void Main() {
    public static void Main() {
        /************************** 第一个例子 **************************/
        Base b = new Base();

        // 用 b 的类型来调用 Dispose，显示：“Base&#39;s Dispose”
        b.Dispose();

        // 用 b 的对象的类型来调用 Dispose，显示：“Base&#39;s Dispose”
        ((IDisposable)b).Dispose();

        /************************** 第二个例子 **************************/
        Derived d = new Derived();

        // 用 d 的类型来调用 Dispose，显示：“Derived&#39;s Dispose”
        d.Dispose();

        // 用 d 的对象的类型来调用 Dispose，显示：“Derived&#39;s Dispose”
        ((IDisposable)d).Dispose();

        /************************** 第三个例子 **************************/
        b = new Derived();

        // 用 b 的类型来调用 Dispose，显示：“Base&#39;s Dispose”
        b.Dispose();

        // 用 b 的对象的类型来调用 Dispose，显示：“Derived&#39;s Dispose”
        ((IDisposable)b).Dispose();
    }
}

// 这个类派生自 Object，它实现了 IDisposable
internal class Base : IDisposable {
    // 这个方法隐式密封，不能被重写
    public void Dispose() {
        Console.WriteLine(&quot;Base&#39;s Dispose&quot;);
    }
}

// 这个类派生自 Base，它重新实现了 IDisposable
internal class Derived : Base, IDisposable {
    // 这个方法不能重写 Base 的 Dispose，
    // &#39;new&#39; 表明该方法重新实现了 IDisposable 的 Dispose 方法
    new public void Dispose() {
        Console.WriteLine(&quot;Derived&#39;s Dispose&quot;);

        // 注意，下面这行代码展示了如何调用基类的实现(如果需要的话)
        // base.Dispose();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-4-关于调用接口方法的更多探讨" tabindex="-1"><a class="header-anchor" href="#_13-4-关于调用接口方法的更多探讨"><span><a name="13_4">13.4 关于调用接口方法的更多探讨</a></span></a></h2><p>FCL 的<code>System.String</code>类型继承了<code>System.Object</code>的方法签名及其实现。此外，<code>String</code>类型还实现了几个接口：<code>IComparable</code>，<code>ICloneable</code>,<code>IConvertible</code>，<code>IEnumerable</code>，<code>IComparable&lt;String&gt;</code>，<code>IEnumerable&lt;Char&gt;</code>和<code>IEquatable&lt;String&gt;</code>。这意味着<code>String</code>类型不需要实现(或重写)其 <code>Object</code> 基类型提供的方法，但必须实现所有接口声明的方法。</p><p>CLR 允许定义接口类型的字段、参数或局部变量。使用接口类型的变量可以调用该接口定义的方法。此外，CLR 允许调用 <code>Object</code> 定义的方法，因为所有类都继承了 <code>Object</code> 的方法。以下代码对此进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// s 变量引用一个 String 对象
String s = &quot;Jeffrey&quot;;
// 可以使用 s 调用在 String, Object, IComparable, ICloneable,
// IConvertible, IEnumerable 中定义的任何方法

// cloneable 变量引用同一个 String 对象
ICloneable cloneable = s;
// 使用 cloneable 只能调用 ICloneable 接口声明的
// 任何方法(或 Object 定义的任何方法)

// comparable 变量引用同一个 String 对象
IComparable comparable = s;
// 使用 comparable 只能调用 IComparable 接口声明的
// 任何方法(或 Object 定义的任何方法)

// enumerable 变量引用同一个 String 对象
// 可在运行时将变量从一个接口转换成另一个，只要
// 对象的类型实现了这两个接口
IEnumerable enumerable = (IEnumerable) comparable;
// 使用 enumerable 只能调用 IEnumerable 接口声明的
// 任何方法(或 Object 定义的任何方法)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这段代码中，所有变量都引用同一个 “Jeffrey” <code>String</code> 对象。该对象在托管堆中；所以，使用其中任何变量时，调用的任何方法都会影响这个“Jeffrey” <code>String</code>对象。不过，变量的类型规定了能对这个对象执行的操作。<code>s</code> 变量是<code>String</code>类型，所以可以用<code>s</code>调用<code>String</code>类型定义的任何成员(比如<code>Length</code>属性)。还可用变量<code>s</code>调用从<code>Object</code>继承的任何方法(比如 <code>GetType</code>)。</p><p><code>cloneable</code> 变量是 <code>ICloneable</code>接口类型。所以，使用<code>cloneable</code>变量可以调用该接口定义的 <code>Clone</code>方法。此外，可以调用 <code>Object</code>定义的任何方法(比如 <code>GetType</code>)，因为 CLR 知道所有类型都继承自 <code>Object</code>。不过，不能用<code>cloneable</code>变量调用<code>String</code>本身定义的公共方法，也不能调用由<code>String</code>实现的其他任何接口的方法。类似地，使用<code>comparable</code>变量可以调用<code>CompareTo</code>方法或<code>Object</code>定义的任何方法，但不能调用其他方法。</p><blockquote><p>重要提示 和引用类型相似，值类型可实现零个或多个接口。但值类型的实例在转换为接口类型时必须装箱。这是由于接口变量是引用，必须指向堆上的对象，使 CLR 能检查对象的类型对象的类型对象指针，从而判断对象的确切类型。调用已装箱值类型的接口方法时，CLR 会跟随对象的类型对象指针找到类型对象的方法表，从而调用正确的方法。</p></blockquote><h2 id="_13-5-隐式和显式接口方法实现-幕后发生的事情" tabindex="-1"><a class="header-anchor" href="#_13-5-隐式和显式接口方法实现-幕后发生的事情"><span><a name="13_5">13.5 隐式和显式接口方法实现(幕后发生的事情)</a></span></a></h2><p>类型加载到 CLR 中时，会为该类型创建并初始化一个方法表(参见第 1 章“CLR的执行模型”)。在这个方法表中，类型引入的每个新方法都有对应的记录项；另外，还为该类型继承的所有虚方法添加了记录项。继承的虚方法既有继承层次结构中的各个基类型定义的，也有接口类型定义的。所以，对于下面这个简单的类型定义：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class SimpleType : IDisposable {
    public void Dispose() { Console.WriteLine(&quot;Dispose&quot;); }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>类型的方法表将包含以下方法的记录项。</p><ul><li><code>Object</code>(隐式继承的基类)定义的所有虚实例方法。</li><li><code>IDisposable</code>(继承的接口)定义所有接口方法。本例只有一个方法，即<code>Dispose</code>，因为<code>IDisposable</code>接口只定义了这个方法。</li><li><code>SimpleType</code>引入的新方法 <code>Dispose</code>。</li></ul><p>为简化编程，C#编译器假定 <code>SimpleType</code> 引入的<code>Dispose</code>方法是对<code>IDisposable</code>的<code>Dispose</code>方法的可访问性是<code>public</code>，而接口方法的签名和新引入的方法完全一致。也就是说，两个方法具有相同的参数和返回类型。顺便说一句，如果新的<code>Dispose</code>方法被标记为<code>virtual</code>，C#编译器仍然认为该方法匹配接口方法。</p><p>C#编译器将新方法和接口方法匹配起来之后，会生成元数据，指明 <code>SimpleType</code> 类型的方法表中的两个记录项应引用同一个实现。为了更清楚地理解这一点，下面的代码演示了如何调用类的公共<code>Dispose</code>方法以及如何调用<code>IDisposable</code>的<code>Dispose</code>方法在类中的实现：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public sealed class Program {
    public static void Main() {
        SimpleType st = new SimpleType();

        // 调用公共 Dispose 方法实现
        st.Dispose();

        // 调用 IDisposable 的 Dispose 方法的实现
        IDisposable d = st;
        d.Dispose();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在第一个 <code>Dispose</code> 方法调用中，调用的是 <code>SimpleType</code> 定义的 <code>Dispose</code> 方法。然后定义 <code>IDisposable</code> 接口类型的变量<code>d</code>，它引用<code>SimpleType</code>对象<code>st</code>。调用<code>d.Dispose()</code>时，调用的是<code>IDisposable</code>接口的<code>Dispose</code>方法的实现，所以会执行相同的代码。在这个例子中，两个调用你看不出任何区别。输出结果如下所示：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Dispose
Dispose
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>现在重写 <code>SimpleType</code>，以便于看出区别：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal sealed class SimpleType : IDisposable {
    public void Dispose() { Console.WriteLine(&quot;public Dispose&quot;); }
    void IDisposable.Dispose() { Console.WriteLine(&quot;IDisposable Dispose&quot;); }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在不改动前面的<code>Main</code>方法的前提下，重新编译并再次运行程序，输出结果如下所示：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>public Dispose
IDisposable Dispose        
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>在 C# 中，将定义方法的那个接口的名称作为方法名前缀(例如 <code>IDisposable.Dispose</code>)，就会创建<strong>显式接口方法实现(Explicit Interface Method Implementation，EIMI<sup>①</sup>)</strong>。注意，C# 中不允许在定义显式接口方法时指定可访问性(比如 <code>public</code>或<code>private</code>)。但是，编译器生成方法的元数据时，可访问性会自动设为 <code>private</code>，防止其他代码在使用类的实例时直接调用接口方法。只有通过接口类型的变量才能调用接口方法。</p><blockquote><p>① 请记住 EIMI 的意思，本书后面会大量使用这个缩写词。——译注</p></blockquote><p>还要注意，EIMI 方法不能标记为 <code>virtual</code>，所以不能被重写。这是用于 EIMI 方法并非真的是类型的对象模型的一部分，它只是将接口(一组行为或方法)和类型连接起来，同时避免公开行为/方法。如果觉得这一点不好理解，那么你的感觉没有错！它就是不太好理解。本章稍后会介绍 EIMI 有用的一些场合。</p><h2 id="_13-6-泛型接口" tabindex="-1"><a class="header-anchor" href="#_13-6-泛型接口"><span><a name="13_6">13.6 泛型接口</a></span></a></h2><p>C# 和 CLR 所支持的泛型接口为开发人员提供了许多非常出色的功能。本节要讨论泛型接口提供的一些好处。</p><p>首先，泛型接口提供了出色的编译时类型安全性。有的接口(比如非泛型 <code>IComparable</code> 接口)定义的方法使用了 <code>Object</code> 参数或 <code>Object</code> 返回类型，在代码中调用这些接口方法时，可传递对任何类型的实例的引用。但这通常不是我们期望的。下面的代码对此进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private void SomeMethod1() {
    Int32 x = 1, y = 2;
    IComparable c = x;

    // CompareTo 期待 Int32，传递y (一个 Int32)没有问题
    c.CompareTo(y);   // y 在这里不装箱

    // CompareTo 期待 Int32，传递“2”(一个 String)造成编译,
    // 但在运行时抛出 ArgumentException 异常
    c.CompareTo(&quot;2&quot;);           
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口方法理想情况下应该使用强类型。这正是 FCL 为什么包含泛型 <code>IComparable&lt;in T&gt;</code> 接口的原因。下面修改代码来使用泛型接口：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private void SomeMethod2() {
    Int32 x = 1, y = 2;
    IComparable&lt;Int32&gt; c = x;
    
    // CompareTo 期待 Int32， 传递 y (一个 Int32)没有问题
    c.CompareTo(y);     // y 在这里不装箱

    // CompareTo 期待 Int32，传递 &quot;2&quot;(一个 String)造成编译错误，
    // 指出 String 不能被转换为 Int32
    c.CompareTo(&quot;2&quot;);       // 错误
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>泛型接口的第二个好处在于，处理值类型时装箱次数会少很多。在 <code>SomeMethod1</code> 中，非泛型 <code>IComparable</code> 接口的 <code>CompareTo</code> 方法期待获取一个 <code>Object</code>；传递 <code>y</code>(<code>Int32</code>值类型)会造成<code>y</code>中的值装箱。但在 <code>SomeMethod2</code> 中，泛型 <code>IComparable&lt;in T&gt;</code>接口的 <code>CompareTo</code>方法本来期待的就是 <code>Int32</code>；<code>y</code>以传值的方式传递，无需装箱。</p><blockquote><p>注意 FCL 定义了 <code>IComparable</code>，<code>ICollection</code>，<code>IList</code>和<code>IDictionary</code>等接口的泛型和非泛型版本。定义类型时要实现其中任何接口，一般应实现泛型版本。FCL 保留非泛型版本是为了向后兼容，照顾在 .NET Framework 支持泛型之前写的代码。非泛型版本还允许用户以较常规的、类型较不安全(more general,less type-safe)的方式处理数据。</p></blockquote><blockquote><p>有的泛型接口继承了非泛型版本，所以必须同时实现接口的泛型和非泛型版本。例如，泛型 <code>IEnumerable&lt;out T&gt;</code>接口继承了非泛型<code>IEnumerable</code>接口，所以实现<code>IEnumerable&lt;out T&gt;</code>就必须实现<code>IEnumerable</code>。</p></blockquote><blockquote><p>和其他代码集成时，有时必须实现非泛型接口，因为接口的泛型版本并不存在。这时，如果接口的任何方法获取或返回 <code>Object</code>，就会失去编译时的类型安全性，而且值类型将发生装箱。可利用本章 13.9 节“用显式接口方法实现来增强编译时类型安全性”介绍的技术来缓解该问题。</p></blockquote><p>泛型接口的第三个好处在于，类可以实现同一个接口若干次，只要每次使用不同的类型参数。以下代码对这个好处进行了演示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

// 该类实现泛型 IComparable&lt;T&gt; 接口两次
public sealed class Number : IComparable&lt;Int32&gt;, IComparable&lt;String&gt; {
    private Int32 m_val = 5;

    // 该方法实现 IComparable&lt;Int32&gt; 的 CompareTo 方法
    public Int32 CompareTo(Int32 n) {
        return m_val.CompareTo(n);
    }

    // 该方法实现 IComparable&lt;String&gt; 的 CompareTo 方法
    public Int32 CompareTo(String s) {
        return m_val.CompareTo(Int32.Parse(s));
    }
}

public static class Program {
    public static void Main() {
        Number n = new Number();

        // 将 n 中的值和一个 Int32(5) 比较
        IComparable&lt;Int32&gt; cInt32 = n;
        Int32 result = cInt32.CompareTo(5);

        // 将 n 中的值和一个 String(&quot;5&quot;) 比较
        IComparable&lt;String&gt; cString = n;
        result = cString.CompareTo(&quot;5&quot;);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口的泛型类型参数可标记为逆变和协变\b，为泛型接口的使用提供更大的灵活性。欲知协变和逆变的详情，请参见 12.5 节“委托和接口的逆变和协变泛型类型实参”。</p><h2 id="_13-7-泛型和接口约束" tabindex="-1"><a class="header-anchor" href="#_13-7-泛型和接口约束"><span><a name="13_7">13.7 泛型和接口约束</a></span></a></h2><p>上一节讨论了泛型接口的好处。本节要讨论将泛型类型参数约束为接口的好处。</p><p>第一个好处在于，可将泛型类型参数约束为多个接口。这样一来，传递的参数的类型必须实现全部接口约束。例如：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static class SomeType {
    private static void Test() {
        Int32 x = 5;
        Guid g = new Guid();

        // 对 M 的调用能通过编译，因为 Int32 实现了
        // IComparable 和 IConvertible
        M(x);

        // 这个 M 调用导致编译错误，因为 Guid 虽然
        // 实现了 IComparable，但没有实现 IConvertible
        M(g);
    }

    // M 的类型参数 T 被约束为只支持同时实现了
    // IComparable 和 IConvertible 接口的类型
    private static Int32 M&lt;T&gt;(T t) where T : IComparable, IConvertible {
        ...
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这真的很“酷”！定义方法参数时，参数的类型规定了传递的实参必须是该类型或者它的派生类型。如果参数的类型是接口，那么实参可以是任意类类型，只是该类实现了接口。使用多个接口约束，实际是表示向方法传递的实参必须实现多个接口。</p><p>事实上，如果将 <code>T</code> 约束为一个类和两个接口，就表示传递的实参类型必须是指定的基类(或者它的派生类)，而且必须实现两个接口。这种灵活性使方法能细致地约束调用者能传递的内容。调用者不满足这些约束，就会产生编译错误。</p><p>接口约束的第二个好处是传递值类型的实例时减少装箱。上述代码向 <code>M</code>方法传递了 <code>x</code>(值类型 <code>Int32</code> 的实例)。<code>x</code>传给<code>M</code>方法时不会发生装箱。如果<code>M</code>方法内部的代码调用<code>t.CompareTo(...)</code>，这个调用本身也不会引发装箱(但传给<code>CompareTo</code>的实参可能发生装箱)。</p><p>另一方面，如果<code>M</code>方法像下面这样声明：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private static Int32 M(IComparable t) {
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么<code>x</code>要传给<code>M</code>就必须装箱。</p><p>C# 编译器为接口约束生成特殊 IL 指令，导致直接在值类型上调用接口方法而不装箱。不用接口约束便没有其他办法让 C# 编译器生成这些 IL 指令，如此一来，在值类型上调用接口方法总是发生装箱。一个例外是如果值类型实现了一个接口方法，在值类型的实例上调用这个方法不会造成值类型的实例装箱。</p><h2 id="_13-8-实现多个具有相同方法名和签名的接口" tabindex="-1"><a class="header-anchor" href="#_13-8-实现多个具有相同方法名和签名的接口"><span><a name="13_8">13.8 实现多个具有相同方法名和签名的接口</a></span></a></h2><p>定义实现多个接口的类型时，这些接口可能定义了具有相同名称和签名的方法。例如，假定有以下两个接口：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>private interface IWindow {
    Object GetMenu();
}

public Interface IRestaurant {
    Object GetMenu();
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>要定义实现这两个接口的类型，必须使用“显式接口方法实现”来实现这个类型的成员，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 这个类型派生自 System.Object
// 并实现了 IWindow 和 IRestaurant 接口
public sealed class MarioPizzeria : IWindow, IRestaurant {

    // 这是 IWindow 的 GetMenu 方法的实现
    Object IWindow.GetMenu() { ... }

    // 这是 IRestaurant 的 GetMenu 方法的实现
    Object IRestaurant.GetMenu() { ... }

    // 这个 GetMenu 方法是可选的，与接口无关
    public Object GetMenu() { ... }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于这个类型必须实现多个接口的 <code>GetMenu</code> 方法，所以要告诉 C# 编译器每个<code>GetMenu</code>方法对应的是哪个接口的实现。</p><p>代码在使用<code>MarioPizzeria</code> 对象时必须将其转换为具体的接口才能调用所需的方法。例如：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>MarioPizzeria mp = new MarioPizzeria();

// 这行代码调用 MarioPizzeria 的公共 GetMenu 方法
mp.GetMenu();

// 以下代码调用 MarioPizzeria 的 IWindow.GetMenu 方法
IWindow window = mp;
window.GetMenu();

// 以下代码调用 MarioPizzeria 的 IRestaurant.GetMenu 方法
IRestaurant restaurant = mp;
restaurant.GetMenu();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-9-用显式接口方法实现来增强编译时类型安全性" tabindex="-1"><a class="header-anchor" href="#_13-9-用显式接口方法实现来增强编译时类型安全性"><span><a name="13_9">13.9 用显式接口方法实现来增强编译时类型安全性</a></span></a></h2><p>接口很好用，它们定义了在类型之间进行沟通的标准方式。前面曾讨论了泛型接口，讨论了它们如何增强编译时的类型安全性和减少装箱操作。遗憾的是，有时由于不存在泛型版本，所以仍需实现非泛型接口。接口的任何方法接受<code>System.Object</code>类型的参数或返回<code>System.Object</code>类型的值，就会失去编译时的类型安全性，装箱也会发生。本节将介绍如何用“显式接口方法实现”(EIMI)在某种程度上改善这个局面。</p><p>下面是极其常用的<code>IComparable</code>接口：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public interface IComparable {
    Int32 CompareTo(Object other);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该接口定义了接受一个 <code>System.Object</code> 参数的方法。可以像下面这样定义实现了接口的类型：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal struct SomeValueType : IComparable {
    private SomeValueType(Int32 x) { m_x = x; }
    public Int32 CompareTo(Object other) {
        return (m_x - ((SomeValueType) other).m_x);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可用<code>SomeValueType</code>写下面这样的代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    SomeValueType v = new SomeValueType(0);
    Object o = new Object();
    Int32 n = v.CompareTo(v);       // 不希望的装箱操作
    n = v.CompareTo(o);             // InvalidCastException 异常
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码存在两个问题。</p><ul><li><p><strong>不希望的装箱操作</strong><br><code>v</code>作为实参传给<code>CompareTo</code>方法时必须装箱，因为 <code>CompareTo</code>期待的是一个<code>Object</code>。</p></li><li><p><strong>缺乏类型安全性</strong><br> 代码能通过编译，但 <code>CompareTo</code> 方法内部试图将 <code>o</code> 转换为 <code>SomeValueType</code> 时抛出 <code>InvalidCastException</code> 异常。</p></li></ul><p>这两个问题都可以用 EIMI 解决。下面是 <code>SomeValueType</code> 的修改版本，这次添加了一个 EIMI：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal struct SomeValueType : IComparable {
    private Int32 m_x;
    public SomeValueType(Int32 x) { m_x = x; }

    public Int32 CompareTo(SomeValueType other) {
        return (m_x - other.m_x);
    }

    // 注意以下代码没有指定 pulbic/private 可访问性
    Int32 IComparable.CompareTo(Object other) {
        return CompareTo((SomeValueType) other);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意新版本的几处改动。现在有两个 <code>CompareTo</code> 方法。第一个 <code>CompareTo</code> 方法不是获取一个 <code>Object</code> 作为参数，而是获取一个 <code>SomeValueType</code>了，所以用于强制类型转换的代码被去掉了。修改了第一个<code>CompareTo</code>方法使其变得类型安全之后，<code>SomeValueType</code>还必须实现一个<code>CompareTo</code>方法来满足<code>IComparable</code>的协定。这正是第二个<code>IComparable.CompareTo</code>方法的作用，它是一个EIMI。</p><p>经过这两处改动之后，就获得了编译时的类型安全性，而且不会发生装箱：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    SomeValueType v = new SomeValueType(0);
    Object o = new Object();
    Int32 n = v.CompareTo(v);   // 不发生装箱
    n = v.CompareTo(o);         // 编译时错误
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>不过，定义接口类型的变量会再次失去编译时的类型安全性，而且会再次发生装箱：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    SomeValueType v = new SomeValueType(0);
    IComparable c = v;          // 装箱！

    Object o = new Object();
    Int32 n = c.CompareTo(v);  // 不希望的装箱操作
    n = c.CompareTo(o);        // InvalidCastException 异常    
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>事实上，如本章前面所述，将值类型的实例换换为接口类型时，CLR 必须对值类型的实例进行装箱。因此，前面的 <code>Main</code> 方法中会发生两次装箱。</p><p>实现 <code>IConvertible</code>，<code>ICollection</code>，<code>IList</code>和<code>IDictionary</code>等接口时 EIMI 很有用。可利用它为这些接口的方法创建类型安全的版本，并减少值类型的装箱。</p><h2 id="_13-10-谨慎使用显式接口方法实现" tabindex="-1"><a class="header-anchor" href="#_13-10-谨慎使用显式接口方法实现"><span><a name="#13_10">13.10 谨慎使用显式接口方法实现</a></span></a></h2><p>使用 EIMI 也可能造成一些严重后果，所以应该尽量避免使用 EIMI。幸好，泛型接口可帮助我们在大多数时候避免使用 EIMI。但有时(比如实现具有相同名称和签名的两个接口方法时)仍然需要它们。EIMI 最主要的问题如下。</p><ul><li><p>没有文档解释类型具体如何实现一个 <code>EIMI</code> 方法，也没有<code>Microsoft Visual Studio</code>“智能感知”支持。</p></li><li><p>值类型的实例在转换成接口时装箱。</p></li><li><p><code>EIMI</code>不能由派生类型调用。</p></li></ul><p>下面详细讨论这些问题。</p><p>文档在列出一个类型的方法时，会列出显式接口方法实现(EIMI)，但没有提供类型特有的帮助，只有接口方法的常规性帮助。例如，<code>Int32</code>类型的文档只是说它实现了<code>IConvertible</code>接口的所有方法。能做到这一步已经不错，它使开发人员知道存在这些方法。但也使开发人员感到困惑，因为不能直接在一个<code>Int32</code>上调用一个<code>IConvertible</code>方法。例如，下面的代码无法编译：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    Int32 x = 5;
    Single s = x.ToSingle(null);        // 试图调用一个 IConvertible 方法
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译这个方法时，C# 编译器会报告以下消息：<code>error CS0117：“int”不包含“ToSingle”的定义</code>。这个错误信息使开发人员感到困惑，因为它明显是说<code>Int32</code>类型没有定义<code>ToSingle</code>方法，但实际上定义了。</p><p>要在一个<code>Int32</code>上调用<code>ToSingle</code>，首先必须将其转换为<code>IConvertible</code>，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static void Main() {
    Int32 x = 5;
    Single s = ((IConvertible) x).ToSingle(null);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对类型转换的要求不明确，而许多开发人员自己看不出来问题出在哪里。还有一个更让人烦恼的问题：<code>Int32</code>值类型转换为<code>IConvertible</code>会发生装箱，既浪费内存，又损害性能。这是本节开头提到的EIMI存在的第二个问题。</p><p>EIMI的第三个也可能是最大的问题是，它们不能被派生类调用。下面是一个例子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal class Base : IComparable {

    // 显式接口方法实现
    Int32 IComparable.CompareTo(Object o) {
        Console.WriteLine(&quot;Base&#39;s CompareTo&quot;);
        return 0;
    }
}


internal sealed class Derived : Base,IComparable {

    // 一个公共方法，也是接口的实现
    public Int32 CompareTo(Object o) {
        Console.WriteLine(&quot;Derived&#39;s CompareTo&quot;);

        // 试图调用基类的 EIMI 导致编译错误：
        // error CS0117：“Base” 不包含 “CompareTo” 的定义
        base.CompareTo(o);
        return 0;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code>Derived</code>的<code>CompareTo</code>方法中调用 <code>base.CompareTo</code>导致C#编译器报错。现在的问题是，<code>Base</code>类没有提供一个可供调用的或受保护<code>CompareTo</code>方法，它提供的是一个只能用<code>IComparable</code>类型的变量来调用的<code>CompareTo</code>方法。可将<code>Derived</code>的<code>CompareTo</code>方法修改成下面这样：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 一个公共方法，也是接口的实现
public Int32 CompareTo(Object o) {
    Console.WriteLine(&quot;Derived&#39;s CompareTo&quot;);

    // 试图调用基类的 EIMI 导致无穷递归
    IComparable c = this;
    c.CompareTo(o);

    return 0;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个版本将<code>this</code>转换成<code>IComparable</code>变量<code>c</code>，然后用<code>c</code>调用<code>CompareTo</code>。但<code>Derived</code>的公共<code>CompareTo</code>方法充当了<code>Derived</code>的<code>IComparable.CompareTo</code>方法的实现，所以造成了无穷递归。这可以通过声明没有<code>IComparable</code>接口的<code>Derived</code>类来解决：</p><p><code>internal sealed class Derived : Base /*, IComparable */ { ... }</code></p><p>现在，前面的<code>CompareTo</code>方法将调用<code>Base</code>中的<code>CompareTo</code>方法。但有时不能因为想在派生类中实现接口方法就将接口从类型中删除。解决这个问题的最佳方法是在基类中除了提供一个被选为显式实现的接口方法，还要提供一个虚方法。然后<code>Derived</code>类可以重写虚方法。下面展示了如何正确定义<code>Base</code>类和<code>Derived</code>类：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal class Base : IComparable {
    
    // 显式接口方法实现(EIMI)
    Int32 IComparable.CompareTo(Object o) {
        Console.WriteLine(&quot;Base&#39;s IComparable.CompareTo&quot;);
        return CompareTo(o);        // 调用虚方法
    }

    // 用于派生类的虚方法(该方法可为任意名称)
    public virtual Int32 CompareTo(Object o) {
        Console.WriteLine(&quot;Base&#39;s virtual CompareTo&quot;);
        return 0;
    }
}

internal sealed class Derived : Base, IComparable {

    // 一个公共方法，也是接口的实现
    public override Int32 CompareTo(Object o) {
        Console.WriteLine(&quot;Derived&#39;s CompareTo&quot;);

        // 现在可以调用 Base 的虚方法
        return base.CompareTo(o);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，这里是讲虚方法定义成公共方法，但有时可能需要定义成受保护方法。把方法定义为受保护(而不是公共)是可以的，但必须进行另一些小的改动。我们的讨论清楚证明了务必谨慎使用EIMI。许多开发人员在最初接触 EIMI 时，认为 EIMI 非常”酷“，于是开始肆无忌惮地使用。千万不要这样做！.NET在某些情况下确实有用，但应该尽量避免使用，因为它们导致类型变得不好用。</p><h2 id="_13-11-设计-基类还是接口" tabindex="-1"><a class="header-anchor" href="#_13-11-设计-基类还是接口"><span><a name="13_11">13.11 设计：基类还是接口</a></span></a></h2><p>经常有人问：”英爱设计基类还是接口？“ 这个问题不能一概而论，以下设计规范或许能帮你理清思路：</p><ul><li><strong>IS-A对比CAN-DO关系<sup>①</sup></strong><br> 类型只能继承一个实现，如果派生类型和基类型建立不起 IS-A 关系，就不能用基类而用接口。接口意味着 CAN-DO 关系。如果多种对象类型都”能“做某事，就为它们创建接口。例如，一个类型能将自己的实例转换为另一个类型(<code>IConvertible</code>)，一个类型序列化自己的实例(<code>ISerializable</code>)。注意，值类型必须从<code>System.ValueType</code>派生，所以不能从任意的基类派生。这时必须使用CAN-DO关系并定义接口。</li></ul><blockquote><p>① IS-A 是指”属于“，例如，汽车属于交通工具；CAN-DO 是指”能做某事“，例如，一个类型能将自己的实例转换为另一个类型。 ——译注</p></blockquote><ul><li><p><strong>易用性</strong><br> 对于开发人员，定义从基类派生的新类型通常比实现接口的所有方法容易得多。基类型可提供大量功能，所以派生类型可能只需稍做改动。而提供接口的话，新类型必须实现所有成员。</p></li><li><p><strong>一致性实现</strong><br> 无论接口协定(contract)订立得有多好，都无法保证所有人百分之百正确实现它。事实上，COM颇受该问题之累，导致有的 COM 对象只能正常用于Microsoft Office Word 或 Microsoft Internet Explorer。而如果为基类型提供良好的默认实现，那么一开始得到的就是能正常工作并经过良好测试的类型。以后根据需要修改就可以了。</p></li><li><p><strong>版本控制</strong><br> 向基类型添加一个方法，派生类型将继承新方法。一开始使用的就是一个能正常工作的类型，用户的源代码甚至不需要重新编译。而向接口添加新成员，会强迫接口的继承者更改其源代码并重新编译。</p></li></ul><p>FCL 中涉及数据流处理(streaming data)的类采用的是实现继承方案<sup>②</sup>。<code>System.IO.Stream</code>是抽象基类，提供了包括<code>Read</code>和<code>Write</code>在内的一组方法。其他类(<code>System.IO.FileStream</code>，<code>System.IO.MemoryStream</code>和<code>System.Net.Sockets.NetworkStream</code>)都从<code>Stream</code>派生。在这三个类中，每一个和<code>Stream</code>类都是 IS-A 关系，这使具体类<sup>③</sup>的实现变得更容易。例如，派生类只需实现同步 I/O 操作，异步 I/O 操作已经从<code>Stream</code>基类继承了。</p><blockquote><p>② 即继承基类的实现。 —— 译注<br> ③ 对应于”抽象类“。 —— 译注</p></blockquote><p>必须承认，为流类(<code>XXXStream</code>)选择继承的理由不是特别充分，因为<code>Stream</code>基类实际只提供了很少的实现。那么就以 Microsoft Windows 窗体控件类为例好了。<code>Button</code>，<code>CheckBox</code>，<code>ListBox</code> 和所有其他窗体控件都从<code>System.Windows.Forms.Control</code>派生。<code>Control</code>实现了大量代码，各种控件类简单继承一下即可正常工作。这时选择继承应该没有疑问了吧？</p><p>相反，Microsoft 采用基于接口的方式来设计FCL中的集合。<code>System.Collections.Generic</code>命名空间定义了几个与集合有关的接口：<code>IEnumerable&lt;out T&gt;</code>，<code>ICollection&lt;T&gt;</code>，<code>IList&lt;T&gt;</code>和<code>IDictionary&lt;TKey, Tvalue&gt;</code>。然后，Microsoft 提供了大量类来实现这些接口组合，包括<code>List&lt;T&gt;</code>，<code>Dictionary&lt;Tkey, TValue&gt;</code>，<code>Queue&lt;T&gt;</code>和<code>Stack&lt;T&gt;</code>等等。设计者在类和接口之间选择 CAN-DO 关系，因为不同集合类的实现迥然有异。换句话说，<code>List&lt;T&gt;</code>，<code>Dictionary&lt;Tkey, Tvalue&gt;</code>和<code>Queue&lt;T&gt;</code>之间没有多少能共享的代码。</p><p>不过，这些集合类提供的操作相当一致。例如，都维护了一组可枚举的元素，而且都允许添加和删除元素。假定有一个对象引用，对象的类型实现了<code>IList&lt;T&gt;</code>接口，就可在不需要知道集合准确类型的前提下插入、删除和搜索元素。这个机制太强大了！</p><p>最后要说的是，两件事情实际能同时做：定义接口，<em>同时</em>提供实现该接口的基类。例如，FCL定义了<code>ICOmparable&lt;in T&gt;</code>接口，任何类型都可选择实现该接口。此外，FCL提供了抽象基类<code>Comparer&lt;T&gt;</code>，它实现了该接口，同时为非泛型<code>IComparer</code>的<code>Compare</code>方法提供了默认实现。接口定义和基类同时存在带来了很大的灵活性，开发人员可根据需要选择其中一个。</p>`,135),a=[s];function c(o,r){return i(),n("div",null,a)}const t=e(l,[["render",c],["__file","ch13_Interfaces.html.vue"]]),u=JSON.parse('{"path":"/zh/chapters/ch13_Interfaces.html","title":"第 13 章 接口","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"13.1 类和接口继承","slug":"_13-1-类和接口继承","link":"#_13-1-类和接口继承","children":[]},{"level":2,"title":"13.2 定义接口","slug":"_13-2-定义接口","link":"#_13-2-定义接口","children":[]},{"level":2,"title":"13.3 继承接口","slug":"_13-3-继承接口","link":"#_13-3-继承接口","children":[]},{"level":2,"title":"13.4 关于调用接口方法的更多探讨","slug":"_13-4-关于调用接口方法的更多探讨","link":"#_13-4-关于调用接口方法的更多探讨","children":[]},{"level":2,"title":"13.5 隐式和显式接口方法实现(幕后发生的事情)","slug":"_13-5-隐式和显式接口方法实现-幕后发生的事情","link":"#_13-5-隐式和显式接口方法实现-幕后发生的事情","children":[]},{"level":2,"title":"13.6 泛型接口","slug":"_13-6-泛型接口","link":"#_13-6-泛型接口","children":[]},{"level":2,"title":"13.7 泛型和接口约束","slug":"_13-7-泛型和接口约束","link":"#_13-7-泛型和接口约束","children":[]},{"level":2,"title":"13.8 实现多个具有相同方法名和签名的接口","slug":"_13-8-实现多个具有相同方法名和签名的接口","link":"#_13-8-实现多个具有相同方法名和签名的接口","children":[]},{"level":2,"title":"13.9 用显式接口方法实现来增强编译时类型安全性","slug":"_13-9-用显式接口方法实现来增强编译时类型安全性","link":"#_13-9-用显式接口方法实现来增强编译时类型安全性","children":[]},{"level":2,"title":"13.10 谨慎使用显式接口方法实现","slug":"_13-10-谨慎使用显式接口方法实现","link":"#_13-10-谨慎使用显式接口方法实现","children":[]},{"level":2,"title":"13.11 设计：基类还是接口","slug":"_13-11-设计-基类还是接口","link":"#_13-11-设计-基类还是接口","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/ch13_Interfaces.md"}');export{t as comp,u as data};
