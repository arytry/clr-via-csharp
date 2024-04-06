import{_ as e,o as l,c as a,e as s}from"./app-IxoMmWNN.js";const i={},n=s('<h1 id="совместно-используемые-сборки-и-сборки-со-строгим-именем" tabindex="-1"><a class="header-anchor" href="#совместно-используемые-сборки-и-сборки-со-строгим-именем"><span>Совместно используемые сборки и сборки со строгим именем</span></a></h1><h2 id="два-вида-сборок-два-вида-развертывания" tabindex="-1"><a class="header-anchor" href="#два-вида-сборок-два-вида-развертывания"><span>Два вида сборок - два вида развёртывания</span></a></h2><p>CLR поддерживает два вида сборок: с <em>нестрогими именами</em> (прим. термин придуман Рихтером, в официальной документации его нет) и со <em>строгими именами</em>. Это одни и те же сборки, однако, сборки со <em>строгим именем</em> подписаны при помощи пары ключей, уникально идентифицирующих издателя сборки. Уникальная идентификация позволяет CLR при попытке привязки приложения к сборке применять политики безопасности.</p><p>Развёртывание может быть закрытым или глобальным. Для сборки с нестрогим именем допустимо лишь закрытое развёртывание.</p><h2 id="назначение-сборки-строгого-имени" tabindex="-1"><a class="header-anchor" href="#назначение-сборки-строгого-имени"><span>Назначение сборки строгого имени</span></a></h2><p>Если сборка используется несколькими приложениями, то её стоит поместить в общедоступный каталог. Однако тогда возникает &quot;кошмар DLL&quot; - появляется несколько сборок с одинаковым именем, последняя перезатирает первую и работа приложения, ссылавшегося на первую, нарушается.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/201d32eb-3f18-4d6a-8ca2-2e71e51c8245" alt="image"></p><p>Для различия сборок используют четыре атрибута: имя файла без расширения, номер версии, идентификатор регионального стандарта и открытый ключ (его хеш-код, так как ключи очень больше, хеш-код называют <em>маркером открытого ключа</em>/<em>public key token</em>).</p><p>Так как сборки с <em>нестрогим именем</em> всегда разворачиваются закрыто, то для их идентификации достаточно имени.</p><p>В AssemblyDef лежит полный открытый ключ, что гарантирует целостность файла и предотвращает несанкционированные изменения.</p><h2 id="глобальныи-кэш-сборок" tabindex="-1"><a class="header-anchor" href="#глобальныи-кэш-сборок"><span>Глобальный кэш сборок</span></a></h2><p>Место, где хранятся совместно используемые сборки, называется <em>глобальным кэшем сборок</em> (global assembly cache, GAC). GAC имеет иерархическое строение и содержит множество вложенных каталогов, имена которых генерируются по определённому алгоритму. Именно поэтому нельзя копировать сборки в GAC вручную, для этого надо использовать специальные инструменты (GACUtil.exe), которые умеют правильно создавать подкаталоги.</p><p>GACUtil.exe не поставляется свободно, поэтому для установки глобальных сборок можно использовать Windows Installer (MSI), так как это единственный инструмент, который позволяет установить сборки в GAC и гарантировано присутствует на машине конечного пользователя.</p><p>Регистрация сборки в GAC — это ещё один способ идентифицировать сборки с одинаковым именем, однако его стоит избегать, потому что такая установка делает невозможным простую установку, копирование, восстановление, перенос и удаление приложения.</p><h2 id="построение-сборки-ссылающеися-на-сборку-со-строгим-именем" tabindex="-1"><a class="header-anchor" href="#построение-сборки-ссылающеися-на-сборку-со-строгим-именем"><span>Построение сборки, ссылающейся на сборку со строгим именем</span></a></h2><p>При компоновке сборки, ссылающейся на System.Drawing.dll, компилятор найдёт её в том же каталоге, что и csc.exe. Однако загрузит он её из другого каталога.</p><p>Во время установки .NET Framework все файлы сборок помещаются в один каталог с CLR и в GAC (копии, предназначенные для загрузки во время выполнения). Сборки в CLR содержат только метаданные, а в GAC - метаданные и IL-код. При этом код оптимизируется под конкретные архитектуры процессора и хранится в разных подкаталогах GAC.</p><h2 id="устоичивость-сборок-со-строгими-именами-к-несанкционированнои-модификации" tabindex="-1"><a class="header-anchor" href="#устоичивость-сборок-со-строгими-именами-к-несанкционированнои-модификации"><span>Устойчивость сборок со строгими именами к несанкционированной модификации</span></a></h2><p>Подписание файла закрытым ключом и внедрение подписи и открытого ключа в сборку позволяет CLR убедиться в том, что сборка не была модифицирована. При установке в GAC система хеширует содержимое файла с манифестом и сравнивает полученное значение с цифровой подписью RSA, встроенной в PE-файл. Кроме этого, хешируется содержимое других файлов сборки и сравнивание полученные значения с соответствующими из таблицы манифест FileDef.</p><p>Для поиска в GAC CLR использует свойства сборки. Если нужная сборка найдена, то возвращается путь к каталогу, где она находится и загружается файл с манифестом. Такой механизм гарантирует вызывающей стороне, что будет загружена нужная сборка. Эта гарантия возможна благодаря соответствию маркера открытого ключа в AssemblyRef и открытому ключу из AssemblyDef. Если сборки нет в GAC, то она ищется в базовом каталоге, а потом проверяются все закрытые пути. Потом, если приложение установление при помощи MSI, происходит поиск через него.</p><p>При загрузке из GAC CLR не проверяет их на несанкционированную модификацию, так как GAC и строги имена гарантируют это. В противном случае CLR необходимо дополнительное время, чтобы произвести проверку во время загрузки файла. Если обнаруживается несоответствие, то система выбрасывает System.IO.FileLoadException.</p><h2 id="отложенное-подписание" tabindex="-1"><a class="header-anchor" href="#отложенное-подписание"><span>Отложенное подписание</span></a></h2><p>Подготовившись к компоновке сборки со строгим именем, её надо подписать закрытым ключом. Однако при разработке и сборке очень неудобно постоянно доставать этот ключ, так как он хранится достаточно надёжно в компании. Поэтому .NET Framework поддерживает <em>отложенное/частичное подписание</em> (delayed/partial signing). Отложенное подписание позволяет построить сборку только с открытым ключом, оставляя её незащищённой к изменениям, что и не важно на этапе разработке. Готовая к компоновке сборка подписывается закрытым ключом.</p><p>Обнаружив, что подписание сборки откладывается, AL.exe генерирует в AssemblyDef запись с открытым ключом. Это позволяет разместить сборку в GAC. При этом в PE-файле остаётся место для подписи (которое высчитывается исходя из размеров открытого ключа). Хеширование при этом также не проводится.</p><p>Загрузить такую сборку в GAC можно, если запретить системе проверять целостность файлов сборки.</p><p>Алгоритм отложенного подписания:</p><ol><li>Создать сборку и подписать её открытым ключом.</li><li>Разрешить добавлять в GAC нехешированные сборки.</li><li>После завершения разработки подписать сборку закрытым ключом.</li><li>Подчистить реестр, снова запретив добавление в GAC нехешированных сборок.</li></ol><p>Подписание сборки бывает полезно, например, в ситуации, когда необходимо обфусцировать код. После подписания это будет сделать невозможно, так как CLR провалит проверку целостности файлов.</p><h2 id="закрытое-развертывание-сборок-со-строгими-именами" tabindex="-1"><a class="header-anchor" href="#закрытое-развертывание-сборок-со-строгими-именами"><span>Закрытое развёртывание сборок со строгими именами</span></a></h2><p>Несмотря на то, что для сборок со строгими именами доступно глобальное развёртывание, это не означает, что так стоит делать. Преимущества закрытого развёртывания всё ещё остаются преимуществами, а глобальное развёртывание необходимо лишь в ситуациях, когда сборка должна использоваться глобально.</p><h2 id="как-исполняющая-среда-разрешает-ссылки-на-типы" tabindex="-1"><a class="header-anchor" href="#как-исполняющая-среда-разрешает-ссылки-на-типы"><span>Как исполняющая среда разрешает ссылки на типы</span></a></h2><p>В результате компиляции и компоновки получается сборка. При запуске приложения происходит загрузка и инициализация CLR. CLR сканирует CLR-заголовок сборки в поисках атрибута MethodDefToken, идентифицирующий метод Main, точку входа. CLR находит в таблице метаданных MethodDef смещение, по которому находится IL-код. Этот код компилируется в машинный с помощью JIT-компилятора. Во время JIT-компиляции CLR обнаруживает все типы и члены и сборки, в которых они определены. Маркер строки кода в IL идентифицирует запись в таблице MemberRef. Просматривая эту таблицу, CLR видит, что одно из полей ссылается на элемент таблицы TypeRef, которая направляет CLR к записи в таблице AssemblyRef. После этого CLR нужно только найти сборку в одном из трёх мест:</p><ul><li><strong>В том же файле.</strong> Обращение к типу, расположенному в том же файле, определяется при компиляции (<em>раннее связывание</em>). Тип загружается из файла и исполнение продолжается.</li><li><strong>В другом файле той же сборки.</strong> CLR проверяет, что файл, на который ссылаются, описан в таблице FileRef в манифесте текущей сборки. При этом файл ищет в каталоге, откуда был загружен файл, содержащий манифест. Файл загружается, проверяется на целостность, затем CLR находит в нём нужный тип, и исполнение продолжается.</li><li><strong>В файле другой сборки.</strong> Если файл находится в отдельной сборке, то сначала загружается файл с манифестом. Если нет там, то загружается соответствующий PE-файл.</li></ul><p>Если во время разрешения ссылки файл не найден, то выбрасывается соответствующее исключение, которое можно обработать программно при помощи рефлексии.</p><p><img src="https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/f4eaa102-8224-4aeb-94a4-6f703f433165" alt="image"></p><p>Такой процесс верен для любой сборки, кроме стандартных. Сборки .NET Framework (в том числе MSCorLib.dll) тесно связаны с CLR. Любая такая сборка привязывается к версии CLR. Этот процесс называется унификацией, и Microsoft это поддерживает, так как для гарантии работоспособности все сборки тестируются на конкретной версии CLR.</p><h2 id="дополнительные-административные-средства-конфигурационные-фаилы" tabindex="-1"><a class="header-anchor" href="#дополнительные-административные-средства-конфигурационные-фаилы"><span>Дополнительные административные средства (конфигурационные файлы)</span></a></h2><p>Для поиска перемещённых сборок используется конфигурационный файл. Основные элементы:</p><ul><li><strong>Элемент probing.</strong> Определяет директории для поиска файлов сборок с нестрогим именем. Сборки со строгим именем ищутся в GAC или по url.</li><li><strong>Первый набор элементов dependentAssembly, assemblyIdentity и bindingRedirect.</strong> Определяет перенаправления при поиске определённых сборок.</li><li><strong>Элемент codebase.</strong> URL, по которому происходит попытка поиска dll.</li><li><strong>Второй набор элементов dependentAssembly, assemblyIdentity и bindingRedirect.</strong> Определяет перенаправления при поиске определённых сборок.</li><li><strong>Элемент publisherPolicy.</strong> Описание поведения с файлом политики издателя.</li></ul><h3 id="управление-версиями-при-помощи-политики-издателя" tabindex="-1"><a class="header-anchor" href="#управление-версиями-при-помощи-политики-издателя"><span>Управление версиями при помощи политики издателя</span></a></h3><p>Политика издателя - удобный инструмент для переопределения сборок с целью исправить ошибки без редакции исходного приложения.</p><p>Сборка, скомпонованная с политикой издателя, должна помещаться в GAC.</p><p>Издатель должен создавать сборку со своей политикой лишь для развёртывания исправленной сборки, установка нового приложения не должна требовать политики издателя.</p><p>Если администратора не устроит новая сборка (например, в ней стало ещё больше ошибок), он может отменить исправления.</p><p>Сборка с политикой издателя должна использоваться как инструмент исправления ошибок, потому что иначе придётся тестировать новую сборку на обратную совместимость. Если же к сборке добавляются новые функции, то стоит подумать о том, чтобы отказаться от связи с прежними сборками.</p>',45),t=[n];function p(r,h){return l(),a("div",null,t)}const c=e(i,[["render",p],["__file","ch03_SharedAssemblies.html.vue"]]),o=JSON.parse('{"path":"/ru/chapters/ch03_SharedAssemblies.html","title":"Совместно используемые сборки и сборки со строгим именем","lang":"ru-RU","frontmatter":{},"headers":[{"level":2,"title":"Два вида сборок - два вида развёртывания","slug":"два-вида-сборок-два-вида-развертывания","link":"#два-вида-сборок-два-вида-развертывания","children":[]},{"level":2,"title":"Назначение сборки строгого имени","slug":"назначение-сборки-строгого-имени","link":"#назначение-сборки-строгого-имени","children":[]},{"level":2,"title":"Глобальный кэш сборок","slug":"глобальныи-кэш-сборок","link":"#глобальныи-кэш-сборок","children":[]},{"level":2,"title":"Построение сборки, ссылающейся на сборку со строгим именем","slug":"построение-сборки-ссылающеися-на-сборку-со-строгим-именем","link":"#построение-сборки-ссылающеися-на-сборку-со-строгим-именем","children":[]},{"level":2,"title":"Устойчивость сборок со строгими именами к несанкционированной модификации","slug":"устоичивость-сборок-со-строгими-именами-к-несанкционированнои-модификации","link":"#устоичивость-сборок-со-строгими-именами-к-несанкционированнои-модификации","children":[]},{"level":2,"title":"Отложенное подписание","slug":"отложенное-подписание","link":"#отложенное-подписание","children":[]},{"level":2,"title":"Закрытое развёртывание сборок со строгими именами","slug":"закрытое-развертывание-сборок-со-строгими-именами","link":"#закрытое-развертывание-сборок-со-строгими-именами","children":[]},{"level":2,"title":"Как исполняющая среда разрешает ссылки на типы","slug":"как-исполняющая-среда-разрешает-ссылки-на-типы","link":"#как-исполняющая-среда-разрешает-ссылки-на-типы","children":[]},{"level":2,"title":"Дополнительные административные средства (конфигурационные файлы)","slug":"дополнительные-административные-средства-конфигурационные-фаилы","link":"#дополнительные-административные-средства-конфигурационные-фаилы","children":[{"level":3,"title":"Управление версиями при помощи политики издателя","slug":"управление-версиями-при-помощи-политики-издателя","link":"#управление-версиями-при-помощи-политики-издателя","children":[]}]}],"git":{"updatedTime":1712403629000},"filePathRelative":"ru/chapters/ch03_SharedAssemblies.md"}');export{c as comp,o as data};
