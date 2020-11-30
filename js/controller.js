"use strict";
// controller

function GameControllerButtons() {
    var myModel = null; // с какой моделью работаем
    var myField = null; // внутри какого элемента DOM наша вёрстка
    var myTimer = null; // таймер
    var touchstartX = 0;
    var touchstartY = 0;
    var touchendX = 0;
    var touchendY = 0;
    var gesuredZone = document.getElementById('wrapper-game');

    this.start=function(model,field) {
        myModel=model;
        myField=field;
        myTimer = this.timer;
        switchToStateFromURLHash();
        window.onhashchange = switchToStateFromURLHash;
        window.onbeforeunload = befUnload;

        gesuredZone.addEventListener('touchstart', function(EO) {
            EO = EO || window.event;
            touchstartX = EO.pageX;
            touchstartY = EO.pageY;
        }, false);

        gesuredZone.addEventListener('touchend', function(EO) {
            EO = EO || window.event;
            touchendX = EO.pageX;
            touchendY = EO.pageY;
            handleGesure();
        }, false);

        // ищем и запоминаем интересные нам элементы DOM
        // назначаем обработчики событий
        var buttonUp = document.querySelector('.up');
        var buttonDown = document.querySelector('.down');
        var buttonLeft = document.querySelector('.left');
        var buttonRight = document.querySelector('.right');
        var buttonStart = document.getElementById('start');
        var buttonPause = document.getElementById('pause');
        buttonPause.addEventListener('click', switchToPausePage)
        var buttonSettings = document.getElementById('settings');
        buttonSettings.addEventListener('click', switchToSettingPage)
        var buttonRecords = document.getElementById('records');
        buttonRecords.addEventListener('click', switchToRecordsPage);

        buttonStart.onclick = function (EO) {
            EO=EO||window.event;
            if (myModel.workMode === 0){
                myModel.newGame();
                switchToMainPage();
                myModel.changeStateMusic();
                requestAnimationFrame(myTimer); //запускаем таймер
            } else if(myModel.workMode === 3){
                myModel.newGame();
                switchToMainPage();
                requestAnimationFrame(myTimer); //запускаем таймер
            } else if (confirm('Весь прогресс будет утерян. Начать новую игру?')){
                if (myModel.workMode===2)  requestAnimationFrame(myTimer); //запускаем таймер
                myModel.newGame();
                switchToMainPage();
            }

            buttonUp.onclick = function (EO) {
                EO=EO||window.event;
                myModel.rotate(); //стрелка вверх
            }

            buttonDown.onclick = function (EO) {
                EO=EO||window.event;
                myModel.goDown(); //стрелка вниз
            }

            buttonLeft.onclick = function (EO) {
                EO=EO||window.event;
                myModel.left(); //стрелка влево
            }

            buttonRight.onclick = function (EO) {
                EO=EO||window.event;
                myModel.right(); //стрелка вправо
            }

            document.onkeydown = function (EO) {
                EO=EO||window.event;
                switch (EO.keyCode) {
                    case 37:
                        myModel.left(); //левая стрелка
                        break;
                    case 38:
                        myModel.rotate(); //стрелка вверх
                        break;
                    case 39:
                        myModel.right(); //правая стрелка
                        break;
                    case 40:
                        myModel.goDown(); //стрелка вниз
                        break;
                }
            }
        }

    }

    this.timer = function () {
        myModel.speed++;
        console.log(myModel.speed);
        //Блок падает с разной скоростью в зависимости от уровня
        if (myModel.lines<=10) {
            myModel.speed % 30 === 0 && myModel.down();
        }
        if (myModel.lines>10&&myModel.lines<=20) {
            myModel.speed % 20 === 0 && myModel.down();
        }
        if (myModel.lines>20) {
            myModel.speed % 10 === 0 && myModel.down();
        }
        //флаг, что игра идет
        if (myModel.workMode === 1) {
            requestAnimationFrame(myTimer);
        }
    }
    function handleGesure() {
        if (touchendX > touchstartX) {
            switchToSettingPage();
        }
    }

    //Переключение на УРЛ из Хэша
    function switchToStateFromURLHash() {
        var self = this;
        var URLHash=window.location.hash;
        // убираем из закладки УРЛа решётку
        var stateStr=URLHash.substr(1);
        if (stateStr!="" ) { // если закладка непустая, читаем из неё состояние и отображаем
            myModel.spaState={ pagename: stateStr}; // первая часть закладки - номер страницы
            if (stateStr === 'Main'&&myModel.workMode===2) switchToMainPage();
            if (stateStr === 'Pause'&&myModel.workMode===1) {
                myModel.workMode=2;
                myModel.spaState={ pagename: 'Pause'};
                switchToPausePage();
            }
            if (stateStr === 'Settings'&&myModel.workMode===1) {
                myModel.workMode=2;
                myModel.spaState={ pagename: 'Settings'};
                switchToSettingPage();
            }
            if (stateStr === 'Records'&&myModel.workMode===1) {
                myModel.workMode=2;
                myModel.spaState={ pagename: 'Records'};
                switchToRecordsPage();
            }
        }
        else {
            myModel.spaState={pagename:'Main'};  // иначе показываем главную страницу
        }
        myModel.spaStateChanged();
        if (document.getElementById('ok-button')) {
            var okButton=document.getElementById('ok-button');
            okButton.addEventListener('click', switchToMainPage);
        }
        if (document.getElementById('music-button')){
            var buttonMusic = document.getElementById('music-button');
            buttonMusic.addEventListener('click', changeStateMusic);
        }
        if (document.getElementById('sound-button')){
            var buttonSound = document.getElementById('sound-button');
            buttonSound.addEventListener('click', changeStateSound);
        }
    }

    function changeStateMusic(){
        myModel.changeStateMusic();
    }
    function changeStateSound(){
        myModel.changeStateSound() ;
    }
    //Изменение хэша страницы
    function switchToState(newState) {
        var stateStr = newState.pagename;
        location.hash = stateStr;
    }
    //Переключение на страницы SPA
    function  switchToMainPage() {
        switchToState( {pagename:'Main'} );
        if (myModel.speed>0&&myModel.isGameOver===false) {
            myModel.workMode = 1;
            requestAnimationFrame(myTimer);//запускаем таймер
        }
    }
    function  switchToPausePage() {
        if (myModel.workMode ===1){
            myModel.workMode = 2;
        }
        switchToState( {pagename:'Pause'} );
    }
    function  switchToSettingPage() {
        if (myModel.workMode ===1){
            myModel.workMode = 2;
        }
        switchToState( {pagename:'Settings'} );
    }
    function  switchToRecordsPage() {
        if (myModel.workMode ===1){
            myModel.workMode = 2;
        }
        switchToState({pagename:'Records'});
    }


    //Предупреждение перед выгрузкой
    function befUnload(EO) {
        EO=EO||window.event;
        // если количество очков не равно 0
        if (myModel.speed > 0) {
            EO.returnValue='А у вас есть несохранённые изменения!';
        }
    }

}

