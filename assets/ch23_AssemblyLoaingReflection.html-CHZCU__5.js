import{_ as e,o as a,c,e as l}from"./app-IxoMmWNN.js";const t={},d=l('<h1 id="загрузка-сборок-и-отражение" tabindex="-1"><a class="header-anchor" href="#загрузка-сборок-и-отражение"><span>Загрузка сборок и отражение</span></a></h1><p>Сведения о загрузке сборок и отражении полезны для создания динамически расширяемых приложений, то есть таких, для которых хост-приложение создаёт одна компания, а другие - <em>подключаемые компоненты</em> (add-ins), которые расширяют функциональность хоста.</p><h2 id="загрузка-сборок" tabindex="-1"><a class="header-anchor" href="#загрузка-сборок"><span>Загрузка сборок</span></a></h2><p>В книге повторяется о механизмах загрузки сборок в домен при обращении к типам этих сборок из кода. Дополнительно рассказывается о возможностях загрузить сборку вручную использую отражение или тип <code>System.AppDomain</code>.</p><h2 id="использование-отражения-для-создания-динамически-расширяемых-приложении" tabindex="-1"><a class="header-anchor" href="#использование-отражения-для-создания-динамически-расширяемых-приложении"><span>Использование отражения для создания динамически расширяемых приложений</span></a></h2><p>Типы в пространстве имён <code>System.Reflection</code> представляют собой объектную модель для работы с метаданными сборки или модуля. Часто привязку к типам через отражение называют <em>поздним связыванием</em> (late binding) - в отличие от <em>раннего связывания</em> (early binding), когда требуемые типы известны при компиляции.</p><h2 id="производительность-отражения" tabindex="-1"><a class="header-anchor" href="#производительность-отражения"><span>Производительность отражения</span></a></h2><p>У отражения, несмотря на его достоинства в виде возможности получения информации о типах во время выполнения, есть и два недостатка:</p><ul><li>Отсутствие безопасности типов на этапе компиляции, так как активно используются строки. Например, вызов метода <code>Type.GetType(&quot;int&quot;)</code> успешно скомпилируется, но во время выполнения вернёт <code>null</code>, потому что типа с таким именем фактически не существует.</li><li>Отражение работает медленно, так как поиск метаданных всегда происходит через сравнение строк без учёта регистра.</li></ul><p>Вызов метода или обращение к полю тоже происходит медленно, так как при использовании отражения перед вызовом метода аргументы упаковываются в массив, а затем при вызове извлекаются в стек. Кроме того, CLR приходится проверять правильность числа и типа параметров, а также разрешений доступа у вызывающего кода.</p><p>При написании приложения, которое динамически ищет и создаёт объекты, стоит следовать одному из подходов:</p><ul><li>Порождать свои типы от базового типа, известного на момент компиляции, а затем выполнить приведение типа к базовому и вызов виртуальных методов базового типа.</li><li>Реализовывать в типах интерфейсы, известные на момент компиляции, а затем выполнить приведение типа к типу интерфейса и вызвать методы интерфейса.</li></ul><h3 id="нахождение-типов-определенных-в-сборке" tabindex="-1"><a class="header-anchor" href="#нахождение-типов-определенных-в-сборке"><span>Нахождение типов, определённых в сборке</span></a></h3><p>С помощью отражения можно находить типы, определённые в сборке.</p><h3 id="объект-type" tabindex="-1"><a class="header-anchor" href="#объект-type"><span>Объект Type</span></a></h3><p>Тип <code>System.Type</code> - отправная точка для операций с типами и объектами, он представляет ссылку на тип.</p><p>Для каждого типа в домене существует единственный объект <code>Type</code>, поэтому определить, принадлежат ли объекты к одному типу можно через операторы равенства и метод получения типа <code>GetType()</code>.</p><p>Помимо этого, в FCL существует ещё несколько способом получения типа:</p><ul><li>Вызов <code>System.Type.GetType()</code> с передачей в качестве аргумента полного имени типа с указанием пространства имён. Помимо этого, можно дополнительно указать сборку для поиска типа.</li><li>Метод <code>System.Type.ReflectionOnlyType()</code> работает так же, но загружает тип только для отражения, но не для выполнения кода.</li><li>Экземплярные методы <code>DeclaredNestedTypes()</code> и <code>GetDeclaredNestedTypes()</code> типа <code>System.TypeInfo</code>.</li><li>Экземплярные методы <code>GetType()</code>, <code>DefinedTypes()</code> и <code>ExportedTypes()</code> типа <code>System.Reflection.Assembly</code>.</li></ul><p>Вместо этих методов лучше использовать специальный оператор, предназначенный для получения объекта типа. При компиляции такого оператора получается более быстрый код. В C# таким оператором является <code>typeof</code>, хотя обычно его не применяют для сравнения информации о типах, загруженных посредством позднего и раннего связывания. Сравнение с использованием данного оператора проверяет на точное, а не на совместимое (как <code>is</code> и <code>as</code>) сравнение.</p><p>Помимо объекта <code>Type</code> информацию можно получить также из <code>TypeInfo</code> путём приведения. Данный тип позволяет получить больше информации о типе, хотя приведение является достаточно затратной операцией, так что не стоит ей злоупотреблять.</p><h3 id="создание-иерархии-типов-определенных-в-сборке" tabindex="-1"><a class="header-anchor" href="#создание-иерархии-типов-определенных-в-сборке"><span>Создание иерархии типов, определённых в сборке</span></a></h3><p>Описывается метод для создания иерархии типов на примере производных от типа <code>System.Exception</code>.</p><h3 id="создание-экземпляра-типа" tabindex="-1"><a class="header-anchor" href="#создание-экземпляра-типа"><span>Создание экземпляра типа</span></a></h3><p>После получения ссылки на объект, производный от <code>Type</code>, можно создать экземпляр этого типа следующими способами:</p><ul><li><strong>Методы <code>System.Activator.CreateInstance()</code>.</strong> Можно создавать экземпляр, используя <code>Type</code> или идентифицирующую строку.</li><li><strong>Методы <code>System.Activator.CreateInstanceFrom()</code>.</strong> Можно создавать только с использованием строки, определяющей тип и сборку.</li><li><strong>Методы объекта <code>System.AppDomain</code>.</strong></li><li><strong>Экземплярный метод <code>Invoke()</code> объекта <code>System.Reflection.ConstructorInfo</code>.</strong></li></ul><p>Существует ряд исключений. Экземпляры массивов создаются с использованием статического метода <code>System.Array.CreateInstance()</code>. Для создания делегата используется статический метод <code>System.Delegate.CreateDelegate()</code>. Для создания экземпляра обобщённого типа сначала необходимо получить ссылку на открытый тип, а затем вызвать экземплярный метод <code>System.Type.MakeGenericType()</code> передав аргументы-типы, после чего можно создать экземпляр типа.</p><h2 id="создание-приложении-с-поддержкои-подключаемых-компонентов" tabindex="-1"><a class="header-anchor" href="#создание-приложении-с-поддержкои-подключаемых-компонентов"><span>Создание приложений с поддержкой подключаемых компонентов</span></a></h2><p>При создании подключаемых компонентов стоит использовать интерфейсы, так как через них можно определить сценарий взаимодействия между модулями. Подробнее в книге.</p><h2 id="нахождение-члена-типа-путем-отражения" tabindex="-1"><a class="header-anchor" href="#нахождение-члена-типа-путем-отражения"><span>Нахождение члена типа путём отражения</span></a></h2><p>Для достижения высокой производительности и безопасности типов следует избегать отражения. В динамически расширяемом приложении после создания объекта он обычно приводится к базовому типу или типу интерфейса.</p><h3 id="нахождение-членов-типа" tabindex="-1"><a class="header-anchor" href="#нахождение-членов-типа"><span>Нахождение членов типа</span></a></h3><p>На рисунках представлена иерархия типов отражения и типы, используемые для обхода объектной модели отражения.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/9accf173-7a79-4e42-8a69-bd30cb52c9c2" alt="image"></p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/a26e360e-6180-4a33-ad8b-53e03e2de7c7" alt="image"></p><h3 id="обращение-к-членам-типов" tabindex="-1"><a class="header-anchor" href="#обращение-к-членам-типов"><span>Обращение к членам типов</span></a></h3><p>В книге приводится более подробное описание обращения к членам типа, полученным через отражение, а также примеры кода.</p><h3 id="использование-дескрипторов-привязки-для-снижения-проблем-потребления-памяти-процессором" tabindex="-1"><a class="header-anchor" href="#использование-дескрипторов-привязки-для-снижения-проблем-потребления-памяти-процессором"><span>Использование дескрипторов привязки для снижения проблем потребления памяти процессором</span></a></h3><p>Объекты <code>Type</code> и производные от <code>MemberInfo</code> занимают много памяти, если их много и к ним надо часто обращаться. Это способствует снижению производительности.</p><p>CLR создаёт эти объекты лишь для упрощения работы программиста, самой среде они не нужны. Для сокращения потребления памяти можно использовать описатели времени выполнения. Они являются значимыми типами с одним единственным полем <code>IntPtr</code>, который представляет собой дескриптор, ссылающийся на тип, поле или метод в куче загрузчика домена приложений. Для приведения данных о типах к описателям существуют специальные статические методы.</p>',40),n=[d];function o(i,s){return a(),c("div",null,n)}const r=e(t,[["render",o],["__file","ch23_AssemblyLoaingReflection.html.vue"]]),h=JSON.parse('{"path":"/ru/chapters/ch23_AssemblyLoaingReflection.html","title":"Загрузка сборок и отражение","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Загрузка сборок","slug":"загрузка-сборок","link":"#загрузка-сборок","children":[]},{"level":2,"title":"Использование отражения для создания динамически расширяемых приложений","slug":"использование-отражения-для-создания-динамически-расширяемых-приложении","link":"#использование-отражения-для-создания-динамически-расширяемых-приложении","children":[]},{"level":2,"title":"Производительность отражения","slug":"производительность-отражения","link":"#производительность-отражения","children":[{"level":3,"title":"Нахождение типов, определённых в сборке","slug":"нахождение-типов-определенных-в-сборке","link":"#нахождение-типов-определенных-в-сборке","children":[]},{"level":3,"title":"Объект Type","slug":"объект-type","link":"#объект-type","children":[]},{"level":3,"title":"Создание иерархии типов, определённых в сборке","slug":"создание-иерархии-типов-определенных-в-сборке","link":"#создание-иерархии-типов-определенных-в-сборке","children":[]},{"level":3,"title":"Создание экземпляра типа","slug":"создание-экземпляра-типа","link":"#создание-экземпляра-типа","children":[]}]},{"level":2,"title":"Создание приложений с поддержкой подключаемых компонентов","slug":"создание-приложении-с-поддержкои-подключаемых-компонентов","link":"#создание-приложении-с-поддержкои-подключаемых-компонентов","children":[]},{"level":2,"title":"Нахождение члена типа путём отражения","slug":"нахождение-члена-типа-путем-отражения","link":"#нахождение-члена-типа-путем-отражения","children":[{"level":3,"title":"Нахождение членов типа","slug":"нахождение-членов-типа","link":"#нахождение-членов-типа","children":[]},{"level":3,"title":"Обращение к членам типов","slug":"обращение-к-членам-типов","link":"#обращение-к-членам-типов","children":[]},{"level":3,"title":"Использование дескрипторов привязки для снижения проблем потребления памяти процессором","slug":"использование-дескрипторов-привязки-для-снижения-проблем-потребления-памяти-процессором","link":"#использование-дескрипторов-привязки-для-снижения-проблем-потребления-памяти-процессором","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch23_AssemblyLoaingReflection.md"}');export{r as comp,h as data};