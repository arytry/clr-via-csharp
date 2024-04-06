import{_ as p,r as s,o as n,c,a as e,d as a,b as t,e as l}from"./app-IxoMmWNN.js";const o={},r=l('<h1 id="автоматическое-управление-памятью-сборка-мусора" tabindex="-1"><a class="header-anchor" href="#автоматическое-управление-памятью-сборка-мусора"><span>Автоматическое управление памятью (сборка мусора)</span></a></h1><h2 id="управляемая-куча" tabindex="-1"><a class="header-anchor" href="#управляемая-куча"><span>Управляемая куча</span></a></h2><p>Любая программа использует ресурсы. В ООП каждый тип идентифицирует некий доступный программе ресурс. Для пользования этим ресурсом, под него должна быть выделена память. Для доступа к ресурсу нужно:</p><ol><li>Выделить память для типа, представляющего ресурс (обычно с помощью оператора <code>new</code> в C#).</li><li>Инициализировать выделенную память, установив начальное значение ресурса (за это отвечает конструктор).</li><li>Использовать ресурс, обращаясь к членам его типа.</li><li>В рамках процедуры очистки уничтожить состояние ресурса.</li><li>Освободить память (за это отвечает сборщик мусора).</li></ol><p>При написании типобезопасного кода (без использования ключевого слова <code>unsafe</code>) повреждения в памяти невозможны. Утечки памяти остаются теоретически возможными, но они не происходят в стандартной ситуации. Как правило, утечки памяти возникают из-за того, что приложение хранит объекты в коллекции, но не удаляет их, когда они становятся ненужными.</p><p>Ситуация дополнительно упрощается тем, что для большинства типов, регулярно используемых разработчиками, уничтожение состояние ресурса не является обязательным. Таким образом, управляемая куча предоставляет разработчику простую модель программирования: программа выделяет и инициализирует ресурс, после чего использует его так долго, сколько понадобится. Для большинства типов очистка ресурсов не нужна, память просто освобождается сборщиком мусора.</p><p>При использовании экземпляров типов, требующий специальной очистки, модель программирования остаётся такой же простой. Однако иногда очистка ресурса должна производиться как можно раньше, для этого есть метод <code>Dispose()</code>, чтобы очистка была выполнена по собственному расписанию. Как правило, типы, требующие специальной очистки, используют низкоуровневые системные ресурсы - файлы, сокеты или подключения к БД.</p><h3 id="выделение-ресурсов-из-управляемои-кучи" tabindex="-1"><a class="header-anchor" href="#выделение-ресурсов-из-управляемои-кучи"><span>Выделение ресурсов из управляемой кучи</span></a></h3><p>В CLR память для всех ресурсов управляется в <em>управляемой куче</em> (managed heap). При инициализации процесса CLR резервирует область адресного пространства под управляемую кучу, а также указатель на участок памяти, где будет выделено место под следующий объект. Изначально он указывает на базовый адрес зарезервированной области адресного пространства.</p><p>По мере заполнения области объектами, CLR выделяет новые области, вплоть до заполнения всего адресного пространства. Таким образом, память приложения ограничивается виртуальным адресным пространством процесса.</p><p>При выполнении оператора <code>new</code> среда CLR:</p><ol><li>Подсчитывает количество байтов, необходимых для размещения полей типа (и всех полей, унаследованных от базового типа).</li><li>Прибавляет к полученному значения количество байтов, необходимое для размещения специальных полей (размер равен разрядности системы).</li><li>Проверяет, хватает ли в зарезервированной области байтов на выделение памяти для объекта. Если памяти достаточно, то она выделяется, начиная с адреса, который содержится в указателе, а занимаемые им байты обнуляются. Затем вызывается конструктор типа (передающий казатель в качестве параметра <code>this</code>), и оператор <code>new</code> возвращает ссылку на объект. Перед возвратом этой ссылки, указатель переходит на новый адрес, куда будет помещён следующий объект.</li></ol><p>Для управляемой кучи выделение памяти сводится к простому увеличению указателя - эта операция выполняется почти мгновенно. Во многих приложениях объекты, выделяемые примерно в одно время, тесно связаны друг с другом. В среде, поддерживающей сборку мусора, новые объекты располагаются непрерывно, что повышает производительность.</p><p>Описание предполагает, что память бесконечна, а CLR может всегда выделить блок для нового объекта. Конечно, это не так, и управляемой куче необходим механизм уничтожения объектов, которые больше не нужны приложению - <em>сборка мусора</em> (Garbage Collection, GC).</p><h3 id="алгоритм-сборки-мусора" tabindex="-1"><a class="header-anchor" href="#алгоритм-сборки-мусора"><span>Алгоритм сборки мусора</span></a></h3><p>Если очень упрощённо описывать работу сборщика мусора, то можно сказать, что сборка выполняется, если при создании объекта с помощью оператора <code>new</code> не хватает памяти для создания объекта. В реальности же сборка мусора выполняется при заполнении поколения 0.</p><p>Для управления сроком жизни объектом в некоторых системах используется алгоритм подсчёта ссылок. В системах с подсчётом ссылок каждый объект в куче содержит внутреннее поле с информацией о том, сколько &quot;частей&quot; программы в данный момент используют объект. Когда каждая &quot;часть&quot; переходит к точке кода, в которой объект становится недоступным, она уменьшает поле счётчика объекта. Когда значение счётчика уменьшается до 0, объект удаляется из памяти. В таких системах очень часто возникают проблемы с циклическими ссылками. Когда два объекта ссылаются друг на друга, их ссылки не позволяют счётчикам обнулиться, в следствие чего ни один их объектов не будет удалён из памяти.</p><p>Из-за проблем с подобными алгоритмами, в CLR используется алгоритм <em>отслеживания ссылок</em>. Данный алгоритм работает только с переменными ссылочного типа, потому что только они могут ссылаться на объекты в куче. Ссылочные переменные могут использоваться во многих контекстах: статические и экземплярные поля классов, аргументы методов, локальные переменные. Все переменные ссылочного типа называются <em>корнями</em> (roots).</p><p>Когда CLR запускает сборку мусора, сначала приостанавливаются все потоки в процессе, чтобы во время анализа не изменялось состояние объектов. Затем CLR переходит к этапу сборки мусора, называемому <em>маркировкой</em> (marking). CLR перебирает все объекты в куче, задавая биту в поле индекса блока синхронизации значение 0. Это означает, что все объекты могут быть удалены. Затем CLR проверяет все активные корни и объекты, на которые они ссылаются. Если корень содержит <code>null</code>, то он игнорируется.</p><p>Если корень ссылается на объект, в поле индекса блока синхронизации устанавливается бит — это и есть признак маркировки объекта. После маркировки объекта CLR проверяет все корни в этом объекте и маркирует объекты, на которые они ссылаются. Встретив уже маркированный объект, сборщик мусора останавливается, чтобы избежать циклических ссылок.</p><p>На рисунке показана управляемая куча до сборки мусора. В приложении есть несколько корней, которые ссылаются на объекты A, C, D и F. Кроме того, при маркировке объекта D сборщик заметил, что есть поле, ссылающееся на H, так что H тоже маркируется. А затем продолжается рекурсивный просмотр всех достижимых объектов.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/79ef2c6f-ac16-4ef3-81a6-4a8ccb4cd0c2" alt="image"></p><p>После проверки всех корней куча содержит набор маркированных и немаркированных объектов. Маркированные объекты переживут сборку мусора, так как они достижимы из кода. Немаркированные объекты, соответственно, недостижимы, так как не существует ссылающихся на них корней.</p><p>После этого начинается следующая фаза - <em>сжатие</em> (compacting phase). В этой фазе CLR перемещает вниз все &quot;немусорные&quot; объекты, чтобы они занимали смежный блок памяти. Перемещение имеет ряд преимуществ:</p><ol><li>Оставшиеся объекты будут находиться поблизости, что приводит к сокращению размера рабочего набора, а следовательно, повышает производительность обращения к ни.</li><li>Свободное пространство тоже становится непрерывным, что позволяет освободить эту область адресного пространства.</li><li>Сжатие позволяет избежать проблем фрагментации адресного пространства.</li></ol><p>После перемещения CLR вычитает из каждого корня количество байт, на которое объект был сдвинут, чтобы ссылки остались корректными и выполнение программы продолжилось без ошибок.</p><p>После сжатия памяти кучи в указатель <code>NextObjPtr</code> заносится первый адрес за последним объектом, не являющимся мусором. После завершения фазы сжатия CLR возобновляет выполнение потоков, а они обращаются к объектам так, будто никакой сборки не было. Результат сборки представлен на рисунке.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/e826f306-eb0c-4cd6-82fd-d13275775ddf" alt="image"></p><p>Если CLR не удалось освободить память в результате сборки мусора, а в процессах не осталось адресного пространства для выделения нового сегмента, значит, свободная память процесса полностью исчерпана. В этом случае возникнет исключение <code>OutOfMemoryException</code>. Приложение может попробовать перехватить это исключение и восстановиться, однако большинство приложений не пытается этого сделать: исключение превращается в необработанное, процесс завершается, а вся используемая процессом память освобождается.</p><p>Из этого описания можно извлечь несколько моментов:</p><ol><li>Исключается утечка объектов, так как все недоступные корням объекты рано или поздно уничтожатся сборщиком мусора.</li><li>Благодаря сборке мусора невозможно получить доступ к освобождённому объекту с последующим повреждением памяти.</li></ol><p>Статическое поле типа хранит объект, на который ссылается, бессрочно или до выгрузки домена приложения с загруженными типами. Чаще всего утечка возникает из-за хранения в статическом поле ссылки на коллекцию, в которую добавляются элементы. Поэтому статических полей следует избегать по возможности.</p><h3 id="сборка-мусора-и-отладка" tabindex="-1"><a class="header-anchor" href="#сборка-мусора-и-отладка"><span>Сборка мусора и отладка</span></a></h3><p>Как только объект становится недостижимым, он превращается в кандидата на удаление - объекты далеко не всегда доживают до завершения работы метода. Иными словами, если переменной присвоено значение, но она ни разу не используется, то объект, на который ссылается переменная, становится кандидатом на удаление.</p><p>Решить подобную проблему можно в режиме отладки, так как в этом режиме JIT-компилятор искусственно продлевает время жизни объектов до выхода из метода. Однако, в продуктовой версии такое решение не сработает. Для продления времени жизни в продуктовой версии необходимо вызвать для переменной метод <code>Dispose()</code> там, до куда необходимо продлить жизнь данного объекта.</p><p>Однако, подобная проблема актуальна не для всех классов в приложении, а только для некоторых специфичных (например, класс <code>Timer</code>). Для всех остальных объектов время жизни определяется автоматические.</p><h2 id="поколения" tabindex="-1"><a class="header-anchor" href="#поколения"><span>Поколения</span></a></h2><p><em>Сборщик мусора с поддержкой поколений</em> (generational garbage collector), который также называют <em>эфемерным сборщиком мусора</em> (ephemeral garbage collector), работает на основе следующих принципов:</p><ul><li>Чем младше объект, тем короче его время жизни.</li><li>Чем старше объект, тем длиннее его время жизни.</li><li>Сборка мусора в части кучи выполняется быстрее, чем во всей куче.</li></ul><p>Сразу после инициализации в управляемой куче нет объектов. Создаваемые объекты образуют поколение 0. Сюда относятся все только что созданные объекты, которых не касался сборщик мусора. Рисунок ниже демонстрирует только что запущенное приложение с пятью объектами в памяти, часть из которых через некоторое время становится недоступна.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/66887aab-a59b-447f-bfb1-c9857d3f88d3" alt="image"></p><p>При инициализации CLR выбирает пороговый размер для поколения 0. Если в результате выделения памяти для нового объекта размер поколения 0 превышает пороговое значение, должна начаться сборка мусора. Сборщик мусора определяет, что является мусором и выполняет сжатие памяти. Объекты, пережившие сборку мусора, становятся поколением 1. Объекты из поколения 1 были проверены единожды.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/e3a384ec-df45-482e-bb08-228ec63e3d0b" alt="image"></p><p>После сборки мусора объектов в поколении 0 не остаётся. Туда помещаются новые объекты, часть из которых в процессе работы также становится недоступной, поэтому занимаемая ими память рано или поздно должна освободиться.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/e2d97707-f052-49d1-84fc-6f19b8cf0d59" alt="image"></p><p>Допустим, что при попытке размещения объекта L размер поколения 0 превысил пороговое значение, а значит, должна начаться сборка мусора. При этом сборщик мусора решает, какие поколения необходимо обработать. При инициализации CLR выбирает пороговый размер не только для поколения 0, но также для поколения 1.</p><p>Начиная сборку, сборщик определяет, сколько памяти занято поколением 1. Пока поколение 1 занимает меньше отведённой памяти, сборщик проверяет только объекты поколения 0. Скорее всего, в поколении 0 окажется много мусора, так как время жизни объектов меньше, и освободится много памяти. А поскольку поколение 1 игнорируется, сборка происходит быстрее.</p><p>Кроме того, производительность растёт за счёт выборочной проверки. Если корень или объект ссылается на объект в старшем поколении, сборщик игнорирует все внутренние ссылки старшего объекта, сокращая время построения графа доступных объектов. Возможна ситуация, когда старый объект ссылается на новый. Чтобы не пропустить обновлённые поля, сборщик использует внутренний механизм JIT-компилятора, устанавливающий флаг при изменении ссылочного поля объекта. Он позволяет сборщику выяснить, какие из старых объектов были изменены с последней сборки мусора. Остаётся проверить только стары объекты с изменёнными полями, чтобы выяснить, не ссылаются ли они на объекты поколения 0. Когда JIT-компилятор создаёт код, модифицирующий ссылочное поле внутри объекта, туда входит вызов барьерного метода записи (write barrier method). Метод проверяет, принадлежит ли объект поколению 1 или 2. Если принадлежит, то устанавливается специальный бит во внутренней таблице. Этот механизм снижает производительность, и производительность падает ещё больше, если объект принадлежит к поколению 1 или 2.</p><p>Тесты быстродействия показывают, что сборка мусора в поколении 0 происходит меньше чем за 1 мс.</p><p>Сборщик мусора с поддержкой поколений предполагает, что объекты, прожившие достаточно долго, продолжат жить и дальше. Так что велика вероятность, что объекты поколения 1 останутся живы и впредь. То есть при нахождении мусора в поколении 1 его там, скорее всего, окажется очень мало, и запускать сборку мусора будет нерезонно, так что объект просто останется жить в поколении 1 мусором.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/fbc631d4-fcff-4ff7-8f71-325e6e170c9f" alt="image"></p><p>Все объекты из поколения 0, пережившие сборку мусора, перешли в поколение 1. Приложение 0 снова пустеет, и в нём снова можно выделять память под объекты, часть из которых через время становится недоступными.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/720aae67-5919-4b08-87fb-aa5f5477de16" alt="image"></p><p>В поколении 0 снова произошла сборка мусора, при этом в поколении 1 занято всё ещё меньше порогового значения.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/d7ed3441-f544-4fe6-9f5f-9efddb069c87" alt="image"></p><p>Поколение 1 постепенно растёт. В какой-то момент оно вырастает до таких размеров, что занимаемое объектами место превышает пороговое значение. В этот момент приложение продолжит работать, так как сборка мусора только что произошла, и начинает размещение объектов в поколении 0 до его порогового значения.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5bc81c28-bd41-4170-ba1d-351ad809eb8b" alt="image"></p><p>При очередной попытке разместить объект в поколении 0, начинается сборка мусора. При этом и в поколении 1 места не хватает. Так как в поколении 0 прошло уже несколько очисток, есть вероятность, что несколько объектов в поколении 1 стали недоступными. Теперь инициирована сборка мусора ещё и в поколении 1. После сборки мусора в обоих поколениях создаётся поколение 2.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/efe85544-cbe1-408f-85bc-00ca5ed00438" alt="image"></p><p>Все выжившие объекты поколения 0 теперь находятся в поколении 1, а все выжившие в поколении 1 - в поколении 2. В поколении 2 находятся объекты, проверенные сборщиком мусора не менее 2 раз.</p><p>Управляемая куча поддерживает только три поколения: 0, 1 и 2. Для всех из них выставляется пороговое значение при инициализации в CLR. Сборщик мусора CLR является самонастраивающимся и подбирает пороговые значения в зависимости от функционала. Если в приложении мало выживающих объектов, тогда поколение 0 будет больше, иначе оно будет меньше.</p><h3 id="запуск-сборки-мусора" tabindex="-1"><a class="header-anchor" href="#запуск-сборки-мусора"><span>Запуск сборки мусора</span></a></h3><p>Запуск сборки мусора может происходить в следующих ситуациях:</p><ul><li><strong>Когда поколение 0 достигло порогового значения.</strong></li><li><strong>При вызове статического метода <code>System.GC.Collect()</code>.</strong> Хоть Microsoft не рекомендует вызывать сборку мусора явно, это иногда может быть оправдано.</li><li><strong>Windows сообщает о нехватке памяти.</strong></li><li><strong>Выгрузка домена приложения.</strong></li><li><strong>Завершение работы CLR.</strong> Во время завершения CLR считает, что в процессе нет корневых ссылок; объектам предоставляется возможность выполнить очистку, но CLR не пытается дефрагментировать или освобождать память, потому что это будет сделано автоматически после завершения всего процесса.</li></ul><h3 id="большие-объекты" tabindex="-1"><a class="header-anchor" href="#большие-объекты"><span>Большие объекты</span></a></h3><p>Есть ещё один способ повышения быстродействия. CLR делит объекты на малые и большие. Любые объекты больше 85000 байт считаются большими. CLR работает с большими объектами иначе:</p><ul><li>Память для них выделяется в отдельной части адресного пространства процесса.</li><li>К большим объектам не применяется сжатие, так как на их перемещение требуется слишком много времени.</li><li>Большие объекты считаются частью поколения 2, поэтому их следует создавать только для долгоживущих объектов, чтобы очистка поколения два производилась как можно реже.</li></ul><h3 id="режимы-сборки-мусора" tabindex="-1"><a class="header-anchor" href="#режимы-сборки-мусора"><span>Режимы сборки мусора</span></a></h3><p>При запуске CLR выбирается один из режимов сборки мусора, который не может быть изменён до завершения процесса. Существует два основных режима:</p><ul><li><strong>Режим рабочей станции.</strong> Настройка сборки для приложений на стороне клиента. Данный режим оптимизирован для минимизации времени остановки потоков. Предполагается, что на компьютере работают и другие приложения, так что режим старается не отнимать много ресурсов процессора.</li><li><strong>Режим сервера.</strong> Оптимизирует сборку мусора на стороне сервера. Все ресурсы процессора тратятся на сборку мусора. Управляемая куча разбирается на несколько разделов - по одному на процессор. При работе с несколькими процессорами возможно распараллеливание сборки.</li></ul><p>По умолчанию приложения запускаются в режиме рабочей станции с включённым режимом параллельной сборки мусора. Серверные приложения, обеспечивающие хостинг CLR, могут потребовать загрузки в режиме сервера. Но если серверное приложение запускается на однопроцессорной машине, CLR использует режим рабочей станции.</p><p>Помимо двух основных режимов существует два подрежима: параллельный (по умолчанию) и непараллельный. В параллельном режиме есть дополнительный фоновый поток, выполняющий разметку объектов во время работы приложения. Когда поток размещает в памяти объект, вызывающий превышение порога поколения 0, сборщик сначала приостанавливает все потоки, а затем определяет поколения, подлежащие очистке. Если необходимо очистить поколения 0 и 1, сборка мусора происходит как обычно. Если нужно очистить поколение 2, то размер поколения 0 увеличивается выше порогового и исполнение потоков продолжается.</p><p>Кроме того, в параллельной сборке память не дефрагментируется, что повышает рабочий набор приложения, но одновременно с этим повышается и быстродействие.</p><p>Подрежимы можно настраивать через конфигурационный файл сборки, а также через специальное свойство <code>GCSettings.GCLatencyMode</code>.</p><h3 id="программное-управление-сборщиком-мусора" tabindex="-1"><a class="header-anchor" href="#программное-управление-сборщиком-мусора"><span>Программное управление сборщиком мусора</span></a></h3><p>Обычно следует избегать вызова любых методов <code>Collect()</code>, так как лучше не вмешиваться в автоматизированную работу сборщика мусора.</p><h3 id="мониторинг-использования-памяти-приложением" tabindex="-1"><a class="header-anchor" href="#мониторинг-использования-памяти-приложением"><span>Мониторинг использования памяти приложением</span></a></h3><p>Существуют методы, которые можно вызывать для наблюдения за работой сборщика мусора в процессе. Это позволяет найти точки для оптимизации. Кроме того, проводить мониторинг работы сборщика мусора можно также с помощью ряда утилит, поставляемых вместе с .NET Framework.</p><h2 id="освобождение-ресурсов-при-помощи-механизма-финализации" tabindex="-1"><a class="header-anchor" href="#освобождение-ресурсов-при-помощи-механизма-финализации"><span>Освобождение ресурсов при помощи механизма финализации</span></a></h2><p>Некоторым типам помимо памяти требуются ещё и системные ресурсы (файлы, мьютексы и так далее).</p><p>Если тип, использующий системный ресурс, будет уничтожен в ходе сборки мусора, занимаемая им память вернётся в управляемую кучу, но системный ресурс будет потерян. Это нежелательно, поэтому CLR поддерживает механизм <em>финализации</em> (finalization), позволяющий объекту выполнить корректную очистку перед тем, как сборщик мусора освободит занимаемую им память. Любой тип, использующий системный ресурс, должен поддерживать финализацию. Когда CLR определит объект как недоступный, ему предоставляется возможность выполнить финализацию с освобождением всех задействованных ресурсов, после чего объект будет возвращён в управляемую кучу.</p><p>Когда сборщик мусора определяет объект как подлежащий очистке, вызывается переопределённый типом объекта метод <code>Finalize()</code>. Для определения метода финализации можно также использовать <code>~</code> перед именем метода.</p><p>Данные методы вызываются при завершении сборки мусора для объектов, подлежащих удалению. Это означает, что память таких объектов не может быть освобождена немедленно, так как метод <code>Finalize()</code> может выполнить код с обращением к полю типа. Так как финализируемый объект должен пережить сборку мусора, он переводится в другое поколение, в следствие чего этот объект живёт дольше. Ситуация не идеальна в отношении памяти, поэтому финализации стоит избегать.</p><p>Для вызова метода <code>Finalize()</code> CLR использует отдельный высокоприоритетный поток, что исключает ситуации взаимной блокировки. Если метод блокируется, специальный поток не сможет вызывать методы <code>Finalize()</code>. Данная ситуация нежелательна, потому что приложение не сможет освободить память, занимаемую финализируемыми объектами. Если метод финализации выдаёт исключение, процесс завершается, так как перехватить такое исключение невозможно.</p>',84),d={href:"https://learn.microsoft.com/ru-ru/dotnet/api/system.runtime.interopservices.safehandle?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},h=e("code",null,"System.Runtime.InteropServices.SafeHandle",-1),m=e("h3",{id:"типы-использующие-системные-ресурсы",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#типы-использующие-системные-ресурсы"},[e("span",null,"Типы, использующие системные ресурсы")])],-1),g={href:"https://learn.microsoft.com/ru-ru/dotnet/api/system.idisposable?view=net-8.0",target:"_blank",rel:"noopener noreferrer"},u=e("code",null,"IDisposable",-1),f=l("<p>Гарантированное освобождение ресурсов возможно и без вызова метода <code>Dispose()</code>. Однако явный вызов позволяет управлять тем, когда это произойдёт.</p><p>В общем случае стоит отказаться от явного вызова метода <code>Dispose()</code>. Сборщик мусора из CLR достаточно хорошо написан, и он может сделать эту работу сам.</p><p>В C# есть инструкция <code>using</code>, предлагающая упрощённый синтаксис генерации кода обращения к типам, реализующим паттерн dispose. Данная инструкция инициализирует объект и сохраняет в переменной ссылку на него. При компиляции кода автоматически создаются блоки <code>try</code> и <code>finally</code>. Внутри блока <code>finally</code> содержится код, приводящий объект к типу <code>IDisposable</code> и вызывающий <code>Dispose()</code>.</p>",3),b={href:"https://habr.com/ru/articles/89720/",target:"_blank",rel:"noopener noreferrer"},C=l('<h3 id="интересные-аспекты-зависимостеи" tabindex="-1"><a class="header-anchor" href="#интересные-аспекты-зависимостеи"><span>Интересные аспекты зависимостей</span></a></h3><p>Описывается порядок финализации на примере <code>StreamWriter</code>, который зависит от <code>FileStream</code>.</p><h3 id="другие-возможности-сборщика-мусора-для-работы-с-системными-ресурсами" tabindex="-1"><a class="header-anchor" href="#другие-возможности-сборщика-мусора-для-работы-с-системными-ресурсами"><span>Другие возможности сборщика мусора для работы с системными ресурсами</span></a></h3><p>В классе, являющимся обёрткой системного ресурса с количественным ограничением, следует использовать экземпляр этого класса для передачи сборщику мусора информации о том, сколько реально задействовано экземпляров этого ресурса.</p><h3 id="внутренняя-реализация-финализации" tabindex="-1"><a class="header-anchor" href="#внутренняя-реализация-финализации"><span>Внутренняя реализация финализации</span></a></h3><p>Когда приложение создаёт новый объект, оператор <code>new</code> выделяет для него память из кучи. Если в типе объекта определён метод финализации, непосредственно перед вызовом конструктора экземпляра типа указатель на объект помещается в <em>список финализации</em> (finalization list) - внутреннюю структуру данных, находящуюся под управлением сборщика мусора.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5725f6f5-5ab9-48d4-a23c-de93516701e8" alt="image"></p><p>Сначала сборщик мусора определяет, какие объекты являются мусором. Сборщик сканирует список финализации в поисках указателей на эти объекты. Обнаружив указатель, он извлекает его из списка и добавляет в конец <em>очереди на финализацию</em> (freachable queue) - ещё одну внутреннюю структуру. Каждый указатель здесь идентифицирует объект, готовый к вызову своего метода финализации.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/723ad66b-6bad-41c1-adb8-d255e351cc79" alt="image"></p><p>В CLR есть особый высокоприоритетный поток, выделенный для методов финализации. Он нужен для предотвращения возможных проблем синхронизации. При пустой очереди на финализацию данный поток бездействует. Обнаружив в очереди элементы, он постепенно очищает её, вызывая для каждого объекта его методы финализации. Смысл очереди на финализацию в том, что она создаёт дополнительные квази-корни, которые запрещают удалять объект до вызова его метода финализации. После этого происходит финализация, и объекты живут до следующей сборки мусора, при этом переходя в следующее поколение.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/65ca897c-4d31-4627-ab2b-5115f22efe61" alt="image"></p><h2 id="мониторинг-и-контроль-времени-жизни-объектов" tabindex="-1"><a class="header-anchor" href="#мониторинг-и-контроль-времени-жизни-объектов"><span>Мониторинг и контроль времени жизни объектов</span></a></h2>',12),k=e("em",null,"таблицу GC-дескрипторов",-1),L={href:"https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.gchandletype?view=net-8.0",target:"_blank",rel:"noopener noreferrer"};function R(_,v){const i=s("ExternalLinkIcon");return n(),c("div",null,[r,e("p",null,[a("При создании управляемого типа, использующего системный ресурс, стоит наследоваться от специального базового класса "),e("a",d,[h,t(i)]),a(". Такие типы гарантируют освобождение системного ресурса в ходе сборки мусора.")]),m,e("p",null,[a("Классы, позволяющие пользователю управлять жизненным циклом инкапсулированных системных ресурсов, реализуют интерфейс "),e("a",g,[u,t(i)]),a(". Если класс определяет поле типа, реализующего паттерн dispose, то сам класс тоже должен реализовывать этот паттерн.")]),f,e("p",null,[a("(Прим. Интересная "),e("a",b,[a("статья"),t(i)]),a(" на тему реализации dispose паттерна).")]),C,e("p",null,[a("Для каждого домена приложения CLR поддерживает "),k,a(" (GC handle table), с помощью которой приложение отслеживает время жизни объекта или позволяет управлять им вручную. Каждый элемент таблицы состоит из указателя на объект в куче и "),e("a",L,[a("флага"),t(i)]),a(", задающего способ мониторинга или контроля объекта.")])])}const S=p(o,[["render",R],["__file","ch21_ManagedHeapGarbage.html.vue"]]),z=JSON.parse('{"path":"/ru/chapters/ch21_ManagedHeapGarbage.html","title":"Автоматическое управление памятью (сборка мусора)","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Управляемая куча","slug":"управляемая-куча","link":"#управляемая-куча","children":[{"level":3,"title":"Выделение ресурсов из управляемой кучи","slug":"выделение-ресурсов-из-управляемои-кучи","link":"#выделение-ресурсов-из-управляемои-кучи","children":[]},{"level":3,"title":"Алгоритм сборки мусора","slug":"алгоритм-сборки-мусора","link":"#алгоритм-сборки-мусора","children":[]},{"level":3,"title":"Сборка мусора и отладка","slug":"сборка-мусора-и-отладка","link":"#сборка-мусора-и-отладка","children":[]}]},{"level":2,"title":"Поколения","slug":"поколения","link":"#поколения","children":[{"level":3,"title":"Запуск сборки мусора","slug":"запуск-сборки-мусора","link":"#запуск-сборки-мусора","children":[]},{"level":3,"title":"Большие объекты","slug":"большие-объекты","link":"#большие-объекты","children":[]},{"level":3,"title":"Режимы сборки мусора","slug":"режимы-сборки-мусора","link":"#режимы-сборки-мусора","children":[]},{"level":3,"title":"Программное управление сборщиком мусора","slug":"программное-управление-сборщиком-мусора","link":"#программное-управление-сборщиком-мусора","children":[]},{"level":3,"title":"Мониторинг использования памяти приложением","slug":"мониторинг-использования-памяти-приложением","link":"#мониторинг-использования-памяти-приложением","children":[]}]},{"level":2,"title":"Освобождение ресурсов при помощи механизма финализации","slug":"освобождение-ресурсов-при-помощи-механизма-финализации","link":"#освобождение-ресурсов-при-помощи-механизма-финализации","children":[{"level":3,"title":"Типы, использующие системные ресурсы","slug":"типы-использующие-системные-ресурсы","link":"#типы-использующие-системные-ресурсы","children":[]},{"level":3,"title":"Интересные аспекты зависимостей","slug":"интересные-аспекты-зависимостеи","link":"#интересные-аспекты-зависимостеи","children":[]},{"level":3,"title":"Другие возможности сборщика мусора для работы с системными ресурсами","slug":"другие-возможности-сборщика-мусора-для-работы-с-системными-ресурсами","link":"#другие-возможности-сборщика-мусора-для-работы-с-системными-ресурсами","children":[]},{"level":3,"title":"Внутренняя реализация финализации","slug":"внутренняя-реализация-финализации","link":"#внутренняя-реализация-финализации","children":[]}]},{"level":2,"title":"Мониторинг и контроль времени жизни объектов","slug":"мониторинг-и-контроль-времени-жизни-объектов","link":"#мониторинг-и-контроль-времени-жизни-объектов","children":[]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch21_ManagedHeapGarbage.md"}');export{S as comp,z as data};