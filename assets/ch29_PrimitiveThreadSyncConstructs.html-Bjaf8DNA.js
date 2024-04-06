import{_ as l,r as p,o,c,a as n,d as s,b as e,e as t}from"./app-IxoMmWNN.js";const i={},d=t('<h1 id="примитивные-конструкции-синхронизации-потоков" tabindex="-1"><a class="header-anchor" href="#примитивные-конструкции-синхронизации-потоков"><span>Примитивные конструкции синхронизации потоков</span></a></h1><p>При разработке масштабируемого и быстродействующего приложения стоит избегать блокировки потоков, так как только в этом случае их можно будет использовать повторно.</p><p>Синхронизация потоков позволяет предотвратить повреждение общих данных при одновременном доступе к ним из разных потоков. Синхронизация не требуется, если доступ к данным осуществляется так, что потоки никак не мешают друг другу. Асинхронные функции реализованы так, что два потока не будут работать одновременно с одними данными, поэтому для асинхронных функций синхронизация потоков не нужна.</p><p>Синхронизация влечёт ряд проблем:</p><ol><li><strong>Сложность разработки.</strong> При разработке необходимо внимательно следить за кодом блокировки и разблокировки данных, а проверить корректную работу можно только с применением нагрузочных тестов (желательно на машине с большим числом процессоров и потоков).</li><li><strong>Снижение производительности.</strong> Установление и снятие блокировки требуют времени. Снижение скорости работы зависит от выбранного механизма блокирования, но даже самое быстрое блокирование значительно снижает быстродействие.</li><li><strong>Создание дополнительных потоков.</strong> При блокировании допускается доступ к данным только из одного потока. Если при этом поток оказывается заблокированным, пул создаст ещё один для сохранения загрузки процессора. А при снятии блокировки потоков оказывается больше, чем процессоров, что приводит к более частым переключениям контекста.</li></ol><p>Следует избегать общих данных (например, статических полей). При создании объекта оператором <code>new</code> он доступен только для вызывающего потока, так что необходимость в синхронизации отпадает. Стоит по возможности избегать значимых типов, потому что они всегда копируются и каждый поток работает со своей копией.</p><p>Однако, нет ничего страшного в работе нескольких потоков с общими данными, если эти данные предназначены только для чтения.</p><h2 id="библиотеки-классов-и-безопасность-потоков" tabindex="-1"><a class="header-anchor" href="#библиотеки-классов-и-безопасность-потоков"><span>Библиотеки классов и безопасность потоков</span></a></h2><p>FCL гарантирует потокобезопасность всех статических методов. То есть вызов статического метода двумя потоками не приводит к повреждению данных. Механизм защиты реализован в FCL, так как нет способа обеспечить блокирование сборок разных производителей, спорящих за доступ к ресурсу. Например, класс <code>Console</code> содержит статическое поле, по которому устанавливается и снимается блокировка, гарантируя, что в каждый момент времени доступ к консоли имеет только один поток. Статический метод <code>System.Math.Max()</code> безопасен в отношении потоков, так как работает с копиями значимых типов.</p><p>В то же время FCL не гарантирует безопасности в отношении потоков экземплярным методам, так как введение в них блокирующего кода слишком сильно скажется на производительности. Более того, если каждый экземплярный метод начнёт выполнять блокирование, это приведёт к тому, что в каждый момент времени будет выполняться только один поток. Но так как экземплярные методы вызываются над объектом, конструируемым в одном потоке, синхронизация не требуется. Однако если в дальнейшем потомок предоставит ссылку на объект (поместив в статическое поле, передав её в качестве аргумента <code>ThreadPool.QueueUserWorkItem()</code> или объекту <code>Task</code>), тогда синхронизация уже потребуется, если потоки попытаются одновременно получить доступ к данным не только для чтения.</p><p>Собственные библиотеки классов стоит строить по вышеописанному паттерну: статические методы должны быть потокобезопасными, а экземплярные - нет.</p><h2 id="примитивные-конструкции-пользовательского-режима-и-режима-ядра" tabindex="-1"><a class="header-anchor" href="#примитивные-конструкции-пользовательского-режима-и-режима-ядра"><span>Примитивные конструкции пользовательского режима и режима ядра</span></a></h2><p>Под &quot;примитивными&quot; подразумеваются простейшие конструкции, которые доступны в коде. Бывают двух видов: пользовательского режима и режима ядра. По возможности стоит использовать первые, так как они быстрее и используют директивы процессора. То есть имеет место координация на аппаратном уровне. Однако одновременно это означает, что Windows не распознаёт такие конструкции и не создаёт дополнительных потоков для выравнивания загрузки процессора. Кроме того, блокировка происходит на короткое время.</p><p>Конструкции пользовательского режима не идеальны. Только ядро Windows может остановить выполнение потока, чтобы он впустую не расходовал ресурсы процессора. Запущенный в пользовательском режиме поток может быть прерван ОС, но довольно быстро будет снова готов к работе. Получается, если поток будет пытаться, но не сможет получить некоторый ресурс, то он начнёт циклически существовать в пользовательском режиме, что потенциально является пустым расходованием времени процессора.</p><p>Именно это заставляет перейти к конструкциям режима ядра. Они предоставляются самой ОС и требуют от потоков вызова функций, реализованных в ядре. Переход потока между пользовательским режимом и режимом ядра требует значительных затрат ресурсов, так что конструкций режима ядра стоит избегать. Однако, у них есть ряд преимущества. Если один поток использует конструкцию режима ядра для получения ресурса, с которым уже работает другой поток, Windows блокирует его, чтобы не тратить время процессора. А после получения доступа к ресурсу блокировка снимается.</p><p>Если поток, использующий в данный момент конструкцию, не освободит её, то ожидающий конструкцию поток может оказаться заблокированным навсегда. В этом случае в пользовательском режиме поток будет бесконечно исполняться, это называется <em>активной (живой) блокировкой</em> (livelock) или <em>зависанием</em>. В режиме ядра поток блокируется навсегда, это называется <em>взаимной (мёртвой) блокировкой</em> (deadlock). Обе блокировки плохи, но вторая является меньшим злом, так как впустую расходуется только память, но не время процессора.</p><h2 id="конструкции-пользовательского-режима" tabindex="-1"><a class="header-anchor" href="#конструкции-пользовательского-режима"><span>Конструкции пользовательского режима</span></a></h2><p>CLR гарантирует атомарность записи большинства примитивных типов, то есть все байты читаются или записываются одновременно. При этом посторонние потоки не увидят переменную в промежуточном состоянии.</p><p>Для тех примитивных типов, которые не поддерживают атомарность, сторонний поток может получить промежуточное значение. Это называется <em>прерванным чтением</em> (torn read).</p><p>Примитивные конструкции пользовательского режима управляют временем выполнения атомарных операций записи или чтения. Кроме того, они обеспечивают атомарность и управление временем выполнения для переменных типов <code>U(Int64)</code> и <code>Double</code>.</p><p>Примитивные конструкции делятся на два типа:</p><ul><li><em>Volatile-конструкции</em> выполняют для переменной, содержащей данные простого типа, атомарную операцию чтения <em>или</em> записи.</li><li><em>Interlocked-конструкции</em> выполняют для переменной, содержащей данные простого типа, атомарную операцию чтения и записи.</li></ul><p>Конструкции обоих типов требуют передачи ссылки на переменную.</p><h3 id="volatile-конструкции" tabindex="-1"><a class="header-anchor" href="#volatile-конструкции"><span>Volatile-конструкции</span></a></h3><p>Компилятор C# очень умело оптимизирует код вплоть до того, чтобы исключать участки, которые никогда не будут вызваны. В процессе оптимизации компилятором C#, JIT-компилятором и процессором гарантируется сохранение назначения кода. То есть с точки рения одного потока код выполняется так, как и задумано, хотя не обязательно сохраняя реализацию. Однако при переходе к многопоточной конфигурации ситуация может измениться.</p><p>В книге приводится несколько примеров, когда многопоточная конфигурация может повлиять на релизную версию программы, при этом в отладке всё будет работать правильно.</p>',26),r={href:"https://learn.microsoft.com/en-us/dotnet/api/system.threading.volatile?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},u=n("code",null,"System.Threading.Volatile",-1),k=t(`<ul><li><code>Volatile.Write()</code> заставляет записать значение непосредственно в момент обращения. Более ранние загрузки и сохранения должны происходить до вызова этого метода.</li><li><code>Volatile.Read()</code> заставляет считать значение параметра непосредственно в момент обращения. Более поздние загрузки и сохранения должны происходить после вызова этого метода.</li></ul><p>Вот так выглядит применение данной конструкции:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">internal</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">ThreadsSharingData</span>
<span class="token punctuation">{</span>
  <span class="token keyword">private</span> <span class="token class-name">Int32</span> m_flag <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token class-name">Int32</span> m_value <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

  <span class="token comment">// Этот метод выполняется одним потоком</span>
  <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Thread1</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">// ПРИМЕЧАНИЕ. 5 нужно записать в m_value до записи 1 в m_flag</span>
    m_value <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>
    Volatile<span class="token punctuation">.</span><span class="token function">Write</span><span class="token punctuation">(</span><span class="token keyword">ref</span> m_flag<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>

  <span class="token comment">// Этот метод выполняется вторым потоком</span>
  <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Thread2</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">// ПРИМЕЧАНИЕ. Поле m_value должно быть прочитано после m_flag</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>Volatile<span class="token punctuation">.</span><span class="token function">Read</span><span class="token punctuation">(</span><span class="token keyword">ref</span> m_flag<span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span>
      Console<span class="token punctuation">.</span><span class="token function">WriteLine</span><span class="token punctuation">(</span>m_value<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Вызов метода <code>Volatile.Write()</code> гарантирует, что все записи в переменные будут завершены до вызова этого метода. При этом предшествующие операции могут быть выполнены в любом порядке.</p><p>Вызов метода <code>Volatile.Read()</code> гарантирует, что все чтения переменных будут выполнены после вызова этого метода. При этом последующие операции могут быть выполнены в любом порядке.</p><h4 id="поддержка-полеи-volatile-в-c" tabindex="-1"><a class="header-anchor" href="#поддержка-полеи-volatile-в-c"><span>Поддержка полей Volatile в C#</span></a></h4><p>Ключевое слово <code>volatile</code> может применяться к статическим или экземплярным полям некоторых примитивных типов, а также к перечислимым полям. Доступ к помеченным данным ключевым словом полям всегда будет происходить в режиме волатильного чтения или записи.</p><p>Ключевое слово <code>volatile</code> позволяет переписать метод из примера выше:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">internal</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">ThreadsSharingData</span> 
<span class="token punctuation">{</span>
  <span class="token keyword">private</span> <span class="token keyword">volatile</span> <span class="token class-name">Int32</span> m_flag <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  <span class="token keyword">private</span> <span class="token class-name">Int32</span> m_value <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
  
  <span class="token comment">// Этот метод исполняется одним потоком</span>
  <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Thread1</span><span class="token punctuation">(</span><span class="token punctuation">)</span> 
  <span class="token punctuation">{</span>
    <span class="token comment">// ПРИМЕЧАНИЕ. Значение 5 должно быть записано в m_value перед записью 1 в m_flag</span>
    m_value <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">;</span>
    m_flag <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
  
  <span class="token comment">// Этот метод исполняется другим потоком</span>
  <span class="token keyword">public</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Thread2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> 
  <span class="token punctuation">{</span>
    <span class="token comment">// ПРИМЕЧАНИЕ. Поле m_value должно быть прочитано после m_flag</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>m_flag <span class="token operator">==</span> <span class="token number">1</span><span class="token punctuation">)</span>
    Console<span class="token punctuation">.</span><span class="token function">WriteLine</span><span class="token punctuation">(</span>m_value<span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Рихтер считает, что данное ключевое слово создаёт ряд проблем и что можно обойтись без него. Кроме того, волатильное поле нельзя передавать в метод по ссылке, а также они несовместимы с CLS.</p><h3 id="interlocked-конструкции" tabindex="-1"><a class="header-anchor" href="#interlocked-конструкции"><span>Interlocked-конструкции</span></a></h3>`,11),m={href:"https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},v=n("code",null,"System.Threading.Interlocked",-1),h=n("h3",{id:"реализация-простои-циклическои-блокировки",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#реализация-простои-циклическои-блокировки"},[n("span",null,"Реализация простой циклической блокировки")])],-1),b=n("p",null,"В книге описан пример реализации простой циклической блокировки.",-1),_=n("p",null,"Она достаточно проста, но её потенциальным недостатком является то, что при наличии конкуренции за право на блокирование потоки вынуждены ожидать блокирования в цикле, что приводит к пустому расходованию процессорного времени. Так что использовать циклическую блокировку стоит только для быстро выполнимых операций.",-1),g={href:"https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread.spinwait?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},f=n("code",null,"System.Threading.SpinWait",-1),y=t('<h4 id="задержка-в-обработке-потока" tabindex="-1"><a class="header-anchor" href="#задержка-в-обработке-потока"><span>Задержка в обработке потока</span></a></h4><p>Хитрость в том, чтобы иметь поток, который мог бы на время заставить ресурс приостановить его, чтобы другой поток, обладающий в данный момент ресурсом, завершился и освободил место. Для этого в структуре <code>System.Threading.SpinWait</code> есть ряд методов.</p><p>В FCL также существует структура <code>System.Threading.SpinLock</code>. Она отличается наличием поддержки времени ожидания.</p><h3 id="универсальныи-interlocked-паттерн" tabindex="-1"><a class="header-anchor" href="#универсальныи-interlocked-паттерн"><span>Универсальный Interlocked-паттерн</span></a></h3><p>При желании добавить дополнительны методы в <code>Interlocked</code> стоит самостоятельно реализовать статические методы, которые бы выполняли желаемые операции через использование <code>Interlocked.CompareExchange()</code>.</p><h2 id="конструкции-режима-ядра" tabindex="-1"><a class="header-anchor" href="#конструкции-режима-ядра"><span>Конструкции режима ядра</span></a></h2><p>Преимущества конструкций режима ядра перед конструкциями пользовательского режима:</p><ul><li>Если конструкция выявляет конкуренцию за ресурс, Windows блокирует проигравший поток, останавливая зацикливание, которое ведёт к пустой трате ресурсов.</li><li>Конструкции могут осуществлять взаимную синхронизацию управляемых и неуправляемых потоков.</li><li>Конструкции умеют синхронизировать потоки разных процессов, запущенных на одной машине.</li><li>Конструкции можно наделить атрибутами безопасности, ограничивая несанкционированный доступ к ним.</li><li>Поток можно заблокировать, пока не станут доступны все или хотя бы одна конструкция.</li><li>Поток можно заблокировать конструкцией, указав время ожидания. Если за указанное время поток не получит доступ к ресурсу, его можно разблокировать для выполнения других заданий.</li></ul><p>К примитивным конструкциям относятся <em>события</em> (events) и <em>семафоры</em> (semaphores). На их основе строятся более сложные, например, <em>мьютексы</em> (mutex).</p>',9),w={href:"https://learn.microsoft.com/en-us/dotnet/api/system.threading.waithandle?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},x=n("code",null,"System.Threading.WaitHandle",-1),S=t(`<p>Конструкции режима ядра часто используются для создания приложений, которые в любой момент времени могут существовать только в одном экземпляре. Пример кода:</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">using</span> <span class="token namespace">System</span><span class="token punctuation">;</span>
<span class="token keyword">using</span> <span class="token namespace">System<span class="token punctuation">.</span>Threading</span><span class="token punctuation">;</span>

<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">class</span> <span class="token class-name">Program</span>
<span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token return-type class-name"><span class="token keyword">void</span></span> <span class="token function">Main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token class-name">Boolean</span> createdNew<span class="token punctuation">;</span>

    <span class="token comment">// Пытаемся создать объект ядра с указанным именем</span>
    <span class="token keyword">using</span> <span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token constructor-invocation class-name">Semaphore</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token string">&quot;SomeUniqueStringIdentifyingMyApp&quot;</span><span class="token punctuation">,</span> <span class="token keyword">out</span> createdNew<span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
      <span class="token keyword">if</span> <span class="token punctuation">(</span>createdNew<span class="token punctuation">)</span>
      <span class="token punctuation">{</span>
        <span class="token comment">// Этот поток создает ядро, так что другие копии приложения не могут запускаться. Выполняем остальную часть приложения...</span>
      <span class="token punctuation">}</span> <span class="token keyword">else</span>
      <span class="token punctuation">{</span>
        <span class="token comment">// Этот поток открывает существующее ядро с тем же именем; должна запуститься другая копия приложения.</span>
        <span class="token comment">// Ничего не делаем, ждем возвращения управления от метода Main, чтобы завершить вторую копию приложения</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="события" tabindex="-1"><a class="header-anchor" href="#события"><span>События</span></a></h3><p>События представоляют собой переменные типа <code>Boolean</code>, находящиеся под управлением ядра. Ожидающий события поток блокируется, если оно имеет значение <code>false</code>, и освобождается, если <code>true</code>. Когда событие с автосбросом имеет значение <code>true</code>, оно освобождает всего один заблокированный поток, так как после освобождения первого потока ядро автоматические возвращает событию значение <code>false</code>. Если значение <code>true</code> имеет событие с ручным сбросом, оно освобождает все ожидающие этого потоки.</p><p>Если можно избежать синхронизации потоков - следует избегать её. Если без неё не обойтись, стоит использовать конструкции пользовательского режима. Конструкции ядра стоит использовать в самом крайнем случае.</p><h3 id="семафоры" tabindex="-1"><a class="header-anchor" href="#семафоры"><span>Семафоры</span></a></h3><p>Семафоры представляют собой обычные переменные типа <code>Int32</code>, управляемые ядром. Ожидающий семафора поток блокируется при значении 0 и освобождается при значениях больше 0. При снятии блокировки с ожидающего семафора потока ядро автоматически вычитает единицу из счётчика.</p><p>События и семафоры ведут себя следующим образом:</p><ul><li>При наличии нескольких потоков в режиме ожидания событие с автосбросом освобождает только один из них.</li><li>Событие с ручным сбросом снимает блокировку со всех ожидающих его потоков.</li><li>При наличии нескольких потоков, ожидающих семафора, его появление снимает блокировку с потоков <code>releaseCount</code>.</li></ul><h3 id="мьютексы" tabindex="-1"><a class="header-anchor" href="#мьютексы"><span>Мьютексы</span></a></h3><p>Мьютекс предоставляет взаимно исключающую блокировку. Он функционирует аналогично событию с ручным сбросом или семафору, так как за раз освобождает всего лишь один ожидающий поток.</p><p>Мьютексы обладают дополнительной логикой:</p><ul><li>Сохраняют информацию о том, какие потоки ими владеют.</li><li>Мьютексы управляют рекурсивным счётчиком, указывающим сколько раз поток-владелец уже владел объектом. Если поток владеет мьютексом и ожидает его ещё раз, рекурсивный счётчик увеличивается на единицу, и потоку разрешается продолжить выполнение. При вызове потоком метода <code>ReleaseMutex()</code> рекурсивный счётчик уменьшается на единицу. Как только значение достигнет 0, владельцем мьютекса может стать другой поток.</li></ul><p>Из-за этих особенностей мьютексу требуется дополнительная память, поэтому многие разработчики стараются обойтись без мьютексов.</p>`,14);function T(C,I){const a=p("ExternalLinkIcon");return o(),c("div",null,[d,n("p",null,[s("Для решения подобных проблем существует класс "),n("a",r,[u,e(a)]),s(", который содержит два метода, отключающие оптимизации:")]),k,n("p",null,[s("Класс "),n("a",m,[v,e(a)]),s(" содержит несколько статических методов, каждый из которых выполняет как атомарное чтение, так и атомарную запись. Кроме того, все методы ставят барьер в памяти, то есть любая запись переменной перед вызовом одного из методов выполняется до него, а все чтения - после.")]),h,b,_,n("p",null,[s("В FCL данная блокировка поставляется вместе со структурой "),n("a",g,[f,e(a)]),s(".")]),y,n("p",null,[s("Базовым для всех примитивных конструкций режима ядра является абстрактный класс "),n("a",w,[x,e(a)]),s(".")]),S])}const W=l(i,[["render",T],["__file","ch29_PrimitiveThreadSyncConstructs.html.vue"]]),L=JSON.parse('{"path":"/ru/chapters/ch29_PrimitiveThreadSyncConstructs.html","title":"Примитивные конструкции синхронизации потоков","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Библиотеки классов и безопасность потоков","slug":"библиотеки-классов-и-безопасность-потоков","link":"#библиотеки-классов-и-безопасность-потоков","children":[]},{"level":2,"title":"Примитивные конструкции пользовательского режима и режима ядра","slug":"примитивные-конструкции-пользовательского-режима-и-режима-ядра","link":"#примитивные-конструкции-пользовательского-режима-и-режима-ядра","children":[]},{"level":2,"title":"Конструкции пользовательского режима","slug":"конструкции-пользовательского-режима","link":"#конструкции-пользовательского-режима","children":[{"level":3,"title":"Volatile-конструкции","slug":"volatile-конструкции","link":"#volatile-конструкции","children":[]},{"level":3,"title":"Interlocked-конструкции","slug":"interlocked-конструкции","link":"#interlocked-конструкции","children":[]},{"level":3,"title":"Реализация простой циклической блокировки","slug":"реализация-простои-циклическои-блокировки","link":"#реализация-простои-циклическои-блокировки","children":[]},{"level":3,"title":"Универсальный Interlocked-паттерн","slug":"универсальныи-interlocked-паттерн","link":"#универсальныи-interlocked-паттерн","children":[]}]},{"level":2,"title":"Конструкции режима ядра","slug":"конструкции-режима-ядра","link":"#конструкции-режима-ядра","children":[{"level":3,"title":"События","slug":"события","link":"#события","children":[]},{"level":3,"title":"Семафоры","slug":"семафоры","link":"#семафоры","children":[]},{"level":3,"title":"Мьютексы","slug":"мьютексы","link":"#мьютексы","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch29_PrimitiveThreadSyncConstructs.md"}');export{W as comp,L as data};