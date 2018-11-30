define('Core/helpers/Hcontrol/trackElement', [
    'Core/constants',
   'Core/helpers/Number/randomId',
    'Core/EventBus',
    'Core/detection',
    'Core/helpers/Hcontrol/isElementVisible',
    'Core/ControlBatchUpdater'
], function(
    constants,
    randomId,
    EventBus,
    detection,
    isElementVisible,
    ControlBatchUpdater
) {
    /**
     * Модуль, в котором описана функция <b>trackElement(element, doTrack)</b>.
     *
     * Показывает индикатор загрузки над конкретной областью.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>element</b> {jQuery|Element}.</li>
     *     <li><b>[doTrack = true]</b> {Boolean} - состояние: скрыть / показать.</li>
     * </ul>
     *
     * @class Core/helpers/Hcontrol/trackElement
     * @public
     * @author Крайнов Д.О.
     */
    return (function () {

        var
            idFastInterval = [],
            elementFastInterval = [],
            INTERVAL_FAST = 200,
            CHANNEL_HOLDER = 'ws_trackerChannelId',
            STATE_HOLDER = 'ws_trackerState';

        function setData(element, key, value) {
            var el = element[0];
            if (el) {
                el[key] = value;
            }
        }

        function getData(element, key) {
            var el = element[0];
            return el && el[key];
        }


        function attachChannel($element) {
            var
                id = randomId('tracker-'),
                channel = EventBus.channel(id);
            setData($element, CHANNEL_HOLDER, id);
            channel.setEventQueueSize('*', 1);
            return channel;
        }

        function isFixedState($element) {
            var isFixed = false;
            $element.parents().each(function (i, elem) {
                if ($(elem).css('position') === 'fixed') {
                    isFixed = true;
                    return false;
                }
            });
            return isFixed;
        }

        function getState($element) {
            var
                isVisible = isElementVisible($element),
                isFixed = isFixedState($element),
                el = $element.get(0),
                win = constants.$win,
                bcr = isVisible && el && el.getBoundingClientRect(),
                isElementHasSize = bcr && bcr.width !== 0 && bcr.height !== 0;

            //В новых обновлениях ie11 баг, связанный с получением размеров контейнера
            //getBoundingClientRect возврашает все значения по 0, хотя элемент видим и имеет свои размеры
            //Для ie11, если прошла наша проверка на видимость(isVisible), но width == 0 или height == 0, то
            //говорим, что позиция не изменилась, т.к. из кода не понять, что сейчас вообще происходит с таргетом
            if ((detection.isIE10 || detection.isIE11) && isVisible && !isElementHasSize) {
               var lastState = getData($element, STATE_HOLDER);
               return lastState || {};
            }

            return {
                visible: isVisible && isElementHasSize,
                fixed: isFixed,
                left: Math.floor(bcr ? bcr.left + win.scrollLeft() : 0),
                top: Math.floor(bcr ? bcr.top + win.scrollTop() : 0),
                winLeft: Math.floor(bcr ? bcr.left : 0),
                winTop: Math.floor(bcr ? bcr.top : 0),
                width: Math.floor(bcr ? bcr.right - bcr.left : 0),
                height: Math.floor(bcr ? bcr.bottom - bcr.top : 0)
            };
        }

        function tracker(force) {
            //Если есть активные пакеты, то обновлять позиции элементов не надо, поскольку они ещё не окончательные,
            //и можно сэкономить на этом расчёте при наличии активных пакетов.
            if (ControlBatchUpdater && ControlBatchUpdater.haveBatchUpdate() && !force) {
                return;
            }

            var
                $element = $(this),
                channelId = getData($element, CHANNEL_HOLDER),
                lastState = getData($element, STATE_HOLDER),
                currentState, channel, pos, lastPos, isInitial = false;

            if (!lastState) {
                isInitial = true;
                lastState = {};
            }

            currentState = getState($element);
            channel = EventBus.channel(channelId);

            if (currentState.visible !== lastState.visible) {
                channel.notify('onVisible', currentState.visible);
            }

            if (currentState.visible) {
                pos = currentState;
                lastPos = lastState;
                if (pos.fixed !== lastPos.fixed || pos.left !== lastPos.left || pos.top !== lastPos.top ||
                    pos.width !== lastPos.width || pos.height !== lastPos.height ||
                    pos.winLeft !== lastPos.winLeft || pos.winTop !== lastPos.winTop)
                {
                    channel.notify('onMove', currentState, isInitial);
                    /* В событии onMove могут отменить отслеживание,
                     поэтому записывать новое состояние не надо, проверим это */
                    if(!getData($element, CHANNEL_HOLDER)) {
                        return;
                    }
                }
            }

            setData($element, STATE_HOLDER, currentState);
        }

       /**
        * Функция запускает таймер для отслеживания позиции элемента, который раз 200 милисекунд запускает функцию обновления позиции элемента.
        * Если для данного элемента уже существует таймер, то новый не будет создан.
        * @param $element DOM-элемент для котрого надо создать таймер
        */
        function beginTrackElement($element) {

            if (elementFastInterval.indexOf($element[0]) === -1) {
               idFastInterval.push(
                  setInterval(
                     tracker.bind($element[0]), INTERVAL_FAST)
               );
               elementFastInterval.push($element[0]);
            }
        }

       /**
        * Функция останавливает таймер для отслеживания позиции элемента, если таймер существет.
        * @param $element DOM-элемент для котрого надо отсановить таймер
        */
        function stopTrackElement($element) {
           var index = elementFastInterval.indexOf($element[0]);

           if (index > -1) {
              clearInterval(idFastInterval[index]);
              idFastInterval.splice(index, 1);
              elementFastInterval.splice(index, 1);
           }
        }

        return function (element, doTrack) {
            var $element = $(element),
                channelId = getData($element, CHANNEL_HOLDER),
                channel;

            if (doTrack === undefined) {
                doTrack = true;
            }

            // Кому-то уже выдан канал
            if (channelId) {
                channel = EventBus.channel(channelId);
            } else {
                channel = attachChannel($element);
            }

            // Если попросили остановить отслеживание
            if (doTrack) {
                // Канала еще нет и попросили начать следить
                beginTrackElement($element);
            } else {
                stopTrackElement($element);
                setData($element, CHANNEL_HOLDER, null);
                setData($element, STATE_HOLDER, null);
                channel.destroy();
            }

            return channel;
        }
    })()
});
