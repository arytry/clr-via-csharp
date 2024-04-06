# События

В данной главе рассматривается последняя разновидность членов, которые можно определить в типе, - события. Тип, в котором определено событие (или экземпляры этого типа), может уведомлять другие объекты о некоторых особых ситуациях, которые могут случиться. Определение события в типе означает, что тип поддерживает следующие возможности:
- Регистрация своей заинтересованности в событии.
- Отмена регистрации своей заинтересованности в событии.
- Оповещение зарегистрированных методов о произошедшем событии.

Типы могут предоставлять эту функциональность при определении событий, так как они поддерживают список зарегистрированных методов. Когда событие происходит, тип уведомляет об этом все зарегистрированные методы.

Модель событий CLR основана на _делегатах_ (delegate). Делегаты обеспечивают реализацию механизме обратного вызова, безопасную по отношению к типам. Методы обратного вызова (callback methods) позволяют объекту получать уведомления, на которые он подписался.

Прим. _В работе я редко (практически никогда) сталкивался с событиями. В микросервисной архитектуре механизм событий построен через асинхронное взаимодействие сервисов, а механизм событий больше подходит для десктопных приложений с графическим интерфейсом. Поэтому данную главу я пропущу, для веб-разработки хватит и общего понимания, что такой механизм возможен._