# Основы типов

## Все типы - производные от System.Object

Благодаря тому, что все типы являются производными от System.Object, любой объект гарантированно имеет следующий набор методов:
- `Equals()` - Возвращает true, если два объекта имеют одинаковые значения.
- `GetHashCode()` - Возвращает хеш-код для значения объекта. Используется при указании типа в качестве ключа хеш-таблиц.
- `ToString()` - По умолчанию возвращает полное имя типа, но на практике метод часто переопределяют, чтобы он возвращал внутреннее состояние объекта.
- `GetType()` - Возвращает информацию о типе объекта. Данный метод нельзя переопределить с целью фальсификаций данных о типе.

Кроме того, есть несколько защищённых методов:
- `MemberwiseClone()` - Не виртуальный метод, который создаёт новый экземпляр типа и копирует в него состояние. Примитивные типы копируются по значению, а пользовательские - по ссылке.
- `Finalize()` - Виртуальный метод; вызывается, когда сборщик мусора определяет, что объект является мусором, но до возвращения занятой памяти в кучу. В типах, требующих очистки, следует переопределить этот метод.

CLR требует, чтобы все объекты создавались оператором `new`, который выполняет следующее:
1. Вычисляет количество байтов, необходимых для хранения всех экземплярных полей типа и всех его базовых типов. В каждом объекте кучи должны присутствовать _указатели на объект-тип_ (type object pointer) и _индекс блока синхронизации_ (sync block index); они необходимы для управления объектом.
2. Выделение памяти для объекта с резервированием необходимого для данного типа количества байтов в управляемой куче. Эти байты инициализируются нулями.
3. Инициализация указателя и индекса.
4. Вызов конструктора типа с параметрами. Большинство компиляторов автоматически включает в конструктор код вызова конструктора базового класса. Каждый конструктор выполняет инициализацию определённых в соответствующем типе полей. Кроме конструктора System.Object - он просто возвращает управление.

Выполнив эти операции, `new` возвращает ссылку на объект.

## Приведение типов

Одна из важнейших особенностей CLR - _безопасность типов_ (type safety). В рантайме CLR всегда знает тип объекта. 

При разработке часто прибегают к приведению типов. CLR разрешает приведение объекта к его собственному или любому из базовых типов. В C# нет специального синтаксиса для приведения к базовому типу, так как это считается безопасным неявным преобразованием. Однако, для приведения типа к производному нужно ввести операцию явного приведения типов.

```csharp
// Этот тип неявно наследует от типа System.Object
internal class Employee
{
 ...
}

public sealed class Program
{
  public static void Main()
  {
    // Приведение типа не требуется, т. к. new возвращает объект Employee, а Object — это базовый тип для Employee.
    Object o = new Employee();

    // Приведение типа обязательно, т. к. Employee — производный от Object.
    // В других языках (таких как Visual Basic) компилятор не потребует явного приведения.
    Employee e = (Employee) o;
  }
} 
```

Пример выше показывает, что необходимо компилятору. Однако, CLR проверяет правильность приведения типов в рантайме. В случае, если приведение не удастся осуществить, CLR выкинет `InvalidCastException`.

```csharp
internal class Employee 
{
 ...
}

internal class Manager : Employee 
{
 ...
}
 
public static void PromoteEmployee(Object o) 
{
 // В этом месте компилятор не знает точно, на какой тип объекта ссылается o, поэтому скомпилирует этот код
 // Однако в период выполнения CLR знает, на какой тип ссылается объект o (приведение типа выполняется каждый раз), и проверяет, соответствует ли тип объекта типу Employee или другому типу, производному от Employee
 Employee e = (Employee) o;
 ...
} 

public sealed class Program 
{
 public static void Main() 
 {
   // Создаем объект Manager и передаем его в PromoteEmployee
   // Manager ЯВЛЯЕТСЯ производным от Employee, поэтому PromoteEmployee работает
   Manager m = new Manager();
   PromoteEmployee(m);
   
   // Создаем объект DateTime и передаем его в PromoteEmployee
   // DateTime НЕ ЯВЛЯЕТСЯ производным от Employee, поэтому PromoteEmployee выбрасывает исключение System.InvalidCastException
   DateTime newYears = new DateTime(2013, 1, 1);
   PromoteEmployee(newYears);
 }
}
```

Если разрешить подобное преобразование, то это может привести к неожиданным и неприятным последствиям, поэтому в CLR столь пристальное внимание уделяется типам.

