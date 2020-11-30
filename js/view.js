"use strict";
// view

function GameViewWebPage() {
    var myModel = null; // с какой моделью работаем
    var myField = null; // внутри какого элемента DOM наша вёрстка
    var myMap = null; // карта
    var myMapNext = null; //поле следующего блока
    var myBlock = null; // блок
    var myBlockNext = null; // следующий блок
    var myScore = null;  //результат
    var myLevel = null;   //уровень
    var bgSound = null;    //фоновая музыка
    var rotateSound = null; //звук поворота
    var moveSound = null;  //звук влево-вправо
    var goDownSound = null;  //звук падения
    var removeSound = null;  //звук удаления линии

    this.start=function(model,field) {
        myModel=model;
        myField=field;

        myMap = this.renderMap();
        myMapNext = this.renderNextMap();
        myBlock = this.renderBlock();
        myBlockNext = this.renderBlockNext();

        // ищем и запоминаем интересные нам элементы DOM
        myScore = document.getElementById("score"); //результат
        myLevel = document.getElementById("level");   //уровень
        bgSound = document.getElementById("bg");
        rotateSound = document.getElementById("rotate");
        moveSound = document.getElementById("move");
        goDownSound = document.getElementById("goDown");
        removeSound = document.getElementById("remove");

    }

    this.renderMap = function (){
        var domTable = document.createElement('table');
        myField.appendChild(domTable);
        var tr, td;
        for (var i = 0; i < 20; i++) {
            tr = document.createElement('tr');//создаем строки проходя по строкам
            domTable.appendChild(tr);
            for (var j = 0; j < 12; j++) {
                td = document.createElement('td');//создаем тдшки проходя по столбцам
                tr.appendChild(td);
            }
        }
    }

    this.renderNextMap = function (){
        //таблица для отображения следующего блока
        var domTableNext = document.createElement('table');  //таблица в 20 ряду в DOM дереве
        document.getElementById('nextBlock').appendChild(domTableNext);
        var trNext, tdNext;
        for (var x = 0; x < 4; x++) {
            trNext = document.createElement('tr');//создаем строки проходя по строкам
            trNext.setAttribute( 'class', 'trNext')
            domTableNext.appendChild(trNext);
            for (var y = 0; y < 4; y++) {
                tdNext = document.createElement('td');//создаем тдшки проходя по столбцам
                tdNext.setAttribute( 'class', 'tdNext')
                trNext.appendChild(tdNext);
            }
        }
    }

    //устанавливаем класс для ячейки по типу фигуры
    this.setClass = function (row, col, classname) {
        document.getElementsByTagName('tr')[row].getElementsByTagName('td')[col].className = classname;
    }

    //очищаем поле
    this.clearClass = function () {
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < 12; j++) {
                this.setClass(i, j, "");
            }
        }
        for (var x = 20; x<24; x++) //вторая таблица для следующего блока
            for (var y = 0; y<4; y++) {
                this.setClass(x, y, "");
            }
    }

    //отображение блока
    this.renderBlock = function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (myModel.block.code[i][j] === 1) { //1 красим, 0 нет
                    this.setClass(myModel.block.row + i, myModel.block.col + j, myModel.block.typeBlock);
                }
            }
        }
    }

    //отображение блока
    this.renderBlockNext = function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (myModel.blockNext.code[i][j] === 1) { //1 красим, 0 нет
                    this.setClass(myModel.blockNext.row + i, myModel.blockNext.col + j, myModel.blockNext.typeBlock);
                }
            }
        }
    }

    this.renderScore = function (){
        if (myModel.lines<=10) {
            myLevel.innerHTML = "Уровень：" + 'легкий';
            myScore.innerHTML = "Счет：" + myModel.score;
        }
        if (myModel.lines>10&&myModel.lines<=20) {
            myLevel.innerHTML = "Уровень：" + 'средний';
            myScore.innerHTML = "Счет：" + myModel.score;
        }
        if (myModel.lines>20) {
            myLevel.innerHTML = "Уровень：" + 'сложный';
            myScore.innerHTML = "Счет：" + myModel.score;
        }
    }

    this.update = function (sound){
        this.clearClass();
        this.renderBlock();
        this.renderBlockNext();
        this.renderScore();
        for (var i = 0; i < 20; i++) {
            for (var j = 0; j < 12; j++) {
                if(myModel.map.code[i][j] !== 0){
                    //Если код на карте не равен 0, отрендерить блок
                    this.setClass(i,j,myModel.map.code[i][j]);
                }
            }
        }
        if ((myModel.workMode===1||myModel.workMode===2)&&myModel.stateMusic===true){
            bgSound.volume = 0.05;
            bgSound.play();
        } else bgSound.pause();
        if (sound === 'move'&&myModel.stateSound===true) moveSound.play();
        if (sound === 'remove'&&myModel.stateSound===true) removeSound.play();
        if (sound === 'goDown'&&myModel.stateSound===true) goDownSound.play();
        if (sound === 'rotate'&&myModel.stateSound===true) rotateSound.play();
    }

    this.showInfo = function (infoType){
        if (!document.getElementById('info-container')) {
            var gameMain=document.getElementById('app');
            var infoContainer=document.createElement('div');
            infoContainer.setAttribute('id','info-container');
            infoContainer.style.zIndex= '5';
            infoContainer.style.animationName='info-show';
            infoContainer.style.animationDuration='0.5s';
            infoContainer.style.animationTimingFunction='linear';
            infoContainer.style.animationFillMode='forwards';
            gameMain.appendChild(infoContainer);
            var infoHeader=document.createElement('h3');
            infoHeader.setAttribute('id','info-header');
            infoHeader.style.fontSize = '1.4em';
            infoHeader.style.fontFamily='Lobster, cursive';
            infoHeader.style.textAlign='center';
            infoHeader.style.color='#F8D778';
            infoHeader.style.padding='15px 5px';
            infoContainer.appendChild(infoHeader);
            var infoContent=document.createElement('div');
            infoContent.setAttribute('id','info-content');
            infoContent.style.fontFamily='Lobster, cursive';
            infoContent.style.fontSize = '1.2em';
            infoContent.style.textAlign='justify';
            infoContent.style.color='#F8D778';
            infoContainer.appendChild(infoContent);
            var okButton=document.createElement('button');
            okButton.setAttribute('id','ok-button');
            okButton.textContent='OK';
            infoContainer.appendChild(okButton);
        }
        //в зависимости нажатой кнопки, будем менять содержимок
        switch (infoType) {
            case 'Pause':
                var infoHeader=document.getElementById('info-header');
                infoHeader.textContent='Пауза';
                var infoContent=document.getElementById('info-content');
                infoContent.innerHTML='<p>Игра "Тетрис" была изобретена советским программистом Алексеем Пажитновым в 1984 году.</p><p>Нажмите "ОК", чтобы продолжить игру.</p>';
                infoContent.style.padding='0px 10px 10px 10px';
                infoContent.style.fontSize='20px';
                break;

            case 'Settings':
                var infoHeader=document.getElementById('info-header');
                infoHeader.textContent='Настройки';
                var infoContent=document.getElementById('info-content');
                infoContent.textContent='';
                infoContent.style.padding='0px 10px 10px 10px';
                infoContent.style.fontSize='20px';
                var musicButton=document.createElement('button');
                musicButton.setAttribute('id','music-button');
                musicButton.textContent='Музыка ВКЛ/ВЫКЛ';
                musicButton.style.marginBottom='20px';
                infoContent.appendChild(musicButton);
                var soundButton=document.createElement('button');
                soundButton.setAttribute('id','sound-button');
                soundButton.textContent='Звуки ВКЛ/ВЫКЛ';
                infoContent.appendChild(soundButton);
                break;


            case 'Records':
                var ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
                var stringName='SHULZHENKO_FD2_TETRIS';
                //Загружаем таблицу рекордов с сервера
                $.ajax( {
                        url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
                        data: { f: 'READ', n: stringName },
                        success: readReady, error: errorHandler
                    }
                );

            function readReady(callresult) {
                if ( callresult.error!=undefined ) {
                    alert(callresult.error);
                }
                //создадим нумерованный список с рекордами
                else {
                    var recordsTable=JSON.parse(callresult.result);
                    var contentHTML='';
                    var infoHeader=document.getElementById('info-header');
                    infoHeader.textContent='Лучшие результаты:'
                    var infoContent=document.getElementById('info-content');
                    infoContent.style.padding='0px 10px 5px 45px';
                    contentHTML+="<ol>";
                    for (var i=0; i<recordsTable.length; i++) {
                        var listItem='<li>'+recordsTable[i][0]+' - <span>'+recordsTable[i][1]+'</span></li>';
                        contentHTML+=listItem;
                    }
                    contentHTML+='</ol>';
                    infoContent.innerHTML=contentHTML;
                }
            }
            function errorHandler(jqXHR,statusStr,errorStr) {
                alert(statusStr+' '+errorStr);
            }
        }
    }
    //анимация убирания меню
    this.hideInfo=function() {
        if (document.getElementById('info-container')) {
            var infoContainer=document.getElementById('info-container');
            infoContainer.style.animationName='info-hide';
            infoContainer.style.animationDuration='0.5s';
            infoContainer.style.animationTimingFunction='linear';
            infoContainer.style.animationFillMode='forwards';
            setTimeout(removeInfo, 500);
        }
        function removeInfo() {
            var infoContainer=document.getElementById('info-container');
            var gameMain=document.getElementById('app');
            gameMain.removeChild(infoContainer);
        }
    }

}