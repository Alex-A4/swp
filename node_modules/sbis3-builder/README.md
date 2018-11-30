# Builder
Builder - утилита для сборки клиентского кода проектов на платформе СБИС3.
Сборка - процесс преобразования исходного кода в работающее приложение.

Пользовательская документация: https://wi.sbis.ru/doc/platform/developmentapl/development-tools/builder/

Техническая документация: https://online.sbis.ru/shared/disk/2f1f267b-f1e0-4955-9a39-fbb9786084b5

Участок работ: https://online.sbis.ru/arearesponsibility.html?region_left=areaResponsibility#openworkarea=da98e741-0b59-480a-82b2-a83669ab3167

# Задачи npm

Описаны в package.json. Запускаются из корневого каталога:

        npm run <имя команды>

Перед любым запуском нужно выполнить

    npm i

Т.к. в проекте есть .npmrc, то о флагах обычно можно не думать.

## Задачи npm для CI/CD

1. **build** - основная задача сборки проекта.
Запускает **build:verify** и **build:only**.
Артефакты: папка dest (готовый builder для SDK), файл eslint-report.log (отчёт ESLint только об ошибках), xunit.log и xunit-result.xml (резултьтат тестирования)
2. **build:only** - копирует нужные исходники в папку dest и устанавливает зависимости.
3. **build:verify** - проверка кода через ESLint(**build:lint**) и юнит тесты(**build:test**). Артефакты: файл eslint-report.log, xunit.log и xunit-result.xml.

## Задачи npm для разработки
1. **test** - запустить юнит тесты.
2. **test:coverage** - узнать % покрытия кода юниттестами. Артефакт: файл отчёта coverage/index.html.
3. **lint** - запустить ESLint. Если ESLint упал - точно будут проблемы при сборке. Варнинги можно игнорировать, но лучше поправить.
4. **lint:fix** - запустить ESLint с флагом --fix. Поправит самые простые ошибки.
6. **lint:errors** - выведет только ошибки, что уронят сборку.

## Про .npmrc

Флаг --legacy-bundling нужен для корректной установки зависимостей пакета sbis3-json-generator.

## Про package-lock.json
package-lock.json нужен для фиксации конкретных версий пакетов для всего дерева зависимостей.
Это нужно для:
1. Повторяемой сборки
2. Безопасности при обновлении минорных пакетов в глубине дерева зависимостей.
3. Быстрой установки зависимости через "npm ci" (NPM 6+)

Подробнее тут:
https://docs.npmjs.com/files/package-lock.json

# Использование Builder'а

## Задача **build**
Основная задача сборки статики проекта.

Выполнить из папки builder'а:

        node ./node_modules/gulp/bin/gulp.js --gulpfile ./gulpfile.js build --config=custom_config.json

Где custom_config.json - путь до JSON конфигарации в формате:

      {
         "cache": "путь до папки с кешем",
         "output": "путь до папки с ресурсами статики стенда",
         "localization": ["ru-RU", "en-US"] | false,            //опционально. список локализаций
         "default-localization": "ru-RU",                       //опционально, если нет "localization"
         "mode": "debug"|"release",                             //опционально, если нет "compileEsAndTs"
         "compileEsAndTs": true                                 //опционально, использовать если требуется компиляция в директорию с исходниками.
         "logs": "путь до папки для записи логов",              //опционально, используется для записи builder_report.json
         "multi-service": false|true,                           //опционально. по умолчанию false. Собираем один сервис или несколько. От этого зависит будем ли мы менять константы в статических html и пакетах.
         "url-service-path": "путь до текущего сервиса",        //опционально. по умолчанию "/"
         "modules": [                                           //сортированный по графу зависимостей список модулей
            {
              "name": "имя модуля",
              "path": "путь до папки модуля",
              "responsible": "ответственный",
              "preload_urls": ["url1", "url2"]
            }
         ]
      }
После сборки в папке с кешем создаётся файл "last_build_gulp_config.json" - копия последнего оригинального файла конфигураци.
## Задача **buildOnChange**
Задача по обновлению одного файла в развёрнутом локальном стенде. Обычно вызывается из WebStorm.

Выполнить из папки builder'а:

        node ./node_modules/gulp/bin/gulp.js --gulpfile ./gulpfile.js buildOnChange --config=last_build_gulp_config.json --filePath="FilePath"

Где **last_build_gulp_config.json** - путь до JSON конфигарации последней сборки, **FilePath** - файл который мы хотим обновить.

## Задача **collectWordsForLocalization**

Задача сборa фраз для локализации статики. Нужно для genie.sbis.ru и wi.sbis.ru.

Выполнить из папки builder'а:

        node ./node_modules/gulp/bin/gulp.js --gulpfile ./gulpfile.js collectWordsForLocalization --config=custom_config.json

Где custom_config.json - путь до JSON конфигарации в формате:

      {
         "cache": "путь до папки с кешем",
         "output": "путь до результирующего json файла",
         "modules": [{                                          //сортированный по графу зависимостей список модулей
            "name": "имя модуля",
            "path": "путь до папки модуля",
            "responsible": "ответственный"
         }]
      }

# Тестирование

Builder тестируем через модульные тесты с помощью mocha и chai.
Для локальной отладки тестов нужно настроить среду разработки на запуск mochа в папке test. Нужно обязательно указать параметр "--timeout 600000".
Такой огромный таймаут нужен по двум причинам:
1. тесты на MacOS идут дольше, чем на windows и centos
2. интеграционные тесты тоже пишем в терминах mocha. Возможно, это не совсем корректно и нужно переделать.

# Style guide
Стандарт разработки на JavaScript описан тут: https://wi.sbis.ru/doc/platform/developmentapl/standards/styleguide-js/

Чтобы эти требования соблюдались, написан конфиг для ESLint - файл ".eslintrc" в корне проекта. В конфиге нулевая толерантность к несоответствию style guide. Причины описаны тут:
1. https://ru.wikipedia.org/wiki/Теория_разбитых_окон
2. https://habrahabr.ru/company/pvs-studio/blog/347686/

Также не пренебрегайте функцией Inspect Code в WebStorm.

# Логирование и вывод ошибок
Логирование и вывод ошибок осуществляется через универсальный логгер: sbis3-builder/lib/logger.js
Пример использования:

        const logger = require('./lib/logger').logger();
        logger.debug('Сообщение не будет видно пользователям, но будет в логах');
        logger.info('Сообщение будет видно пользователям и будет в логах');
        logger.warning('Текст предупреждения');
        logger.error('Текст ошибки');
        logger.error({ //аналогично можно вызывать logger.warning.
            message: 'Текст ошибки', //если не задать, то будет выведено error.message
            filePath: filePath, //полный путь до файла, крайне желательно
            moduleInfo: moduleInfo, // экземпляр класса ModuleInfo, если есть. актуально для Gulp.
            error: error //пойманное исключение, если есть
        });

Вывод сообщений уровня debug включается при запуске утилиты с флагом -LLLL. Побробнее тут: https://github.com/gulpjs/gulp-cli

После сборки записывается builder_report.json - отчёт об ошибках и предупреждениях сборки для автоматизации оформления ошибок в системе CI/CD.