В данном случае для `PromoteEmployee` правильнее было бы выбрать `Employee` в качестве параметра, чтобы избавиться от потенциального исключения ещё на этапе компиляции.

### Приведение типов в C# с помощью операторов is и as

В C# существуют другие механизмы приведения типов. Оператор `is` проверяет совместимость объекта с данным типом. Данный оператор не генерирует исключение, для `null` он всегда возвращает `false`. Обычно данный оператор используется следующим образом:

```csharp
if (o is Employee) {
 Employee e = (Employee) o;
 // Используем e внутри инструкции if
} 
```

Однако, это заставляет CLR дважды проверять совместимость типов, что несколько ухудшает производительность. В качестве решения данной проблемы можно использовать оператор `as`:

```csharp
Employee e = o as Employee;
if (e != null) {
 // Используем e внутри инструкции if
}  
```

В данном случае CLR проверяет совместимость и, если типы совместимы, возвращает ненулевой указатель на объект. По сути оператор `as` отличается от явного приведения типов тем, что в рантайме можно получить NullReferenceException, если типы в результате получился `null`, вместо InvalidCastException.

## Пространства имён и сборки

Пространства имён используются для логической группировки родственных типов.

Для компилятора пространства имён - простое средство, позволяющее удлинить имя типа и сделать его уникальным за счёт добавления к началу имени групп символов, разделённых точками.

Директива `using` заставляет компилятор добавлять к имени указанный префикс, пока не будет найдено совпадение по типу.

CLR не знает ничего о пространствах имён. CLR обращается к типу по полному имени и сборке.

В ситуации, когда в разных сборках объявлены типы с одинаковыми именами, стоит указывать полное имя типа, так как иначе компилятор выдаёт ошибку. 

В C# есть ещё одна форма директивы `using` - создание псевдонима для отдельного типа или пространства имён. Это позволяет избежать объявления полного типа в коде.

Бывают ситуации, когда дублируются не только имена типов или пространства имён, но также и названия сборок. На этот случай в компиляторе поддерживаются _внешние псевдонимы_ (external aliases). 

При проектировании типов, которые могут использоваться третьими лицами, стоит использовать максимально уникальные имена, которые бы имели наименьшие шансы совпадения с кем-либо.

В C# директива namespace заставляет компилятор добавлять к каждому имени типа определённую приставку - это избавляет разработчика от написания массы лишнего кода.

### Связь между сборками и пространством имен

Пространства имён и сборка не обязательно связаны друг с другом: одно пространство может быть описано в разных сборках, как и одна сборка может содержать разные пространства.

## Как разные компоненты взаимодействуют во время выполнения

На рисунке представлен один процесс Microsoft Windows с загруженной в него CLR. У процесса может быть много потоков. После создания потоку выделяется стек размером в 1 Мбайт. Выделенная память используется для передачи аргументов в методы и хранения локальных переменных. Память заполняется от старших адресов к младшим. Тёмной область в стеке обозначен какой-то код с данными. Далее происходит вызов метода `M1()`.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/953a5d6a-4581-4597-b549-8f6955548370)

Все методы содержат некоторый _входной код_ (prologue code), инициализирующий метод до начала работы. Все методы содержат _выходной код_ (epilogue code), выполняющий очистку после того, как метод завершит свою работу, чтобы передать управление в вызывающий метод. В начале выполнения `M1()` его входной код выделяет в стеке потока память под локальную переменную `name`.

Далее `M1()` вызывает `M2()` передавая в качестве аргумент локальную переменную `name`. При это адрес локальной переменной заносится в стек. Внутри `M2()` местоположение стека хранится в переменной-параметре. При вызове метода адрес возврата в вызывающий метод также помещается в стек.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/16de1921-61f4-45ed-bf4e-d923c22a5647)

В начале выполнения `M2()` его входной код выделяет в стеке потока память для своих локальных переменных. 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/884336af-3049-4a4b-bfb0-9d23693e2ff5)

Затем выполняется код метода. Потом выполнение доходит до команды возврата, которая записывает в указатель команд процессора адрес возврата из стека, и стековый кадр `M2()` возвращается состояние как было до его вызова. С этого момента продолжается выполнение кода `M1()`, который следует сразу за вызовом `M2()`, а стековый кадр метода находится в состоянии, необходимом для работы `M1()`.

В конечном счёте, метод `M1()` возвращает управление вызывающей команде, устанавливая указатель команд процессора на адрес возврата, и стековый кадр возвращается в состоянии, аналогичное тому, что было до вызова и так далее.

