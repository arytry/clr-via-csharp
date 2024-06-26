# Интерфейсы

Некоторые языки поддерживают концепцию _множественного наследования_ (multiple inheritance), но ни CLR, а следовательно и не C#. Но CLR позволяет реализовать ограниченное множественное наследование через интерфейсы.

## Наследование в классах и интерфейсах

В .NET все классы наследуются от `object`, а это значит, что код, оперирующий данным классом, может выполнять операции с экземпляром любого класса.

Любой производный от `object` класс наследует:
- **Сигнатуры методов.** Это позволяет считать, что код оперирует элементом типа `object`, когда на самом деле работает с экземпляром другого класса.
- **Реализацию этих методов.** Наследуемые методы можно не реализовывать вручную.

В CLR у класса может быть только один базовый класс (который прямо или опосредованно наследуется от `object`). Базовый класс предоставляет сигнатуры и реализации методов. При этом новый класс может стать базовым для ещё одного, и тот также унаследует все сигнатуры и реализации.

CLR также позволяет определить _интерфейс_, который, в сущности, представляет собой средство назначения имени набору сигнатур методов. Интерфейс не содержит реализаций. Класс наследует интерфейс через указание имени, причём класс должен явно содержать реализации методов.

Аналогично подстановке экземпляров производного типа в контекст, где требуется базовый тип, можно выполнять подстановку классу в контекст, где вызывается реализуемый классом интерфейс.

## Определение интерфейсов

Интерфейс представляет собой именованный набор сигнатур методов. При этом в интерфейсах можно так же объявлять события и свойства (которые и так соответствуют методам). 

CLR допускает наличие в интерфейсах статических полей, но они не входят в CLS. В C# это можно делать, начиная с 11 версии языка. 

В C# интерфейс определяется с помощью ключевого слова `interface`.

С точки зрения CLR, определение интерфейса - почти то же, что и определение типа. То есть CLR определяет внутреннюю структуру данных для объекта интерфейсного типа, а для обращения к членам интерфейса можно использовать рефлексию. Интерфейсы могут определяться на уровне файла или быть вложенными в другие типы. Кроме этого, при определении интерфейсов можно указать область видимости и доступа.

Имена интерфейсов начинаются с буквы `I`, что облегчает их поиск. Интерфейсы могут быть обобщёнными.

Определении интерфейса может наследовать другие интерфейсы, однако наследование здесь работает иначе, чем в классах. Это можно рассматривать как включение в интерфейс контрактов других интерфейсов, то есть:
- Класс, реализующий интерфейс, должен реализовать и методы из интерфейсов, которые наследует интерфейс класса.
- Любой код, ожидающий реализацию интерфейса, может быть уверен, что тип объекта реализует и методы наследуемых интерфейсов.

## Наследование интерфейсов

Компилятор C# требует, чтобы метод, реализующий интерфейс, был открытым. CLR требует, чтобы интерфейсные методы были виртуальными. Если метод явно не определён в коде как виртуальный, компилятор сделает его таковым и, вдобавок, запечатанным. Это не позволяет производному классу переопределять интерфейсные методы. Если же явно пометить метод как виртуальный, его можно будет переопределить в наследниках.

Производный класс не в состоянии переопределять интерфейсные методы, объявленные запечатанными, но может повторно унаследовать интерфейс и предоставить собственную реализацию методов. При вызове интерфейсного метода вызывается реализация, связанная с типом самого объекта.

## Подробнее о вызовах интерфейсных методов

Тип `string` наследуется от `object` и реализует несколько интерфейсов. Это значит, что ему не надо переопределять методы `object`, но надо определить методы интерфейсов.

CLR допускает определение полей, параметров или локальных переменных интерфейсного типа. Используя такую переменную, можно вызывать методы, определённые интерфейсом. А также можно вызывать методы `object`, поскольку все классы наследуют его методы.

В коде можно объявить переменную типа `string` и присвоить её переменной тип одного из реализуемых типом `string` интерфейса. Тогда все переменные будут ссылаться на один объект в управляемой куче. Но тип переменной определяет действие, которое можно выполнить с объектом.

Как и ссылочный тип, значимый тип может реализовывать несколько интерфейсов. Но при приведении экземпляра значимого типа к интерфейсному происходит упаковка, потому что переменная интерфейсного типа является ссылкой на объект в куче, чтобы CLR могла проверить указатель и точно выяснить тип объекта. Затем при вызове метода интерфейса у упакованного объекта CLR использует указатель, чтобы найти таблицу методов объекта-типа и вызвать нужный метод.

## Явные и неявные реализации интерфейсных методов (что происходит за кулисами)

Когда тип загружается в CLR, для него создаётся и инициализируется таблица методов. Она содержит по одной записи для каждого нового, представленного только этим типом метода, а также записи для всех виртуальных методов, унаследованных типом. Унаследованные методы включают методы, определённые в базовых типах иерархии, а также все методы, определённые интерфейсными типами. 

Пусть имеется простое определение типа:

```csharp
internal sealed class SimpleType : IDisposable
{
  public void Dispose() { Console.WriteLine("Dispose"); }
}
```

Таблица методов типа содержит следующие записи:
- Все экземплярные методы, определённые в object и неявно унаследованные от него.
- Все интерфейсные методы, определённые в явно унаследованным интерфейсе.
- Новый метод, появившийся в типе.

