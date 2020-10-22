class Point {

    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }

    addPoint(point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    subPoint(point) {
        return new Point(this.x - point.x, this.y - point.y);
    }

    prodPoint(point) {
        return new Point(this.x * point.x, this.y * point.y);
    }
}


/* Para poupar memoria vamos usar chars em vez de strings, estou 
    um pouco preocupado com o uso de memoria para gerar os clones
    '0' = empty
    '1' = dark
    '2' = light */
class Board {

    constructor(size, state = [], dark = 0, light = 0) {
        this.dark = dark;
        this.light = light;

        this.size = size;
        this.state = [];

        if ( state.length == 0 ) {
            this.startState();
        }

        else {
            this.copyState(state);
        }

    }

    cloneBoard() {
        return new Board(this.size, this.state, this.dark, this.light);
    }

    startState() {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = '0';
        }

        let middle = this.size / 2;
        let point = new Point(middle - 1, middle - 1);

        console.log("hello!");
        this.addPiece('1', point);
        this.addPiece('1', point.addPoint(new Point(1,1)));
        this.addPiece('2', point.addPoint(new Point(0,1)));
        this.addPiece('2', point.addPoint(new Point(1,0)));  
    }

    copyState(state) {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = state[i];
        }
    }

    decodeCoordinates(point) {
        return point.y*this.size + point.x;
    }

    decodePieceType(ch) {
        switch(ch) {
            case '0':
                return "empty";

            case '1':
                return "dark";

            case '2':
                return "light";

            default:
                return "empty";
        }
    }

    debugBoard() {
        if ( this.state.length == 0 ) {
            console.log("Nothing yet!");
        }

        else {
            console.log("dark = "+this.dark+" light = "+this.light);

            let str = "";

            for( let i=0; i<this.size; i++ ) {
                for ( let j=0; j<this.size; j++ ) {
                    let temp = this.decodePieceType(this.state[this.decodeCoordinates(new Point(j, i))]);

                    if ( temp == "dark" ) { temp += " "}

                    str += temp;

                    if ( j!=this.size - 1 ) {
                        str += ',';
                    }
                }
                
                str += '\n';
            }

            console.log(str);
        }
    }

    addPiece(type, point) {
        if ( type == '1' ) {
            this.dark++;
        }

        else if ( type == '2' ) {
            this.light++;
        }

        this.state[this.decodeCoordinates(point)] = type;
    }

    rmPiece(point) {
        let type = this.state[this.decodeCoordinates(point)];

        if ( type == '1' ) {
            this.dark--;
        }

        else if ( type == '2' ) {
            this.light--;
        }

        this.state[this.decodeCoordinates(point)] = '0';
    }

    invertType(type) {
        switch( type ) {
            case '1':
                return '2';

            case '2':
                return '1';

            default :
                return '0';
        }
    }

    getPiece(point) {
        if ( this.state.length == 0 ) {
            return '0'
        }

        else
            return this.state[this.decodeCoordinates(point)];
    }

    insideBoard(point) {
        return point.x >= 0 && point.x < this.size && point.y >= 0 && point.y < this.size ? true: false;
    }

    inRange(type, point) {
        return this.insideBoard(point) && this.getPiece(point) == type ? true: false;
    }

    getArrayPiece(type, point, vec) {
        let arr = [];
        let p = point.addPoint(vec);

        for ( ; this.inRange(type, p); p = p.addPoint(vec) ) {
            arr.push(p);
        }

        if ( this.insideBoard(p) && this.invertType(p) == type ) {
            return arr;
        }

        else {
            return [];
        }
    }

    flipArrayPiece(arrPoint, type) {
        for ( let i=0; i<arrPoint.length; i++ ) {
            this.rmPiece(type, arrPoint[i]);
            this.addPiece(type, arrPoint[i]);
        }
    }

    flipAllPieces(type, point) {
        let type1 = this.invertType(type);
        
        for ( let i = -1; i<=1; i++ ) {
            if ( i != 0) {
                this.flipArrayPiece(this.getArrayPiece(type1, point, new Point(i,0)), type);
                this.flipArrayPiece(this.getArrayPiece(type1, point, new Point(0,i)), type);
                this.flipArrayPiece(this.getArrayPiece(type1, point, new Point(i,i)), type);
                this.flipArrayPiece(this.getArrayPiece(type1, point, new Point(i,-i)), type);
            }
        }     
    }

    newPiece(type, point) {
        let newBoard = this.cloneBoard();

        newBoard.rmPiece(point);
        newBoard.addPiece(type, point);

        newBoard.flipAllPieces(type, point);

        return newBoard;
    }
}

/* Testing */

function test() {
    board = new Board(10);
    board.debugBoard();

    board = board.newPiece('2', new Point(4, 3));
    board.debugBoard();
    board = board.newPiece('1', new Point(3, 3));
    board.debugBoard();
    board = board.newPiece('2', new Point(4, 2));
    board.debugBoard();
    board = board.newPiece('2', new Point(4, 1));
    board.debugBoard();
    board = board.newPiece('1', new Point(4, 0));
    board.debugBoard();
}

console.log(test());