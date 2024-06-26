# Примитивные, ссылочные и значимые типы

## Примитивные типы в языках программирования

Типы данных, которые поддерживаются компилятором напрямую, называются _примитивными_ (primitive types); у них существуют прямые аналоги в .NET FCL. Ниже представлены типы FCL и соответствующие им примитивные типы C#. В других языка типам, удовлетворяющим CLS, соответствуют аналогичные примитивные типы.

| Примитивный тип | FCL-тип        | Совместимость с CLS | Описание                                                                                                               |
| :-------------: | :------------: | :-----------------: | :--------------------------------------------------------------------------------------------------------------------- |
| sbyte           | System.Sbyte   | Нет                 | 8-разрядное значение со знаком                                                                                         |
| byte            | System.Byte    | Да                  | 8-разрядное значение без знака                                                                                         |
| short           | System.Int16   | Да                  | 16-разрядное значение со знаком                                                                                        |
| ushort          | System.Uint16  | Нет                 | 16-разрядное значение без знака                                                                                        |
| int             | System.Int32   | Да                  | 32-разрядное значение со знаком                                                                                        |
| uint            | System.Unit32  | Нет                 | 32-разрядное значение без знака                                                                                        |
| long            | System.Int64   | Да                  | 64-разрядное значение со знаком                                                                                        |
| ulong           | System.Uint64  | Нет                 | 64-разрядное значение без знака                                                                                        |
| char            | System.Char    | Да                  | 16-разрядный символ Unicode                                                                                            |
| float           | System.Single  | Да                  | 32-разрядное значение с плавающей точкой                                                                               |
| double          | System.Double  | Да                  | 64-разрядное значение с плавающей точкой                                                                               |
| bool            | System.Boolean | Да                  | Булево значение                                                                                                        |
| decimal         | System.Decimal | Да                  | 128-разрядное значение с плавающей точкой повышенной точности (часто используется для выполнения финансовых операций)  |
| string          | System.String  | Да                  | Массив символов                                                                                                        |
| object          | System.Sbyte   | Да                  | Базовый тип для всех типов                                                                                             |
| dynamic         | System.Sbyte   | Да                  | Для CLR идентичен типу object (при этом позволяет участвовать в динамическом разрешении типа с упрощённым синтаксисом) |

Иначе говоря, можно считать, что компилятор C# автоматически предполагает, что во всех файлах подключены директивы вида `using <primitive type> = <FCL-type>;`.

Спецификация языка C# советует использовать ключевое слово, а не полное имя типа. Однако Джеффри Рихтер с этим не согласен по следующим причинам:

- Некоторые разработчики, используя ключевые слова, совершенно не понимаю, что за ними прячется: некоторые считают, что `int` представляет 32-разрядное число в 32-разрядной системе и 64-разрядное в 64-разрядной, что в корне неверно, так как `int` всегда представляет `System.Int32`.
- В C# `long` представляет `System.Int64`, однако в других языках оно может обозначать другой тип (например, в C++/CLI оно трактуется как Int32). Это может привести к путанице в попытках прочитать код на новом языке.
- У многих FCL типов есть методы, которые включают в себя имена типов. Из-за этого может возникать путаница, например, в методе `float val = bt.ReadSingle();`.

Компилятор умеет выполнять явное и неявное приведение между примитивными типами. Неявное применяется от менее разрядных типов к более (если приведение безопасно: не сопряжено с потерей данных), а явное - наоборот.

Помимо приведения, компилятор знает и о литеральной форме записи примитивных типов (литералы считаются экземплярами типов, поэтому к ним спокойно можно применять методы `123.ToString();`).

Кроме этого, выражения, состоящие из литералов, вычисляют на этапе компиляции, что повышает скорость выполнения приложения. 

Наконец, компилятор знает, в каком порядке интерпретировать все встречающиеся в коде операторы.

### Проверяемые и непроверяемые операции для примитивных типов

Существует такое явление как переполнение, когда значение становится больше, чем допустимо для данного типа, и тогда старшие байты отбрасываются. Переполнение обычно не приветствуется, однако иногда (при вычислении хешей или контрольных сумм) может быть даже полезно.