Теперь о том, как всё это происходит в среде CLR. Допустим, есть два класса:

```csharp
internal class Employee {
  public Int32 GetYearsEmployed () { ... }
  public virtual String GetProgressReport () { ... }
  public static Employee Lookup(String name) { ... }
}

internal sealed class Manager : Employee {
  public override String GenProgressReport() { ... }
} 
```

Процесс Windows запустился, в него загружена CLR, инициализирована управляемая куча, и создан поток (с 1 Мбайт памяти в стеке). Поток выполняет какой-то метод, из которого вызвался `M3()`. 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/506a9a64-c6a5-4293-874c-0ed8acff6132)

В процессе преобразования IL-кода метода `M3()` JIT-компилятор выявляет все типы, на которые есть ссылки. На данном этапе CLR обеспечивает загрузку в домен приложения всех сборок, в которых определены эти типы. Затем, используя метаданные сборки, CLR получает информацию о типах и создаёт структуры данных, представляющих эти типы.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/6df42749-a9ce-440b-82c8-3f25d43aa0bf)

После того, как CLR создаст все необходимые объекты-типы и откомпилирует код метода, она приступает к выполнению машинного кода метода. При выполнении метода в стеке потока выделяется память для локальных переменных. CLR автоматически инициализирует все локальные переменные значениями null или 0. Однако при попытке обращения к локальной переменной, неявно инициализированной, компилятор выведет сообщение об ошибке.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/227c1dfd-79e4-4a2c-9dba-6c9067401581)

Далее метод выполняет код создания объекта `Manager`. При этом в управляемой куче создастся экземпляр типа. 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/4b3c19f6-2a14-483a-9192-757fca57989e)

У объекта есть указатель на объект-тип и индекс блока синхронизации. У этого объекта тоже есть байты, необходимые для размещения всех экземплярных полей данных типа, а также экземплярных полей, определённых во всех базовых классах. Всякий раз при создании нового объекта в куче, CLR автоматически инициализирует внутренний указатель на соответствующий объект-тип. Кроме того, CLR инициализирует все экземплярные поля перед вызовом конструктора, который, скорее всего, изменит значения некоторых полей. Оператор `new` вернёт адрес в памяти объекта, который хранится в переменной (в стеке потока). 

Следующая строка метода вызывает статический метод `Lookup()`. При вызове этого метода CLR определяет местонахождение объекта-типа, соответствующий типу, в котором определён статический метод. Затем CLR находит точку входа в вызываемый метод, компилирует его и передаёт ему управление. Допустим, метод создаёт объект типа `Manager` и возвращает адрес объекта в куче. Адрес помещается в стек.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/f00a468f-c1ad-4998-8adc-5b6b81fa590c)

Переменная `e` больше не ссылается на первый объект, и поскольку никто больше не ссылается на этот объект, он становится идеальный кандидатом на сборку мусора.

Следующая строка вызывает не виртуальный метод. При вызове не виртуального метода экземпляра JIT-компилятор находит объект типа, соответствующий переменной, которая использовалась для вызова. Если бы тип не определял вызываемый метод, то JIT-компилятор начал бы поиск метода в предках типа. Затем JIT-компилятор находит запись, соответствующую этому методу, компилирует и передаёт управление методу. Допустим, метод вернул 5, что и сохраняется в локальной переменной.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5f18c493-e917-4ccf-bf4c-99ec3c1fe3fc)

Следующая строка вызывает виртуальный метод. При вызове виртуального метода CLR приходится выполнить дополнительную работу. Во-первых, CLR обращается к переменной, используемой для вызова, а затем следует по адресу вызывающего объекта. Во-вторых, CLR проверяет у объекта внутренний указатель на объект-тип, затем метод обрабатывается так же, как и не виртуальный.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/b29db466-78f6-4dc6-a556-1401d6df520d)

Объекты содержат указатели на объекты-типы. По сути они являются объектами. Создавая его, CLR должна как-то его инициализировать. При запуске процесса CLR сразу создаёт специальный объект-тип для типа System.Type. Объекты типов Employee и Manager являются "экземплярами" этого типа, и по этой причине их указатели на объекты-типы инициализируются ссылкой на объект-тип System.Type. 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/79734a55-b524-470e-90f3-825888e4796a)

Объект-тип System.Type сам является объектом и поэтому также содержит указатель на объект-тип. Он ссылается на самого себя, так как он сам по себе является "экземпляром" объекта-типа. Метод GetType() возвращает указатель на объект-тип, что и гарантирует истинность типа любого объекта в системе.

