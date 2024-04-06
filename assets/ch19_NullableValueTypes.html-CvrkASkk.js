import{_ as n,o as s,c as a,e as l}from"./app-IxoMmWNN.js";const e={},t=l(`<h1 id="null-совместимые-значимые-типы" tabindex="-1"><a class="header-anchor" href="#null-совместимые-значимые-типы"><span>Null-совместимые значимые типы</span></a></h1><p>Переменная значимого типа не может принимать null, её содержимым всегда является значение соответствующего типа, поэтому их и называют <em>значимыми</em>. Но такой подход может создавать проблемы. Например, в БД часто бывает ситуация, когда значение представлено целым числом, но оно необязательно. Но CLR не позволяет такого, что может создать проблема при работе с базой данных из .NET Framework.</p><p>Чтобы исправить ситуацию, в Microsoft разработали для CLR <em>null-совместимые значимые типы</em> (nullable value types). Они работает с применением определённого в FCL типа <code>System.Nullable&lt;T&gt;</code>. Данный тип является значимым: его экземпляры достаточно производительны, потому что размещаются в стеке, а их размер совпадает с размером исходного типа, к которому прибавляется размер поля типа <code>Boolean</code>. Null-совместимый значимый тип предполагает, что если ему присваивается <code>null</code>, то флаг, отвечающий за наличие значения, становится равен <code>false</code>, а внутренне значение равно дефолтному. Данный класс работает только для значимых типов, так как ссылочные и так могут быть равны <code>null</code>.</p><h2 id="поддержка-в-c-null-совместимых-значимых-типов" tabindex="-1"><a class="header-anchor" href="#поддержка-в-c-null-совместимых-значимых-типов"><span>Поддержка в C# null-совместимых значимых типов</span></a></h2><p>В настоящее время C# предлагает достаточно удобный синтаксис для работы с null-совместимыми значимыми типами. Переменные можно объявлять и инициализировать прямо в коде, воспользовавшись знаком вопроса после имени типа. При этом можно выполнять преобразования, а также приведения null-совместимых экземпляров к другим типам. Язык C# поддерживает и возможность применения операторов приведения к null-совместимым значимым типам. Вот несколько примеров:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">ConversionsAndCasting</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">// Неявное преобразование из типа Int32 в Nullable&lt;Int32&gt;</span>
  <span class="token class-name">Int32<span class="token punctuation">?</span></span> a <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>
  
  <span class="token comment">// Неявное преобразование из &#39;null&#39; в Nullable&lt;Int32&gt;</span>
  <span class="token class-name">Int32<span class="token punctuation">?</span></span> b <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
  
  <span class="token comment">// Явное преобразование Nullable&lt;Int32&gt; в Int32</span>
  <span class="token class-name">Int32</span> c <span class="token operator">=</span> <span class="token punctuation">(</span>Int32<span class="token punctuation">)</span> a<span class="token punctuation">;</span>
  
  <span class="token comment">// Прямое и обратное приведение примитивного типа в null-совместимый тип</span>
  <span class="token class-name">Double<span class="token punctuation">?</span></span> d <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span> <span class="token comment">// Int32-&gt;Double? (d содержит 5.0 в виде double)</span>
  <span class="token class-name">Double<span class="token punctuation">?</span></span> e <span class="token operator">=</span> b<span class="token punctuation">;</span> <span class="token comment">// Int32?-&gt;Double? (e содержит null)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Ещё C# позволяет применять к null-совместимым значимым типам и другие операторы:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">private</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Operators</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token class-name">Int32<span class="token punctuation">?</span></span> a <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>
  <span class="token class-name">Int32<span class="token punctuation">?</span></span> b <span class="token operator">=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>

  <span class="token comment">// Унарные операторы (+ ++ - -- ! ~)</span>
  a<span class="token operator">++</span><span class="token punctuation">;</span> <span class="token comment">// a = 6</span>
  b <span class="token operator">=</span> <span class="token operator">-</span>b<span class="token punctuation">;</span> <span class="token comment">// b = null</span>

  <span class="token comment">// Бинарные операторы (+ - * / % &amp; | ^ &lt;&lt; &gt;&gt;)</span>
  a <span class="token operator">=</span> a <span class="token operator">+</span> <span class="token number">3</span><span class="token punctuation">;</span> <span class="token comment">// a = 9</span>
  b <span class="token operator">=</span> b <span class="token operator">*</span> <span class="token number">3</span><span class="token punctuation">;</span> <span class="token comment">// b = null;</span>

  <span class="token comment">// Операторы равенства (== !=)</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>a <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* нет */</span> <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">/* да */</span> <span class="token punctuation">}</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>b <span class="token operator">==</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* да */</span> <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">/* нет */</span> <span class="token punctuation">}</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>a <span class="token operator">!=</span> b<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* да */</span> <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">/* нет */</span> <span class="token punctuation">}</span>

  <span class="token comment">// Операторы сравнения (&lt;&gt; &lt;= &gt;=)</span>
  <span class="token keyword">if</span> <span class="token punctuation">(</span>a <span class="token operator">&lt;</span> b<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token comment">/* нет */</span> <span class="token punctuation">}</span> <span class="token keyword">else</span> <span class="token punctuation">{</span> <span class="token comment">/* да */</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Данные операнды C# интерпретирует следующим образом:</p><ul><li><strong>Унарные операторы.</strong> Если операнд равен <code>null</code>, то и результат равен <code>null</code>.</li><li><strong>Бинарные операторы.</strong> Если хотя бы один из операндов равен <code>null</code>, то и результат равен <code>null</code>. Исключением является применение конъюнкции или дизъюнкции внутри тернарного оператора. Таблицы для этих операторов приведена ниже.</li><li><strong>Операторы равенства.</strong> Операнды равны если они оба <code>null</code> или все их поля совпадают, в противном случае операнды не равны.</li><li><strong>Операторы сравнения.</strong> Если один из операндов равен <code>null</code>. то <code>false</code>, иначе значения сравниваются.</li></ul><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/cb981375-866d-4a89-92aa-f627f27f25ae" alt="image"></p><p>Стоит учесть, что для операций с экземплярами null-совместимых значимых типов будет создан больший объём IL-кода в следствие чего, операции будут выполняться медленнее.</p><h2 id="оператор-объединения-null-совместимых-значении" tabindex="-1"><a class="header-anchor" href="#оператор-объединения-null-совместимых-значении"><span>Оператор объединения null-совместимых значений</span></a></h2><p>В C# существует <em>оператор объединения null-совместимых значений</em> (null-coalescing operator). Он обозначается как <code>??</code> и работает с двумя операндами. Если левый операнд не равен <code>null</code>, оператор возвращает его значение. Иначе возвращается значение правого операнда. Данный оператор удобен при задании значения по умолчанию (прим. <em>А также выбрасывании исключения</em>). Данный оператор работает как с ссылочными, так и с null-совместимыми значимыми типами.</p><p>Некоторые считают, что данный оператор является всего лишь синтаксическим сокращением для тернарного оператора. Однако, во-первых, данный оператор лучше работает с выражениями, а во-вторых, он может работать и для большего числа операндов, что повышает читабельность кода.</p><h2 id="поддержка-в-clr-null-совместимых-значимых-типов" tabindex="-1"><a class="header-anchor" href="#поддержка-в-clr-null-совместимых-значимых-типов"><span>Поддержка в CLR null-совместимых значимых типов</span></a></h2><p>В CLR существует встроенная поддержка null-совместимых значимых типов. Она предусматривает упаковку и распаковку, а также вызов <code>GetType()</code>, что призвано обеспечить более тесную интеграцию данных типов в CLR. В результате типы ведут себя более естественно и лучше соответствуют ожиданиям разработчиков.</p><h3 id="упаковка-null-совместимых-значимых-типов" tabindex="-1"><a class="header-anchor" href="#упаковка-null-совместимых-значимых-типов"><span>Упаковка null-совместимых значимых типов</span></a></h3><p>При упаковке экземпляра <code>Nullable&lt;T&gt;</code> проверяется его равенство на <code>null</code> и в случае положительного результата возвращается <code>null</code>, в противном случае происходит самая обычная упаковка.</p><h3 id="распаковка-null-совместимых-значимых-типов" tabindex="-1"><a class="header-anchor" href="#распаковка-null-совместимых-значимых-типов"><span>Распаковка null-совместимых значимых типов</span></a></h3><p>В CLR упакованный значимый тип <code>T</code> распаковывается в <code>T</code> или <code>Nullable&lt;T&gt;</code> в зависимости от наличия <code>null</code> в упакованном объекте.</p><h3 id="вызов-метода-gettype-через-null-совместимыи-значимыи-тип" tabindex="-1"><a class="header-anchor" href="#вызов-метода-gettype-через-null-совместимыи-значимыи-тип"><span>Вызов метода GetType через null-совместимый значимый тип</span></a></h3><p>При вызове метода <code>GetType()</code> для <code>Nullable&lt;T&gt;</code> будет возвращён тип <code>T</code>.</p><h3 id="вызов-интерфеисных-методов-через-null-совместимыи-значимыи-тип" tabindex="-1"><a class="header-anchor" href="#вызов-интерфеисных-методов-через-null-совместимыи-значимыи-тип"><span>Вызов интерфейсных методов через null-совместимый значимый тип</span></a></h3><p>При приведении null-совместимого значимого типа к интерфейсу код успешно компилируется, несмотря на то, что, например, <code>Nullable&lt;Int32&gt;</code> не реализует <code>IComparable&lt;Int32&gt;</code>. В данном случае механизм верификации CLR считает, что код прошёл проверку, чтобы не приходилось громоздить код сначала приведением к значимому типу, а затем к типу интерфейса.</p>`,25),p=[t];function c(o,u){return s(),a("div",null,p)}const d=n(e,[["render",c],["__file","ch19_NullableValueTypes.html.vue"]]),r=JSON.parse('{"path":"/ru/chapters/ch19_NullableValueTypes.html","title":"Null-совместимые значимые типы","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Поддержка в C# null-совместимых значимых типов","slug":"поддержка-в-c-null-совместимых-значимых-типов","link":"#поддержка-в-c-null-совместимых-значимых-типов","children":[]},{"level":2,"title":"Оператор объединения null-совместимых значений","slug":"оператор-объединения-null-совместимых-значении","link":"#оператор-объединения-null-совместимых-значении","children":[]},{"level":2,"title":"Поддержка в CLR null-совместимых значимых типов","slug":"поддержка-в-clr-null-совместимых-значимых-типов","link":"#поддержка-в-clr-null-совместимых-значимых-типов","children":[{"level":3,"title":"Упаковка null-совместимых значимых типов","slug":"упаковка-null-совместимых-значимых-типов","link":"#упаковка-null-совместимых-значимых-типов","children":[]},{"level":3,"title":"Распаковка null-совместимых значимых типов","slug":"распаковка-null-совместимых-значимых-типов","link":"#распаковка-null-совместимых-значимых-типов","children":[]},{"level":3,"title":"Вызов метода GetType через null-совместимый значимый тип","slug":"вызов-метода-gettype-через-null-совместимыи-значимыи-тип","link":"#вызов-метода-gettype-через-null-совместимыи-значимыи-тип","children":[]},{"level":3,"title":"Вызов интерфейсных методов через null-совместимый значимый тип","slug":"вызов-интерфеисных-методов-через-null-совместимыи-значимыи-тип","link":"#вызов-интерфеисных-методов-через-null-совместимыи-значимыи-тип","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch19_NullableValueTypes.md"}');export{d as comp,r as data};
