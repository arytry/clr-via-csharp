# Массивы

Массив представляет собой механизм, позволяющий рассматривать набор элементов как единую коллекцию. CLR поддерживает _одномерные_ (single-dimension), _многомерные_ (multidimension) и _нерегулярные_ (jagged) массивы/ Базовым для всех массивов является абстрактный класс `System.Array`, производный от `System.Object`, а значит массивы являются ссылочным типом, хранятся в куче, а переменная в коде содержит не элементы массива, а ссылку на массив.

Ниже представлен код и визуализация в памяти созданий и изменений массивов различных типов.

```csharp
Int32[] myIntegers; // Объявление ссылки на массив
myIntegers = new Int32[100]; // Создание массива типа Int32 из 100 элементов

Control[] myControls; // Объявление ссылки на массив
myControls = new Control[50]; // Создание массива из 50 ссылок на переменную Control

myControls[1] = new Button();
myControls[2] = new TextBox();
myControls[3] = myControls[2]; // Два элемента ссылаются на один объект
myControls[46] = new DataGrid();
myControls[48] = new ComboBox();
myControls[49] = new Button();
```

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/4f94509c-ce1c-4ec0-b4be-73bf2e37e785)

В данном случае происходит следующее. В первой строке объявляется переменная, которая будет ссылаться на одномерные массив и ей присваивается значение `null`, так как память пока не выделена. Затем выделяется память под 100 значений и всем им присваивается 0. Помимо элементов здесь этот объект хранит типичные для объекта в куче поля. Адрес данного массива заносится в переменную. Во втором блоке кода создаётся массив из элементов ссылочного типа. Смысл тот же, только вместо нулей элементы массива заполняются `null`. В третьем блоке кода происходит частичное заполнение массива так, как если бы те же объекты создавались в качестве переменных.

Согласно CLS? нумерация элементов массива начинается с нуля. Иные варианты нумерации в CLR допускаются, но не приветствуются. 

В массиве всегда присутствует некая дополнительная информация: данные о размерности, типе данных, нижней границе и так далее.

По возможности нужно ограничиваться созданием одномерных массивов с нулевым начальным индексом (их иногда называют _SZ-массивами_ или _векторами_). Векторы обеспечивают наилучшую производительность, так как для них используются IL-команды. Однако, можно создавать и многомерные массивы:

```csharp 
// Создание двухмерного массива типа Double
Double[,] myDoubles = new Double[10, 20];

// Создание трехмерного массива ссылок на строки
String[,,] myStrings = new String[5, 3, 10];
```

CLR поддерживает также нерегулярные массивы - массивы массивов. Производительность одномерных нерегулярных массивов с нулевым начальным индексом такая же, как у обычных векторов. Однако обращение к элементам нерегулярного массива означает обращение к двум или более массивам одновременно.

```csharp
// Создание одномерного массива из массивов типа Point
Point[][] myPolygons = new Point[3][];

// myPolygons[0] ссылается на массив из 10 экземпляров типа Point
myPolygons[0] = new Point[10];

// myPolygons[1] ссылается на массив из 20 экземпляров типа Point
myPolygons[1] = new Point[20];

// myPolygons[2] ссылается на массив из 30 экземпляров типа Point
myPolygons[2] = new Point[30];

// вывод точек первого многоугольника
for (Int32 x = 0; x < myPolygons[0].Length; x++)
{
  Console.WriteLine(myPolygons[0][x]);
}
```

CLR проверяет корректность индексов. При попытках обратиться к элементу с индексом, выходящим за границы, выбрасывается исключение `System.Index.OutOfRange`, так как доступ к памяти за пределами границ массивов может нарушить безопасность типов и создать брешь в защите, недопустимую для верифицированного кода. Проверка индекса обычно не влияет на скорость, так как происходит заранее перед началом цикла, а не на каждой итерации. Однако эту проверку можно обойти (и увеличить производительность) с помощью небезопасного кода.

## Инициализация элементов массива

Синтаксис C# позволяет объединить операции создания массива и присвоения ему начальных значений:

```csharp 
String[] names = new String[] { "Aidan", "Grant" };
```

Набор разделённых запятой символов в фигурных скобках называется _инициализатором массива_ (array initializer). Сложность каждого символа может быть произвольной, а в случае многомерного массива инициализатор может оказаться вложенным. Данную операцию можно сократить ещё сильнее с помощью неявной типизации (в данном случае компилятор выбирает наиболее подходящий тип из всех):

