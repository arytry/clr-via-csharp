# Модель выполнения кода в среде CLR

## Компиляция исходного кода в исполняемые модули

_Общеязыковая среда выполнения_ (Common Language Runtime) - среда выполнения, которая подходит для разных языков программирования. Основные возможности (управление памятью, загрузка сборок, безопасность, обработка исключений, синхронизация) доступных в любых языках, использующих эту среду.

На рисунке ниже изображён процесс компиляции файлов с исходным кодом. Код может быть написан на любом языке, поддерживаемом CLR. Затем компилятор проверяет синтаксис и анализирует исходный код. Результатом компиляции будет являться _управляемый модуль_ (managed module) - стандартный переносимый исполняемый файл (portable executable: PE32/PE32+), который требует CLR для своего выполнения. Компиляторы машинного кода ориентируются на конкретную процессорную архитектуру. В отличие от этого, все CLR-совместимые компиляторы генерируют IL-код (intermediate language), его иногда называют управляемым, потому что CLR управляет его выполнением.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/4c923aef-5a06-482c-b31a-103b55c122ca)

Каждый компилятор для CLR должен генерировать не только IL-код, но и полные _метаданные_ для каждого управляемого модуля. Метаданные - набор таблиц данных, описывающих, что определено в модуле (например, типы и их члены). Также в метаданных указывается, на что ссылается управляемый модуль (например, импортируемые типы и их члены). Компилятор генерирует метаданные и код одновременно и привязывает их к конечному управляемому модулю, так что рассинхронизация исключена.

Для выполнения управляемого модуля на машине должна быть установлена среда CLR (в составе .NET Framework).

## Объединение управляемых модулей в сборку

CLR работает не с модулями, а со сборками (assembly). В контексте среды CLR сборкой называется то, что обычно зовут _компонентом_.
- Сборка обеспечивает логическую группировку одного или нескольких управляемых модулей или файлов ресурсов.
- Сборка является наименьшей единицей многократного использования, безопасности и управления версиями.

Рисунок ниже позволяет понять суть сборки. На рисунке несколько управляемых модулей и ресурсных файлов, с которыми работает программа. Программа создаст единственный PE32+ файл, который обеспечит логическую группировку файлов и при этом включает в себя блок данных, называемый манифестом. Манифест - набор таблиц метаданных. 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/7a4ac223-a46e-42f1-a245-1fd2a1be25da)

Модули сборки также содержат сведения о других сборках, на которые они ссылаются (в том числе номера их версий). Это делает сборку _самоописываемой_. 

## Загрузка CLR

Каждая создаваемая сборка является либо исполняемым приложением, либо DLL. 

После анализа заголовка для выяснения, какой процесс надо запустить (32- или 64-разрядный) Windows загружает в адресное пространство процесса соответствующую версию библиотеки MSCorEE.dll. Далее основной поток вызывает определённый в MSCorEE.dll метод, который инициализирует CLR, загружает сборку EXE, а затем вызывает её метод Main.

## Исполнение кода сборки

IL - язык более высокого уровня по сравнению с большинством машинных языков: он позволяет работать с объектами и имеет команды для создания и инициализации объектов, вызова виртуальных методов манипулирования элементами массивов. IL можно рассматривать как ОО машинный язык.

Для выполнения какого-либо методов его IL-код должен быть преобразован в машинный, этим занимается JIT-компилятор (Just-In-Time). 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5a5e2418-a799-4279-ae6d-96ef473fd79c)

Перед исполнением метода Main среда CLR находит все типы данных, на которые ссылается метод. При этом CLR выделяет внутренние структуры данных, используемые для управления доступом к типам, на которые есть ссылки. Структура данных содержит записи на каждый метод. Каждая запись содержит адрес, по которому лежит реализация метода. Когда метод Main первый раз обращается к методу WriteLine, вызывается функция JITComplier. Этот компонент CLR называют _JIT-компилятором_, так как он компилирует код непосредственно перед выполнением.

При повторном вызове метода WriteLine он уже проверен и скомпилирован, так что обращение к блоку памяти происходит напрямую, без компиляции.

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/5c1d6c6b-cd6e-4fb5-ad6e-7f3c0701b593)

JIT-компилятор хранит команды в динамической памяти. 

Есть два параметра компилятора, влияющие на оптимизацию кода: 
- `/optimize` - создаёт оптимизированный код, который не содержит пустых команд; затруднена отладка; легче читать IL-код.
- `/debug` - компилятор связывает команды IL с исходным кодом.

В отладочной конфигурации проекта устанавливаются параметры `/optimize /debug:full`, а в релизе - `/optimize+ /debug:pdbonly`. PDB (Program Database) помогает находить локальные переменные и связывать команды IL с исходным кодом.

