"use strict";
// model

function GameModel() {
    //создаем карту
    this.map = new Map();
    //создаем карту для отображения следующего блока
    this.mapNext = new MapNext();
    //создаем фигуру и изначально задаем пустое поле, чтоб ничего не отображалось
    this.block  = new Block();
    this.block.code = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]
    //создаем следующую фигуру
    this.blockNext = new BlockNext();
    this.speed = 0;
    this.score = 0;
    this.lines = 0;

    //0-загрузка страницы,
    //1-таймер идет, фигурки падают,
    //2-таймер остановлен, фигурки не падают, нажата кнопка Пауза, Настройки или Рекорды
    //3 - игра проиграна, таймер остановлен
    this.workMode = 0;
    this.isGameOver = false;
    this.points = {
        light:10,
        medium:20,
        high:30
    }
    this.stateSound = true;  //состояние звуков, включены true, выключены false
    this.stateMusic = false;  //состояние музыки, включена true, выключена false

    var myView = null;
    var self = this;

    this.start=function(view) {
        myView=view;
    }

    this.updateView=function(sound) {
        // при любых изменениях модели попадаем сюда
        // представление может быть любым,
        // лишь бы имело метод update()
        if ( myView )
            myView.update(sound);
    };
    this.changeStateMusic = function (){
        this.stateMusic = !this.stateMusic;
        this.updateView();
    }
    this.changeStateSound = function (){
        this.stateSound = !this.stateSound;
        this.updateView();
    }
    this.spaState ={};

    //изменение состояния в зависимости от хэша
    this.spaStateChanged=function(){
        switch (this.spaState.pagename) {
            case 'Settings':
                myView.showInfo('Settings');
                break;
            case 'Main':
                myView.hideInfo();
                break;
            case 'Records':
                myView.showInfo('Records');
                break;
            case 'Pause':
                myView.showInfo('Pause');
                break;
        }
    }

    this.newGame = function (){
        this.map = new Map();
        this.mapNext = new MapNext();
        this.blockNext.col = 4;
        this.blockNext.row = 0;
        this.block = this.blockNext;
        this.blockNext = new BlockNext();
        this.speed = 0;
        this.score = 0;
        this.lines = 0;
        this.workMode = 1;
        this.isGameOver = false;
    }

    function Map(){
        //Создание карты двумерного массива
        this.code = (function(){
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr.push([]);
                for (var j = 0; j < 12; j++) {
                    arr[i].push(0);
                }
            }

            arr.push(Array(12).fill("X")); //вспомогательная строка для определения конца таблицы
            return arr;
        })();
    }

    function MapNext(){
        //Создание карты двумерного массива
        this.code = (function(){
            var arr = [];
            for (var x = 0; x < 4; x++) {
                arr.push([]);
                for (var y = 0; y < 4; y++) {
                    arr[x].push(0);
                }
            }

            return arr;
        })();
    }

    function Block(){
        //Рандомно выбираем фигуру S,Z,J,L,O,I,T
        this.typeBlock = ["I", "L", "S", "Z", "J", "O", "T"][Math.floor(Math.random() * 7)];
        //количество возможных вариантов поворота
        this.allDirectionNumber = block_json[this.typeBlock].length;
        //выбираем случайное значение
        this.direction = Math.floor(Math.random() * this.allDirectionNumber);
        //получаем фигуру
        this.code = block_json[this.typeBlock][this.direction];
        //4*4 Начальное положение блока, сверху
        this.row = 0;
        //появление в середине карты (12 столбиков; 4 пустых слева, 4 для фигуры, 4 остается справа)
        this.col = 4;
    }

    function BlockNext(){
        this.typeBlock = ["I", "L", "S", "Z", "J", "O", "T"][Math.floor(Math.random() * 7)];
        this.allDirectionNumber = block_json[this.typeBlock].length;
        this.direction = Math.floor(Math.random() * this.allDirectionNumber);
        this.code = block_json[this.typeBlock][this.direction];
        //4*4 Начальное положение блока в окне для следующих блоков
        this.row = 20;
        this.col = 0;
    }

    this.updateScore = function (){
        if (this.lines<=10) {
            this.score = this.lines*this.points.light;
        }
        if (this.lines>10&&this.lines<=20) {
            this.score = 100+(this.lines-10)*this.points.medium;
        }
        if (this.lines>20) {
            this.score = 300+(this.lines-20)*this.points.high;
        }
    }

    //Проверка, чтобы блок не заезжал на зафиксированные блоки
    this.check = function (row, col) {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (this.block.code[i][j] !== 0 && this.map.code[row + i][col + j] !== 0) {
                    return false; //если ячейка заполнена, возвращаем false
                }
            }
        }
        return true; //если ячейка не заполнена, возвращаем true
    }

    this.rotate = function (){
        //Резервное копирование старого направления
        this.block.oldDirection = this.block.direction;

        //если квадрат или точка
        if (this.block.direction === this.block.allDirectionNumber - 1) {
            this.block.direction = 0;
        } else {
            //остальные фигуры вращаем
            this.block.direction++;
        }
        //рисуем фигурку
        this.block.code = block_json[this.block.typeBlock][this.block.direction];

        //Если блок нельзя повернуть
        if (!this.check(this.block.row, this.block.col)) {
            //не поворачиваем
            this.block.direction = this.block.oldDirection;
            this.block.code = block_json[this.block.typeBlock][this.block.direction];
        }
        this.updateView('rotate');
    }

    //вниз
    this.goDown = function () {
        while (this.check(this.block.row + 1, this.block.col)) {
            this.block.row++;
        }
        this.updateView('goDown');
    }

    //влево
    this.left = function () {
        if (this.check(this.block.row, this.block.col - 1)) {
            this.block.col--;
        }
        this.updateView('move');
    }

    //вправо
    this.right = function () {
        if (this.check(this.block.row, this.block.col + 1)) {
            this.block.col++;
        }
        this.updateView('move');
    }

    //фиксация блока
    this.lockBlock = function () {
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                //Если не 0, значит есть цвет
                if (this.block.code[i][j] !== 0) {
                    this.map.code[i + this.block.row][this.block.col + j] = this.block.typeBlock;
                }
            }
        }
        this.updateView();
    }

    //удаление заполненных строк
    this.remove = function () {
        //проверяем, есть ли в линии 0
        for (var i = 0; i < 20; i++) {
            if (!this.map.code[i].includes(0)) {
                this.lines++;
                //если 0 в линии нет, линия удаляется
                this.map.code.splice(i, 1);
                this.updateView('remove');
                console.log(this.map.code);
                this.speed = 0;
                //добавляем сверху новую строку ячеек
                this.map.code.unshift(new Array(12).fill(0));
            }
        }
    }

    //по таймеру блок падает вниз
    this.down = function () {
        this.workMode = 1;
        var self = this;
        //если верхняя строка содержит что-то кроме 1, игра проиграна
        this.map.code[0].forEach(function (item) {
            if (item !== 0) {
                self.workMode = 3;// переменная для остановки таймера, конец игры
                self.isGameOver = true; //игра проиграна
            }
        });
        if (self.isGameOver === true) AJAXNewRecord(); // проверяем таблицу рекордов
        //проверяем нижние ячейки
        if (this.check(this.block.row + 1, this.block.col)) {
            this.block.row++;//если 0, можно продолжать
        } else {
            // иначе коснулся ненулевой ячейки, фиксируем
            this.lockBlock();
            //проверяем на заполненные линии
            this.remove();
            // создаем новый блок
            this.blockNext.col = 4;
            this.blockNext.row = 0;
            this.block = this.blockNext;
            this.blockNext = new BlockNext();
        }
        this.updateScore();
        this.updateView();
    }

    //функция записи в AJAX
    function AJAXNewRecord() {
        var ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
        var updatePassword;
        var stringName='SHULZHENKO_FD2_TETRIS';
        updatePassword=Math.random();
        $.ajax( {
                url: ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
                data: { f: 'LOCKGET', n: stringName, p: updatePassword },
                success: lockGetReady, error: errorHandler
            }
        );
        function lockGetReady(callresult) {
            if ( callresult.error!=undefined ) {
                alert(callresult.error);
            }
            else {
                //debugger;
                var recordsTable=JSON.parse(callresult.result);
                recordsTable.sort(function(a, b) {
                    return b[1] - a[1];
                })
                if (recordsTable.length>=10) {
                    for (var i=0; i<recordsTable.length; i++) {
                        if (recordsTable[i][1]<self.score) {
                            var name=prompt('Поздравляем! Вы попали в таблицу рекордов! Введите ваше имя:');
                            name = name.substring(0,15);
                            recordsTable.push([name, self.score]);
                            recordsTable.sort(function(a, b) {
                                return b[1] - a[1];
                            })
                            recordsTable=recordsTable.slice(0,10);
                            break;
                        }
                        if (i===recordsTable.length-1) {
                            alert('Игра окончена! К сожалению, вы не попали в таблицу рекордов');
                        }
                    }
                }
                else {
                    var name=prompt('Поздравляем! Вы попали в таблицу рекордов! Введите ваше имя:');
                    recordsTable.push([name, self.score]);
                    recordsTable.sort(function(a, b) {
                        return b[1] - a[1];
                    })
                }
                $.ajax( {
                        url : ajaxHandlerScript, type: 'POST', cache: false, dataType:'json',
                        data : { f: 'UPDATE', n: stringName, v: JSON.stringify(recordsTable), p: updatePassword },
                        success : updateReady, error : errorHandler
                    }
                );
            }
         //   self.newGame(); //новая игра
        }

        function updateReady(callresult) {
            if ( callresult.error!=undefined )
                alert(callresult.error);
        }

        function errorHandler(jqXHR,statusStr,errorStr) {
            alert(statusStr+' '+errorStr);
        }

    }


}