```csharp
var names = new[] { "Aidan", "Grant", null };
```

Однако, нельзя совмещать, например, строки и числа, так как в этом случае компилятор будет считать, что наиболее подходящим типом является `object`, а значит, необходима упаковка, которую компилятор откажется делать неявно ввиду высоких затрат.

В качестве бонуса существует вот такая возможность инициализации (в данном случае компилятор не разрешает неявную типизацию):

```csharp 
String[] names = { "Aidan", "Grant" };
```

В качестве символов инициализатора могут выступать и объекты анонимного типа (в данном случае объекты массива должны быть экземплярами одного и того же анонимного типа):

```csharp 
var kids = new[] {new { Name="Aidan" }, new { Name="Grant" }};
```

## Приведение типов в массивах

В CLR для массивов с элементами ссылочного типа допустимо приведение. Для этого массивы должны быть одинаковой размерности и иметь возможность явного или неявного приведения из типа элементов исходного массива в целевой тип. CLR не поддерживает преобразование массивов с элементами значимого типа, однако это можно обойти при помощи метода `Array.Copy()`, который создаёт новый массив и заполняет его элементами. Если при попытках приведения массивов не совпадают размерности, то компилятор выдаёт ошибку. Если же при приведении не совместимы типы, то ошибки компиляции не будет, но в рантайме можно получить `InvalidCastException`.

Метод `Array.Copy()` выполняет следующее:
- Упаковка элементов значимого типа в элементы ссылочного типа, например, копирование `Int32[]` в `Object[]`.
- Распаковка элементов ссылочного типа в элементы значимого типа, например, копирование `Object[]` в `Int32[]`.
- Расширение (widening) примитивных значимых типов, например, копирование `Int32[]` в `Double[]`.
- Понижающее приведение в случаях, когда совместимость массивов невозможно определить по их типам. Например, можно привести массив типа `Object[]` в массив типа `IFormattable[]`, если все объекты в исходном массиве реализуют данный интерфейс.

FCL достаточно часто использует преимущества метода `Array.Copy()`. Иногда бывает полезно изменить тип массива, то есть выполнить его _ковариацию_ (array covariance). Однако стоит помнить, что данная операция сказывается на производительности.

Для копирования есть ещё два метода. Первый - `System.Buffer.BlockCopy()`, который работает быстрее, чем `Array.Copy()`, но поддерживает только примитивные типы. Для надёжного копирования стоит использовать метод `System.Array.ConstrainedCopy()`, который гарантирует, что в случае неудачного копирования данные в исходном массиве не будут повреждены, хотя данный метод не поддерживает упаковку, распаковку и нисходящее приведение.

## Базовый класс System.Array 