Есть мнение, что управляемые приложения могут превосходить по быстродействию неуправляемые (компилируемые для конкретного процессора и выполняющиеся просто при вызове). Это объясняется следующими причинами:
- JIT-компилятор может определить тип процессора и сгенерировать машинный код со специальными командами под конкретный процессор. Неуправляемые приложения генерируются с общими командами.
- JIT-компилятор может оценить истинность некоторого условия для машины, на которой он выполняется, и, следовательно, создать оптимизированный код под конкретный компьютер.
```csharp
if (numberOfCPUs > 1) {
  ...
}
```
- CLR может профилировать выполняемую программу и перекомпилировать IL в машинный код, который реорганизуется для сокращения ошибочного прогнозирования переходов на основании наблюдаемых закономерностей выполнения.

### IL-код и верификация

IL является стековым языков - все инструкции заносят операнды в стек и извлекают результат из стека.

Инструкции IL являются нетипизированными. При выполнении инструкция (например, сложения) определяет типы операндов, хранящихся в стеке, и выполняет соответствующую операцию.

В процессе JIT-компиляции выполняется _верификация_ - анализ высокоуровневого кода IL и проверка безопасности операций: проверяется, что каждый метод вызывается с правильными количеством и типами параметров, что каждый метод содержит return и так далее.

В Windows каждый процесс обладает собственным виртуальным адресным пространством. Это обеспечивает защищённость и стабильность системы - один процесс не может навредить другому.

Каждый процесс Windows требует значительный затрат ресурсов ОС, что снижает производительность. CLR даёт возможность размещения нескольких управляемых приложений в одном процессе, каждое из которых будет выполняться в домене приложений (App Domain).

### Небезопасный код

По умолчанию компилятор C# генерирует безопасный код, однако есть возможность писать небезопасный код, способный оперировать байтами памяти напрямую. Это бывает полезно для взаимодействия с неуправляемым кодом или оптимизации алгоритмов.

### IL и защита интеллектуальной собственности

...

## NGen.exe

- **Ускорение запуска приложения.** Запуск ускоряется, потому что ВЕСЬ код уже откомпилирован в машинный код.
- **Сокращение рабочего набора приложения.** Полностью машинный код можно загрузить в нескольких процессах одновременно.

## Библиотека FCL

Одним из компонентов .NET Framework является FCL (Framework Class Library) - набор сборок в формате DLL, содержащих определение нескольких тысяч типов. Примеры:
- **Веб-службы.** ASP.NET XML Web Service и WCF позволяют легко создавать методу для обработки сообщений в сети Интернет.
- **Приложения Web Forms и MVC на базе HTML.**
- **Приложения Windows c расширенным графическим интерфейсом.** Вместо UI можно реализовать более мощную функциональность (Windows Store, WPF и WinForms). Эти приложения могут использовать события элементов управления, сенсорного экрана и так далее.
- **Консольные приложения Windows.**
- **Службы Windows.** Windows SCM (Service Control Manager).
- **Хранимые процедуры баз данных.**
- **Библиотеки компонентов.** Сборки, которые легко встроить в приложения всех разновидностей.

В FCL буквально тысячи типов, поэтому взаимосвязанные типы объединяются в пространство имён.

## CTS

Microsoft создала формальную спецификацию CTS (Common Type System).

CTS устанавливает правила, формирующие границу видимости типа, а CLR обеспечивает выполнение этого правила. Однако при работе с верхнеуровневым языком программирования (например, C#) ограничения описываются языком.

Варианты ограничения доступа:
- **Закрытый (приватный) доступ** - член доступен внутри типа - `private`
- **Доступ в семействе** - член доступен для производных типов в любой сборке - `protected`
- **Доступ в семействе и сборке** - член доступен для производных типов, но только внутри этой же сборки - `private protected` (появился, начиная с C# 7.2)
- **Доступ в сборке** - `internal`
- **Доступ в семействе или сборке** - `protected internal`
- **Открытй доступ** - `public`

## CLS

Для упрощения написания в одном языке типов, которые были бы доступны для использования в другом, Microsoft разработала CLS (Common Language Specification). 

![image](https://github.com/kuzmin-nikita/CLR-via-CSharp/assets/80389873/ece48577-828b-4b2c-a075-5f659ea0b233)

```csharp
using System;

// Приказываем компилятору проверять код на совместимость с CLS
[assembly: CLSCompliant(true)]

namespace SomeLibrary;

// Предупреждения выводятся, потому что класс является открытым
public sealed class SomeLibraryType {
  // Предупреждение: возвращаемый тип 'SomeLibrary.SomeLibraryType.Abc()' не является CLS-совместимым
  public UInt32 Abc() { return 0; }

  // Предупреждение: идентификаторы 'SomeLibrary.SomeLibraryType.abc()', отличающиеся только регистром символов, не являются CLS-совместимыми
  public void abc() { }
  
  // Предупреждения нет: закрытый метод
  private UInt32 ABC() { return 0; }
}
```

CLS в упрощённом виде - в CLR каждый член типа является либо полем, либо методом.

## Взаимодействие с неуправляемым кодом

CLR спроектирована так, чтобы приложения могли состоять как из управляемых, так и из неуправляемых модулей. CLR поддерживает три сценария взаимодействия:
- **Управляемый код может вызывать неуправляемые функции из DLL** с использованием механизма P/Invoke (Platform Invoke).
- **Управляемый код может использовать готовые компоненты COM.**
- **Неуправляемый код может использовать управляемый тип.**