```csharp
Byte b = 100;
b = (Byte) (b + 200);
```

При выполнении этой операции все значения операндов расширяются до 32 разрядов (или 64, если 32 недостаточно). Полученное 32-разрядное число помещается в переменную типа Byte, где и происходит переполнение и отсечение.

В каждом языке существуют свои правила обработки переполнения: какой-то язык может его игнорировать, а какой-то - вызывать исключения. В CLR для этого есть отдельные команды (add и add.ovf). Подобные команды есть для вычитания (sub/sub.ovf), умножения (mul/mul.ovf) и преобразования данных (conv/conv.ovf).

По умолчанию команды с проверкой переполнения выключены и программист должен это предусмотреть при написании приложения. Включить проверку можно с использованием параметры `/checked+` у компилятора, что замедлит выполнение программы. Однако, в этом случае стоит подумать об обработке выкидываемого исключения.

Но программистам вряд ли понравится необходимость включения или выключения этой возможности на этапе компиляции, поэтому в C# для этого придуман механизм гибкого управления проверки переполнения виде операторов `checked` и `unchecked`. Наряду с этими операторами в C# есть одноимённые инструкции, которые проверяют не операцию, а блок кода в фигурных скобках.

При использовании этих операторов стоит соблюдать некоторые правила:

- Использовать целочисленные типы со знаком, что позволит компилятору выявлять ошибку переполнения. Кроме того, некоторые компоненты библиотеки классов возвращают значения со знаком, и передача этих значений потребует меньшего количества преобразований типа.
- Включать в блок `checked` любой код, в котором возможно переполнение (например, при вводе пользовательских данных), а затем обрабатывать исключение.
- Включать в блок `unchecked` код, в котором переполнение не создаёт проблем.
- В коде, где нет этих операторов или блоков, предполагается, что при переполнении должно происходить исключение.

Тип System.Decimal стоит особняком, так как в CLR он не относится к примитивным типам. Все математические операции описаны статическими методами и перегруженными операторами. Это означает, что в IL нет определённых команд для манипуляции числами, а значит, здесь не имеют эффекта операторы `checked` и `unchecked`.  

## Ссылочные и значимые типы

CLR поддерживает две разновидности типов: _ссылочные_ (reference types) и _значимые_ (value types). Большинство типов в FCL - ссылочные, но разработчики чаще всего используют значимые. Память для ссылочных типов выделяется из управляемой кучи, а оператор `new()` возвращает адрес в памяти. При работе со ссылочными типами следует учитывать следующие обстоятельства:

- Память всегда выделяется из управляемой кучи.
- Каждый объект, размещённый в куче, содержит дополнительные члены, подлежащие инициализации.
- Незанятые полезной информацией байты объекта обнуляются (это касается полей). Размещение объекта в управляемой куче со временем инициирует сборку мусора.

