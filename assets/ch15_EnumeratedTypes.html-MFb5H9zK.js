import{_ as e,o as i,c as n,e as d}from"./app-IxoMmWNN.js";const l={},s=d(`<h1 id="第-15-章-枚举类型和位标志" tabindex="-1"><a class="header-anchor" href="#第-15-章-枚举类型和位标志"><span>第 15 章 枚举类型和位标志</span></a></h1><p>本章内容：</p><ul><li><a href="#15_1">枚举类型</a></li><li><a href="#15_2">位标志</a></li><li><a href="#15_3">为枚举类型添加方法</a></li></ul><p>本章要讨论枚举类型和位标志。由于 Microsoft Windows 和许多编程语言多年来一直在使用这些结构，相信许多人已经知道了如何使用它们。不过，CLR 与 FCL 结合起来之后，枚举类型和位标志才正成为面向对象的类型。而它们提供的一些非常“酷”的功能，我相信大多数开发人员并不熟悉。让我惊讶的是，这些新功能极大地简化了应用程序开发，个中缘由且听我娓娓道来。</p><h2 id="_15-1-枚举类型" tabindex="-1"><a class="header-anchor" href="#_15-1-枚举类型"><span><a name="15_1">15.1 枚举类型</a></span></a></h2><p><strong>枚举类型</strong>(enumerated type)定义了一组“符号名称/值”配对。例如，以下 <code>Color</code> 类型定义了一组符号，每个符号都标识一种颜色：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal enum Color {
    White,          // 赋值 0
    Red,            // 赋值 1
    Green,          // 赋值 2
    Blue,           // 赋值 3
    Orange          // 赋值 4
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当然，也可写程序用 0 表示白色，用 1 表示红色，以此类推。不过，不应将这些数字硬编码到代码中，而应使用枚举类型，理由至少有二。</p><ul><li><p>枚举类型使程序更容易编写、阅读和维护。有了枚举类型，符号名称可在代码中随便使用，程序员不用费心思量每个硬编码值的含义(例如，不用念叨 white 是 0 ， 或者 0 是 white)。而且，一旦与符号名称对应的值发生改变，代码也可以简单地重新编译，不需要对源代码进行任何修改。此外，文档工具和其他实用程序(比如调试程序)能向开发人员显示有意义的符号名称。</p></li><li><p>枚举类型是强类型的。例如，将 <code>Color.Orange</code> 作为参数传给要求 <code>Fruit</code> 枚举类型的方法，编译器会报错。<sup>①</sup></p></li></ul><blockquote><p>① <code>ruit</code> 枚举类型定义的应该是水果，而 <code>Color</code> 枚举类型定义的是颜色。虽然两个枚举类型中都有一个 <code>Orange</code>，但分别代表橙子和橙色。 ——译注</p></blockquote><p>在 Microsoft .NET Framework 中，枚举类型不只是编译器所关心的符号，它还是类型系统中的“一等公民”，能实现很强大的操作。而在其他环境(比如非托管 C++)中，枚举类型是没有这个特点的。</p><p>每个枚举类型都直接从 <code>System.Enum</code> 派生，后者从 <code>System.ValueType</code> 派生，而 <code>System.ValueType</code> 又从 <code>System.Object</code> 派生。所以，枚举类型是值类型(详情参见第 5 章“基元类型、引用类型和值类型”)，可用未装箱和已装箱的形式来表示。但有别于其他值类型，枚举类型不能定义任何方法、属性或事件。不过，可利用C#的“扩展方法”功能模拟向枚举类型添加方法，15.3节“向枚举类型添加方法”展示了一个例子。</p><p>编译枚举类型时，C# 编译器把每个符号转换成类型的一个常量字段。例如，编译器将前面的 <code>Color</code> 枚举类型看成是以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal struct Color : System.Enum {
    // 以下是一些公共常量，它们定义了 Color 的符号和值
    public const Color White    = (Color) 0;
    public const Color Red      = (Color) 1;
    public const Color Green    = (Color) 2;
    public const Color Blue     = (Color) 3;
    public const Color Orange   = (Color) 4;

    // 以下是一个公共实例字段，包含 Color 变量的值，
    // 不能写代码来直接引用该字段
    public Int32 value__;
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>C# 编译器不会实际地编译上述代码，因为它禁止定义从特殊类型 <code>System.Enum</code> 派生的类型。不过，可通过上述伪类型定义了解内部的工作方式。简单地说，枚举类型只是一个结构，其中定义了一组常量字段和一个实例字段。常量字段会嵌入程序集的的元数据中，并可通过反射来访问。这意味着可以在运行时获得与枚举类型关联的所有符号及其值。还意味着可以将字符串符号转换成对应的数值。这些操作是通过<code>System.Enum</code>基类型来提供的，该类型提供了几个静态和实例方法，可利用它们操作枚举类型的实例，从而避免了必须使用反射的麻烦。下面将讨论其中一些操作。</p><blockquote><p>重要提示 枚举类型定义的符号时常量值。所以当编译器发现代码引用了枚举类型的符号时，会在编译时用数值替换符号，代码不再引用定义了符号的枚举类型。这意味着运行时可能并不不要定义了枚举类型的程序集，编译时才需要。假如代码引用了枚举类型(而非仅仅引用类型定义的符号)，那么运行时就需要包含了枚举类型定义的程序集。可能会出现一些版本问题，因为枚举类型符号是常量，而非只读的值。7.1 节 “常量”已解释过这些问题。</p></blockquote><p>例如，<code>System.Enum</code> 类型有一个名为<code>GetUnderlyingType</code>的静态方法，而<code>System.Type</code>类型有一个名为<code>GetEnumUnderlyingType</code>的实例方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static Type GetUnderlyingType(Type enumType);    // System.Enum 中定义
public Type GetEnumUnderlyingType();                    // System.Type 中定义
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这些方法返回用于容纳一个枚举类型的值的基础类型。每个枚举类型都有一个基础类型，它可以是<code>byte</code>，<code>sbyte</code>，<code>short</code>，<code>ushort</code>，<code>int</code>(最常用，也是 C#默认选择的)，<code>uint</code>，<code>long</code>或<code>ulong</code>。虽然这些 C# 基元类型<sup>①</sup>都有对应的 FCL 类型，但 C#编译器为了简化本身的实现，要求只能指定基元类型名称。如果使用 FCL 类型名称(比如 <code>Int32</code>)，会显示以下错误信息：<code>error CS1008：应输入类型 byte、sbyte、short、ushort、int、uint、long 或 ulong</code>。</p><blockquote><p>① 不要混淆“基础类型”和“基元类型”(参见 5.1 节“编程语言的基元类型”)。虽然枚举的基础类型就是这些基元类型(其实就是除<code>Char</code>之外的所有整型)，但英语中用 underlying type 和 primitive type 进行了区分，中文翻译同样要区分。简而言之，基元类型是语言的内建类型，编译器能直接识别。——译注</p></blockquote><p>以下代码演示了如何声明一个基础类型为 <code>byte(System.Byte)</code>的枚举类型：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal enum Color : byte {
    White,
    Red,
    Green,
    Blue,
    Orange
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>基于这个<code>Color</code>枚举类型，以下代码显示了<code>GetUnderlyingType</code>的返回结果：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 以下代码会显示 “System.Byte”
Console.WriteLine(Enum.GetUnderlyingType(typeof(Color)));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>C# 编译器将枚举类型视为基元类型。所以可用许多熟悉的操作符(<code>==</code>，<code>!=</code>，<code>&lt;</code>，<code>&gt;</code>，<code>&lt;=</code>，<code>&gt;=</code>，<code>+</code>，<code>-</code>，<code>^</code>，<code>&amp;</code>，<code>|</code>，<code>~</code>，<code>++</code>和<code>--</code>)来操纵枚举类型的实例。所有这些操作符实际作用于每个枚举类型实例内部的 <code>value__</code> 实例字段。此外，C# 编译器允许将枚举类型的实例显式转型为不同的枚举类型。也可显式将枚举类型实例转型为数值类型。</p><p>给定一个枚举类型的实例，可调用从<code>System.Enum</code> 继承的 <code>ToString</code> 方法，把这个值映射为以下几种字符串表示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Color c = Color.Blue;   
Console.WriteLine(c);                   // “Blue” (常规格式)
Console.WriteLine(c.ToString());        // “Blue” (常规格式)
Console.WriteLine(c.ToString(&quot;G&quot;));     // “Blue” (常规格式)
Console.WriteLine(c.ToString(&quot;D&quot;));     // “3”  (十进制格式)
Console.WriteLine(c.ToString(&quot;X&quot;));     // “03” (十六进制格式)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 使用十六进制格式时，<code>ToString</code>总是输出大写字母。此外，输出几位数取决于枚举的基础类型：<code>byte/sbyte</code> 输出 2 位数，<code>short/ushort</code>输出 4 位数，<code>int/uint</code> 输出 8 位数，而 <code>long/ulong</code> 输出 16 位数。如有必要会添加前导零。</p></blockquote><p>除了<code>ToString</code>方法，<code>System.Enum</code>类型还提供了静态<code>Format</code>方法，可调用它格式化枚举类型的值：</p><p><code>public static String Format(Type enumType, Object value, String format);</code></p><p>个人倾向于调用<code>ToString</code>方法，因为它需要的代码更少，而且更容易调用。但<code>Format</code>有一个<code>ToString</code>没有的优势：允许为<code>value</code>参数传递数值。这样就不一定要有枚举类型的实例。例如，以下代码将显示“Blue”：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 以下代码显示“Blue”
Console.WriteLine(Enum.Foramt(typeof(Color), 3, &quot;G&quot;));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 声明有多个符号的枚举类型时，所有符号都可以有相同的数值。使用常规格式将数值转换为符号时，<code>Enum</code>的方法会返回其中一个符号，但不保证具体返回哪一个符号名称。另外，如果没有为要查找的数值定义符号，会返回包含该数值的字符串。</p></blockquote><p>也可调用<code>System.Enum</code>的静态方法<code>GetValues</code>或者<code>System.Type</code>的实例方法<code>GetEnumValues</code>来返回一个数组，数组中的每个元素都对应枚举类型中的一个符号名称，每个元素都包含符号名称的数值：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static Array GetValues(Type enumType);   // System.Enum 中定义
public Array GetEnunmValues();                  // System.Type 中定义
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>该方法可以结合<code>ToString</code>方法使用以显示枚举类型中的所有符号名称及其对应数值，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Color[] colors = (Color[])Enum.GetValues(typeof(Color));
Console.WriteLine(&quot;Number of symbols defined: &quot; + colors.Length);
Console.WriteLine(&quot;Value\\tSymbol\\n-----\\t------&quot;);
foreach (Color c in colors) {
    // 以十进制和常规格式显示每个符号
    Console.WriteLine(&quot;{0,5:D}\\t{0:G}&quot;, c);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上代码的输出如下：</p><div class="language-cmd line-numbers-mode" data-ext="cmd" data-title="cmd"><pre class="language-cmd"><code>Number of symbols defined: 5
Value   Symbol
-----   ------
    0   White
    1   Red
    2   Green
    3   Blue
    4   Orange
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我个人不喜欢 <code>GetValues</code> 和 <code>GetEnumValues</code> 方法，因为两者均返回一个<code>Array</code>，必须转型成恰当的数组类型。所以我总是定义自己的方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static TEnum[] GetEnumValues&lt;TEnum&gt;() where TEnum : struct {
    return (TEnum[])Enum.GetValues(typeof(TEnum));
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用我的泛型 <code>GetEnumValues</code> 方法可获得更好的编译时类型安全性，而且上例的第一行代码可简化成以下形式：</p><p><code>Color[] colors = GetEnumValues&lt;Color&gt;();</code></p><p>前面的讨论展示了可以对枚举类型执行的一些很“酷”的操作。在程序的 UI 元素(列表框、组合框等)中显示符号名称时，我认为经常使用的会是 <code>ToString</code> 方法(常规格式)，前提是字符串不需要本地化(因为枚举类型没有提供本地化支持)。除了 <code>GetValues</code> 方法， <code>System.Enum</code> 和 <code>System.Type</code> 类型提供了以下方法来返回枚举类型的符号：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 返回数值的字符串表示
public static String GetName(Type enumType, Object value);      // System.Enum 中定义
public String GetEnumName(Object value);                        // System.Type 中定义 

// 返回一个 String 数组， 枚举中每个符号都对应一个 String
public static String[] GetNames(Type enumType);                 // System.Enum 中定义
public String[] GetEnumNames();                                 // System.Type 中定义
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>前面讨论了用于查找枚举类型中的符号的多种方法。但还需要一个方法来查找与符号对应的值。例如，可利用这个操作转换用户在文本框中输入的一个符号。利用 <code>Enum</code> 提供的静态 <code>Parse</code> 和 <code>TryParse</code> 方法，可以很容易地将符号转换为枚举类型的实例：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static Object Parse(Type enumType, String value);
public static Object Prase(Type enumType, String value, Boolean ignoreCase);
public static Boolean TryParse&lt;TEnum&gt;(String value, out TEnum result) where TEnum : struct;
public static Boolean TryParse&lt;TEnum&gt;(String value, Boolean ignoreCase, out TEnum result) where TEnum : struct;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下代码演示了如何使用这些方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 因为 Orange 定义为 4，&#39;c&#39; 被初始化为 4
Color c = (Color) Enum.Parse(typeof(Color), &quot;Orange&quot;, true);

// 因为没有定义 Brown， 所以抛出 ArgumentException 异常
Color c = (Color) Enum.Parse(typeof(Color), &quot;Brown&quot;, false);

// 创建值为 1 的 Color 枚举类型实例
Enum.TryParse&lt;Color&gt;(&quot;1&quot;, false, out c);

// 创建值为 23 的 Color 枚举类型实例
Enum.TryParse&lt;Color&gt;(&quot;23&quot;, false, out c);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下是 <code>Enum</code> 的静态 <code>IsDefined</code> 方法和 <code>Type</code> 的 <code>IsEnumDefined</code>:</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public static Boolean IsDefined(Type enumType, Object value);       // System.Enum 中定义
public Boolean IsEnumDefined(Object value);                         // System.Type 中定义
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可利用 <code>IsDefined</code> 方法判断数值对于某枚举类型是否合法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 显示 “True”，因为 Color 将 Red 定义为 1
Console.WriteLine(Enum.IsDefined(typeof(Color), 1));

// 显示 “True”，因为 Color 将 White 定义为 0 
Console.WriteLine(Enum.IsDefined(typeof(Color), &quot;White&quot;));

// 显示 “False”， 因为检查要区分大小写
Console.WriteLine(Enum.IsDefined(typeof(Color), &quot;white&quot;));

// 显示“False”，因为 Color 没有和值 10 对应的符号
Console.WriteLine(Enum.IsDefined(typeof(Color), 10));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>IsDefined</code> 方法被经常用于参数校验，如下例所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>public void SetColor(Color c) {
    if (!Enum.IsDefined(typeof(Color), c)) {
    throw(new ArgumentOutOfRangeException(&quot;c&quot;, c, &quot;无效颜色值。&quot;));
    }
    // 将颜色设置为 White, Red, Green, Blue 或 Orange
    ...
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数校验是和有用的一个功能，因为其他人可能像下面这样调用 <code>SetColor</code>:</p><p><code>SetColor((Color)) 547);</code></p><p>没有和值 547 对应的符号，所以 <code>SetColor</code> 方法 <code>ArgumentOutOfRangeException</code> 异常，指出哪个参数无效，并解释为什么无效。</p><blockquote><p>重要提示 <code>IsDefined</code> 方法很方便，但必须慎用。首先，<code>IsDefined</code> 总是执行区分大小写的查找，而且完全没有办法让它执行不区分大小写的查找。其次，<code>IsDefined</code> 相当慢，因为它在内部使用了反射。如果写代码来手动检查每一个可能的值，应用程序的性能极有可能变得更好。最后，只有当枚举类型本身在调用<code>IsDefined</code>的同一个程序集中定义，<code>SetColor</code>方法在另一个程序集中定义。<code>SetColor</code> 方法调用 <code>IsDefined</code>，假如颜色是 <code>White</code>，<code>Red</code>,<code>Green</code>,<code>Blue</code> 或者 <code>Orange</code>，那么 <code>SetColor</code> 能正常执行。然而，假如 <code>Color</code> 枚举将来发生了变化，在其中包含了 <code>Purple</code>，那么 <code>SetColor</code> 现在就会接受 <code>Purple</code>，这是以前没有预料到的。因此，方法现在可能返回无法预料的结果。</p></blockquote><p>最后，<code>System.Enum</code> 类型提供了一组静态 <code>ToObject</code> 方法。这些方法将 <code>Byte</code>，<code>SByte</code>，<code>Int16</code>，<code>UInt16</code>，<code>Int32</code>，<code>UInt32</code>，<code>Int64</code> 或 <code>UInt64</code> 类型的实例转换为枚举类型的实例。</p><p>枚举类型总是要与另外某个类型结合使用，一般作为类型的方法参数或返回类型、属性和字段使用。初学者经常提出的一个问题是：枚举类型是嵌套定义在需要它的类型中，还是和该类型同级？检查 FCL，会发现枚举类型通常与需要它的类同级。原因很简单，就是减少代码的录入量，使开发人员的工作变得更轻松。所以，除非担心名称冲突，否则你定义的枚举类型应该和需要它的类型同级。</p><h2 id="_15-2-位标志" tabindex="-1"><a class="header-anchor" href="#_15-2-位标志"><span><a name="15_2">15.2 位标志</a></span></a></h2><p>程序员经常要和位标志(bit flag)集合打交道。调用 <code>System.IO.File</code> 类型的 <code>GetAttributes</code> 方法，会返回 <code>FileAttributes</code> 类型的一个实例。 <code>FileAttributes</code> 类型是基本类型为 <code>Int32</code> 的枚举类型，其中每一位都反映了文件的一个特性(attribute)。<code>FileAttributes</code> 类型在 FCL 中的定义如下：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>[Flags, Serializable]
public enum FileAttributes {
    ReadOnly            = 0x00001,
    Hidden              = 0x00002,
    System              = 0x00004,
    Directory           = 0x00010,
    Archive             = 0x00020,
    Device              = 0x00040,
    Normal              = 0x00080,
    Temporary           = 0x00100,
    SparseFile          = 0x00200,
    ReparsePoint        = 0x00400,
    Compressed          = 0x00800,
    Offline             = 0x01000,
    NotContentIndexed   = 0x02000,
    Encrypted           = 0x04000,
    IntegrityStream     = 0x08000,
    NoScrubData         = 0x20000
} 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>判断文件是否隐藏可执行以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>String file = Assembly.GetEntryAssembly().Location;
FileAttributes attributes = File.GetAttributes(file);
Console.WriteLine(&quot;Is {0} hidden? {1}&quot;, file, (attributes &amp; FileAttributes.Hidden) != 0);
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意 <code>Enum</code> 类定义了一个 <code>HasFlag</code> 方法：<br><code>public Boolean HasFlag(Enum flag);</code><br> 可利用该方法重写上述 <code>Console.WriteLine</code> 调用：<br><code>Console.WriteLine(&quot;Is {0} hidden? {1}&quot;, file, attributes.HasFlag(FileAttributes.Hidden));</code><br> 但我建议避免使用 <code>HasFlag</code> 方法，理由是：由于它获取 <code>Enum</code> 类型的参数，所以传给它的任何值都必须装箱，产生一次内存分配。</p></blockquote><p>以下代码演示了如何为文件设置只读和隐藏特性：</p><p><code>File.SetAttributes(file, FileAttributes.ReadOnly | FileAttributes.Hidden);</code></p><p>正如 <code>FileAttributes</code> 类型展示的那样，经常都要用枚举类型来表示一组可以组合的位标志。不过，虽然枚举类型和位标志相似，但它们的语义不尽相同。例如，枚举类型表示单个数值，而位标志表示位集合，其中一些位出于 on 状态，一些处于 off 状态<sup>①</sup>。</p><blockquote><p>① 进制 1 代表 “on”，二进制 0 代表“off”。 ——译注</p></blockquote><p>定义用于标识位标志的枚举类型时，当然应该显式为每个符号分配一个数值。通常，每个符号都有单独的一个位处于 on 状态。此外，经常都要定义一个值为 <code>0</code> 的 <code>None</code> 符号。还可定义一些符合来代表常见的位组合(参见下面的 <code>ReadWrite</code> 符号)。另外，强烈建议向枚举类型应用定制特性类型 <code>System.FlagsAttribute</code> ，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>[Flags]   // C# 编译器允许 “Flags” 或 “FlagsAttribute” 
internal enum Actions {
    None        = 0,
    Read        = 0x0001,
    Write       = 0x0002,
    ReadWrite   = Actions.Read | Actions.Write,
    Delete      = 0x004,
    Query       = 0x0008,
    Sync        = 0x0010
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由于 <code>Actions</code> 是枚举类型，所以在操纵位标志枚举类型时，可以使用上一节描述的所有方法。不过，假如其中一些方法的行为稍有区别，效果会更加理想。例如，假设有以下代码：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>Actions actions = Actions.Read | Actions.Delete;    // 0x0005
Console.WriteLine(actions.ToString());              // “Read, Delete”
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>调用 <code>ToString</code> 时，它会试图将数值转换为对应的符号。现在的数值是<code>0x0005</code>，没有对应的符号。不过，<code>ToString</code> 方法检测到 <code>Actions</code> 类型上存在 <code>[Flags]</code> 特性，所以 <code>ToString</code> 方法现在不会将该数值视为单独的值。相反，会把它视为一组位标志。由于 <code>0x0005</code> 由 <code>0x0001</code> 和 <code>0x0004</code> 组合而成，所以 <code>ToString</code> 会生成字符串 “<code>Read,Delete</code>”。从 <code>Actions</code> 类型中删除 <code>[Flags]</code> 特性， <code>ToString</code> 方法将返回“<code>5</code>”。</p><p>上一节已讨论了 <code>ToString</code> 方法，指出它允许以 3 种方式格式化输出：”G“(常规)、”D“(十进制)和”X“(十六进制)。使用常规格式化枚举类型的实例时，首先会检查类型，看它是否应用了<code>[Flags]</code> 这个特性。没有应用就查找与该数值匹配的符号并返回符号。如果应用了<code>[Flags]</code>特性，<code>ToString</code>方法的工作过程如下所示。</p><ol><li><p>获取枚举类型定义的数值集合，降序排列这些数值。</p></li><li><p>每个数值都和枚举实例中的值进行”按位与“计算，假如结果等于数值，与该数值关联的字符串就附加到输出字符串上，对应的位会被认为已经考虑过了，会被关闭(设为 0)。这一步不断重复，直到检查完所有数值，或直到枚举实例的所有位都被关闭。</p></li><li><p>检查完所有数值后，如果枚举实例仍然不为 0，表明枚举实例中一些处于 on 状态的位不对应任何已定义的符号。在这种情况下，<code>ToString</code>将枚举实例中的原始数值作为字符串返回。</p></li><li><p>如果枚举实例原始值不为 0，返回符号之间以逗号分隔的字符串。</p></li><li><p>如果枚举实例原始值为 0， 而且枚举类型定义的一个符号对应的是 0 值，就返回这个符号。</p></li><li><p>如果到达这这一步，就返回”0“。</p></li></ol><p>如果愿意，可定义没有 <code>[Flags]</code> 特性的 <code>Actions</code> 类型，并用 ”F“ 格式获得正确的字符串：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// [Flags]              // 现在已经被注释掉6
internal enum Actions
{
    None        = 0,
    Read        = 0x0001,
    Write       = 0x0002,
    ReadWrite   = Actions.Read | Actions.Write,
    Delete      = 0x004,
    Query       = 0x0008,
    Sync        = 0x0010
}

Actions actions = Actions.Read | Actions.Delete;    // 0x0005
Console.WriteLine(actions.ToString(”F“));              // “Read, Delete”
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果数值有一个位不能映射到一个符号，返回的字符串只包含一个代表原始数值的十进制数；字符串中不会有符号。</p><p>注意，枚举类型中定义的符号不一定是 2 的整数次方。例如，<code>Actions</code>类型可定义一个名为 <code>All</code> 的符号，它对应的值是<code>0x001F</code><sup>①</sup>。如果<code>Actions</code>类型的一个实例的值是 <code>0x001F</code>，格式化该实例就会生成一个含有”<code>All</code>“的字符串。其他符号字符串不会出现。</p><blockquote><p>① 计算可知，二进制 00000001(Read) | 00000010(Write) | 00000100(Delete) | 00001000(Query) | 00010000(Sync) = 00011111(All) = 十六进制 0x001F。 —— 译注</p></blockquote><p>前面讨论的是如何将数值转换成标志字符串(string of flag)。还可将以逗号分隔的符号字符串转换成数值，这是通过调用<code>Enum</code>的静态方法<code>Parse</code> 和<code>TryParse</code>来实现的。以下代码演示了如何使用这些方法;</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>// 由于 Query 被定义为 8， 所以 &#39;a&#39; 被初始化为 8
Actions a = (Actions)Enum.Parse(typeof(Actions), &quot;Query&quot;, true);
Console.WriteLine(a.ToString());        // Query

// 由于 Query 和 Read 已定义，所以 ‘a’ 被初始化为 9
Enum.TryParse&lt;Actions&gt;(&quot;Query, Read&quot;, false, out a);
Console.WriteLine(a.ToString());        // &quot;Read, Query&quot;

// 创建一个 Actions 枚举类型实例，其值 28
a = (Actions)Enum.Parse(typeof(Actions), &quot;28&quot;, false);
Console.WriteLine(a.ToString());        // &quot;Delete, Query, Sync&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Parse</code> 和 <code>TryParse</code> 方法在调用时，会在内部执行以下动作。</p><ol><li><p>删除字符串头尾的所有空白字符。</p></li><li><p>如果字符串第一个字符是数字、加号(<code>+</code>)或减号(<code>-</code>)，该字符串会被认为是一个数字，方法返回一个枚举类型实例，其数值等于字符串转换后的数值。</p></li><li><p>传递的字符串被分解为一组以逗号分隔的 token，每个 token 的空白字符都被删除。</p></li><li><p>在枚举类型的已定义符号中查找每个 token 字符串。如果没有找到相应的符号，<code>Parse</code>会抛出 <code>System.ArgumentException</code> 异常‘而<code>TryParse</code>会返回<code>false</code>。如果找到符号，就将它对应的数值与当前的一个动态结果进行”按位或“计算，再查找下一个符号。</p></li><li><p>查找并找到了所有标记之后，返回这个动态结果。</p></li></ol><p>永远不要对位标志枚举类型使用 <code>IsDefined</code> 方法。以下两方面原因造成该方法无法使用。</p><ul><li><p>向 <code>IsDefined</code> 方法传递字符串，它不会将这个字符串拆分为单独的 token 来进行查找，而是试图查找整个字符串，把它看成是包含逗号的一个更大的符号。由于不能在枚举类型中定义含有逗号的符号，所以这个符号永远找不到。</p></li><li><p>向<code>IsDefined</code> 方法传递一个数值，它会检查枚举类型是否定义了其数值和传入数值匹配的一个符号。由于位标志不能这样简单地匹配<sup>①</sup>，所以<code>IsDefined</code>通常会返回<code>false</code>。</p></li></ul><blockquote><p>① 因为 bit flag 一般都要组合起来使用。 ——译注</p></blockquote><h2 id="_15-3-向枚举类型添加方法" tabindex="-1"><a class="header-anchor" href="#_15-3-向枚举类型添加方法"><span><a name="15_3">15.3 向枚举类型添加方法</a></span></a></h2><p>本章早些时候曾指出，不能将方法定义为枚举类型的一部分。多年以来，我对此一直感到很”郁闷“，因为很多时候都需要为我的枚举类型提供一些方法。幸好，现在可以利用 C# 的扩展方法功能(参见第 8 章”方法“)模拟向枚举类型添加方法。</p><p>要为 <code>FileAttributes</code> 枚举类型添加方法，先定义一个包含了扩展方法的静态类，如下所示：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>internal static class FileAttributesExtensionMethods {
    public static Boolean IsSet(this FileAttributes flags, FileAttributes flagToTest) {
        if (flagToTest == 0)
            throw new ArgumentOutOfRangeException(&quot;flagToTest&quot;, &quot;Value must not be 0&quot;);
        return (flags &amp; flagToTest) == flagToTest;
    }

    public static Boolean IsClear(this FileAttributes flags, FileAttributes flagToTest) {
        if (flagToTest == 0)
            throw new ArgumentOutOfRangeException(&quot;flagToTest&quot;, &quot;Value must not be 0&quot;);
        return !IsSet(flags, flagToTest);
    }

    public static Boolean AnyFlagsSet(this FileAttributes flags, FileAttributes testFlags) {
        return ((flags &amp; testFlags) != 0);
    }

    public static FileAttributes Set(this FileAttributes flags, FileAttributes setFlags) {
        return flags | setFlags;
    }

    public static FileAttributes Clear(this FileAttributes flags, FileAttributes clearFlags) {
        return flags &amp; ~clearFlags;
    }

    public static void ForEach(this FileAttributes flags, Action&lt;FileAttributes&gt; processFlag) {
        if (processFlag == null) throw new ArgumentNullException(&quot;processFlag&quot;);
        for (UInt32 bit = 1; bit != 0; bit &lt;&lt;= 1) {
            UInt32 temp = ((UInt32)flags) &amp; bit;
            if (temp != 0) processFlag((FileAttributes)temp);
        }
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下代码演示了如何调用其中的一些方法。从表面上看，似乎真的是在枚举类型上调用这些方法：</p><div class="language-C# line-numbers-mode" data-ext="C#" data-title="C#"><pre class="language-C#"><code>FileAttributes fa = FileAttributes.System;
fa = fa.Set(FileAttributes.ReadOnly);
fa = fa.Clear(FileAttributes.System);
fa.ForEach(f =&gt; Console.WriteLine(f));
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,96),o=[s];function c(a,t){return i(),n("div",null,o)}const u=e(l,[["render",c],["__file","ch15_EnumeratedTypes.html.vue"]]),v=JSON.parse('{"path":"/chapters/ch15_EnumeratedTypes.html","title":"第 15 章 枚举类型和位标志","lang":"zh-CN","frontmatter":{},"headers":[{"level":2,"title":"15.1 枚举类型","slug":"_15-1-枚举类型","link":"#_15-1-枚举类型","children":[]},{"level":2,"title":"15.2 位标志","slug":"_15-2-位标志","link":"#_15-2-位标志","children":[]},{"level":2,"title":"15.3 向枚举类型添加方法","slug":"_15-3-向枚举类型添加方法","link":"#_15-3-向枚举类型添加方法","children":[]}],"git":{"updatedTime":1712067352000},"filePathRelative":"chapters/ch15_EnumeratedTypes.md"}');export{u as comp,v as data};