Все массивы являются производными от `System.Array`, а значит, поддерживают и все его методы (многие из которых являются перегруженными для осуществления контроля типов). Подробнее можно прочитать в [документации](https://learn.microsoft.com/en-us/dotnet/api/system.array?view=net-8.0). 

## Реализация интерфейсов IEnumerable, ICollection и IList

Многие методы работают с коллекциями, поскольку их параметры объявлены как `IEnumerable`, `ICollection` или `IList`. На их место можно передавать и массивы, поскольку все три необобщённых интерфейса реализованы в `System.Array`. Это обусловлено тем, что интерфейсы интерпретируют любой элемент как экземпляр `System.Object`. 

Обобщённые версии данных интерфейсов `IEnumerable<T>`, `ICollection<T>` и `IList<T>` не реализованы в `System.Array`, потому что в этом случае возникают проблемы с многомерными массивами, а также с массивами с ненулевой нижней границей. Вместо этого разработчики CLR пошли на хитрость: при создании одномерного массива с нулевой индексацией CLR автоматически реализует обобщённые интерфейсы, а также три интерфейса для всех базовых типов массива при условии, что типы являются ссылочными. Ситуацию иллюстрирует следующая иерархия:

```csharp
Object
  Array (необобщенные IEnumerable, ICollection, IList)
    Object[] (IEnumerable, ICollection, IList of Object)
      String[] (IEnumerable, ICollection, IList of String)
      Stream[] (IEnumerable, ICollection, IList of Stream)
        FileStream[] (IEnumerable, ICollection, IList of FileStream)
          .
          . (другие массивы ссылочных типов)
          .
```

В этом случае массив `FileStream[] fsArray;` наследует интерфейсы базовых классов и может быть передан в методы с такими прототипами:

```csharp
void M1(IList<FileStream> fsList) { ... }
void M2(ICollection<Stream> sCollection) { ... }
void M3(IEnumerable<Object> oEnumerable) { ... }
```

Но если массив содержит элементы значимого типа, класс, к которому он принадлежит, не будет реализовывать интерфейсы базовых типов.

## Передача и возврат массивов

Передавая массив в метод, стоит помнить о том, что на самом деле передаётся ссылка на массив, что означает возможность модификации элементов массива. Этого можно избежать, передавая в качестве аргумента копию. Однако `Array.Copy()` выполняет поверхностное (shallow) копирование, а это значит, что элементы ссылочного типа скопируются как ссылка на существующие объекты. 

Аналогично, отдельные методы возвращают ссылку на массив. Если есть необходимость, чтобы метод возвращал ссылку на внутренний массив, ассоциированный с полем, то сначала стоит решить, вправе ли вызывающая программа иметь доступ к этому массиву. Как правило, этого делать не стоит. Поэтому лучше вернуть копию этого массива через метод.

В случае, если метод возвращает пустой массив, результатом может быть ссылка на массив с нулевым числом элементов либо `null`. Первый вариант предпочтительнее, так как вызывающий код сможет обработать данный результат и не выкинуть NullReferenceException.

## Массивы с ненулевой нижней границей

Создать такие массивы можно с использованием статического метода `Array.CreateInstance()`, который позволяет задавать тип элементов, размерность, нижнюю границу   и так далее. Подобные массивы могут быть полезны, когда границы массива являются значениями бизнес-логики (например, года отчётности).

## Внутренняя реализация массивов

В CLR поддерживаются массивы двух типов:
- Одномерные массивы с нулевым начальным индексов. Иногда их называют _SZ-массивами_ (single-dimensional, zero-based) или _векторами_.
- Одномерные и многомерные массивы с неизвестным начальным индексом.

Допустим, создаётся массив строк. Тогда типов одномерного массива с нулевой   нижней границей будет `System.String[]`, а если индексация начинается не с нуля, то тип будет `System.String[*]`, где `*` говорит о том, что CLR знает о ненулевой нижней границе. Так как в C# объявить переменную типа `String[*]` нельзя, то и обращаться к элементам по индексу тоже нельзя. Для этого необходимо использовать методы `Array.GetValue()` и `Array.SetValue()`, что сказывается на производительности. Для многомерных массивов всегда выводится тип `String[,]`, так как во время выполнения CLR рассматривает все многомерные массивы как массивы с ненулевой нижней границей. 

Доступ к SZ-массивам происходит гораздо быстрее по нескольким причинам:
- Для таких массивов существуют специальные команды CLR, которые позволяют JIT-компилятору генерировать оптимизированный код.
- Предполагается, что индексация начинается с нуля и для доступа к любому элементу необходимо выполнить смещение.
- В общем случае компилятор выносит код проверку границ за пределы цикла.

Для многомерных массивов или массивов с ненулевой нижней границей код проверки и вычисления текущего индекса генерируется для каждой итерации цикла, что и делает их медленнее. Если есть необходимость повысить производительность, то стоит использовать нерегулярные массивы (массивы массивов).

Кроме того, в C# и CLR возможен доступ к элементам массива при помощи небезопасного (неверифицируемого) кода. В этом случае процедура проверки индекса просто отключается. Данная техника применима только к примитивным структурам, а также к перечислениям. Подробнее о доступе к элементам массива с использованием небезопасного кода в книге (стр. 430).

## Небезопасный доступ к массивам и массивы фиксированного размера

Небезопасный доступ к массиву является мощным средством, так как даёт возможность работать:
- С элементами управляемого массива.
- С элементами массива в неуправляемой куче (например, `SecureString`).
- С элементами массива в стеке потока.

Если производительность критична, управляемый массив можно разместить в стеке при помощи инструкции `stackalloc` языка C#. В этом случае все элементы массива (и даже вложенные в значимые типы) должны быть значимыми.

В структуру можно встроить массив при соблюдении следующих условий:
- Тип должен быть структурой.
- Поле или структура, в которой оно определено, должны помечаться модификатором `unsafe`.
- Поле массива должно быть помечено модификатором `fixed`.
- Массив должен быть SZ.
- Элементы массива должны быть примитивными структурами.