Если бы все типы были ссылочными, эффективность приложения бы резко упала из-за постоянного выделения и очищения памяти в куче. Поэтому для ускорения обработки простых, часто используемых типов CLR предлагает облегчённые типы - _значимые_. Экземпляры этих типов обычно размещаются в стеке (хотя могут быть встроены и в объект ссылочного типа). В представляющей экземпляр переменной нет указателя на экземпляр, поля размещаются в самой переменной, поэтому не нужно выполнять [разыменование (dereference)](https://ru.wiktionary.org/wiki/разыменование). Благодаря тому, что экземпляры значимых типов не обрабатываются сборщиком мусора, уменьшается интенсивность работы с управляемой кучей и сокращается количество сборок.

В .NET Framework ссылочные типы называют _классами_ (class), а значимые - _структурами_ (struct) и _перечислениями_ (enumeraton). Все структуры являются потомками абстрактного типа `System.ValueType` (по умолчанию все значимые типы должны быть производными от него), а он является производным от `System.Object`.  Все перечисления являются производными от типа `System.Enum`, а он является производным от `System.ValueType`.

При определение собственного значимого типа нельзя выбрать произвольный базовый тип, но он может реализовывать один или несколько интерфейсов. Кроме того, в CLR значимый тип является изолированным, то есть он не может являться базовым типом.

В управляемом коде разработчик, описывающий тип, решает, где будет размещаться экземпляр этого типа, а разработчик, использующий этот тип, управлять этим не может.

В коде и на рисунке ниже описывается различие между ссылочными и значимыми типами.

```csharp
// Ссылочный тип (поскольку 'class')
class SomeRef { public Int32 x; }

// Значимый тип (поскольку 'struct')
struct SomeVal { public Int32 x; }

static void ValueTypeDemo() {
    SomeRef r1 = new SomeRef(); // Размещается в куче
    SomeVal v1 = new SomeVal(); // Размещается в стеке

    r1.x = 5; // Разыменовывание указателя
    v1.x = 5; // Изменение в стеке

    Console.WriteLine(r1.x); // Отображается "5"
    Console.WriteLine(v1.x); // Также отображается "5"

    SomeRef r2 = r1; // Копируется только ссылка (указатель)
    SomeVal v2 = v1; // Помещаем в стек и копируем члены

    r1.x = 8; // Изменяются r1.x и r2.x
    v1.x = 9; // Изменяется v1.x, но не v2.x

    Console.WriteLine(r1.x); // Отображается "8"
    Console.WriteLine(r2.x); // Отображается "8"
    Console.WriteLine(v1.x); // Отображается "9"
    Console.WriteLine(v2.x); // Отображается "5"
}
```

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/1d508b4f-6425-4d8d-9af6-8cb226743976)

При проектировании типов стоит проверить, не использовать ли вместо ссылочного типа значимый, так как иногда это может повысить эффективность кода. Сказанное справедливо для типов, удовлетворяющих всем условиям:

- Тип ведёт себя подобно примитивному типу. Это означает, что тип достаточно простой и у него нет членов, способных изменить экземплярное состояние. В это случае говорят, что тип _неизменяемый_(immutable).
- Тип не обязан иметь любой другой тип в качестве базового.
- Тип не имеет производных от него типов.

Также необходимо учитывать размер экземпляров типа, потому что по умолчанию аргументы передаются по значению; при этом поля экземпляров значимого типа копируются, что негативно сказывается на производительности. Поэтому дополнительно необходимо, чтобы выполнялось хотя бы одно из условий:

- Размер экземпляров типа мал (примерно 16 байт или меньше).
- Размер экземпляров типа велик (более 16 байт), но экземпляры не передаются в качестве аргументов метода и не являются возвращаемыми из метода значениями.

Основные отличия между ссылочными и значимыми типами:

- Объекты значимого типа могут быть _упакованными_ (boxed) и _неупакованными_ (unboxed). Ссылочные типы существуют только в упакованной форме.
- Значимые типы являются наследниками `System.ValueType`. Этот тип имеет все те же методы, что и `System.Object`, однако он переопределяет методы `Equals()`, чтобы тот сравнивал экземпляры по значениям, а также метод `GetHashCode()`, в котором алгоритм учитываются значения. Однако, из-за проблем с производительность стоит переопределять эти методы самому при написании значимых типов.
- Поскольку нельзя наследоваться от значимого типа, то он не может быть абстрактным (является неявно запечатанным) и не может содержать виртуальных методов.
- Так как значимый тип не указывает на объект в куче, то он не может быть `null` (за исключением `nullable` типов), соответственно, нельзя получить `NullReferenceException`.
- При присваивании одной переменной значимого типа другой переменной происходит копирование всех полей. При присваивании переменной ссылочного типа - копируется адрес.
- Вследствие предыдущего пункта несколько переменных ссылочного типа могут ссылаться на один объект в куче и изменения в одной переменной порождают изменения во всех остальных. Переменные значимого типа изолированы друг от друга.
- Так как неупакованные значимые типы не размещаются в куче, то и занятая ими память освобождается сразу при возвращении стека к предыдущему кадру, не дожидаясь сборки мусора.

### Как CLR управляет размещением полей для типа

Для повышения производительности CLR дано право устанавливать порядок размещения полей типа. Например, среда может вытроить поля таким образом, что ссылки на объекты окажутся в одной группе, а поля данных и свойства - выровненные и упакованные - в другой. Однако при описании типа можно указать, сохранить ли порядок полей.

