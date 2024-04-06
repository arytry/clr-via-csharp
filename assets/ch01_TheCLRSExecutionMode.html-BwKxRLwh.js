import{_ as n,o as s,c as a,e}from"./app-IxoMmWNN.js";const l={},i=e(`<h1 id="модель-выполнения-кода-в-среде-clr" tabindex="-1"><a class="header-anchor" href="#модель-выполнения-кода-в-среде-clr"><span>Модель выполнения кода в среде CLR</span></a></h1><h2 id="компиляция-исходного-кода-в-исполняемые-модули" tabindex="-1"><a class="header-anchor" href="#компиляция-исходного-кода-в-исполняемые-модули"><span>Компиляция исходного кода в исполняемые модули</span></a></h2><p><em>Общеязыковая среда выполнения</em> (Common Language Runtime) - среда выполнения, которая подходит для разных языков программирования. Основные возможности (управление памятью, загрузка сборок, безопасность, обработка исключений, синхронизация) доступных в любых языках, использующих эту среду.</p><p>На рисунке ниже изображён процесс компиляции файлов с исходным кодом. Код может быть написан на любом языке, поддерживаемом CLR. Затем компилятор проверяет синтаксис и анализирует исходный код. Результатом компиляции будет являться <em>управляемый модуль</em> (managed module) - стандартный переносимый исполняемый файл (portable executable: PE32/PE32+), который требует CLR для своего выполнения. Компиляторы машинного кода ориентируются на конкретную процессорную архитектуру. В отличие от этого, все CLR-совместимые компиляторы генерируют IL-код (intermediate language), его иногда называют управляемым, потому что CLR управляет его выполнением.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/4c923aef-5a06-482c-b31a-103b55c122ca" alt="image"></p><p>Каждый компилятор для CLR должен генерировать не только IL-код, но и полные <em>метаданные</em> для каждого управляемого модуля. Метаданные - набор таблиц данных, описывающих, что определено в модуле (например, типы и их члены). Также в метаданных указывается, на что ссылается управляемый модуль (например, импортируемые типы и их члены). Компилятор генерирует метаданные и код одновременно и привязывает их к конечному управляемому модулю, так что рассинхронизация исключена.</p><p>Для выполнения управляемого модуля на машине должна быть установлена среда CLR (в составе .NET Framework).</p><h2 id="объединение-управляемых-модулеи-в-сборку" tabindex="-1"><a class="header-anchor" href="#объединение-управляемых-модулеи-в-сборку"><span>Объединение управляемых модулей в сборку</span></a></h2><p>CLR работает не с модулями, а со сборками (assembly). В контексте среды CLR сборкой называется то, что обычно зовут <em>компонентом</em>.</p><ul><li>Сборка обеспечивает логическую группировку одного или нескольких управляемых модулей или файлов ресурсов.</li><li>Сборка является наименьшей единицей многократного использования, безопасности и управления версиями.</li></ul><p>Рисунок ниже позволяет понять суть сборки. На рисунке несколько управляемых модулей и ресурсных файлов, с которыми работает программа. Программа создаст единственный PE32+ файл, который обеспечит логическую группировку файлов и при этом включает в себя блок данных, называемый манифестом. Манифест - набор таблиц метаданных.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/7a4ac223-a46e-42f1-a245-1fd2a1be25da" alt="image"></p><p>Модули сборки также содержат сведения о других сборках, на которые они ссылаются (в том числе номера их версий). Это делает сборку <em>самоописываемой</em>.</p><h2 id="загрузка-clr" tabindex="-1"><a class="header-anchor" href="#загрузка-clr"><span>Загрузка CLR</span></a></h2><p>Каждая создаваемая сборка является либо исполняемым приложением, либо DLL.</p><p>После анализа заголовка для выяснения, какой процесс надо запустить (32- или 64-разрядный) Windows загружает в адресное пространство процесса соответствующую версию библиотеки MSCorEE.dll. Далее основной поток вызывает определённый в MSCorEE.dll метод, который инициализирует CLR, загружает сборку EXE, а затем вызывает её метод Main.</p><h2 id="исполнение-кода-сборки" tabindex="-1"><a class="header-anchor" href="#исполнение-кода-сборки"><span>Исполнение кода сборки</span></a></h2><p>IL - язык более высокого уровня по сравнению с большинством машинных языков: он позволяет работать с объектами и имеет команды для создания и инициализации объектов, вызова виртуальных методов манипулирования элементами массивов. IL можно рассматривать как ОО машинный язык.</p><p>Для выполнения какого-либо методов его IL-код должен быть преобразован в машинный, этим занимается JIT-компилятор (Just-In-Time).</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5a5e2418-a799-4279-ae6d-96ef473fd79c" alt="image"></p><p>Перед исполнением метода Main среда CLR находит все типы данных, на которые ссылается метод. При этом CLR выделяет внутренние структуры данных, используемые для управления доступом к типам, на которые есть ссылки. Структура данных содержит записи на каждый метод. Каждая запись содержит адрес, по которому лежит реализация метода. Когда метод Main первый раз обращается к методу WriteLine, вызывается функция JITComplier. Этот компонент CLR называют <em>JIT-компилятором</em>, так как он компилирует код непосредственно перед выполнением.</p><p>При повторном вызове метода WriteLine он уже проверен и скомпилирован, так что обращение к блоку памяти происходит напрямую, без компиляции.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5c1d6c6b-cd6e-4fb5-ad6e-7f3c0701b593" alt="image"></p><p>JIT-компилятор хранит команды в динамической памяти.</p><p>Есть два параметра компилятора, влияющие на оптимизацию кода:</p><ul><li><code>/optimize</code> - создаёт оптимизированный код, который не содержит пустых команд; затруднена отладка; легче читать IL-код.</li><li><code>/debug</code> - компилятор связывает команды IL с исходным кодом.</li></ul><p>В отладочной конфигурации проекта устанавливаются параметры <code>/optimize /debug:full</code>, а в релизе - <code>/optimize+ /debug:pdbonly</code>. PDB (Program Database) помогает находить локальные переменные и связывать команды IL с исходным кодом.</p><p>Есть мнение, что управляемые приложения могут превосходить по быстродействию неуправляемые (компилируемые для конкретного процессора и выполняющиеся просто при вызове). Это объясняется следующими причинами:</p><ul><li>JIT-компилятор может определить тип процессора и сгенерировать машинный код со специальными командами под конкретный процессор. Неуправляемые приложения генерируются с общими командами.</li><li>JIT-компилятор может оценить истинность некоторого условия для машины, на которой он выполняется, и, следовательно, создать оптимизированный код под конкретный компьютер.</li></ul><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>numberOfCPUs <span class="token operator">&gt;</span> <span class="token number">1</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
  <span class="token range operator">..</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>CLR может профилировать выполняемую программу и перекомпилировать IL в машинный код, который реорганизуется для сокращения ошибочного прогнозирования переходов на основании наблюдаемых закономерностей выполнения.</li></ul><h3 id="il-код-и-верификация" tabindex="-1"><a class="header-anchor" href="#il-код-и-верификация"><span>IL-код и верификация</span></a></h3><p>IL является стековым языков - все инструкции заносят операнды в стек и извлекают результат из стека.</p><p>Инструкции IL являются нетипизированными. При выполнении инструкция (например, сложения) определяет типы операндов, хранящихся в стеке, и выполняет соответствующую операцию.</p><p>В процессе JIT-компиляции выполняется <em>верификация</em> - анализ высокоуровневого кода IL и проверка безопасности операций: проверяется, что каждый метод вызывается с правильными количеством и типами параметров, что каждый метод содержит return и так далее.</p><p>В Windows каждый процесс обладает собственным виртуальным адресным пространством. Это обеспечивает защищённость и стабильность системы - один процесс не может навредить другому.</p><p>Каждый процесс Windows требует значительный затрат ресурсов ОС, что снижает производительность. CLR даёт возможность размещения нескольких управляемых приложений в одном процессе, каждое из которых будет выполняться в домене приложений (App Domain).</p><h3 id="небезопасныи-код" tabindex="-1"><a class="header-anchor" href="#небезопасныи-код"><span>Небезопасный код</span></a></h3><p>По умолчанию компилятор C# генерирует безопасный код, однако есть возможность писать небезопасный код, способный оперировать байтами памяти напрямую. Это бывает полезно для взаимодействия с неуправляемым кодом или оптимизации алгоритмов.</p><h3 id="il-и-защита-интеллектуальнои-собственности" tabindex="-1"><a class="header-anchor" href="#il-и-защита-интеллектуальнои-собственности"><span>IL и защита интеллектуальной собственности</span></a></h3><p>...</p><h2 id="ngen-exe" tabindex="-1"><a class="header-anchor" href="#ngen-exe"><span>NGen.exe</span></a></h2><ul><li><strong>Ускорение запуска приложения.</strong> Запуск ускоряется, потому что ВЕСЬ код уже откомпилирован в машинный код.</li><li><strong>Сокращение рабочего набора приложения.</strong> Полностью машинный код можно загрузить в нескольких процессах одновременно.</li></ul><h2 id="библиотека-fcl" tabindex="-1"><a class="header-anchor" href="#библиотека-fcl"><span>Библиотека FCL</span></a></h2><p>Одним из компонентов .NET Framework является FCL (Framework Class Library) - набор сборок в формате DLL, содержащих определение нескольких тысяч типов. Примеры:</p><ul><li><strong>Веб-службы.</strong> ASP.NET XML Web Service и WCF позволяют легко создавать методу для обработки сообщений в сети Интернет.</li><li><strong>Приложения Web Forms и MVC на базе HTML.</strong></li><li><strong>Приложения Windows c расширенным графическим интерфейсом.</strong> Вместо UI можно реализовать более мощную функциональность (Windows Store, WPF и WinForms). Эти приложения могут использовать события элементов управления, сенсорного экрана и так далее.</li><li><strong>Консольные приложения Windows.</strong></li><li><strong>Службы Windows.</strong> Windows SCM (Service Control Manager).</li><li><strong>Хранимые процедуры баз данных.</strong></li><li><strong>Библиотеки компонентов.</strong> Сборки, которые легко встроить в приложения всех разновидностей.</li></ul><p>В FCL буквально тысячи типов, поэтому взаимосвязанные типы объединяются в пространство имён.</p><h2 id="cts" tabindex="-1"><a class="header-anchor" href="#cts"><span>CTS</span></a></h2><p>Microsoft создала формальную спецификацию CTS (Common Type System).</p><p>CTS устанавливает правила, формирующие границу видимости типа, а CLR обеспечивает выполнение этого правила. Однако при работе с верхнеуровневым языком программирования (например, C#) ограничения описываются языком.</p><p>Варианты ограничения доступа:</p><ul><li><strong>Закрытый (приватный) доступ</strong> - член доступен внутри типа - <code>private</code></li><li><strong>Доступ в семействе</strong> - член доступен для производных типов в любой сборке - <code>protected</code></li><li><strong>Доступ в семействе и сборке</strong> - член доступен для производных типов, но только внутри этой же сборки - <code>private protected</code> (появился, начиная с C# 7.2)</li><li><strong>Доступ в сборке</strong> - <code>internal</code></li><li><strong>Доступ в семействе или сборке</strong> - <code>protected internal</code></li><li><strong>Открытй доступ</strong> - <code>public</code></li></ul><h2 id="cls" tabindex="-1"><a class="header-anchor" href="#cls"><span>CLS</span></a></h2><p>Для упрощения написания в одном языке типов, которые были бы доступны для использования в другом, Microsoft разработала CLS (Common Language Specification).</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/ece48577-828b-4b2c-a075-5f659ea0b233" alt="image"></p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">using</span> <span class="token namespace">System</span><span class="token punctuation">;</span>

<span class="token comment">// Приказываем компилятору проверять код на совместимость с CLS</span>
<span class="token punctuation">[</span>assembly<span class="token punctuation">:</span> <span class="token function">CLSCompliant</span><span class="token punctuation">(</span><span class="token boolean">true</span><span class="token punctuation">)</span><span class="token punctuation">]</span>

<span class="token keyword">namespace</span> <span class="token namespace">SomeLibrary</span><span class="token punctuation">;</span>

<span class="token comment">// Предупреждения выводятся, потому что класс является открытым</span>
<span class="token keyword">public</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">SomeLibraryType</span> <span class="token punctuation">{</span>
  <span class="token comment">// Предупреждение: возвращаемый тип &#39;SomeLibrary.SomeLibraryType.Abc()&#39; не является CLS-совместимым</span>
  <span class="token keyword">public</span> <span class="token return-type class-name">UInt32</span> <span class="token function">Abc</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>

  <span class="token comment">// Предупреждение: идентификаторы &#39;SomeLibrary.SomeLibraryType.abc()&#39;, отличающиеся только регистром символов, не являются CLS-совместимыми</span>
  <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">abc</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token punctuation">}</span>
  
  <span class="token comment">// Предупреждения нет: закрытый метод</span>
  <span class="token keyword">private</span> <span class="token return-type class-name">UInt32</span> <span class="token function">ABC</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>CLS в упрощённом виде - в CLR каждый член типа является либо полем, либо методом.</p><h2 id="взаимодеиствие-с-неуправляемым-кодом" tabindex="-1"><a class="header-anchor" href="#взаимодеиствие-с-неуправляемым-кодом"><span>Взаимодействие с неуправляемым кодом</span></a></h2><p>CLR спроектирована так, чтобы приложения могли состоять как из управляемых, так и из неуправляемых модулей. CLR поддерживает три сценария взаимодействия:</p><ul><li><strong>Управляемый код может вызывать неуправляемые функции из DLL</strong> с использованием механизма P/Invoke (Platform Invoke).</li><li><strong>Управляемый код может использовать готовые компоненты COM.</strong></li><li><strong>Неуправляемый код может использовать управляемый тип.</strong></li></ul>`,60),t=[i];function p(c,o){return s(),a("div",null,t)}const d=n(l,[["render",p],["__file","ch01_TheCLRSExecutionMode.html.vue"]]),u=JSON.parse('{"path":"/ru/chapters/ch01_TheCLRSExecutionMode.html","title":"Модель выполнения кода в среде CLR","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Компиляция исходного кода в исполняемые модули","slug":"компиляция-исходного-кода-в-исполняемые-модули","link":"#компиляция-исходного-кода-в-исполняемые-модули","children":[]},{"level":2,"title":"Объединение управляемых модулей в сборку","slug":"объединение-управляемых-модулеи-в-сборку","link":"#объединение-управляемых-модулеи-в-сборку","children":[]},{"level":2,"title":"Загрузка CLR","slug":"загрузка-clr","link":"#загрузка-clr","children":[]},{"level":2,"title":"Исполнение кода сборки","slug":"исполнение-кода-сборки","link":"#исполнение-кода-сборки","children":[{"level":3,"title":"IL-код и верификация","slug":"il-код-и-верификация","link":"#il-код-и-верификация","children":[]},{"level":3,"title":"Небезопасный код","slug":"небезопасныи-код","link":"#небезопасныи-код","children":[]},{"level":3,"title":"IL и защита интеллектуальной собственности","slug":"il-и-защита-интеллектуальнои-собственности","link":"#il-и-защита-интеллектуальнои-собственности","children":[]}]},{"level":2,"title":"NGen.exe","slug":"ngen-exe","link":"#ngen-exe","children":[]},{"level":2,"title":"Библиотека FCL","slug":"библиотека-fcl","link":"#библиотека-fcl","children":[]},{"level":2,"title":"CTS","slug":"cts","link":"#cts","children":[]},{"level":2,"title":"CLS","slug":"cls","link":"#cls","children":[]},{"level":2,"title":"Взаимодействие с неуправляемым кодом","slug":"взаимодеиствие-с-неуправляемым-кодом","link":"#взаимодеиствие-с-неуправляемым-кодом","children":[]}],"git":{"updatedTime":1712405766000},"filePathRelative":"ru/chapters/ch01_TheCLRSExecutionMode.md"}');export{d as comp,u as data};