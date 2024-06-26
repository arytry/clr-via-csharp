# Null-совместимые значимые типы

Переменная значимого типа не может принимать null, её содержимым всегда является значение соответствующего типа, поэтому их и называют _значимыми_. Но такой подход может создавать проблемы. Например, в БД часто бывает ситуация, когда значение представлено целым числом, но оно необязательно. Но CLR не позволяет такого, что может создать проблема при работе с базой данных из .NET Framework.

Чтобы исправить ситуацию, в Microsoft разработали для CLR _null-совместимые значимые типы_ (nullable value types). Они работает с применением определённого в FCL типа `System.Nullable<T>`. Данный тип является значимым: его экземпляры достаточно производительны, потому что размещаются в стеке, а их размер совпадает с размером исходного типа, к которому прибавляется размер поля типа `Boolean`. Null-совместимый значимый тип предполагает, что если ему присваивается `null`, то флаг, отвечающий за наличие значения, становится равен `false`, а внутренне значение равно дефолтному. Данный класс работает только для значимых типов, так как ссылочные и так могут быть равны `null`.

## Поддержка в C# null-совместимых значимых типов

В настоящее время C# предлагает достаточно удобный синтаксис для работы с null-совместимыми значимыми типами. Переменные можно объявлять и инициализировать прямо в коде, воспользовавшись знаком вопроса после имени типа. При этом можно выполнять преобразования, а также приведения null-совместимых экземпляров к другим типам. Язык C# поддерживает и возможность применения операторов приведения к null-совместимым значимым типам. Вот несколько примеров:

```csharp 
private static void ConversionsAndCasting()
{
  // Неявное преобразование из типа Int32 в Nullable<Int32>
  Int32? a = 5;
  
  // Неявное преобразование из 'null' в Nullable<Int32>
  Int32? b = null;
  
  // Явное преобразование Nullable<Int32> в Int32
  Int32 c = (Int32) a;
  
  // Прямое и обратное приведение примитивного типа в null-совместимый тип
  Double? d = 5; // Int32->Double? (d содержит 5.0 в виде double)
  Double? e = b; // Int32?->Double? (e содержит null)
}
```

Ещё C# позволяет применять к null-совместимым значимым типам и другие операторы: 

```csharp 
private static void Operators()
{
  Int32? a = 5;
  Int32? b = null;

  // Унарные операторы (+ ++ - -- ! ~)
  a++; // a = 6
  b = -b; // b = null

  // Бинарные операторы (+ - * / % & | ^ << >>)
  a = a + 3; // a = 9
  b = b * 3; // b = null;

  // Операторы равенства (== !=)
  if (a == null) { /* нет */ } else { /* да */ }
  if (b == null) { /* да */ } else { /* нет */ }
  if (a != b) { /* да */ } else { /* нет */ }

  // Операторы сравнения (<> <= >=)
  if (a < b) { /* нет */ } else { /* да */ }
}
```

Данные операнды C# интерпретирует следующим образом:
- **Унарные операторы.** Если операнд равен `null`, то и результат равен `null`.
- **Бинарные операторы.** Если хотя бы один из операндов равен `null`, то и результат равен `null`. Исключением является применение конъюнкции или дизъюнкции внутри тернарного оператора. Таблицы для этих операторов приведена ниже.
- **Операторы равенства.** Операнды равны если они оба `null` или все их поля совпадают, в противном случае операнды не равны.
- **Операторы сравнения.** Если один из операндов равен `null`. то `false`, иначе значения сравниваются.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/cb981375-866d-4a89-92aa-f627f27f25ae)

Стоит учесть, что для операций с экземплярами null-совместимых значимых типов будет создан больший объём IL-кода в следствие чего, операции будут выполняться медленнее.

## Оператор объединения null-совместимых значений

В C# существует _оператор объединения null-совместимых значений_ (null-coalescing operator). Он обозначается как `??` и работает с двумя операндами. Если левый операнд не равен `null`, оператор возвращает его значение. Иначе возвращается значение правого операнда. Данный оператор удобен при задании значения по умолчанию (прим. _А также выбрасывании исключения_). Данный оператор работает как с ссылочными, так и с null-совместимыми значимыми типами.

Некоторые считают, что данный оператор является всего лишь синтаксическим сокращением для тернарного оператора. Однако, во-первых, данный оператор лучше работает с выражениями, а во-вторых, он может работать и для большего числа операндов, что повышает читабельность кода.

## Поддержка в CLR null-совместимых значимых типов 

В CLR существует встроенная поддержка null-совместимых значимых типов. Она предусматривает упаковку и распаковку, а также вызов `GetType()`, что призвано обеспечить более тесную интеграцию данных типов в CLR. В результате типы ведут себя более естественно и лучше соответствуют ожиданиям разработчиков.

### Упаковка null-совместимых значимых типов

При упаковке экземпляра `Nullable<T>` проверяется его равенство на `null` и в случае положительного результата возвращается `null`, в противном случае происходит самая обычная упаковка.  

### Распаковка null-совместимых значимых типов

В CLR упакованный значимый тип `T` распаковывается в `T` или `Nullable<T>` в зависимости от наличия `null` в упакованном объекте. 

### Вызов метода GetType через null-совместимый значимый тип

При вызове метода `GetType()` для `Nullable<T>` будет возвращён тип `T`.

### Вызов интерфейсных методов через null-совместимый значимый тип

При приведении null-совместимого значимого типа к интерфейсу код успешно компилируется, несмотря на то, что, например, `Nullable<Int32>` не реализует `IComparable<Int32>`. В данном случае механизм верификации CLR считает, что код прошёл проверку, чтобы не приходилось громоздить код сначала приведением к значимому типу, а затем к типу интерфейса.