По умолчанию, поля ссылочных типов размещаются в памяти сгруппировано, а значимых - последовательности, так, как определил разработчик. Это можно изменить с помощью специальных атрибутов.

## Упаковка и распаковка значимых типов

Значимые типы "легче" ссылочных: под них не выделяется память в управляемой куче, их не затрагивает сборка мусора, к ним нельзя обратиться через указатель. Однако часто требуется получать ссылку на экземпляр значимого типа. например при сохранении структуры `Point` в объекте типа `ArrayList`.

```csharp
// Объявляем значимый тип
struct Point {
    public Int32 x, y;
}

public sealed class Program {
    public static void Main() {
        ArrayList a = new ArrayList();
        Point p; // Выделяется память для Point (не в куче)
        for (Int32 i = 0; i < 10; i++)
        {
            p.x = p.y = i; // Инициализация членов в нашем значимом типе
            a.Add(p); // Упаковка значимого типа и добавление ссылки в ArrayList
        }
    ...
    }
} 
```

Метод `ArrayList.Add()` принимает в качестве аргумента `Object`, однако в примере передаётся экземпляр значимого типа. Чтобы код работал, необходимо преобразовать аргумент в объект из управляемой кучи и получить на него ссылку. Для преобразования значимого типа в ссылочный служит _упаковка_ (boxing):

1. В управляемой куче выделяется память, объём которой определяется длиной значимого типа и двумя дополнительными членами - указателем на объект-тип и индексом блока синхронизации (эти члена необходимы для всех объектов в управляемой куче).
2. Поля значимого типа копируются в эту область в управляемой куче.
3. Возвращается адрес объекта.

Время жизни упакованного значимого типа (время нахождения в куче до следующей сборки мусора) превышает время жизни неупакованного значимого типа (время жизни кадра стека).

Обобщённые классы коллекций значительно сокращают количество необходимых упаковок, так как умеют хранить в себе значимые типы. Это сокращает количество выделяемой памяти в управляемой куче и количество циклов работы сборщика мусора. В результате обеспечивается безопасность типов на этапе компиляции, а код становится понятнее за счёт сокращения числа приведения типов.

При попытке присвоить упакованный объект в переменную значимого типа происходит обратная операция: содержимое упакованного объекта копируются в переменную значимого типа, находящуюся в потоке. CLR выполняет эту процедуру в два этапа: сначала извлекается адрес полей из упакованного объекта (это называется _распаковкой_ (unboxing)), а затем значения полей копируются из кучи в экземпляр значимого типа, находящийся в стеке.

Распаковка не является точной противоположностью упаковки. Она менее ресурсозатратна, так как состоит только в получении указателя на исходный значимый тип, содержащийся в объекте. Указатель ссылается на неупакованную часть упакованного экземпляра (поля без дополнительных блоков) и никакого копирования при распаковке (в отличие от упаковки) не требуется. Однако после распаковки обычно выполняется копирование полей.

При распаковке может происходить следующее:

1. NullReferenceException, если переменная, содержащая ссылку на упакованный значимый тип, равна null.
2. InvalidCastException, если ссылка указывает на объект, не являющийся упакованным значением требуемого типа (CLR позволяет распаковку в nullable версию типа).

Распаковка не включает в себя приведение типов, поэтому, если типы не совпадают, необходимо отдельное приведение.

Если необходимо изменить значения полей упакованного объекта, то нужно распаковать его, скопировать все поля, изменить значения и снова упаковать. Это значительно сказывается на производительности.

Многие методы из FCL часто написаны с применением перегрузок под конкретные примитивные типы, чтобы сократить потенциальное число упаковок. При написании собственных классов стоит подумать над обобщениями, которые бы принимали значимый тип, не требуя упаковки.

Последнее, что касается упаковки: если известно, что код будет периодически заставлять компилятор выполнять упаковку, то стоит сделать это вручную и далее оперировать ссылкой на упакованный объект.

Простое правило: если нужна ссылка на экземпляр значимого типа, этот экземпляр должен быть упакован. Обычно упаковка выполняется, когда необходимо передать значимый тип в метод, где требуется ссылочный. Но бывают и другие ситуации.

