import{_ as s,o as n,c as a,e}from"./app-IxoMmWNN.js";const p={},c=e(`<h1 id="основы-типов" tabindex="-1"><a class="header-anchor" href="#основы-типов"><span>Основы типов</span></a></h1><h2 id="все-типы-производные-от-system-object" tabindex="-1"><a class="header-anchor" href="#все-типы-производные-от-system-object"><span>Все типы - производные от System.Object</span></a></h2><p>Благодаря тому, что все типы являются производными от System.Object, любой объект гарантированно имеет следующий набор методов:</p><ul><li><code>Equals()</code> - Возвращает true, если два объекта имеют одинаковые значения.</li><li><code>GetHashCode()</code> - Возвращает хеш-код для значения объекта. Используется при указании типа в качестве ключа хеш-таблиц.</li><li><code>ToString()</code> - По умолчанию возвращает полное имя типа, но на практике метод часто переопределяют, чтобы он возвращал внутреннее состояние объекта.</li><li><code>GetType()</code> - Возвращает информацию о типе объекта. Данный метод нельзя переопределить с целью фальсификаций данных о типе.</li></ul><p>Кроме того, есть несколько защищённых методов:</p><ul><li><code>MemberwiseClone()</code> - Не виртуальный метод, который создаёт новый экземпляр типа и копирует в него состояние. Примитивные типы копируются по значению, а пользовательские - по ссылке.</li><li><code>Finalize()</code> - Виртуальный метод; вызывается, когда сборщик мусора определяет, что объект является мусором, но до возвращения занятой памяти в кучу. В типах, требующих очистки, следует переопределить этот метод.</li></ul><p>CLR требует, чтобы все объекты создавались оператором <code>new</code>, который выполняет следующее:</p><ol><li>Вычисляет количество байтов, необходимых для хранения всех экземплярных полей типа и всех его базовых типов. В каждом объекте кучи должны присутствовать <em>указатели на объект-тип</em> (type object pointer) и <em>индекс блока синхронизации</em> (sync block index); они необходимы для управления объектом.</li><li>Выделение памяти для объекта с резервированием необходимого для данного типа количества байтов в управляемой куче. Эти байты инициализируются нулями.</li><li>Инициализация указателя и индекса.</li><li>Вызов конструктора типа с параметрами. Большинство компиляторов автоматически включает в конструктор код вызова конструктора базового класса. Каждый конструктор выполняет инициализацию определённых в соответствующем типе полей. Кроме конструктора System.Object - он просто возвращает управление.</li></ol><p>Выполнив эти операции, <code>new</code> возвращает ссылку на объект.</p><h2 id="приведение-типов" tabindex="-1"><a class="header-anchor" href="#приведение-типов"><span>Приведение типов</span></a></h2><p>Одна из важнейших особенностей CLR - <em>безопасность типов</em> (type safety). В рантайме CLR всегда знает тип объекта.</p><p>При разработке часто прибегают к приведению типов. CLR разрешает приведение объекта к его собственному или любому из базовых типов. В C# нет специального синтаксиса для приведения к базовому типу, так как это считается безопасным неявным преобразованием. Однако, для приведения типа к производному нужно ввести операцию явного приведения типов.</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token comment">// Этот тип неявно наследует от типа System.Object</span>
<span class="token keyword">internal</span> <span class="token keyword">class</span> <span class="token class-name">Employee</span>
<span class="token punctuation">{</span>
 <span class="token range operator">..</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>

<span class="token keyword">public</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">Program</span>
<span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">// Приведение типа не требуется, т. к. new возвращает объект Employee, а Object — это базовый тип для Employee.</span>
    <span class="token class-name">Object</span> o <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">Employee</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// Приведение типа обязательно, т. к. Employee — производный от Object.</span>
    <span class="token comment">// В других языках (таких как Visual Basic) компилятор не потребует явного приведения.</span>
    <span class="token class-name">Employee</span> e <span class="token operator">=</span> <span class="token punctuation">(</span>Employee<span class="token punctuation">)</span> o<span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Пример выше показывает, что необходимо компилятору. Однако, CLR проверяет правильность приведения типов в рантайме. В случае, если приведение не удастся осуществить, CLR выкинет <code>InvalidCastException</code>.</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">internal</span> <span class="token keyword">class</span> <span class="token class-name">Employee</span> 
<span class="token punctuation">{</span>
 <span class="token range operator">..</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>

<span class="token keyword">internal</span> <span class="token keyword">class</span> <span class="token class-name">Manager</span> <span class="token punctuation">:</span> <span class="token type-list"><span class="token class-name">Employee</span></span> 
<span class="token punctuation">{</span>
 <span class="token range operator">..</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span>
 
<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">PromoteEmployee</span><span class="token punctuation">(</span><span class="token class-name">Object</span> o<span class="token punctuation">)</span> 
<span class="token punctuation">{</span>
 <span class="token comment">// В этом месте компилятор не знает точно, на какой тип объекта ссылается o, поэтому скомпилирует этот код</span>
 <span class="token comment">// Однако в период выполнения CLR знает, на какой тип ссылается объект o (приведение типа выполняется каждый раз), и проверяет, соответствует ли тип объекта типу Employee или другому типу, производному от Employee</span>
 <span class="token class-name">Employee</span> e <span class="token operator">=</span> <span class="token punctuation">(</span>Employee<span class="token punctuation">)</span> o<span class="token punctuation">;</span>
 <span class="token range operator">..</span><span class="token punctuation">.</span>
<span class="token punctuation">}</span> 

<span class="token keyword">public</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">Program</span> 
<span class="token punctuation">{</span>
 <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> 
 <span class="token punctuation">{</span>
   <span class="token comment">// Создаем объект Manager и передаем его в PromoteEmployee</span>
   <span class="token comment">// Manager ЯВЛЯЕТСЯ производным от Employee, поэтому PromoteEmployee работает</span>
   <span class="token class-name">Manager</span> m <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">Manager</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
   <span class="token function">PromoteEmployee</span><span class="token punctuation">(</span>m<span class="token punctuation">)</span><span class="token punctuation">;</span>
   
   <span class="token comment">// Создаем объект DateTime и передаем его в PromoteEmployee</span>
   <span class="token comment">// DateTime НЕ ЯВЛЯЕТСЯ производным от Employee, поэтому PromoteEmployee выбрасывает исключение System.InvalidCastException</span>
   <span class="token class-name">DateTime</span> newYears <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token constructor-invocation class-name">DateTime</span><span class="token punctuation">(</span><span class="token number">2013</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
   <span class="token function">PromoteEmployee</span><span class="token punctuation">(</span>newYears<span class="token punctuation">)</span><span class="token punctuation">;</span>
 <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Если разрешить подобное преобразование, то это может привести к неожиданным и неприятным последствиям, поэтому в CLR столь пристальное внимание уделяется типам.</p><p>В данном случае для <code>PromoteEmployee</code> правильнее было бы выбрать <code>Employee</code> в качестве параметра, чтобы избавиться от потенциального исключения ещё на этапе компиляции.</p><h3 id="приведение-типов-в-c-с-помощью-операторов-is-и-as" tabindex="-1"><a class="header-anchor" href="#приведение-типов-в-c-с-помощью-операторов-is-и-as"><span>Приведение типов в C# с помощью операторов is и as</span></a></h3><p>В C# существуют другие механизмы приведения типов. Оператор <code>is</code> проверяет совместимость объекта с данным типом. Данный оператор не генерирует исключение, для <code>null</code> он всегда возвращает <code>false</code>. Обычно данный оператор используется следующим образом:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">if</span> <span class="token punctuation">(</span>o <span class="token keyword">is</span> <span class="token class-name">Employee</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
 <span class="token class-name">Employee</span> e <span class="token operator">=</span> <span class="token punctuation">(</span>Employee<span class="token punctuation">)</span> o<span class="token punctuation">;</span>
 <span class="token comment">// Используем e внутри инструкции if</span>
<span class="token punctuation">}</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Однако, это заставляет CLR дважды проверять совместимость типов, что несколько ухудшает производительность. В качестве решения данной проблемы можно использовать оператор <code>as</code>:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token class-name">Employee</span> e <span class="token operator">=</span> o <span class="token keyword">as</span> <span class="token class-name">Employee</span><span class="token punctuation">;</span>
<span class="token keyword">if</span> <span class="token punctuation">(</span>e <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
 <span class="token comment">// Используем e внутри инструкции if</span>
<span class="token punctuation">}</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>В данном случае CLR проверяет совместимость и, если типы совместимы, возвращает ненулевой указатель на объект. По сути оператор <code>as</code> отличается от явного приведения типов тем, что в рантайме можно получить NullReferenceException, если типы в результате получился <code>null</code>, вместо InvalidCastException.</p><h2 id="пространства-имен-и-сборки" tabindex="-1"><a class="header-anchor" href="#пространства-имен-и-сборки"><span>Пространства имён и сборки</span></a></h2><p>Пространства имён используются для логической группировки родственных типов.</p><p>Для компилятора пространства имён - простое средство, позволяющее удлинить имя типа и сделать его уникальным за счёт добавления к началу имени групп символов, разделённых точками.</p><p>Директива <code>using</code> заставляет компилятор добавлять к имени указанный префикс, пока не будет найдено совпадение по типу.</p><p>CLR не знает ничего о пространствах имён. CLR обращается к типу по полному имени и сборке.</p><p>В ситуации, когда в разных сборках объявлены типы с одинаковыми именами, стоит указывать полное имя типа, так как иначе компилятор выдаёт ошибку.</p><p>В C# есть ещё одна форма директивы <code>using</code> - создание псевдонима для отдельного типа или пространства имён. Это позволяет избежать объявления полного типа в коде.</p><p>Бывают ситуации, когда дублируются не только имена типов или пространства имён, но также и названия сборок. На этот случай в компиляторе поддерживаются <em>внешние псевдонимы</em> (external aliases).</p><p>При проектировании типов, которые могут использоваться третьими лицами, стоит использовать максимально уникальные имена, которые бы имели наименьшие шансы совпадения с кем-либо.</p><p>В C# директива namespace заставляет компилятор добавлять к каждому имени типа определённую приставку - это избавляет разработчика от написания массы лишнего кода.</p><h3 id="связь-между-сборками-и-пространством-имен" tabindex="-1"><a class="header-anchor" href="#связь-между-сборками-и-пространством-имен"><span>Связь между сборками и пространством имен</span></a></h3><p>Пространства имён и сборка не обязательно связаны друг с другом: одно пространство может быть описано в разных сборках, как и одна сборка может содержать разные пространства.</p><h2 id="как-разные-компоненты-взаимодеиствуют-во-время-выполнения" tabindex="-1"><a class="header-anchor" href="#как-разные-компоненты-взаимодеиствуют-во-время-выполнения"><span>Как разные компоненты взаимодействуют во время выполнения</span></a></h2><p>На рисунке представлен один процесс Microsoft Windows с загруженной в него CLR. У процесса может быть много потоков. После создания потоку выделяется стек размером в 1 Мбайт. Выделенная память используется для передачи аргументов в методы и хранения локальных переменных. Память заполняется от старших адресов к младшим. Тёмной область в стеке обозначен какой-то код с данными. Далее происходит вызов метода <code>M1()</code>.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/953a5d6a-4581-4597-b549-8f6955548370" alt="image"></p><p>Все методы содержат некоторый <em>входной код</em> (prologue code), инициализирующий метод до начала работы. Все методы содержат <em>выходной код</em> (epilogue code), выполняющий очистку после того, как метод завершит свою работу, чтобы передать управление в вызывающий метод. В начале выполнения <code>M1()</code> его входной код выделяет в стеке потока память под локальную переменную <code>name</code>.</p><p>Далее <code>M1()</code> вызывает <code>M2()</code> передавая в качестве аргумент локальную переменную <code>name</code>. При это адрес локальной переменной заносится в стек. Внутри <code>M2()</code> местоположение стека хранится в переменной-параметре. При вызове метода адрес возврата в вызывающий метод также помещается в стек.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/16de1921-61f4-45ed-bf4e-d923c22a5647" alt="image"></p><p>В начале выполнения <code>M2()</code> его входной код выделяет в стеке потока память для своих локальных переменных.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/884336af-3049-4a4b-bfb0-9d23693e2ff5" alt="image"></p><p>Затем выполняется код метода. Потом выполнение доходит до команды возврата, которая записывает в указатель команд процессора адрес возврата из стека, и стековый кадр <code>M2()</code> возвращается состояние как было до его вызова. С этого момента продолжается выполнение кода <code>M1()</code>, который следует сразу за вызовом <code>M2()</code>, а стековый кадр метода находится в состоянии, необходимом для работы <code>M1()</code>.</p><p>В конечном счёте, метод <code>M1()</code> возвращает управление вызывающей команде, устанавливая указатель команд процессора на адрес возврата, и стековый кадр возвращается в состоянии, аналогичное тому, что было до вызова и так далее.</p><p>Теперь о том, как всё это происходит в среде CLR. Допустим, есть два класса:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">internal</span> <span class="token keyword">class</span> <span class="token class-name">Employee</span> <span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token return-type class-name">Int32</span> GetYearsEmployed <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token range operator">..</span><span class="token punctuation">.</span> <span class="token punctuation">}</span>
  <span class="token keyword">public</span> <span class="token keyword">virtual</span> <span class="token return-type class-name">String</span> GetProgressReport <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token range operator">..</span><span class="token punctuation">.</span> <span class="token punctuation">}</span>
  <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name">Employee</span> <span class="token function">Lookup</span><span class="token punctuation">(</span><span class="token class-name">String</span> name<span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token range operator">..</span><span class="token punctuation">.</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">internal</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">Manager</span> <span class="token punctuation">:</span> <span class="token type-list"><span class="token class-name">Employee</span></span> <span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token keyword">override</span> <span class="token return-type class-name">String</span> <span class="token function">GenProgressReport</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token range operator">..</span><span class="token punctuation">.</span> <span class="token punctuation">}</span>
<span class="token punctuation">}</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Процесс Windows запустился, в него загружена CLR, инициализирована управляемая куча, и создан поток (с 1 Мбайт памяти в стеке). Поток выполняет какой-то метод, из которого вызвался <code>M3()</code>.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/506a9a64-c6a5-4293-874c-0ed8acff6132" alt="image"></p><p>В процессе преобразования IL-кода метода <code>M3()</code> JIT-компилятор выявляет все типы, на которые есть ссылки. На данном этапе CLR обеспечивает загрузку в домен приложения всех сборок, в которых определены эти типы. Затем, используя метаданные сборки, CLR получает информацию о типах и создаёт структуры данных, представляющих эти типы.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/6df42749-a9ce-440b-82c8-3f25d43aa0bf" alt="image"></p><p>После того, как CLR создаст все необходимые объекты-типы и откомпилирует код метода, она приступает к выполнению машинного кода метода. При выполнении метода в стеке потока выделяется память для локальных переменных. CLR автоматически инициализирует все локальные переменные значениями null или 0. Однако при попытке обращения к локальной переменной, неявно инициализированной, компилятор выведет сообщение об ошибке.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/227c1dfd-79e4-4a2c-9dba-6c9067401581" alt="image"></p><p>Далее метод выполняет код создания объекта <code>Manager</code>. При этом в управляемой куче создастся экземпляр типа.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/4b3c19f6-2a14-483a-9192-757fca57989e" alt="image"></p><p>У объекта есть указатель на объект-тип и индекс блока синхронизации. У этого объекта тоже есть байты, необходимые для размещения всех экземплярных полей данных типа, а также экземплярных полей, определённых во всех базовых классах. Всякий раз при создании нового объекта в куче, CLR автоматически инициализирует внутренний указатель на соответствующий объект-тип. Кроме того, CLR инициализирует все экземплярные поля перед вызовом конструктора, который, скорее всего, изменит значения некоторых полей. Оператор <code>new</code> вернёт адрес в памяти объекта, который хранится в переменной (в стеке потока).</p><p>Следующая строка метода вызывает статический метод <code>Lookup()</code>. При вызове этого метода CLR определяет местонахождение объекта-типа, соответствующий типу, в котором определён статический метод. Затем CLR находит точку входа в вызываемый метод, компилирует его и передаёт ему управление. Допустим, метод создаёт объект типа <code>Manager</code> и возвращает адрес объекта в куче. Адрес помещается в стек.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/f00a468f-c1ad-4998-8adc-5b6b81fa590c" alt="image"></p><p>Переменная <code>e</code> больше не ссылается на первый объект, и поскольку никто больше не ссылается на этот объект, он становится идеальный кандидатом на сборку мусора.</p><p>Следующая строка вызывает не виртуальный метод. При вызове не виртуального метода экземпляра JIT-компилятор находит объект типа, соответствующий переменной, которая использовалась для вызова. Если бы тип не определял вызываемый метод, то JIT-компилятор начал бы поиск метода в предках типа. Затем JIT-компилятор находит запись, соответствующую этому методу, компилирует и передаёт управление методу. Допустим, метод вернул 5, что и сохраняется в локальной переменной.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5f18c493-e917-4ccf-bf4c-99ec3c1fe3fc" alt="image"></p><p>Следующая строка вызывает виртуальный метод. При вызове виртуального метода CLR приходится выполнить дополнительную работу. Во-первых, CLR обращается к переменной, используемой для вызова, а затем следует по адресу вызывающего объекта. Во-вторых, CLR проверяет у объекта внутренний указатель на объект-тип, затем метод обрабатывается так же, как и не виртуальный.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/b29db466-78f6-4dc6-a556-1401d6df520d" alt="image"></p><p>Объекты содержат указатели на объекты-типы. По сути они являются объектами. Создавая его, CLR должна как-то его инициализировать. При запуске процесса CLR сразу создаёт специальный объект-тип для типа System.Type. Объекты типов Employee и Manager являются &quot;экземплярами&quot; этого типа, и по этой причине их указатели на объекты-типы инициализируются ссылкой на объект-тип System.Type.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/79734a55-b524-470e-90f3-825888e4796a" alt="image"></p><p>Объект-тип System.Type сам является объектом и поэтому также содержит указатель на объект-тип. Он ссылается на самого себя, так как он сам по себе является &quot;экземпляром&quot; объекта-типа. Метод GetType() возвращает указатель на объект-тип, что и гарантирует истинность типа любого объекта в системе.</p>`,66),t=[c];function o(l,i){return n(),a("div",null,t)}const u=s(p,[["render",o],["__file","ch04_TypeFundamentals.html.vue"]]),r=JSON.parse('{"path":"/ru/chapters/ch04_TypeFundamentals.html","title":"Основы типов","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Все типы - производные от System.Object","slug":"все-типы-производные-от-system-object","link":"#все-типы-производные-от-system-object","children":[]},{"level":2,"title":"Приведение типов","slug":"приведение-типов","link":"#приведение-типов","children":[{"level":3,"title":"Приведение типов в C# с помощью операторов is и as","slug":"приведение-типов-в-c-с-помощью-операторов-is-и-as","link":"#приведение-типов-в-c-с-помощью-операторов-is-и-as","children":[]}]},{"level":2,"title":"Пространства имён и сборки","slug":"пространства-имен-и-сборки","link":"#пространства-имен-и-сборки","children":[{"level":3,"title":"Связь между сборками и пространством имен","slug":"связь-между-сборками-и-пространством-имен","link":"#связь-между-сборками-и-пространством-имен","children":[]}]},{"level":2,"title":"Как разные компоненты взаимодействуют во время выполнения","slug":"как-разные-компоненты-взаимодеиствуют-во-время-выполнения","link":"#как-разные-компоненты-взаимодеиствуют-во-время-выполнения","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch04_TypeFundamentals.md"}');export{u as comp,r as data};
