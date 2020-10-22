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
            this.emptyState();
        }

        else {
            this.copyState(state);
        }

    }

    cloneBoard() {
        return new Board(this.size, this.state, this.dark, this.light);
    }

    emptyState() {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = this.encodePieceType("empty");
        }
    }

    copyState(state) {
        let totalSize = this.size*this.size;

        for( let i = 0; i<totalSize; i++) {
            this.state[i] = state[i];
        }
    }

    decodeCoordinates(point) { return point.y*this.size + point.x;  }

    decodePieceType(ch) {
        switch(ch) {
            case '1':
                return "empty";

            case '2':
                return "dark";

            case '3':
                return "light";

            default:
                return "empty";
        }
    }

    encodePieceType(str) {
        switch(str) {
            case "empty":
                return '1';

            case "dark":
                return '2';

            case "light":
                return '3';

            default:
                return '1';
        }
    }

    debugBoard() {
        if ( this.state.length == 0 ) {
            console.log("Nothing yet!");
        }

        else {
            let str = "";

            for( let i=0; i<this.size; i++ ) {
                for ( let j=0; j<this.size; j++ ) {
                    str += this.decodePieceType(this.state[this.decodeCoordinates(new Point(j, i))]);

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
        if ( type == "dark" ) {
            this.dark++;
        }

        else if ( type == "light" ) {
            this.light++;
        }

        this.state[this.decodeCoordinates(point)] = this.encodePieceType(type);
    }

    rmPiece(point) {
        let type = this.decodePieceType(this.state[this.decodeCoordinates(point)]);

        if ( type == "dark" ) {
            this.dark--;
        }

        else if ( type == "light" ) {
            this.light--;
        }

        this.state[this.decodeCoordinates(point)] = this.encodePieceType("empty");
    }

    flipPieces(board, type, point) {
        le
    }

    newPiece(type, point) {
        newBoard = this.cloneBoard();

        newBoard.rmPiece(point);
        newBoard.addPiece(type, point);

        flipPiece(newBoard, type, point);

        return newBoard;
    }
}