Так как у значимых типов нет блока синхронизации, то не может быть и нескольких потоков, синхронизирующих свой доступ к экземпляру (например, инструкция `lock` языка C#).

Хотя неупакованные значимые типы не имеют указателя на объект-тип, всё равно можно вызвать виртуальные методы (`Equals()`, `GetHashCode()` или `ToString()`), унаследованные или переопределённые этим типом. Если значимый тип переопределяет один из этих виртуальных методов, тогда CLR может вызвать его невиртуально, потому что значимые типы запечатаны. В данном случае экземпляр значимого типа не упаковывается. Но если переопределение вызывает реализацию метода из базового класса, тогда экземпляр значимого типа будет упакован, чтобы в указателе `this` базового метода передавалась ссылка на объект в куче.

Вместе с тем вызов невиртуального унаследованного метода (`GetType()` или `MemberwiseCLone()`) всегда требует упаковки значимого типа, так как эти методы определены в `System.Object`, поэтому методы ожидают, что в аргументе `this` передастся ссылка на объект в куче. Кроме того, приведение неупакованного экземпляра значимого типа к одному из интерфейсов этого типа требует, чтобы экземпляр был упакован, так как интерфейсные переменные всегда должны содержать ссылку на объект в куче.

```csharp
using System;

internal struct Point : IComparable
{
    private Int32 m_x, m_y;

    // Конструктор, просто инициализирующий поля
    public Point(Int32 x, Int32 y)
    {
        m_x = x;
        m_y = y;
    }

    // Переопределяем метод ToString, унаследованный от System.ValueType
    public override String ToString()
    {
        // Возвращаем Point как строку (вызов ToString предотвращает упаковку)
        return String.Format("({0}, {1})", m_x.ToString(), m_y.ToString());
    }

    // Безопасная в отношении типов реализация метода CompareTo
    public Int32 CompareTo(Point other)
    {
        // Используем теорему Пифагора для определения точки, наиболее удаленной от начала координат (0, 0)
        return Math.Sign(Math.Sqrt(m_x * m_x + m_y * m_y) - Math.Sqrt(other.m_x * other.m_x + other.m_y * other.m_y));
    }

    // Реализация метода CompareTo интерфейса IComparable
    public Int32 CompareTo(Object o)
    {
        if (GetType() != o.GetType())
        {
            throw new ArgumentException("o is not a Point");
        }
        // Вызов безопасного в отношении типов метода CompareTo
        return CompareTo((Point) o);
    }
}

public static class Program
{
    public static void Main()
    {
        // Создаем в стеке два экземпляра Point
        Point p1 = new Point(10, 10);
        Point p2 = new Point(20, 20);

        // p1 НЕ пакуется для вызова ToString (виртуальный метод)
        Console.WriteLine(p1.ToString()); // "(10, 10)"

        // p1 ПАКУЕТСЯ для вызова GetType (невиртуальный метод)
        Console.WriteLine(p1.GetType()); // "Point"

        // p1 НЕ пакуется для вызова CompareTo
        // p2 НЕ пакуется, потому что вызван CompareTo(Point)
        Console.WriteLine(p1.CompareTo(p2)); // "-1"

        // p1 пакуется, а ссылка размещается в c
        IComparable c = p1;
        Console.WriteLine(c.GetType()); // "Point"

        // p1 НЕ пакуется для вызова CompareTo
        // Поскольку в CompareTo не передается переменная Point, вызывается CompareTo(Object), которому нужна ссылка на упакованный Point
        // c НЕ пакуется, потому что уже ссылается на упакованный Point
        Console.WriteLine(p1.CompareTo(c)); // "0"

        // c НЕ пакуется, потому что уже ссылается на упакованный Point
        // p2 ПАКУЕТСЯ, потому что вызывается CompareTo(Object)
        Console.WriteLine(c.CompareTo(p2));// "-1"

        // c пакуется, а поля копируются в p2
        p2 = (Point) c;

        // Убеждаемся, что поля скопированы в p2
        Console.WriteLine(p2.ToString());// "(10, 10)"
    }
}
```

### Изменение полей в упакованных типах посредством интерфейсов (и почему этого лучше не делать)

Значимые типы должны быть неизменяемыми, так как при упаковке и последующей распаковке может происходить неожиданное поведение, связанное со ссылками в управляемую кучу. Значимые типы могут быть полезными, если знать, как ими пользоваться.

### Равенство и тождество объектов

Для `System.Object` метод `Equals()` работает достаточно просто: метод сравнивает ссылки, то есть реализует проверку на тождество.

Правильная реализация метода `Equals()` должна действовать следующим образом:

1. Если аргумент равен null, вернуть false.
2. Если аргументы ссылаются на один и тот же объект, вернуть true.
3. Если аргументы ссылаются на объекты разного типа, вернуть false.
4. Сравнить все определённые в типе экземплярные поля объектов. Если хотя бы одна пара не равна, то вернуть false.
5. Вызвать метод `Equals()` базового класса, чтобы сравнить определённые в нём поля. Если метод вернул false, то тоже вернуть false.

```csharp
public class Object
{
    public virtual Boolean Equals(Object obj)
    {
        // Сравниваемый объект не может быть равным null
        if (obj == null) return false;

        // Объекты разных типов не могут быть равны
        if (this.GetType() != obj.GetType()) return false;

        // Если типы объектов совпадают, возвращаем true при условии, что все их поля попарно равны.
        // Так как в System.Object не определены поля, следует считать, что поля равны
        return true;
    }
}
```

Однако при написании собственных типов метод `Equals()` переопределяется и его уже нельзя использовать для проверки на тождественность. Для исправления ситуации в типе `Object` предусмотрен статический метод `ReferenceEquals()`.

В базовом классе всех значимых типов метод корректно переопределён и проверяет именно равенство, а не тождественность. Внутренняя реализация метода работает по следующей схеме:

1. Если аргумент равен null, вернуть false.
2. Если аргументы ссылаются на объекты разного типа, вернуть false.
3. Сравнить все определённые в типе экземплярные поля объектов. Если хотя бы одна пара не равна, то вернуть false.
4. Вернуть true, так как одноимённый метод из Object не вызывается.

Для реализации пункта 3 используется отражение (рефлексия). Так как она работает медленно, то стоит написать свою реализацию. Конечно, из этой реализации не стоит вызывать метод базового класса.

При переопределении метода для предсказуемости поведения стоит обеспечить поддержку четырёх характеристик:

- **Рефлективность.** x.Equals(x) должно возвращать true.
- **Симметричность.** x.Equals(y) должно быть равно y.Equals(x).
- **Транзитивность.** Если x.Equals(y) равно true и y.Equals(z) равно true, то и x.Equals(z) равно true.
- **Постоянство.** Если в двух сравниваемых значениях не произошло изменений, то результат сравнения не должен измениться.

При переопределении может потребоваться выполнить несколько дополнительных условий:

- **Реализовать в типе метод Equals() интерфейса System.IEquatable\<T>.** Этот обобщённый интерфейс позволяет определить безопасный в отношении типов метод.
- **Перегрузить операторы == и !=.**

Если предполагается сравнивать экземпляры для сортировки, то стоит также реализовать метод CompareTo() типа System.IComparable и безопасный в отношении типов метод CompareTo() типа System.IComparable\<T>.

## Хеш-коды объектов

Виртуальный метод `GetHashCode()`, позволяющий вычислить для любого объекта целочисленный хеш-код, является очень удобной возможностью для добавления в хеш-таблицы экземпляров любых типов. 

При переопределении только одного метода из двух (`Equals()` и `GetHashCode()`) компилятор выдаст предупреждение. Причина состоит в том, что реализация хеш-таблиц, словарей и любых других коллекций в C# требует, чтобы два равных объекта имели одинаковые значения хеш-кодов. Для этого необходимо обеспечить соответствие алгоритмов.

При выборе алгоритма вычисления хеш для своего типа стоит следовать определённым правилам:

- Использовать алгоритм, дающий случайное распределение, что повышает производительность хеш-таблицы.
- Алгоритм может использовать алгоритм базового типа и использовать возвращаемое им значение, однако от этого лучше отказаться, так как эти реализации обладают низкой производительностью.
- В алгоритме должно использоваться как минимум одно экземплярное поле.
- Поля, используемые в алгоритме, в идеале должны быть неизменяемыми.
- Алгоритм должен быть максимально быстрым.
- Объекты с одинаковым значением должны возвращать одинаковые коды.

Реализация алгоритма по умолчанию ничего не знает о производных типах, поэтому просто возвращает число, которое однозначно идентифицирует объект в пределах домена. При этом гарантируется, что число не изменится за время жизни объекта.

## Примитивный тип данных dynamic

Язык C# обеспечивает безопасность типов данных: все выражения вычисляются в экземпляр типа, и компилятор генерирует только тот код, который правомерен для данного типа. Это позволяет заметить ошибки ещё на этапе компиляции и ускорить приложение. 

Однако иногда бывают ситуации (когда приложение взаимодействует с компонентами, написанными на языках с динамической типизацией), когда тип заранее не известен. В этом случае типобезопасный код становится громоздким и медленным.

Для облегчения подобной разработки C# предлагает помечать типы как _динамические_ (dynamic). Также можно записывать результаты вычисления в переменную, помеченную как dynamic? затем динамическая переменная может быть использована для вызова её полей. В этом случае компилятор создаёт специальный IL-код, который описывает желаемую операцию. Этот код называется _полезной нагрузкой_ (payload). Во время выполнения он определяет существующую операцию для выполнения на основе действительного типа объекта.

```csharp
internal static class DynamicDemo
{
    public static void Main()
    {
        dynamic value;
        for (Int32 demo = 0; demo < 2; demo++)
        {
            value = (demo == 0) ? (dynamic) 5 : (dynamic) "A";
            value = value + value;
            M(value);
        }
    }

    private static void M(Int32 n) { Console.WriteLine("M(Int32): " + n); }
    private static void M(String s) { Console.WriteLine("M(String): " + s); }
}
```

После выполнения метода Main получается следующий результат:

```csharp
M(Int32): 10
M(String): AA
```

Когда тип поля, параметр метода, возвращаемый тип метола или локальная переменная снабжается пометкой `dynamic`, компилятор конвертирует этот тип в тип `System.Object` и применяет к экземпляру `System.Runtime.CompilerServices.DynamicAttribute` к полю, параметру или возвращаемому типу в метаданных, но не к локальной переменной, потому что переменная используется только внутри метода. Из-за того, что на уровне IL-кода `dynamic` компилируется в `object`, нельзя создать перегрузки методов, которые бы отличались только этими типами.

Любое выражение может быть явно приведено к типу `dynamic`. Компилятор также разрешает неявное приведение типа `dynamic` к другому типу. Если тип не приводим, то на этапе компиляции будет вызвано `InvalidCastException`.

Преимущество `dynamic` перед `object` состоит в том, что использование `dynamic` значительно упрощает код и позволяет избавиться от упаковки, так как тип будет разрешён на этапе выполнения программы. Однако именно это и является минусом, так как подобное поведение может привести к ряду исключений.

Код полезной нагрузки, который генерируется на этапе компиляции использует класс, известный как _компоновщик_ (runtime binder). Различные языки программирования определяют различные компоновщики.

При выполнении кода полезной нагрузки, который генерирует динамический код во время выполнения, этот код окажется в сборке, названной _анонимной сборкой динамических методов_ (Anonymously Hosted Dynamic Methods Assembly). Назначение этого кода заключается в повышении производительности динамических ссылок в ситуациях, в которых конкретное место вызова выдаёт много вызовов с динамическими аргументами, соответствующих одному типу на этапе выполнения.

Если динамический код используется только в паре мест, разумнее придерживаться старого подхода: либо использовать рефлексию, либо вручную приводить типы.

Одно из ограничений динамических типов заключается в том, что они могут использоваться только для обращения к членам экземпляров, потому что динамическая переменная должна ссылаться на объект. Однако иногда бывает полезно динамически вызывать статические методы типа, определяемого во время выполнения. Для этих целей можно создать класс с использованием рефлексии (прим. подробный пример есть в книге).