компилятор C# считает, что новый метод является реализацией метода интерфейса. Компилятор вправе сделать такое предположение, потому что метод открытый, а сигнатуры методов совпадают. Однако, если бы новый метод был помечен как виртуальный, компилятор бы всё равно сопоставил их. Сопоставляя методы, компилятор генерирует метаданные, указывающие на то, что обе записи в таблице методов должны ссылаться на одну реализацию. То есть вне зависимости от того, вызываем мы метод типа или интерфейсный, мы получим одну и ту же реализацию. Если же переписать тип:

```csharp
internal sealed class SimpleType : IDisposable
{
  public void Dispose() { Console.WriteLine("public Dispose"); }
  void IDisposable.Dispose() { Console.WriteLine("IDisposable Dispose"); }
}
```

Если перед именем метода указано имя интерфейса, то создаётся _явная реализация интерфейсного метода_ (Explicit Interface Method Implementation, EIMI). При явной реализации интерфейсного метода в C# нельзя указывать уровень доступа. Однако компилятор назначает для этого метода закрытый уровень доступа, что запрещает любому кода использовать экземпляр класса простым вызовом интерфейсного метода. Единственный способ вызвать интерфейсный метод - обратиться через переменную интерфейсного типа. 

Стоит заметить, что явно реализованный метод не может быть виртуальным, его нельзя переопределить. Происходит это потому, что данный метод в действительности не является частью объектной модели типа, это всего лишь средство связывания интерфейса с типом.

## Обобщённые интерфейсы

Обобщённые интерфейсы обеспечивают безопасность типов на стадии компиляции, так как в необобщённых интерфейсах определены методы, принимающие в качестве параметра `object`, что может привести к ошибке во время выполнения, например, в попытках сравнить значения разных типов.

Второе преимущество обобщённых интерфейсов состоит в том, что при работе со значимыми типами требуется меньше операций упаковки.

В FCL реализованы обобщ1нные и необобщённые версии интерфейсов. Необобщённые версии оставлены для обратной совместимости, поэтому лучше использовать именно обобщённые версии. 

Третье преимущество обобщённых интерфейсов состоит в том, что класс может реализовывать один интерфейс многократно, просто используя параметры различного типа. Параметры обобщённого типа могут быть помечены как контравариантные и ковариантные.

## Обобщения и ограничения интерфейса

Первое преимущество ограничениях параметров-типов интерфейсами состоит в том, что параметр-тип можно ограничивать несколькими интерфейсами, и тогда тип должен реализовывать все ограничения. Такое поведение позволяет отсечь множество ошибок ещё на этапе компиляции.

Второе преимущество - избавление от упаковки при передаче экземпляров значимого типа. Если же объявить интерфейс не ограничением обобщённого метода, а параметром метода, то будет происходить упаковка. 

Для ограничений интерфейсов компилятор генерирует определённые IL-инструкции, которые вызывают интерфейсные методы для значимого типа напрямую. В иных случаях всегда будет происходить упаковка.

## Реализация нескольких интерфейсов с одинаковыми сигнатурами и именами методов

При реализации нескольких интерфейсов с одинаковыми сигнатурами и именами методов необходимо явно указать имя метода. Тогда для типа будет вызываться метод, определённый в нём, а при приведении к типу интерфейса - метод этого интерфейса.

## Совершенствование безопасности типов за счёт явной реализации интерфейсных методов

Интерфейсы удобны тем, что они предоставляют стандартный механизм взаимодействия между типами. Обобщённые типы хорошо повышают безопасность типов при компиляции и позволяют избавиться от упаковки. Однако иногда приходится реализовывать необобщённые интерфейсы, так как обобщённой версии попросту нет. Такие типы очень часто оперируют типом `object`, что нарушает безопасность и приводит к упаковке.

Используя явную реализацию интерфейсного метода, мы объявляем в типе похожий метод, который, однако, оперирует не `object`, а самим типом. В реализации интерфейсного метода мы приводим объект к нашему типу и вызываем экземплярный метод. Тогда для вызова метода нашего типа не нарушается безопасность и не происходит упаковки. Однако при приведении нашего типа к интерфейсу, все преимущества теряются. 

К явной реализации интерфейсных методов часто прибегают, если необходимо реализовать именно необобщённый интерфейс.

## Опасности явной реализации интерфейсных методов

С явной реализацией интерфейсных методов связаны некоторые проблемы:
- **Отсутствие документации, объясняющей, как именно тип реализует явный метод, а также отсутствие поддержки в IDE.** В описаниях методов типа в документации можно найти сведения о явной реализации, однако вызвать эти методы нельзя, что только вводит разработчика в замешательство.
- **При приведении к интерфейсному типу экземпляры значимого типа упаковываются.**
- **Явную реализацию интерфейсных методов нельзя вызвать из производного типа.** Лучший способ исправить это - в дополнение к явно реализованному методу создать в базовом классе виртуальный метод, который можно будет переопределить в наследниках.

Явная реализация методов полезна лишь в некоторых случаях, но её стоит избегать везде, где это возможно.

## Дилемма разработчика: базовый класс или интерфейс?

Несколько правил для правильного выбора:
- **Связь потомка с предком.** Если производный тип не может ограничиваться отношением "является частным случаем", то стоит использовать интерфейс. Интерфейс подразумевает отношение типа "поддерживает функциональность". Значимые типы не могут наследоваться, поэтому здесь можно использовать только интерфейсы.
- **Простота использования.** При наследовании от базового типа вносятся лишь незначительные изменения, при реализации интерфейса реализуется всё.
- **Чёткая реализация.** Базовый тип с хорошей реализацией основных функций - хорошая отправная точка.
- **Управление версиями.** При добавлении нового члена в базовый тип, ничего не нужно менять и даже перекомпилировать. Внесение изменений в интерфейс требует усилий по доработке.
