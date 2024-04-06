import{_ as e}from"./16_1-DKFsOkDL.js";import{_ as n,o as i,c as d,e as l}from"./app-IxoMmWNN.js";const c={},a=l(`<h1 id="第-16-章-数组" tabindex="-1"><a class="header-anchor" href="#第-16-章-数组"><span>第 16 章 数组</span></a></h1><p>本章内容</p><ul><li><a href="#16_1">初始化数组元素</a></li><li><a href="#16_2">数组转型</a></li><li><a href="#16_3">所有数组都隐式派生自 <code>System.Array</code></a></li><li><a href="#16_4">所有数组都隐式实现 <code>IEnumerable</code>、<code>ICollection</code> 和 <code>IList</code></a></li><li><a href="#16_5">数组的传递和返回</a></li><li><a href="#16_6">创建下限非零的数组</a></li><li><a href="#16_7">数组的内部工作原理</a></li><li><a href="#16_8">不安全的数组访问和固定大小的数组</a></li></ul><p>数组是允许将多个数据项作为集合来处理的机制。CLR 支持一维、多维和交错数组(即数组构成的数组)。所有数组类型都隐式地从 <code>System.Array</code> 抽象类派生，后者又派生自 <code>System.Object</code>。这意味着数组始终是引用类型，是在托管堆上分配的。在应用程序的变量或字段中，包含的是对数组的引用，而不是包含数组本身的元素。下面的代码更清楚地说明了这一点：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Int32[] myIntegers;                 // 声明一个数组引用
myIntegers = new Int32[100];        // 创建含有 100 个 Int32 的数组
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>第一行代码声明 <code>myIntegers</code> 变量，它能指向包含 <code>Int32</code> 值的一维数组。<code>myIntegers</code> 刚开始设为 <code>null</code>，因为当时还没有分配数组。第二行代码分配了含有 100 个 <code>Int32</code> 值的数组，所有 <code>Int32</code> 都被初始化为 0。由于数组是引用类型，所以会在托管堆上分配容纳 100 个未装箱<code>Int32</code>所需的内存块。实际上，除了数组元素，数组对象占据的内存块还包含一个类型对象指针、一个同步块索引和一些额外的成员<sup>①</sup>。该数组的内存块地址被返回并保存到<code>myIntegers</code>变量中。</p><blockquote><p>① 这些额外的成员称为 overhead 字段或者说“开销字段”。 —— 译注</p></blockquote><p>还可创建引用类型的数组：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Control[] myControls;               // 声明一个数组引用
myControls = new Control[50];       // 创建含有 50 个 Control 引用的数组
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>第一行代码声明<code>myControls</code> 变量，它能指向包含 <code>Control</code> 引用的一维数组。<code>myControls</code> 刚开始被设为 <code>null</code>，因为当时还没有分配数组。第二行代码分配了含有 50 个 <code>Control</code> 引用的数组，这些引用全被初始化为<code>null</code>。由于 <code>Control</code> 是引用类型，所以创建数组只是创建了一组引用，此时没有创建实际的对象。这个内存块\b的地址被返回并保存到 <code>myControls</code> 变量中。</p><p>图 16-1 展示了值类型的数组和引用类型的数组在托管堆中的情况。</p><p><img src="`+e+`" alt="16_1"></p><p>图 16-1 值类型和引用类型的数组在托管堆中的情况</p><p>图 16—1 中，<code>Control</code> 数组显示了执行以下各行代码之后的结果：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>myControls[1] = new Button();
myControls[2] = new TextBox();
myControls[3] = myControls[2];
myControls[46] = new DataGrid();
myControls[48] = new ComboBox();
myControls[49] = new Button();
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>为了符合“公共语言规范”(Common Language Specification， CLS)的要求，所有数组都必须是 0 基数组(即最小索引为 0)。这样就可以用 C# 的方法创建数组，并将该数组的引用传给用其他语言(比如 Microsoft Visual Basic .NET)写的代码。此外，由于 0 基数组是最常用的数组(至少就目前而言)，所以 Microsoft 花了很大力气优化性能。不过， CLR 确实支持非 0 基数组，只是不提倡使用。对于不介意稍许性能下降或者跨语言移植问题的读者，本章后文要介绍如何创建和使用非 0 基数组。</p><p>注意在图 16-1 中，每个数组都关联了一些额外的开销信息。这些信息包括数组的秩<sup>①</sup>、数组每一维的下限(几乎总是 0)和每一维的长度。开销信息还包含数组的元素类型。本章后文将介绍查询这种开销信息的方法。</p><blockquote><p>① 即 rank，或称数组的维数。 ——译注</p></blockquote><p>前面已通过几个例子演示了如何创建一维数组。应尽可能使用一维 0 基数组，有时也将这种数组称为 SZ<sup>②</sup>数组或向量(vector)。向量的性能是最佳的，因为可以使用一些特殊的 IL 指令(比如 <code>newarr</code>，<code>ldelem</code>，<code>ldelema</code>，<code>ldlen</code> 和 <code>stelem</code>)来处理。不过，必要时也可使用多维数组。下面展示了几个多维数组的例子：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建一个二维数组，由 Double 值构成
Double[,] myDoubles = new Double[10, 20];

// 创建一个三维数组，由 String 引用构成
String[,,] myStrings = new String[5, 3, 10];
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>② SZ 是 single-dimension, zero-based(一维 0 基)的简称。 ——译注</p></blockquote><p>CLR 还支持交错数组(jagged array)，即数组构成的数组。0 基一维交错数组的性能和普通向量一样好。不过，访问交错数组的元素意味着必须进行两次或更多次数组访问。下例演示了如何创建一个多边形数组，每个多边形都由一个包含 <code>Point</code> 实例的数组构成：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建由多个 Point 数组构成的一维数组
Point[][] myPolygons = new Point[3][];

// myPolygons[0] 引用一个含有 10 个 Point 实例的数组
myPolygons[0] = new Point[10];

// myPolygons[1] 引用一个含有 20 个 Point 实例的数组
myPolygons[1] = new Point[20];

// myPolygons[2] 引用一个含有 30 个 Point 实例的数组
myPolygons[2] = new Point[30];

// 显示第一个多边形中的 Point
for (Int32 x = 0; x &lt; myPolygons[0].Length; x++)
    Console.WriteLine(myPolygons[0][x]);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 CLR 会验证数组索引的有效性。换句话说，不能创建含有 100 个元素的数组(索引编号 0 到 99)，然后试图访问索引为 -5 或 100 的元素。这样做会导致 <code>System.IndexOutOfRangeException</code> 异常。允许访问数组范围之外的内存会破坏类型安全性，而且会造成潜在的安全漏洞，所以 CLR 不允许可验证的代码这么做。通常，索引范围检查对性能的影响微乎其微，因为 JIT 编译器通常只在循环开始之前检查一次数组边界，而不是每次循环迭代都检查<sup>①</sup>。不过，如果仍然担心 CLR 索引检查造成的性能损失，可以在 C# 中使用 unsafe 代码来访问数组。16.7 节“数组的内部工作原理”将演示具体做法。</p></blockquote><blockquote><p>① 不要混淆“循环”和“循环迭代”。例如以下代码：</p></blockquote><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Int32[] myArray = new Int32[100];
for (Int32 i = 0; i &lt; myArray.Length; i++) myArray[i] = i;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>“<code>for</code>循环”总共要“循环迭代100次”，有时也简单地说“迭代100次”。 —— 译注</p></blockquote><h2 id="_16-1-初始化数组元素" tabindex="-1"><a class="header-anchor" href="#_16-1-初始化数组元素"><span><a name="16_1">16.1 初始化数组元素</a></span></a></h2><p>前面展示了如何创建数组对象，如何初始化数组中的元素。C# 允许用一个语句做这两件事情。例如：</p><p><code>String[] names = new String[] { &quot;Aidan&quot;, &quot;Grant&quot; };</code></p><p>大括号中的以逗号分隔的数据的数据项称为<strong>数组初始化器</strong>(array initializer)。每个数据项都可以是一个任意复杂度的表达式；在多维数组的情况下，则可以是一个嵌套的数组初始化器。上例只使用了两个简单的<code>String</code>表达式。</p><p>在方法中声明局部变量来引用初始化好的数组时，可利用 C# 的“隐式类型的局部变量”功能来简化一下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 利用 C# 的隐式类型的局部变量功能：
var names = new String[] { &quot;Aidan&quot;, &quot;Grant&quot; };
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>编译器推断局部变量 <code>names</code> 是 <code>String[]</code> 类型，因为那是赋值操作符(<code>=</code>)右侧的表达式的类型。</p><p>可利用 C# 的隐式类型的数组功能让编译器推断数组元素的类型。注意，下面这行代码没有在 <code>new</code> 和 <code>[]</code>之间指定类型。</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 利用 C#的隐式类型的局部变量和隐式类型的数组功能:
var names = new[] { &quot;Aidan&quot;, &quot;Grant&quot;, null }；
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>在上一行中，编译器检查数组中用于初始化数组元素的表达式的类型，并选择所有元素最接近的共同基类来作为数组的类型。在本例中，编译器发现两个 <code>String</code> 和一个 <code>null</code>。由于 <code>null</code> 可隐式转型为任意引用类型(包括 <code>String</code>)，所以编译器推断应该创建和初始化一个由 <code>String</code> 引用构成的数组。但假如写以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 使用 C# 的隐式类型的局部变量和隐式类型的数组功能：(错误)
var names = new[] { &quot;Aidan&quot;, &quot;Grant&quot;, 123 }；
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>编译器就会报错：<code>error Cs0826:找不到隐式类型数组的最佳类型</code>。这是由于两个 <code>String</code> 和一个 <code>Int32</code> 的共同基类是 <code>Object</code>，意味着编译器不得不创建 <code>Object</code>引用的一个数组，然后对 <code>123</code> 进行装箱，并让最后一个数组元素引用已装箱的、值为 <code>123</code> 的一个 <code>Int32</code>。C# 团队认为，隐式对数组元素进行装箱是一个代价高昂的操作，所以要在编译时报错。</p><p>作为初始化数组时的一个额外的语法奖励，还可以像下面这样写：</p><p><code>String[] names = { &quot;Aidan&quot;, &quot;Grant&quot; };</code></p><p>注意，赋值操作符(<code>=</code>)右侧只给出了一个初始化器，没有 <code>new</code>，没有类型，没有 <code>[]</code>。这个语法可读性很好，但遗憾的是，C#编译器不允许在这种语法中使用隐式类型的局部变量：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 试图使用隐式类型的局部变量(错误)
var names = { &quot;Aidan&quot;, &quot;Grant&quot; };
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>试图编译上面这行代码，编译器会报告以下两条消息。</p><ul><li><p>error CS0820：无法用数组初始值设定项初始化隐式类型的局部变量。</p></li><li><p>error CS0622；只能使用数组初始值设定项表达式为数组类型赋值，请尝试改用 new 表达式。</p></li></ul><p>虽然理论上可以通过编译，但 C#团队认为编译器在这里会为你做太多的工作。它要推断数组类型，新建数组对象那个，初始化数组，还要推断局部变量的类型。</p><p>最后讲一下“隐式类型的数组”如何与“匿名类型”和“隐式类型的局部变量”组合使用。10.1.4 “匿名类型”已讨论了匿名类型以及如何保证类型同一性。下面来看看以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 使用 C# 的隐式类型的局部变量、隐式类型的数组和匿名类型功能：
var kids = new[] { new { Name=&quot;Aidan&quot; }, new { Name=&quot;Grant&quot; }};

// 示例用法(用了另一个隐式类型的局部变量)：
foreach (var kid in kids)
    Console.WriteLine(kid.Name);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这个例子在一个数组初始化器中添加了两个用于定义数组元素的表达式。每个表达式都代表一个匿名类型(因为 <code>new</code> 操作符后没有提供类型名称)。由于连个匿名类型具有一致的结构(有一个 <code>String</code> 类型的 <code>Name</code> 字段)，所以编译器知道这两个对象具有相同的类型(类型的同一性)。然后，我使用了 C#的“隐式类型的数组”功能(在 <code>new</code> 和 <code>[]</code> 之间不指定类型)，让编译器推断数组本身的类型，构造这个数组对象，并初始化它内部的两个引用，指向匿名类型的两个实例。最后，将对这个数组对象的引用赋给 <code>kids</code> 局部变量，该变量的类型通过C# 的“隐式类型的局部变量”功能来推断。</p><p>第二行代码用 <code>foreach</code> 循环演示如何使用刚才创建的、用两个匿名类型实例初始化的数组。注意必须为循环使用隐式类型的局部变量(<code>kid</code>)。运行这段代码将得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Aidan
Grant
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_16-2-数组转型" tabindex="-1"><a class="header-anchor" href="#_16-2-数组转型"><span><a name="16_2">16.2 数组转型</a></span></a></h2><p>对于元素为引用类型的数组，CLR 允许将数组元素从一种类型转型另一种。成功转型要求数组维数相同，而且必须存在从元素源类型到目标类型的隐式或显式转换。CLR 不允许将值类型元素的数组转型为其他任何类型。(不过，可用 <code>Array.Copy</code>方法创建新数组并在其中填充元素来模拟这种效果。)<sup>①</sup>以下代码演示了数组转型：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 创建二维 FileStream 数组
FileStream[,] fs2dim = new FileStream[5, 10];

// 隐式转型为二维 Object 数组
Object[,] o2dim = fs2dim;

// 二维数组不能转型为一维数组，编译器报错：
// error CS00303: 无法将类型“object[*,*]”转换为“System.IO.Stream[]”
Stream[] sldim = (Stream[]) o2dim;

// 显示转型为二维 Stream 数组
Stream[,] s2dim = (Stream[,]) o2dim;

// 显式转型为二维 String 数组
// 能通过编译，但在运行时抛出 InvalidCastException 异常
String[,] st2dim = (String[,]) o2dim;

// 创建一维 Int32 数组(元素是值类型)
Int32[] ildim = new Int32[5];

// 不能将值类型的数组转型为其他任何类型，编译器报错：
// error CS0030：无法将类型 &quot;int[]&quot; 转换为 &quot;Object[]&quot;
Object[] oldim = (Object[]) ildim;

// 创建一个新数组，使用 Array.Copy 将源数组中的每个元素
// 转型为目标数组中的元素类型，并把它们复制过去。
// 下面的代码创建元素为引用类型的数组，
// 每个元素都是对已装箱 Int32 的引用
Object[] obldim = new Object[ildim.Length];
Array.Copy(ildim, obldim, ildim.Length);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Array.Copy</code> 的作用不仅仅是将元素从一个数组复制到另一个。<code>Copy</code>方法还能正确处理内存的重叠区域，就像 C 的 <code>memmove</code> 函数一样。有趣的是， C 的 <code>memcpy</code> 函数反而不能正确处理处理重叠的内存区域。<code>Copy</code>方法还能在复制每个数组元素时进行必要的类型转换，具体如下所述：</p><ul><li><p>将值类型的元素装箱为引用类型的元素，比如将一个 <code>Int32[]</code> 复制到一个 <code>Object[]</code> 中。</p></li><li><p>将引用类型的元素拆箱为值类型的元素，比如将一个 <code>Object[]</code> 复制到一个 <code>Int32[]</code> 中。</p></li><li><p>加宽 CLR 基元值类型，比如将一个 <code>Int32[]</code> 的元素复制到一个 <code>Double[]</code> 中。</p></li><li><p>在两个数组之间复制时，如果仅从数组类型证明不了两者的兼容性，比如从 <code>Object[]</code> 转型为 <code>IFormattable[]</code>，就根据需要对元素进行向下类型转换。如果<code>Object[]</code>中的每个对象都实现了<code>IFormattable</code>，<code>Copy</code>方法就能成功执行。</p></li></ul><p>下面演示了 <code>Copy</code> 方法的另一种用法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 定义实现了一个接口的值类型
internal struct MyValueType : IComparable {
    public Int32 CompareTo(Object obj){
        ...
    }
}

public static class Program {
    public static void Main() {
        // 创建含有 100 个值类型的数组
        MyValueType[] src = new MyValueType[100];

        // 创建 IComparable 引用数组
        IComparable[] dest = new IComparable[src.Length];

        // 初始化 IComparable 数组中的元素，
        // 使它们引用源数组元素的已装箱版本
        Array.Copy(src, dest, src.Length);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>地球人都能猜得到，FCL 频繁运用了 <code>Array</code> 的 <code>Copy</code> 方法。</p><p>有时确实需要将数组从一种类型转换为另一种类型。这种功能称为<strong>数组协变性</strong>(array covariance)。但在利用它时要清楚由此而来的性能损失。假设有以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>String[] sa = new String[100];
Object[] oa = sa;           // oa 引用一个 String 数组
oa[5] = &quot;Jeff&quot;;             // 性能损失：CLR 检查 oa 的元素类型是不是 String；检查通过
oa[3] = 5;                  // 性能损失：CLR 检查 oa 的元素类型是不是 Int32；发现有错，
                            // 抛出 ArrayTypeMismatchException 异常
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在上述代码中，<code>oa</code> 变量被定义为 <code>Object[]</code> 类型，但实际引用的是一个 <code>String[]</code>。编译器允许代码将 5 放到数组元素中，因为 5 是 <code>Int32</code>,而 <code>Int32</code> 派生自 <code>Object</code>。虽然编译能通过，但 CLR 必须保证类型安全。对数组元素赋值时，它必须保证赋值的合法性。所以，CLR 必须在运行时检查数组包含的是不是 <code>Int32</code> 元素。在本例中，在本例中，答案是否定的，所有不允许赋值；CLR 抛出 <code>ArrayTypeMismatchException</code> 异常。</p><blockquote><p>注意 如果只是需要将数组的某些元素复制到另一个数组，可选择<code>System.Buffer</code> 的 <code>BlockCopy</code> 方法，它比 <code>Array</code> 的 <code>Copy</code>方法快。但<code>Buffer</code> 的 <code>BlockCopy</code> 方法只支持基于类型，不提供像<code>Array</code>的<code>Copy</code>方法那样的转型能力。方法的<code>Int32</code>参数代表的是数组中的字节偏移量，而非元素索引。设计<code>BlockCopy</code>的目的实际是将按位兼容(bitwise-compatible)<sup>①</sup>的数据从一个数组类型复制到另一个按位兼容的数据类型，比如将包含 Unicode 字符的一个 <code>Byte[]</code>(按字节的正确顺序)复制到一个 <code>Char[]</code> 中，该方法一定程度上弥补了不能将数组当作任意类型的内存块来处理的不足。</p></blockquote><blockquote><p>要将一个数组的元素可靠地复制到另一个数组，应该使用<code>System.Array</code>的<code>ConstrainedCopy</code>方法。该方法要么完成复制，要么抛出异常，总之不会破坏目标数组中的数据。这就允许<code>ConstrainedCopy</code>在约束执行区域(Constrained Execution Region, CER)中执行。为了提供这种保证，<code>ConstrainedCopy</code> 要求源数组的元素类型要么与目标数组的元素类型相同，要么派生自目标数组的元素类型。另外，它不执行任何装箱、拆箱或向下类型转型。</p></blockquote><blockquote><blockquote><p>① “按位兼容”因为英文原文是 bitwise-compatible，所以人们发明了 blittable 一词来表示这种类型。这种类型在托管和非托管内存中具有相同的表示。一部分基元类型是 blittable 类型。如果一维数组包含的是 blittable 类型。另外，格式化的值类型如果包含 blittable 类型，该值类型也是 blittable 类型。欲知详情，请在 MSDN 文档中搜索“可直接复制到本机结构中的类型和非直接复制到本机结构中的类型”这一主题。——译注</p></blockquote></blockquote><h2 id="_16-3-所有数组都隐式派生自-system-array" tabindex="-1"><a class="header-anchor" href="#_16-3-所有数组都隐式派生自-system-array"><span><a name="16_3">16.3 所有数组都隐式派生自 <code>System.Array</code></a></span></a></h2><p>像下面这样声明数组变量：</p><p><code>FileStream[] fsArray;</code></p><p>CLR 会自动为 AppDomain 创建一个 <code>FileStream[]</code> 类型。该类型隐式派生自 <code>System.Array</code>类型；因此，<code>System.Array</code>类型定义的所有实例方法和属性都将由 <code>FileStream[]</code> 继承，使这些方法和属性能通过 <code>fsArray</code> 变量调用。这极大方便了数组处理，因为<code>System.Array</code>定义了许多有用的实例方法和属性，比如 <code>Clone</code>，<code>CopyTo</code>，<code>GetLength</code>，<code>GetLongLength</code>，<code>GetLowerBound</code>，<code>GetUpperBound</code>，<code>Length</code>，<code>Rank</code>等。</p><p><code>System.Array</code>类型还公开了很多有用的、用于数组处理的静态方法。这些方法均获取一个数组引用作用作为参数。一些有用的静态方法包括：<code>AsReadOnly</code>，<code>BinarySearch</code>，<code>Clear</code>，<code>ConstrainedCopy</code>，<code>ConvertAll</code>，<code>Copy</code>，<code>Exists</code>，<code>Find</code>，<code>FindAll</code>，<code>FindIndex</code>，<code>FindLast</code>，<code>FindLastIndex</code>，<code>Foreach</code>，<code>IndexOf</code>，<code>LastIndexOf</code>，<code>Resize</code>，<code>Sort</code>和<code>TrueForAll</code>。这些方法中，每个都有多个重载版本，能保障编译时的类型安全性和良好的性能。鼓励大家查阅文档，体会这些方法究竟多么有用和强大！</p><h2 id="_16-4-所有数组都隐式实现-ienumerable-icollection和ilist" tabindex="-1"><a class="header-anchor" href="#_16-4-所有数组都隐式实现-ienumerable-icollection和ilist"><span><a name="16_4">16.4 所有数组都隐式实现 <code>IEnumerable</code>，<code>ICollection</code>和<code>IList</code></a></span></a></h2><p>许多方法都能操纵各种各样的集合对象，因为它们声明为允许获取<code>IEnumerable</code>，<code>ICollection</code>和<code>IList</code>等参数。可将数组传给这些方法，因为<code>System.Array</code>也实现了这三个接口。<code>System.Array</code>之所以实现这些非泛型接口，是因为这些接口将所有元素都视为<code>System.Object</code>。然后，最后是让<code>System.Array</code>实现这些接口的泛型形式，提供更好的编译时类型安全性和更好的性能。</p><p>不过，由于涉及多维数组和非 0 基数组的问题，CLR 团队不希望 <code>System.Array</code> 实现<code>IEnumerable&lt;T&gt;</code>，<code>ICollection&lt;T&gt;</code>和<code>IList&lt;T&gt;</code>。若在<code>System.Array</code>上定义这些接口，就会为所有数组类型启用这些接口。所以，CLR没有那么做，而是耍了一个小花招；创建一维 0 基数组类型时，CLR 自动使数组类型实现<code>IEnumerable&lt;T&gt;</code>，<code>ICollection&lt;T&gt;</code>和<code>IList&lt;T&gt;</code>(<code>T</code>是数组元素的类型)。同时，还为数组类型实现这三个接口，只要它们是引用类型。以下层次结构图对此进行了澄清：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Object
    Array (非泛型 IEnumerable, ICollection, IList)
        Object[]            (IEnumerable, ICollection, IList of Object)
          String[]          (IEnumerable, ICollection, IList of String)
          Stream[]          (IEnumerable, ICollection, IList of Stream)
            FileStream[]    (IEnumerable, ICollection, IList of FileStream)
         .
         .      (其他引用类型的数组)
         .
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>所以，如果执行以下代码：</p><p><code>FileStream[] fsArray;</code></p><p>那么当 CLR 创建<code>FileStream[]</code>类型时，会自动为这个类型实现 <code>IEnumerable&lt;FileStream&gt;</code>，<code>ICollection&lt;FileStream&gt;</code>和<code>IList&lt;FileStream&gt;</code>接口。此外，<code>FileStream[]</code>类型还会为基类型实现接口：<code>IEnumerable&lt;Stream&gt;</code>，<code>IEnumerable&lt;Object&gt;</code>，<code>ICollection&lt;Stream&gt;</code>，<code>ICollection&lt;Object&gt;</code>，<code>IList&lt;Stream&gt;</code>和<code>IList&lt;Object&gt;</code>。由于所有这些接口都由 CLR 自动实现，所以在存在这些接口任何地方都可以使用 <code>fsArray</code> 变量。例如，可将 <code>fsArray</code> 变量传给具有以下任何一种原型的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>void M1(IList&lt;FileStream&gt; fsList) { ... }
void M2(ICollection&lt;Stream&gt; sCollection) { ... }
void M3(IEnumerable&lt;Object&gt; oEnumerable) { ... }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，如果数组包含值类型的元素，数组类型不会为元素的基类型实现接口。例如，如果执行以下代码：</p><p><code>DateTime[] dtArray; // 一个值类型的数组</code></p><p>那么 <code>DateTime[]</code> 类型只会实现 <code>IEnumerable&lt;DateTime&gt;</code>，<code>ICollection&lt;DateTime&gt;</code>和<code>IList&lt;DateTime&gt;</code>接口，不会为<code>DateTime</code>的基类型(包括<code>System.ValueType</code>和<code>System.Object</code>)实现这些泛型接口。这意味着<code>dtArray</code>变量不能作为实参传给前面的<code>M3</code>方法。这是因为值类型的数组在内存中的布局与引用类型的数组不同。数组内存的布局请参见本章前面的描述。</p><h2 id="_16-5-数组的传递和返回" tabindex="-1"><a class="header-anchor" href="#_16-5-数组的传递和返回"><span><a name="16_5">16.5 数组的传递和返回</a></span></a></h2><p>数组作为实参传给方法时，实际传递的是对该数组的引用。因此，被调用的方法能修改数组中的元素。如果不想被修改，必须生成数组的拷贝并将拷贝传给方法。注意，<code>Array.Copy</code> 方法执行的是浅拷贝。换言之，如果数组元素是引用类型，新数组将引用现有的对象。</p><p>类似地，有的方法会返回对数组的引用。如果方法构造并初始化数组，返回数组引用是没有问题的。但假如方法返回的是对字段所维护的一个内部数组的引用，就必须决定是否想让该方法的调用者直接访问这个数组及其元素。如果是，就可以返回数组引用。但更常见的情况是，你并不希望方法的调用者获得这个访问权限。所以，方法应该构造一个新数组，并调用<code>Array.Copy</code>返回对新数组的引用。再次提醒，<code>Array.Copy</code>执行的是对原始数组的浅拷贝。</p><p>如果定义返回数组引用的方法，而且数组中不包含元素，那么方法既可以返回<code>null</code>，也可以返回对包含零个元素的一个数组的引用。实现这种方法时，Microsoft 强烈建议让它返回后者，因为这样能简化调用该方法时需要写的代码<sup>①</sup>。例如，以下代码很容易理解。而且即使没有可供遍历的约会(即 <code>appointments</code> 数组中没有元素)，也能正确运行：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 这段代码更容易写，更容易理解
Appointment[] appointments = GetAppointmentsForToday();
for (Int32 a = 0; a &lt; appointments.Length; a++) {
    // 对 appointments[a]执行操作
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>① 因为不需要执行 <code>null</code> 值检测。 —— 译注</p></blockquote><p>以下代码也能在没有约会的前提下正确运行，但写起来麻烦一些，而且不好理解：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 这段代码写起来麻烦一些，而且不好理解
Appointment[] appointments = GetAppointmentsForToday();
if (appointments != null) {
    for (Int32 a = 0; a &lt; appointments.Length; a++) {
        // 对 appointments[a] 执行操作
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>将方法设计为返回对含有 0 个元素的一个数组的引用，而不是返回 <code>null</code>，该方法的迪用者就能更轻松地使用该方法。顺便提一句，对字段也应如此。如果类型中有一个字段是数组引用，应考虑让这个字段始终引用数组，即使数组中不包含任何元素。</p><h2 id="_16-6-创建下限非零的数组" tabindex="-1"><a class="header-anchor" href="#_16-6-创建下限非零的数组"><span><a name="16_6">16.6 创建下限非零的数组</a></span></a></h2><p>前面提到过，能创建和操作下限非 0 的数组。可以调用数组的静态 <code>CreatInstance</code> 方法来动态创建自己的数组。该方法有若干个重载版本，允许指定数组元素的类型、数组的维数、每一维的下限和每一维的元素数目。<code>CreateInstance</code> 为数组分配内存，将参数信息保存到数组的内存块的开销(overhead)部分，然后返回对该数组的引用。如果数组维数是2 或 2 以上，就可以把 <code>CreateInstance</code> 返回的引用转型为一个 <code>ElementType[]</code> 变量(<code>ElementType</code>要替换为类型名称)，以简化对数组中的元素的访问。如果只有一维，C# 要求必须使用该 <code>Array</code> 的 <code>GetValue</code> 和 <code>SetValue</code>方法访问数组元素。</p><p>以下代码演示了如何动态创建由 <code>System.Decimal</code> 值构成的二维数组。第一维代表 2005 到 2009(含)年份，第二维 1 到 4(含)季度。代码遍历动态数组中的所有元素。我本来可以将数组的上下限硬编码到代码中，这样能获取更好的性能。但我最后决定使用<code>System.Array</code>的<code>GetLowerBound</code>和<code>GetUpperBound</code>方法来演示它们的用法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public sealed class DynamicArrays {
    public static void Main() {
        // 我想创建一个二维数组 [2005..2009][1..4]
        Int32[] lowerBounds = { 2005, 1 };
        Int32[] lengths     = {    5, 4 };
        Decimal[,] quarterlyRevenue = (Decimal[,]) 
            Array.CreateInstance(typeof(Decimal), lengths, lowerBounds);

        Console.WriteLine(&quot;{0,4} {1,9} {2,9} {3,9} {4,9}&quot;, &quot;Year&quot;, &quot;Q1&quot;, &quot;Q2&quot;, &quot;Q3&quot;, &quot;Q4&quot;);
        Int32 firstYear    = quarterlyRevenue.GetLowerBound(0);
        Int32 lastYear     = quarterlyRevenue.GetUpperBound(0);
        Int32 firstQuarter = quarterlyRevenue.GetLowerBound(1);
        Int32 lastQuarter  = quarterlyRevenue.GetUpperBound(1);

        for (Int32 year = firstYear; year &lt;= lastYear; year++) {
            Console.Write(year + &quot; &quot;);
            for (Int32 quarter = firstQuarter; quarter &lt;= lastQuarter; quarter++) {
                Console.Write(&quot;{0,9:C} &quot;, quarterlyRevenue[year, quarter]);
            }
            Console.WriteLine();
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>编译并运行这段代码将得到以下输出：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Year     Q1        Q2        Q3        Q4
2005     $0.00     $0.00     $0.00     $0.00 
2006     $0.00     $0.00     $0.00     $0.00 
2007     $0.00     $0.00     $0.00     $0.00 
2008     $0.00     $0.00     $0.00     $0.00 
2009     $0.00     $0.00     $0.00     $0.00 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_16-7-数组的内部工作原理" tabindex="-1"><a class="header-anchor" href="#_16-7-数组的内部工作原理"><span><a name="16_7">16.7 数组的内部工作原理</a></span></a></h2><p>CLR 内部实际支持两种不同的数组。</p><ul><li><p>下限为 0 的一维数组。这些数组有时称为 SZ(single-dimensional,zero-based, 一维 0 基)数组或向量(vector)。</p></li><li><p>下限未知的一维或多维数组。</p></li></ul><p>可执行以下代码来实际地查看不同种类的数组(注释显示了输出)</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public sealed class DynamicArrays {
    public static void Main() {
        Array a;

        // 创建一维的 0 基数组，不包含任何元素
        a = new String[0];
        Console.WriteLine(a.GetType());     // &quot;System.String[]&quot;

        // 创建一维 0 基数组，不包含任何元素
        a = Array.CreateInstance(typeof(String), new Int32[] { 0 }, new Int32[] { 0 });
        Console.WriteLine(a.GetType());     // &quot;System.String[]&quot;

        // 创建一维 1 基数组，其中不包含任何元素
        a = Array.CreateInstance(typeof(String), new Int32[] { 0 }, new Int32[] { 1 });
        Console.WriteLine(a.GetType());     // &quot;System.String[*]&quot;  &lt;-- 这个显示很奇怪，不是吗？

        Console.WriteLine();

        // 创建二维 0 基数组，其中不包含任何元素
        a = new String[0, 0];
        Console.WriteLine(a.GetType());     // &quot;System.String[,]&quot;

        // 创建二维 0 基数组，其中不包含任何元素
        a = Array.CreateInstance(typeof(String), new Int32[] { 0, 0 }, new Int32[] { 0, 0 });
        Console.WriteLine(a.GetType());    // &quot;System.String[,]&quot;

        //
        a = Array.CreateInstance(typeof(String), new Int32[] { 0, 0 }, new Int32[] { 0, 0 });
        Console.WriteLine(a.GetType());    // &quot;System.String[,]&quot;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每个 <code>Console.WriteLine</code> 语句后都有一条指出其输出的注释。对于一维数组，0 基数组显示的类型名称是 <code>System.String[]</code>，但 1 基数组显示的是 <code>System.String[*]</code>。<code>*</code> 符号表明 CLR 知道该数组不是 0 基的。注意，C# 不允许声明 <code>String[*]</code> 类型的变量，因此不能使用 C# 语法来访问一维非 0 基数组。尽管可以调用 <code>Array</code> 的 <code>GetValue</code> 和 <code>SetValue</code> 方法来访问这种数组的元素，但速度会比较慢，因为有方法调用的开销。</p><p>对于多维数组，0 基和 1 基数组会显示同样的类型名称：<code>System.String[,]</code>。在运行时，CLR 将所有多维数组都视为非 0 基数组。这自然会让人觉得类型名称应该显示为<code>System.String[*,*]</code>。但是，对于多维数组，CLR 决定不使用<code>*</code>符号。这是由于假如使用<code>*</code>，那么它们始终都会存在，而大量的<code>*</code>会使开发人员产生混淆。</p><p>访问一维 0 基数组的元素比访问非 0 基一维或多维数组的元素稍快。这是多方面的原因造成的。首先，有一些特殊 IL 指令，比如 <code>newarr</code>，<code>ldelem</code>，<code>ldelema</code>，<code>ldlen</code>和<code>stelem</code>，用于处理一维 0 基数组，这些特殊 IL 指令会导致 JIT 编译器生成优化代码。例如，JIT 编译器生成的代码假定数组时 0 基的，所以在访问元素时不需要从指定索引中减去一个偏移量。其次，一般情况下，JIT 编译器能将索引范围检查代码从循环中拿出，导致它只执行一次。以下面这段常见的代码为例：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public static class Program {
    public static void Main() {
        Int32[] a = new Int32[5];
        for (Int32 index = 0; index &lt; a.Length; index++) {
            // 对 a[index] 执行操作
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对于以上代码，首先注意在 <code>for</code> 循环的测试表达式中对数组的 <code>Length</code> 属性的调用。由于 <code>Length</code> 是属性，所以查询长度实际是方法调用。但 JIT 编译器知道 <code>Length</code> 是 <code>Array</code> 类的属性，所以在生成的代码中，实际只调用该属性一次，结果存储到一个临时表变量中。每次循环迭代检查的都是这个临时变量中。每次循环迭代检查的都是这个临时变量。这就加快了 JIT 编译的代码的速度。但有的开发人员低估了 JIT 编译器的“本事”，试图自己写一些“高明”的代码来“帮助”JIT编译器。任何自作聪明的尝试几乎肯定会对性能造成负面影响，还会使代码更难阅读，妨碍可维护性。在上述代码中，最好保持对数组<code>Length</code>属性的调用，而不要自己用什么局部变量来缓存它的值。</p><p>其次要注意，JIT 编译器知道 <code>for</code> 循环要访问 <code>0</code> 到 <code>Length - 1</code>的数组元素。所以，JIT 编译器会生成代码，在运行时测试所有数组元素的访问都在数组有效范围内。具体地说，JIT 编译器会生成代码来检查是否<code>(0 &gt;= a.GetLowerBound(0)) &amp;&amp; ((Length - 1)) &lt;= a.GetUpperBound(0))</code>。这个检查在循环之前发生。如果在数组有效范围内，JIT 编译器不会在循环内部生成代码验证每一次数组访问都在有效范围内。这样一来，循环内部的数组访问变得非常快。</p><p>遗憾的是，正如前文所述，访问“非 0 基一维数组” 或 “多维数组” 的速度比不上一维 0 基数组。对于这些数组类型，JIT 编译器不会将索引检查从循环中拿出来，所以每次数组访问都要验证指定的索引。此外，JIT 编译器还要添加代码从指定索引中减去数组下限，这进一步影响了代码执行速度，即使此时使用的多维数组碰巧是 0 基数组。所以，如果很关心性能，考虑用由数组构成的数组(即交错数组)代替矩形数组。</p><p>C# 和 CLR 还允许使用 <code>unsafe</code>(不可验证)代码访问数组。这种技术实际能在访问数组时关闭索引上下限检查。这种不安全的数组访问技术适合以下元素类型的数组：<code>SByte</code>、<code>Byte</code>、<code>Int16</code>、<code>UInt16</code>、<code>Int32</code>、<code>UInt32</code>、<code>Int64</code>、<code>UInt64</code>、<code>Char</code>、<code>Single</code>、<code>Double</code>、<code>Decimal</code>、<code>Boolean</code>、枚举类型或者字段为上述任何类型的值类型结构。</p><p>这个功能很强大，但使用须谨慎，因为它允许直接内存访问。访问越界(超出数组上下限)不会抛出异常，但会损失内存中的数据，破坏类型安全性，并可能造成安全漏洞！有鉴于此，包含 <code>unsafe</code> 代码的程序集必须被授予完全信任，或至少启用“跳过验证”安全权限。</p><p>以下 C# 代码演示了访问二维数组的三种方式(安全、交错和不安全)：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;
using System.Diagnostics;

public static class Program {
    private const Int32 c_numElements = 10000;
     
    public static void Main() {
        // 声明二维数组
        Int32[,] a2Dim = new Int32[c_numElements, c_numElements];

        // 将二维数组声明为交错数组(向量构成的向量)
        Int32[][] aJagged = new Int32[c_numElements][];
        for (Int32 x = 0; x &lt; c_numElements; x++)
            aJagged[x] = new Int32[c_numElements];

        // 1：用普通的安全技术访问数组中的所有元素
        Safe2DimArrayAccess(a2Dim);

        // 2：用交错数组技术访问数组中的所有元素
        SafeJaggedArrayAccess(aJagged);

        // 3：用 unsafe 技术访问数值中的所有元素
        Unsafe2DimArrayAccess(a2Dim);
    }

    private static Int32 Safe2DimArrayAccess(Int32[,] a) {
        Int32 sum = 0;
        for (Int32 x = 0; x &lt; c_numElements; x++) {
            for (Int32 y = 0; y &lt; c_numElements; y++) {
                sum += a[x, y];
            }
        }
        return sum;
    }

    private static Int32 SafeJaggedArrayAccess(Int32[][] a) {
        Int32 sum = 0;
        for (Int32 x = 0; x &lt; c_numElements; x++) {
            for (Int32 y = 0; y &lt; c_numElements; y++) {
                sum += a[x][y];
            }
        }
        return sum;
    }

    private static unsafe Int32 Unsafe2DimArrayAccess(Int32[,] a) {
        Int32 sum = 0;
        fixed (Int32* pi = a) {
            for (Int32 x = 0; x &lt; c_numElements; x++) {
                Int32 baseOfDim = x * c_numElements;
                for (Int32 y = 0; y &lt; c_numElements; y++) {
                    sum += pi[baseOfDim + y];
                }
            }
        }
        return sum;       
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Unsafe2DimArrayAccess</code> 方法标记了 <code>unsafe</code> 修饰符，这是使用 C# 的 <code>fixed</code> 语句所必须的。编译这段代码要求在运行 C# 编译器时指定 <code>/unsafe</code> 开关，或者在 Microsoft Visual Studio 的项目属性页的“生成”选项卡中勾选“允许不安全代码”。</p><p>写代码时，不安全数据访问技术有时或许是你的最佳选择，但要注意该技术的三处不足。</p><ul><li><p>相较于其他技术，处理数组元素的代码更复杂，不容易读和写，因为要使用 C# <code>fixed</code> 语句，要执行内存地址计算。</p></li><li><p>计算过程中出错，可能访问到不属于数组的内存。这会造成计算错误，损坏内存数据，破坏类型安全性，并可能造成安全漏洞。</p></li><li><p>因为这些潜在的问题，CLR 禁止在降低了安全级别的环境(如 Microsoft Silverlight)中运行不安全代码。</p></li></ul><h2 id="_16-8-不安全的数组访问和固定大小的数组" tabindex="-1"><a class="header-anchor" href="#_16-8-不安全的数组访问和固定大小的数组"><span><a name="16_8">16.8 不安全的数组访问和固定大小的数组</a></span></a></h2><p>不安全的数组访问非常强大，因为它允许访问以下元素。</p><ul><li><p>堆上的托管数组对象中的元素(上一节对此进行了演示)。</p></li><li><p>非托管堆上的数组中的元素。第 14 章的 SecureString 示例演示了如何调用 <code>System.Runtime.InteropServices.Marshal</code> 类的 <code>SecureStringToCoTaskMemUnicode</code> 方法来返回一个数组，并对这个数组进行不安全的数组访问。</p></li><li><p>线程栈上的数组中的元素。</p></li></ul><p>如果性能是首要目标，请避免在堆上分配托管的数组对象。相反，在线程栈上分配数组。这是通过 C# 的 <code>stackalloc</code> 语句来完成的(它在很大程度上类似于 C 的 <code>alloca</code> 函数)。<code>stackalloc</code>语句只能创建一维 0 基、由值类型元素构成的数组，而且值类型绝对不能包含任何引用类型的字段。实际上，应该把它的作用看成是分配一个内存块，这个内存块可以使用不安全的指针来操纵。所以，不能将这个内存缓冲区的地址传给大部分 FCL 语法。当然，栈上分配的内存(数组)会在方法返回时自动释放；这对增强性能起了一定作用。使用这个功能要求为 C# 编译器指定<code>/unsafe</code>开关。</p><p>以下代码中的<code>StackallocDemo</code>方法演示如何使用C# <code>stackalloc</code>语句：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>using System;

public static class Program {
    public static void Main() {
        StackallocDemo();
        InlineArrayDemo();
    }

    private static void StackallocDemo() {
        unsafe {
            const Int32 width = 20;
            Char* pc = stackalloc Char[width];      // 在栈上分配数组 

            String s = &quot;Jeffrey Richter&quot;;           // 15个字符

            for (Int32 index = 0; index &lt; width; index++) {
                pc[width - index - 1] = (index &lt; s.Length) ? s[index] : &#39;.&#39;;
            }

            // 下面这行代码显示“.....rethciR yerffeJ”
            Console.WriteLine(new String(pc, 0, width));
        }
    }

    private static void InlineArrayDemo() {
        unsafe {
            CharArray ca;           // 在栈上分配数组
            Int32 widthInBytes = sizeof(CharArray);
            Int32 width = widthInBytes / 2;

            String s = &quot;Jeffrey Richter&quot;;       // 15 个字符

            for (Int32 index = 0; index &lt; width; index++) {
                ca.Characters[width - index - 1] = (index &lt; s.Length) ? s[index] : &#39;.&#39;;
            }

            // 下面这行代码显示 “.....rethciR yerffeJ”
            Console.WriteLine(new String(ca.Characters, 0, width));
        }
    }
}

internal unsafe struct CharArray {
    // 这个数组内联(嵌入)到结构中
    public fixed Char Characters[20];
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通常，由于数组是引用类型，所以结构中定义的数组字段实际只是指向数组的指针或引用；数组本身在结构的外部。不过，也可像上述代码中的<code>CharArray</code>结构那样，直接将数组嵌入结构。在结构中嵌入数组需满足以下几个条件。</p><ul><li><p>类型必须是结构(值类型)；不能在类(引用类型)中嵌入数组。</p></li><li><p>字段或其定义结构必须用<code>unsafe</code>关键字标记。</p></li><li><p>数组字段必须用 <code>fixed</code> 关键字标记。</p></li><li><p>数组必须是一维 0 基数组。</p></li><li><p>数组的元素类型必须是以下类型之一：<code>Boolean</code>，<code>Char</code>，<code>SByte</code>，<code>Byte</code>，<code>Int16</code>，<code>Int32</code>，<code>UInt16</code>，<code>UInt32</code>，<code>Int64</code>，<code>Single</code>或<code>Double</code>。</p></li></ul><p>要和非托管代码进行互操作，而且非托管数据结构也有一个内联数组，就特别适合使用内联的数组。但内联数组也能用于其他地方。上述代码中的 <code>InlineArrayDemo</code> 方法提供了如何使用内联数组的一个例子。它执行和 <code>StackallocDemo</code> 方法一样的功能，只是用了不一样的方式。</p>`,124),s=[a];function o(r,t){return i(),d("div",null,s)}const m=n(c,[["render",o],["__file","ch16_Arrays.html.vue"]]),b=JSON.parse('{"path":"/zh/chapters/ch16_Arrays.html","title":"第 16 章 数组","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"16.1 初始化数组元素","slug":"_16-1-初始化数组元素","link":"#_16-1-初始化数组元素","children":[]},{"level":2,"title":"16.2 数组转型","slug":"_16-2-数组转型","link":"#_16-2-数组转型","children":[]},{"level":2,"title":"16.3 所有数组都隐式派生自 System.Array","slug":"_16-3-所有数组都隐式派生自-system-array","link":"#_16-3-所有数组都隐式派生自-system-array","children":[]},{"level":2,"title":"16.4 所有数组都隐式实现 IEnumerable，ICollection和IList","slug":"_16-4-所有数组都隐式实现-ienumerable-icollection和ilist","link":"#_16-4-所有数组都隐式实现-ienumerable-icollection和ilist","children":[]},{"level":2,"title":"16.5 数组的传递和返回","slug":"_16-5-数组的传递和返回","link":"#_16-5-数组的传递和返回","children":[]},{"level":2,"title":"16.6 创建下限非零的数组","slug":"_16-6-创建下限非零的数组","link":"#_16-6-创建下限非零的数组","children":[]},{"level":2,"title":"16.7 数组的内部工作原理","slug":"_16-7-数组的内部工作原理","link":"#_16-7-数组的内部工作原理","children":[]},{"level":2,"title":"16.8 不安全的数组访问和固定大小的数组","slug":"_16-8-不安全的数组访问和固定大小的数组","link":"#_16-8-不安全的数组访问和固定大小的数组","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"zh/chapters/ch16_Arrays.md"}');export{m as comp,b as data};
