import{_ as s,r as l,o as c,c as p,a as e,d as a,b as i,e as o}from"./app-IxoMmWNN.js";const t={},d=e("h1",{id:"методы",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#методы"},[e("span",null,"Методы")])],-1),r=e("h2",{id:"конструкторы-экземпляров-и-классы-ссылочные-типы",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#конструкторы-экземпляров-и-классы-ссылочные-типы"},[e("span",null,"Конструкторы экземпляров и классы (ссылочные типы)")])],-1),h=e("p",null,[a("Конструкторы - специальные методы, позволяющие корректно инициализировать новый экземпляр типа. В таблице определений в метаданных отмечаются сочетанием .ctor (от "),e("em",null,"constructor"),a("). При создании экземпляра ссылочного типа выделяется память для полей данных и инициализируются служебные поля (индекс блока синхронизации и ссылка на объект-тип), после чего вызывается конструктор экземпляра, устанавливающий исходное состояние нового объекта.")],-1),u=e("p",null,[a("При конструировании объекта ссылочного типа выделяемая для него память обнуляется до вызова конструктора экземпляра: любые поля, не задаваемые конструктором явно, гарантировано содержат 0 ли "),e("code",null,"null"),a(".")],-1),m={href:"https://github.com/kuzmin-nikita/CLR-via-CSharp/blob/main/chapters/Chapter6.md#%D0%BC%D0%BE%D0%B4%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%D0%BE%D1%80%D1%8B-%D0%BD%D0%B0%D1%81%D0%BB%D0%B5%D0%B4%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F",target:"_blank",rel:"noopener noreferrer"},k=o(`<p>Для абстрактных классов компилятор создаёт конструктор с модификатором <code>protected</code>, иначе область видимости будет открытой. Если в базовом классе нет конструктора без параметров, производный класс должен явно вызывать конструктор базового класса, иначе компилятор вернёт ошибку. Для статических классов компилятор не создаёт конструктор по умолчанию.</p><p>В типе можно определить несколько конструкторов, при этом сигнатуры и уровни доступа должны отличаться. В случае верифицируемого кода конструктор экземпляров должен вызвать конструктор базового класса до обращения к какому-либо из унаследованных от него полей. В конечном счёте всегда вызывается конструктор <code>System.Object</code>, который ничего не делает, а только возвращает управление, так как в <code>object</code> не определены поля.</p><p>В редких случаях экземпляр может создаваться без вызова конструктора. Например, метод <code>MemberwiseClone()</code> выделяет память, инициализирует служебные поля объекта, а потом копирует байты исходного объекта в новую область памяти. Кроме того, конструктор обычно не вызывается при десериализации.</p><p>Нельзя вызывать какие-либо виртуальные методы конструктора, которые могут повлиять на создаваемый объект. Потому что если виртуальный метод переопределён в производном типе, то реализация производного типа вызовется до того, как завершится инициализация всех полей в иерархии. На примере: конструктор базового типа вызывает виртуальный метод, виртуальный метод переопределён в наследнике, наследник вызывает конструктор, вызывается конструктор базового типа - получилась петля. Но если виртуальный метод не переопределён, тогда всё нормально. В таких обстоятельствах последствия вызова непредсказуемы.</p><p>Если имеется несколько инициализируемых экземплярных полей и множество перегруженных конструкторов, стоит подумать о том, чтобы определить поля без инициализации: создать единственный конструктор, выполняющий общую инициализацию и заставить каждый конструктор явно вызвать общий конструктор. Связано это с тем, что все инициализируемые поля будут прописаны в каждом конструкторе, что способствует разрастанию кода.</p><h2 id="конструкторы-экземпляров-и-структуры-значимые-типы" tabindex="-1"><a class="header-anchor" href="#конструкторы-экземпляров-и-структуры-значимые-типы"><span>Конструкторы экземпляров и структуры (значимые типы)</span></a></h2><p>Конструкторы значимых типов работают иначе. CLR всегда разрешает создание экземпляров значимых типов и этому ничто не может помешать. Поэтому по большому счёту конструкторы у значимого типа можно не определять. Фактически компиляторы не определяют для значимых типов конструкторы по умолчанию.</p><div class="language-csharp line-numbers-mode" data-ext="cs" data-title="cs"><pre class="language-csharp"><code><span class="token keyword">internal</span> <span class="token keyword">struct</span> <span class="token class-name">Point</span>
<span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token class-name">Int32</span> m_x<span class="token punctuation">,</span> m_y<span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">internal</span> <span class="token keyword">sealed</span> <span class="token keyword">class</span> <span class="token class-name">Rectangle</span>
<span class="token punctuation">{</span>
  <span class="token keyword">public</span> <span class="token class-name">Point</span> m_topLeft<span class="token punctuation">,</span> m_bottomRight<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Для создания объекта ссылочного типа надо использовать оператор <code>new()</code> с указанием конструктора. В этом случае вызывается конструктор по умолчанию. Память, выделенная для объекта ссылочного типа включает место для двух экземпляров значимого типа. Из соображений производительности CLR не пытается вызвать конструктор для каждого экземпляра значимого типа, содержащегося в объекте ссылочного типа. Поля значимого типа инициализируются нулями/<code>null</code>.</p><p>CLR позволяет определять конструкторы для значимых типов, но они выполняются лишь при наличии кода, явно вызывающего один из них.</p><p>Конструктор экземпляра значимого типа выполняется только при явном вызове, так что если конструктор ссылочного типа не инициализировал поля значимого типа вызовом с помощью оператора <code>new()</code> конструкторам значимого типа, то поля значимого типа будут содержать значения по умолчанию.</p><p>Если значимый тип уже определён, то определяется конструктор, по умолчанию не имеющий параметров.</p><p>Фактически большинство компиляторов никогда не генерирует автоматически код для вызова конструктора по умолчанию для значимого типа даже при наличии конструктора без параметров. Для исполнения конструктора значимого типа без параметров, разработчик должен явно его вызвать. Однако C# не позволяет даже создать конструктор без параметров, и выдаст ошибку компиляции. Это сделано специально, чтобы не вводить разработчиков в заблуждение.</p><p>В поля значимого типа обязательно заносятся значения 0 или <code>null</code>, если значимый тип вложен в объект ссылочного типа. Однако сказать такое про значимый тип, хранящийся в стеке, нельзя. Так как код верифицируемый, компилятор гарантирует, что поля значимого типа обнулятся или заполнятся каким-то значением, так что исключений возникнуть не должно.</p><p>C# не допускает конструктором без параметров для значимых типов, но CLR это разрешает, так что такую структуру можно написать на IL. По этой же причине нельзя использовать инициализаторы полей (они разворачиваются в конструктор без параметров). Конструктор без параметров выглядит так, будто он будет вызван неявно, но этого не произойдёт.</p><p>При наличии конструктора с параметрами, он должен инициализировать все поля. Это можно обойти, если прописать в конструкторе <code>this = new SomeValueType();</code>, а затем инициализировать необходимые поля. В ссылочных типах указатель <code>this</code> может быть использован только для чтения.</p><h2 id="конструкторы-типов" tabindex="-1"><a class="header-anchor" href="#конструкторы-типов"><span>Конструкторы типов</span></a></h2><p>Помимо экземплярных конструкторов, CLR также поддерживает конструкторы типов (статические конструкторы / конструкторы классов / инициализаторы типов). Конструкторы типов можно применять в интерфейсах (не в C#), ссылочным и значимым типам. Данные конструкторы определяют первоначальное состояние объекта-типа. По умолчанию у типа не определено конструктора. У типа не может быть более одного конструктора. У конструктора типа не должно быть параметров.</p><p>Конструкторы типов объявляют так же, как и экземплярные, однако их помечают ключевым словом <code>static</code>, а также они всегда должны быть закрытыми (по умолчанию) и модификаторы доступа к ним не применимы.</p><p>Хотя конструктор значимого типа определить можно, этого не следует делать, потому что CLR иногда может не вызвать его.</p><p>При компиляции метода JIT-компилятор обнаруживает типы, на которые есть ссылки из кода. Если в каком-то типе есть конструктор, то JIT-компилятор проверяет, был ли он исполнен в текущем домене.</p><p>Затем после JIT-компиляции метода начинается выполнение потока. В реальности потоков может быть несколько. В этом случае CLR старается гарантировать, чтобы конструктор типа выполнялся единожды в каждом домене. Для этого при вызове конструктора типа вызывающий поток получает исключающую блокировку. Это означает, что при попытке вызвать конструктор типа только один поток получит эту возможность, остальные будут заблокированы. Первый поток выполнит код статического конструктора, после чего проснутся остальные потоки и проверят, был ли вызван данный конструктор. Потоки не станут вызывать конструктор, а просто вернут управление.</p><p>Благодаря этой особенности конструктор типа лучше всего подходит для инициализации объектов-одиночек.</p><p>В рамках одного потока возможно ситуация, когда конструкторы типа ссылаются друг на друга. Даже в этом случае CLR постарается корректно разрешить эту ситуацию, однако так как за вызов подобных конструкторов отвечает CLR, то не стоит вызывать их явно.</p><p>Наконец, если конструктор типа выбрасывает исключение, тип считается непригодным и при попытке обращения к любому полю этого типа возникает исключение <code>System.TypeInitializationException</code>.</p><p>Статический конструктор может инициализировать только статические поля. C# предлагает простой синтаксис через инициализатор.</p><p>C# не разрешает использовать синтаксис инициализации полей в значимых типах. Однако в значимых типах по-прежнему можно использовать инициализацию статических полей.</p><p>В таблице определений типов метод-конструктор типа называется .cctor (от <em>class constructor</em>).</p><p>При наличии в классе инициализации статического поля и статического конструктора код инициализации как бы вставляется в конструктор перед всеми его операциями.</p><p>Несмотря на то, что для типов не существует статических методов <code>Finalize()</code>, выгрузить тип из домена можно, зарегистрировав колбэк метод для события <code>DomainUnload</code> типа <code>System.AppDomain</code>. Хотя это и не имеет особого смысла, так как GC освобождает всю занятую память при закрытии домена.</p><h2 id="методы-перегруженных-операторов" tabindex="-1"><a class="header-anchor" href="#методы-перегруженных-операторов"><span>Методы перегруженных операторов</span></a></h2><p>В некоторых языках тип может определять, как операторы должны манипулировать его экземплярами. CLR ничего не известно о перегрузке операторов, потому что среда даже не знает, что такое оператор. Смысл операторов и код, который должен быть сгенерирован, определяется языком программирования.</p><p>Хоть CLR ничего не знает об операторах, она указывает, как языки программирования должны предоставлять доступ к перегруженным операторам, а далее каждый язык сам решает, будет ли он использовать эту возможность. С точки зрения CLR перегруженные операторы представляют из себя просто методы.</p><p>Спецификация CLR требует, чтобы перегруженные операторы были статическими и открытыми. Кроме этого сам C# требует, чтобы тип одного из параметров совпадал с типом, в котором определена перегрузка операторов. Это помогает компилятору в разумное время находить кандидатуры операторных методов для привязки.</p><p>В книге можно найти примеры доступных для перегрузки операторов (см. стр. 227-228).</p><p>Для примитивных типов операторы не перегружены, а реализованы через сгенерированные IL-команды. Это позволяет ускорить быстродействие при применении операторов к примитивным типам (которые применяются чаще всего).</p><h3 id="операторы-и-взаимодеиствие-языков-программирования" tabindex="-1"><a class="header-anchor" href="#операторы-и-взаимодеиствие-языков-программирования"><span>Операторы и взаимодействие языков программирования</span></a></h3><p>Если язык не поддерживает перегрузку оператора, то можно использовать специализированные методы. Логично было бы предположить, что, например, C# при вызове оператора будет вызывать соответствующий метода. Однако это не совсем так, потому что для перегруженных методов ищется соответствующая операция с флагом <code>specialname</code>, означающим, что оператор перегружен. Однако, так как такого флага у метода не будет, компилятор вернёт ошибку.</p><h3 id="особое-мнение-автора-о-правилах-microsoft-связанных-с-именами-методов-операторов" tabindex="-1"><a class="header-anchor" href="#особое-мнение-автора-о-правилах-microsoft-связанных-с-именами-методов-операторов"><span>Особое мнение автора о правилах Microsoft, связанных с именами методов операторов</span></a></h3><p>Автор считает, что Microsoft излишне усложнила функционал перегрузки операторов путём добавления флага <code>specialname</code>, так как все языки могли бы переопределять операторы, а разработчикам было бы проще использовать код, написанный на других языках. Microsoft же предлагает рядом с перегруженными операторами определять методы с дружественными именами, вызывающие методы перегруженных операторов. Однако это значительно усложняет написание и замедляет быстродействие. Примером такого типа служит <code>System.Decimal</code>.</p><h2 id="методы-операторов-преобразования" tabindex="-1"><a class="header-anchor" href="#методы-операторов-преобразования"><span>Методы операторов преобразования</span></a></h2><p>Для создания выполнения преобразования из примитивного типа в описанный разработчиком необходимо объявить конструктор с параметром примитивного (или другого исходного) типа. Для обратных преобразований необходимо определить метод <code>ToXxx()</code>, не принимающий параметров (где <code>Xxx</code> - необходимый целевой тип).</p><p>Наряду с этим некоторые компиляторы (например, C#) поддерживают перегрузку <em>операторов преобразования</em>. Методы операторов преобразования определяются специальным синтаксисом. Спецификация CLR требует, чтобы такие методы были открытыми и статическими. Кроме этого компилятор C# требует, чтобы тип параметра и/или выходного типа совпадали с типом, в котором перегружен оператор, чтобы компилятор мог найти его в разумное время.</p><p>При переопределении оператор преобразования стоит указать, необходим ли код для явного или неявного вызова.</p><p>Что происходит под капотом? Компилятор обнаруживает в исходном тексте операции приведения и при помощи внутренних механизмов генерирует IL-код, который вызывает методы приведения, определённые в исходном типе.</p><p>Интересный факт, что в результате переопределения операторов приведения, компилятор генерирует IL-код с методами, которые отличаются лишь выходными параметрами. Такое не разрешено в явном виде в C#, но через переопределение операций вполне себе работает.</p><p>Компилятор C# полностью поддерживает данный функционал. Поэтому при обнаружении кода, в котором вместо ожидаемого типа используется совершенно другой, компилятор ищет метод неявного преобразования. Найдя оператор явного преобразования, компилятор ищет метод оператора явного или неявного преобразования. Не найдя никакой код, компилятор выдаёт ошибку.</p><h2 id="методы-расширения" tabindex="-1"><a class="header-anchor" href="#методы-расширения"><span>Методы расширения</span></a></h2><p>Для расширения поведения над типом можно использовать статический класс, который бы принимал тип в качестве аргумента. Однако такой код неудобно читать и поддерживать. В качестве альтернативы используются методы расширения.</p><p>Методы расширения позволяют определить статический метод, который вызывается посредством синтаксиса экземплярного метода. Для этого в определении метода перед параметром типа, который мы хотим расширить, необходимо указать ключевое слово <code>this</code>.</p><p>При нахождении подобного кода, компилятор сначала проверит тип или все его базовые типы на наличие метода. Если метод не найдет, тогда компилятор будет искать любой статический класс с этим методом, у которого первый параметр будет соответствовать типу выражения, используемого при вызове метода.</p><p>Метод расширения улучшает читаемость кода, а также, за счёт отображения подсказок, показывает разработчикам доступность метода над типом, даже если в самом типе этот метод не определён.</p><h3 id="правила-и-рекомендации" tabindex="-1"><a class="header-anchor" href="#правила-и-рекомендации"><span>Правила и рекомендации</span></a></h3><p>Несколько правил и фактов о методах расширения:</p><ul><li>C# поддерживает только методы расширения (нет свойств расширения, событий расширения и т. д.).</li><li>Методы расширения должны быть объявлены в статическом необобщённом классе. Метод расширения должен иметь как минимум один параметр и только первый параметр должен быть отмечен ключевым словом <code>this</code>.</li><li>Метод расширения должен быть определён в статических классах первого уровня (в области файла, не типа).</li><li>C# просматривает все статические классы на предмет метода расширения. Для ускорения этого необходимо в начале файла использовать директиву <code>using</code> с указанием пространства имён, где определён данный метод.</li><li>Если в нескольких статических классах определены методы расширения с одинаковыми именами, тогда стоит вызывать метод расширения с явным указанием имени класса.</li><li>При написании методов расширения не стоит увлекаться: писать их следует только над теми типами, которым это необходимо (например, при указании первым параметром типа <code>System.Object</code> метод можно будет применить к любому объекту, что только загромоздит подсказки IDE).</li><li>Следует использовать методы расширения аккуратно, так как если расширенный тип в будущем обретёт одноимённый экземплярный метод, будет вызываться именно он, что может нарушить работу приложения.</li></ul><h3 id="расширение-разных-типов-методами-расширения" tabindex="-1"><a class="header-anchor" href="#расширение-разных-типов-методами-расширения"><span>Расширение разных типов методами расширения</span></a></h3><p>Так как метод расширения является вызовом статического метода, к нему не применяется проверка на <code>null</code>.</p><p>Методы расширения можно также применять для интерфейсных типов.</p><p>Хорошим примером методов расширения является статический класс <code>System.Linq.Enumerable</code>.</p><p>Методы расширения можно определять для типов-делегатов.</p><p>Кроме того, можно добавлять методы расширения к перечислимым типам.</p><p>Компилятор C# позволяет создавать делегатов, ссылающихся на метод расширения через объект.</p><h3 id="атрибут-расширения" tabindex="-1"><a class="header-anchor" href="#атрибут-расширения"><span>Атрибут расширения</span></a></h3><p>В языке C#, когда вы создаёте метод расширения, компилятор применяет к методу специальный атрибут. Этот же атрибут применяется к метаданным статического класса, содержащего хотя бы один метод расширения. Это позволяет находить методы расширения быстрее, так как поиск происходит только в сборках с соответствующим атрибутом.</p><h2 id="частичные-методы" tabindex="-1"><a class="header-anchor" href="#частичные-методы"><span>Частичные методы</span></a></h2><p>Если вам надо определить некоторое поведение в будущем, а не на моменте написания кода, тогда можно определить метод виртуальным с пустым телом, вызвать его и переопределить его поведение в наследнике. Однако такой подход имеет ряд недостатков:</p><ul><li>Тип не должен быть запечатанным или статическим.</li><li>Существует проблема эффективности: переопределяющий класс расходует ресурсы, а если переопределяющего класса нет, то базовый всё равно вызывает метод, который только возвращает управление.</li></ul><p>Для решения этой проблемы можно использовать механизм частичных методов. Объявляющий тип и метод помечаются ключевым словом <code>partial</code>.</p><p>В этом случае есть ряд особенностей:</p><ul><li>Класс может быть запечатанным, статическим или даже значимым типом.</li><li>Код является двумя частичными определениями, которые в конечном счёте будут сгенерированы с одно определение типа.</li></ul><p>У частичных методов имеется одно серьёзное преимущество. Если реализации частичного метода не будет, то компилятор не сгенерирует для него метаданные, команды вызова и код, вычисляющий аргументы для передачи частичному методу. В результате будет меньше метаданных, IL-кода и производительность повысится.</p><h3 id="правила-и-рекомендации-1" tabindex="-1"><a class="header-anchor" href="#правила-и-рекомендации-1"><span>Правила и рекомендации</span></a></h3><p>Несколько дополнительных рекомендаций касаемо частичных методов:</p><ul><li>Частичные методы могут объявляться только внутри частичного класса или структуры.</li><li>Частичные методы всегда должны иметь возвращаемый тип <code>void</code> и не иметь параметров, помеченных ключевым словом <code>out</code>. Это необходимо потому, во время выполнения программы метода не существует и вы не можете инициализировать переменную, возвращаемую этим методом. Однако в частичном методе можно использовать ключевое слово <code>ref</code>, универсальные параметры, экземплярные или статически, а также параметры, помеченные как <code>unsafe</code>.</li><li>Сигнатуры частичных методы должны быть одинаковыми, а атрибуты - объединяемыми.</li><li>Если не существует имплементации частичного метода, то нельзя создавать делегат, ссылающийся на него.</li><li>Частичные методы считаются закрытыми, но компилятор запрещает писать ключевое слово <code>private</code>.</li></ul>`,74);function v(b,C){const n=l("ExternalLinkIcon");return c(),p("div",null,[d,r,h,u,e("p",null,[a("В отличие от других методов конструкторы экземпляров не наследуются: у класса есть только те конструкторы, которые определены в классе. Невозможность наследования означает, что к конструкторам невозможно применить "),e("a",m,[a("модификаторы наследования"),i(n)]),a(". Если определить класс без явно заданных конструкторов, компилятор создаст конструктор по умолчанию, который просто вызывает конструктор без параметров базового класса.")]),k])}const _=s(t,[["render",v],["__file","ch08_Methods.html.vue"]]),D=JSON.parse('{"path":"/ru/chapters/ch08_Methods.html","title":"Методы","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Конструкторы экземпляров и классы (ссылочные типы)","slug":"конструкторы-экземпляров-и-классы-ссылочные-типы","link":"#конструкторы-экземпляров-и-классы-ссылочные-типы","children":[]},{"level":2,"title":"Конструкторы экземпляров и структуры (значимые типы)","slug":"конструкторы-экземпляров-и-структуры-значимые-типы","link":"#конструкторы-экземпляров-и-структуры-значимые-типы","children":[]},{"level":2,"title":"Конструкторы типов","slug":"конструкторы-типов","link":"#конструкторы-типов","children":[]},{"level":2,"title":"Методы перегруженных операторов","slug":"методы-перегруженных-операторов","link":"#методы-перегруженных-операторов","children":[{"level":3,"title":"Операторы и взаимодействие языков программирования","slug":"операторы-и-взаимодеиствие-языков-программирования","link":"#операторы-и-взаимодеиствие-языков-программирования","children":[]},{"level":3,"title":"Особое мнение автора о правилах Microsoft, связанных с именами методов операторов","slug":"особое-мнение-автора-о-правилах-microsoft-связанных-с-именами-методов-операторов","link":"#особое-мнение-автора-о-правилах-microsoft-связанных-с-именами-методов-операторов","children":[]}]},{"level":2,"title":"Методы операторов преобразования","slug":"методы-операторов-преобразования","link":"#методы-операторов-преобразования","children":[]},{"level":2,"title":"Методы расширения","slug":"методы-расширения","link":"#методы-расширения","children":[{"level":3,"title":"Правила и рекомендации","slug":"правила-и-рекомендации","link":"#правила-и-рекомендации","children":[]},{"level":3,"title":"Расширение разных типов методами расширения","slug":"расширение-разных-типов-методами-расширения","link":"#расширение-разных-типов-методами-расширения","children":[]},{"level":3,"title":"Атрибут расширения","slug":"атрибут-расширения","link":"#атрибут-расширения","children":[]}]},{"level":2,"title":"Частичные методы","slug":"частичные-методы","link":"#частичные-методы","children":[{"level":3,"title":"Правила и рекомендации","slug":"правила-и-рекомендации-1","link":"#правила-и-рекомендации-1","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch08_Methods.md"}');export{_ as comp,D as data};